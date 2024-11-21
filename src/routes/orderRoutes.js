const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateApi } = require('../middleware/authMiddleware');

router.use(authenticateApi);

router.post('/order', orderController.createOrder);

module.exports = router;
