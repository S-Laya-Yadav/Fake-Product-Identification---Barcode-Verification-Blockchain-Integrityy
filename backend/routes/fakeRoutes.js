const express = require('express');
const router = express.Router();
const FakeEntry = require('../models/FakeEntry');
const { protect, admin } = require('../middleware/auth');

// @desc    Submit a fake report
// @route   POST /api/fakes
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { details, photoUrl } = req.body;

        const fakeEntry = new FakeEntry({
            details,
            photoUrl,
            userId: req.user._id
        });

        const createdEntry = await fakeEntry.save();
        res.status(201).json(createdEntry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all fake entries
// @route   GET /api/fakes
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const fakes = await FakeEntry.find({}).populate('userId', 'name email');
        res.json(fakes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
