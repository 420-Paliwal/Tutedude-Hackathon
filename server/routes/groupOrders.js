const express = require('express');
const router = express.Router();
const GroupOrder = require('../models/GroupOrder');
const { auth, authorize } = require('../middleware/auth');

// Create new group order
router.post('/', auth, authorize('vendor'), async (req, res) => {
  try {
    const groupOrder = new GroupOrder({
      name: req.body.name,
      createdBy: req.user._id,
      participants: [],
    });
    await groupOrder.save();
    res.status(201).json({ message: 'Group order created', groupOrder });
  } catch (err) {
    res.status(500).json({ error: 'Error creating group order' });
  }
});

// Join a group order
router.post('/:id/join', auth, authorize('vendor'), async (req, res) => {
  try {
    const groupOrder = await GroupOrder.findById(req.params.id);
    if (!groupOrder) return res.status(404).json({ message: 'Group order not found' });

    const existing = groupOrder.participants.find(p => p.vendor.toString() === req.user._id.toString());
    if (existing) return res.status(400).json({ message: 'You have already joined' });

    groupOrder.participants.push({
      vendor: req.user._id,
      items: req.body.items
    });

    await groupOrder.save();
    res.json({ message: 'Joined successfully', groupOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join group order' });
  }
});

// Get all group orders
router.get('/', auth, authorize('vendor'), async (req, res) => {
  const orders = await GroupOrder.find().populate('createdBy participants.vendor participants.items.product');
  res.json({ orders });
});


module.exports = router;