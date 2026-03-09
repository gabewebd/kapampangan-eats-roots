const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const vendorController = require('../controllers/vendorController');

// Route for "Submit a Listing"
// Use upload.array('images', 4) to match your UI limit
router.post('/', upload.array('images', 4), vendorController.createVendor);

// Route for "Trending Local Spots"
router.get('/trending', vendorController.getTrending);

// Route for "Vendor Detail Page"
router.get('/:id', vendorController.getVendorById);

module.exports = router;