const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  vendorEmail: {
    type: String,
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplierName: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    type: String,
    required: true,
    maxlength: [500, 'Delivery address cannot exceed 500 characters']
  },
  phone: {
    type: String,
    required: true,
    maxlength: [15, 'Phone number cannot exceed 15 characters']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  isRated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `BZ${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => total + item.subtotal, 0);
  }
  next();
});

// Update status method with automatic delivery date
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  if (newStatus === 'confirmed') {
    // Set expected delivery date to 2 days from confirmation
    this.expectedDeliveryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  } else if (newStatus === 'delivered') {
    this.actualDeliveryDate = new Date();
  }
  
  return this.save();
};

// Add rating method
orderSchema.methods.addRating = function(rating, review = '') {
  this.rating = rating;
  this.review = review;
  this.isRated = true;
  return this.save();
};

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for delivery status
orderSchema.virtual('deliveryStatus').get(function() {
  if (this.status === 'delivered') return 'delivered';
  if (this.status === 'cancelled') return 'cancelled';
  if (this.expectedDeliveryDate && new Date() > this.expectedDeliveryDate) return 'delayed';
  return 'on_time';
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });

// Indexes for better query performance
orderSchema.index({ vendorId: 1, createdAt: -1 });
orderSchema.index({ supplierId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);