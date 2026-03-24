const User = require('../models/User');
const Vendor = require('../models/Vendor');
const mongoose = require('mongoose');

// GET: User Profile with populated lists
exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }

        const user = await User.findById(id)
            .populate('savedPlaces', 'name category location images rating')
            .populate('favorites', 'name category location images rating')
            .populate('visited', 'name category location images rating')
            .populate('submissions', 'name category location images rating isVerified createdAt');

        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json(user);
    } catch (err) {
        console.error('Audit: getUserProfile failed:', err);
        return res.status(500).json({ error: 'Server Error' });
    }
};

// POST: Toggle Saved Place (Bookmark)
exports.toggleSavedPlace = async (req, res) => {
    try {
        const { userId, vendorId } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(vendorId)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format provided' });
        }

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const index = user.savedPlaces.indexOf(vendorId);
        if (index > -1) {
            user.savedPlaces.splice(index, 1);
        } else {
            user.savedPlaces.push(vendorId);
        }

        await user.save();
        return res.status(200).json({ message: 'Saved places updated', savedPlaces: user.savedPlaces });
    } catch (err) {
        console.error('Audit: toggleSavedPlace failed:', err);
        return res.status(500).json({ error: 'Server Error' });
    }
};

// POST: Toggle Favorite (Heart)
exports.toggleFavorite = async (req, res) => {
    try {
        const { userId, vendorId } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(vendorId)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format provided' });
        }

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const index = user.favorites.indexOf(vendorId);
        if (index > -1) {
            user.favorites.splice(index, 1);
        } else {
            user.favorites.push(vendorId);
        }

        await user.save();
        return res.status(200).json({ message: 'Favorites updated', favorites: user.favorites });
    } catch (err) {
        console.error('Audit: toggleFavorite failed:', err);
        return res.status(500).json({ error: 'Server Error' });
    }
};

// POST: Toggle Visited Place
exports.toggleVisited = async (req, res) => {
    try {
        const { userId, vendorId } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(vendorId)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format provided' });
        }

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const index = user.visited.indexOf(vendorId);
        if (index > -1) {
            user.visited.splice(index, 1);
        } else {
            user.visited.push(vendorId);
        }

        await user.save();
        return res.status(200).json({ message: 'Visited places updated', visited: user.visited });
    } catch (err) {
        console.error('Audit: toggleVisited failed:', err);
        return res.status(500).json({ error: 'Server Error' });
    }
};
