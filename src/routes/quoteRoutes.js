const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const { authenticateApi } = require('../middleware/authMiddleware');

router.use(authenticateApi);

router.post('/quote', quoteController.createQuote);

module.exports = router;
