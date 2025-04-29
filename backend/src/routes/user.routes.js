const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/all', protect, authorize('admin'), userController.getAllUsers);

module.exports = router;