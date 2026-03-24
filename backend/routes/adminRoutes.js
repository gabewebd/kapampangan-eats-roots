const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// All admin routes require JWT authentication
router.use(authMiddleware);

// Dashboard Overview Metrics
router.get('/metrics', adminController.getDashboardMetrics);

const { upload } = require('../config/cloudinary');

// Vendor Management
router.get('/vendors', adminController.getVendorsByStatus);
router.get('/vendors/pending', adminController.getPendingVendors);
router.put('/vendors/:id/approve', adminController.approveVendor);
router.put('/vendors/:id', upload.fields([
    { name: 'images', maxCount: 4 },
    { name: 'menuItemImages', maxCount: 10 }
]), adminController.updateVendor); 
router.delete('/vendors/:id/reject', adminController.rejectVendor); // Soft reject
router.delete('/vendors/:id/permanent', adminController.deleteVendorPermanent); // Hard delete

module.exports = router;
