const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/auth');

// Public GET routes
router.get('/trending', vendorController.getTrending);
router.get('/search', vendorController.searchVendors);
router.get('/filter/heritage', vendorController.getHeritageSites);
router.get('/filter/eateries', vendorController.getEateries);
router.get('/explore/map', vendorController.getAllVendors);
router.get('/:id/related', vendorController.getRelatedVendors);
router.get('/:id', vendorController.getVendorById);

// Protected routes — require JWT
router.post('/', authMiddleware, upload.fields([
    { name: 'images', maxCount: 4 },
    { name: 'menuItemImages', maxCount: 10 }
]), vendorController.createVendor);

router.patch('/:id/verify', authMiddleware, vendorController.verifyVendor);
router.patch('/:id/authenticate', authMiddleware, vendorController.authenticateVendor);
router.delete('/:id/reject', authMiddleware, vendorController.rejectVendor);

module.exports = router;
