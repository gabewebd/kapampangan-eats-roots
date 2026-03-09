const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Dashboard Overview Metrics
router.get('/metrics', adminController.getDashboardMetrics);

// Get Pending Vendor Approvals
router.get('/vendors/pending', adminController.getPendingVendors);

// Approve a Vendor
router.put('/vendors/:id/approve', adminController.approveVendor);

// Reject / Delete a Vendor
router.delete('/vendors/:id/reject', adminController.rejectVendor);

module.exports = router;
