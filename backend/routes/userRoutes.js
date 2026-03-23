const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route for User Profile
router.get('/:id', userController.getUserProfile);

// Route to Toggle Saved Place
router.post('/toggle-saved', userController.toggleSavedPlace);

// Route to Toggle Favorite
router.post('/toggle-favorite', userController.toggleFavorite);

// Route to Toggle Visited
router.post('/toggle-visited', userController.toggleVisited);

module.exports = router;
