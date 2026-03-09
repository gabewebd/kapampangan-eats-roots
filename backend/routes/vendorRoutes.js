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

// Route for "Heritage Sites"
router.get('/filter/heritage', vendorController.getHeritageSites);

// Route for "Local Eateries"
router.get('/filter/eateries', vendorController.getEateries);

// Route for "Explore Map"
router.get('/explore/map', vendorController.getAllVendors);

module.exports = router;