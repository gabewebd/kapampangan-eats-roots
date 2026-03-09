const User = require('../models/User');
const Vendor = require('../models/Vendor');

// GET: User Profile with populated lists
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('savedPlaces', 'name category location images rating')
            .populate('favorites', 'name category location images rating')
            .populate('visited', 'name category')
            .populate('submissions', 'name isVerified createdAt');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// POST: Toggle Saved Place
exports.toggleSavedPlace = async (req, res) => {
    try {
        const { userId, vendorId } = req.body;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const index = user.savedPlaces.indexOf(vendorId);
        if (index > -1) {
            user.savedPlaces.splice(index, 1); // Remove if exists
        } else {
            user.savedPlaces.push(vendorId); // Add if not exists
        }

        await user.save();
        res.status(200).json({ message: 'Saved places updated', savedPlaces: user.savedPlaces });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};
