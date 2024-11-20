const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/quote', quoteController.createQuote);

module.exports = router;
