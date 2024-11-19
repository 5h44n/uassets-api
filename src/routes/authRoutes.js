const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Auth routes
router.post('/token', authController.generateToken);
router.post('/refresh', authController.refreshToken);

module.exports = router;
