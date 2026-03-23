const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Review routes
router.get('/:vendorId', reviewController.getVendorReviews);
router.post('/:vendorId', reviewController.addReview);

module.exports = router;
