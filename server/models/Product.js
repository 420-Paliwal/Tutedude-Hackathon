const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'g', 'l', 'ml', 'piece', 'dozen', 'packet'],
    default: 'kg'
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['vegetables', 'fruits', 'spices', 'grains', 'oils', 'dairy', 'meat', 'beverages', 'packaging', 'other'],
    default: 'vegetables'
  },
  imageURL: {
    type: String,
    trim: true,
    // validate: {
    //   validator: function(v) {
    //     return !v || /^https?:\/\/.+/.test(v);
    //   },
    //   message: 'Please provide a valid image URL'
    // }
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1']
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Supplier ID is required']
  },
  supplierName: {
    type: String,
    required: [true, 'Supplier name is required']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  ratingSum: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update rating method
productSchema.methods.updateRating = function(newRating) {
  this.ratingSum += newRating;
  this.totalRatings += 1;
  this.rating = this.ratingSum / this.totalRatings;
  return this.save();
};

// Update stock method
productSchema.methods.updateStock = function(quantity, operation = 'subtract') {
  if (operation === 'subtract') {
    this.stock = Math.max(0, this.stock - quantity);
  } else {
    this.stock += quantity;
  }
  return this.save();
};

// Increment order count
productSchema.methods.incrementOrderCount = function() {
  this.totalOrders += 1;
  return this.save();
};

// Virtual for availability status
productSchema.virtual('availabilityStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock < 10) return 'low_stock';
  return 'in_stock';
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

// Indexes for better query performance
productSchema.index({ supplierId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);