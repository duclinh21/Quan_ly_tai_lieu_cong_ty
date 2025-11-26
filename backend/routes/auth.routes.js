const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public register (không cho phép admin)
router.post('/register', register);
// Admin register (cho phép admin tạo user với role admin)
router.post('/register-admin', authenticate, authorize('admin'), register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);

module.exports = router;

