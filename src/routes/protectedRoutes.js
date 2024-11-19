const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/hello', authenticateToken, (req, res) => {
    res.json({ message: 'Hello from protected route!' });
});

module.exports = router;
