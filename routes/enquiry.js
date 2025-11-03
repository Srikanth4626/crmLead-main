const express = require('express');
const Enquiry = require('../models/Enquiry');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, courseInterest, message } = req.body;

    if (!name || !email || !courseInterest) {
      return res.status(400).json({ error: 'Name, email, and course interest are required' });
    }

    const enquiry = new Enquiry({
      name,
      email,
      phone,
      courseInterest,
      message
    });

    await enquiry.save();

    res.status(201).json({
      message: 'Enquiry submitted successfully',
      enquiry: {
        id: enquiry._id,
        name: enquiry.name,
        email: enquiry.email,
        courseInterest: enquiry.courseInterest
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/unclaimed', auth, async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ claimedBy: null })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      message: 'Unclaimed enquiries fetched successfully',
      count: enquiries.length,
      enquiries
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/claimed', auth, async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ claimedBy: req.employeeId })
      .sort({ claimedAt: -1 })
      .populate('claimedBy', 'name email')
      .select('-__v');

    res.json({
      message: 'Your claimed enquiries fetched successfully',
      count: enquiries.length,
      enquiries
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/claim/:id', auth, async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    if (enquiry.claimedBy) {
      return res.status(400).json({ error: 'Enquiry already claimed by another employee' });
    }

    enquiry.claimedBy = req.employeeId;
    enquiry.claimedAt = new Date();
    await enquiry.save();

    await enquiry.populate('claimedBy', 'name email');

    res.json({
      message: 'Enquiry claimed successfully',
      enquiry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
