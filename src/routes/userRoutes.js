const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateApi } = require('../middleware/authMiddleware');

router.use(authenticateApi);

router.post('/users', userController.createUser);
router.get('/users/:id', userController.getUser);
router.get('/users', userController.getUsers);
router.put('/users/:id', userController.updateUser);

module.exports = router;
