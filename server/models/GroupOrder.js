const mongoose = require('mongoose');

const groupOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number
    }]
  }],
  totalCost: {
    type: Number,
    default: 0
  },
  isConfirmed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GroupOrder', groupOrderSchema);
