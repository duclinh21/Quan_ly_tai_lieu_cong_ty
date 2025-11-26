const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditLogById } = require('../controllers/auditLog.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', authenticate, authorize('admin'), getAuditLogs);
router.get('/:id', authenticate, authorize('admin'), getAuditLogById);

module.exports = router;

