const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Admin Login
router.post('/admin/login', authController.adminLogin);

// User Login
router.post('/user-login', authController.userLogin);

// User Register
router.post('/user-register', authController.userRegister);

module.exports = router;
