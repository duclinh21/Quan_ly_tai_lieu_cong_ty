const express = require('express');
const router = express.Router();
const { getAllRoles, getRoleById } = require('../controllers/role.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Cho phép public access để đăng ký
router.get('/', getAllRoles);
router.get('/:id', authenticate, getRoleById);

module.exports = router;

