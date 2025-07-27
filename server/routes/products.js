const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'vegetables', label: 'Vegetables' },
      { value: 'fruits', label: 'Fruits' },
      { value: 'spices', label: 'Spices' },
      { value: 'grains', label: 'Grains' },
      { value: 'oils', label: 'Oils' },
      { value: 'dairy', label: 'Dairy' },
      { value: 'meat', label: 'Meat' },
      { value: 'beverages', label: 'Beverages' },
      { value: 'packaging', label: 'Packaging' },
      { value: 'other', label: 'Other' }
    ];

    res.json({ categories });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('supplierId', 'name rating totalRatings')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      products,
      pagination: {
        current: pageNum,
        total: totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        limit: limitNum,
        totalProducts: total
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});


// Recommend products based on vendor's order history
router.get('/recommendations',auth, authorize('vendor'), async (req, res) => {
  try {
    const vendorId = req.user._id;

    // 1. Get last 5 orders of vendor
    const recentOrders = await Order.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.product');

    // 2. Extract all ordered categories
    const categoryCount = {};
    recentOrders.forEach(order => {
      order.items.forEach(({ product }) => {
        const category = product.category || 'other';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });

    // 3. Sort categories by frequency
    const sortedCategories = Object.keys(categoryCount).sort(
      (a, b) => categoryCount[b] - categoryCount[a]
    );

    let recommended = [];

    // 4. Get top products from top 2 categories
    for (let i = 0; i < Math.min(2, sortedCategories.length); i++) {
      const products = await Product.find({ category: sortedCategories[i] })
        .sort({ rating: -1 })
        .limit(3);
      recommended.push(...products);
    }

    // 5. Fallback if no orders
    if (recommended.length === 0) {
      recommended = await Product.find().sort({ rating: -1 }).limit(6);
    }

    res.json({ recommended });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});


// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplierId', 'name email phone address rating totalRatings');

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Product fetch error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

// @route   GET /api/products/supplier/:supplierId
// @desc    Get products by supplier
// @access  Public
router.get('/supplier/:supplierId', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { 
      supplierId: req.params.supplierId, 
      isActive: true 
    };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      products,
      pagination: {
        current: pageNum,
        total: totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        limit: limitNum,
        totalProducts: total
      }
    });
  } catch (error) {
    console.error('Supplier products fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching supplier products' });
  }
});

// @route   POST /api/products
// @desc    Create new product (suppliers only)
// @access  Private - Supplier only
router.post('/', auth, authorize('supplier'), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      unit,
      stock,
      category,
      imageURL,
      minOrderQuantity
    } = req.body;

    // Validation
    if (!name || !price || !unit || stock === undefined || !category) {
      return res.status(400).json({ 
        message: 'Name, price, unit, stock, and category are required' 
      });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    if (stock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    const product = new Product({
      name: name.trim(),
      description: description?.trim(),
      price: parseFloat(price),
      unit,
      stock: parseInt(stock),
      category,
      imageURL: imageURL?.trim(),
      minOrderQuantity: parseInt(minOrderQuantity) || 1,
      supplierId: req.user._id,
      supplierName: req.user.name
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error during product creation' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product (suppliers only)
// @access  Private - Supplier only
router.put('/:id', auth, authorize('supplier'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    if (product.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const {
      name,
      description,
      price,
      unit,
      stock,
      category,
      imageURL,
      minOrderQuantity
    } = req.body;

    // Validation
    if (price !== undefined && price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    // Update fields
    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = parseFloat(price);
    if (unit !== undefined) product.unit = unit;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (category !== undefined) product.category = category;
    if (imageURL !== undefined) product.imageURL = imageURL.trim();
    if (minOrderQuantity !== undefined) product.minOrderQuantity = parseInt(minOrderQuantity);

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Product update error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error during product update' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (suppliers only)
// @access  Private - Supplier only
router.delete('/:id', auth, authorize('supplier'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    if (product.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(500).json({ message: 'Server error during product deletion' });
  }
});
module.exports = router;