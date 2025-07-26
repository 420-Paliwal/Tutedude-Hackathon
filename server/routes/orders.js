const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/orders/statistics/dashboard
// @desc    Get order statistics for dashboard
// @access  Private
router.get('/statistics/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};
    if (userRole === 'vendor') {
      query.vendorId = userId;
    } else if (userRole === 'supplier') {
      query.supplierId = userId;
    }

    const [orders, products] = await Promise.all([
      Order.find(query),
      userRole === 'supplier' ? Product.find({ supplierId: userId, isActive: true }) : []
    ]);

    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length
    };

    if (userRole === 'vendor') {
      stats.totalSpent = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + order.totalAmount, 0);
    } else if (userRole === 'supplier') {
      stats.totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + order.totalAmount, 0);
      stats.totalProducts = products.length;
    }

    res.json({ stats });
  } catch (error) {
    console.error('Dashboard statistics error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
  }
});

// @route   GET /api/orders
// @desc    Get orders for current user with filtering and pagination
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    const userId = req.user._id;
    const userRole = req.user.role;

    // Build query based on user role
    let query = {};
    if (userRole === 'vendor') {
      query.vendorId = userId;
    } else if (userRole === 'supplier') {
      query.supplierId = userId;
    }

    if (status && status !== 'all') {
      if (status === 'pending') {
        query.status = { $in: ['pending', 'confirmed'] };
      } else {
        query.status = status;
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('vendorId', 'name email rating totalRatings')
        .populate('supplierId', 'name email rating totalRatings')
        .populate({
          path: 'items.productId',
          select: 'name imageURL category'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      orders,
      pagination: {
        current: pageNum,
        total: totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        limit: limitNum,
        totalOrders: total
      }
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('vendorId', 'name email phone rating totalRatings')
      .populate('supplierId', 'name email phone address rating totalRatings')
      .populate({
        path: 'items.productId',
        select: 'name imageURL category unit'
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    const userId = req.user._id.toString();
    if (order.vendorId._id.toString() !== userId && order.supplierId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Order fetch error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// @route   POST /api/orders
// @desc    Create new order (vendors only)
// @access  Private - Vendor only
// @route   POST /api/orders
// @desc    Create new order (vendors only)
// @access  Private - Vendor only
router.post('/', auth, authorize('vendor'), async (req, res) => {
  try {
    const { items, deliveryAddress, phone, notes } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (!deliveryAddress || !phone) {
      return res.status(400).json({ message: 'Delivery address and phone are required' });
    }

    // Fetch products and validate availability
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ 
      _id: { $in: productIds }, 
      isActive: true 
    }).populate('supplierId', 'name email');

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'Some products not found or inactive' });
    }

    // Check if all products are from the same supplier
    const supplierIds = [...new Set(products.map(p => p.supplierId._id.toString()))];
    if (supplierIds.length > 1) {
      return res.status(400).json({ message: 'All items must be from the same supplier' });
    }

    const supplier = products[0].supplierId;

    // Validate stock and create order items
    const orderItems = [];
    let hasStockIssues = false;
    let stockIssues = [];

    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.productId);
      
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }

      if (item.quantity < product.minOrderQuantity) {
        return res.status(400).json({ 
          message: `Minimum order quantity for ${product.name} is ${product.minOrderQuantity}` 
        });
      }

      if (item.quantity > product.stock) {
        hasStockIssues = true;
        stockIssues.push(`${product.name}: requested ${item.quantity}, available ${product.stock}`);
        continue;
      }

      orderItems.push({
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
        subtotal: product.price * item.quantity
      });
    }

    if (hasStockIssues) {
      return res.status(400).json({ 
        message: 'Insufficient stock for some items',
        details: stockIssues
      });
    }

    // ✅ Calculate totalAmount and generate orderNumber
    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order
    const order = new Order({
      vendorId: req.user._id,
      vendorName: req.user.name,
      vendorEmail: req.user.email,
      supplierId: supplier._id,
      supplierName: supplier.name,
      items: orderItems,
      deliveryAddress: deliveryAddress.trim(),
      phone: phone.trim(),
      notes: notes?.trim(),
      totalAmount,       // ✅ Required field
      orderNumber        // ✅ Required field
    });

    await order.save();

    // Update product stock and order counts
    for (const item of orderItems) {
      const product = products.find(p => p._id.toString() === item.productId.toString());
      await product.updateStock(item.quantity, 'subtract');
      await product.incrementOrderCount();
    }

    // Populate the order before sending response
    await order.populate([
      { path: 'vendorId', select: 'name email rating totalRatings' },
      { path: 'supplierId', select: 'name email rating totalRatings' },
      { path: 'items.productId', select: 'name imageURL category unit' }
    ]);

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error during order creation' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (suppliers only)
// @access  Private - Supplier only
router.put('/:id/status', auth, authorize('supplier'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Validate status transition
    const currentStatus = order.status;
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['dispatched', 'cancelled'],
      dispatched: ['delivered']
    };

    if (currentStatus !== 'pending' && currentStatus !== 'confirmed' && currentStatus !== 'dispatched') {
      return res.status(400).json({ message: 'Order status cannot be changed' });
    }

    if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot change status from ${currentStatus} to ${status}` 
      });
    }

    // Update status
    await order.updateStatus(status);

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Order status update error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(500).json({ message: 'Server error during order status update' });
  }
});

// @route   POST /api/orders/:id/rate
// @desc    Rate an order (vendors only)
// @access  Private - Vendor only
router.post('/:id/rate', auth, authorize('vendor'), async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const order = await Order.findById(req.params.id)
      .populate('supplierId', 'name rating totalRatings ratingSum');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to rate this order' });
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Order must be delivered before rating' });
    }

    // Check if already rated
    if (order.isRated) {
      return res.status(400).json({ message: 'Order has already been rated' });
    }

    // Add rating to order
    await order.addRating(parseInt(rating), review?.trim());

    // Update supplier rating
    const supplier = await User.findById(order.supplierId._id);
    if (supplier) {
      await supplier.updateRating(parseInt(rating));
    }

    res.json({
      message: 'Rating submitted successfully',
      order
    });
  } catch (error) {
    console.error('Order rating error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(500).json({ message: 'Server error during order rating' });
  }
});

module.exports = router;