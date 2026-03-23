const Review = require('../models/Review');
const Vendor = require('../models/Vendor');
const mongoose = require('mongoose');

// GET: Get all reviews for a vendor
exports.getVendorReviews = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const reviews = await Review.find({ vendorId }).sort({ createdAt: -1 });
        return res.status(200).json(reviews);
    } catch (err) {
        console.error('Audit: getVendorReviews failed:', err);
        return res.status(500).json({ error: 'Server Error' });
    }
};

// POST: Add a new review
exports.addReview = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { userId, userName, rating, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(vendorId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const newReview = new Review({
            vendorId,
            userId,
            userName,
            rating,
            comment
        });

        await newReview.save();

        // Update Vendor average rating and reviewCount
        const reviews = await Review.find({ vendorId });
        const totalRating = reviews.reduce((acc, rev) => acc + rev.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);

        await Vendor.findByIdAndUpdate(vendorId, {
            rating: averageRating,
            reviewCount: reviews.length
        });

        return res.status(201).json(newReview);
    } catch (err) {
        console.error('Audit: addReview failed:', err);
        return res.status(500).json({ error: 'Server Error' });
    }
};
