const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Đăng ký và đăng nhập không cần xác thực
router.post('/register', userController.register);
router.post('/login', userController.login);

// Các routes cần xác thực
router.get('/profile', authMiddleware.verifyToken, userController.getProfile);
router.put('/profile', authMiddleware.verifyToken, userController.updateProfile);
router.post('/change-password', authMiddleware.verifyToken, userController.changePassword);

// Admin routes
router.get('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getUserById);
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getAllUsers);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.updateUserById);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.deleteUserById);
module.exports = router;