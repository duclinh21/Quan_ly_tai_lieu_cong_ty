const express = require('express');
const router = express.Router();
const {
  getDocumentPermissions,
  createPermission,
  updatePermission,
  deletePermission
} = require('../controllers/permission.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/document/:documentId', authenticate, getDocumentPermissions);
router.post('/', authenticate, createPermission);
router.put('/:id', authenticate, updatePermission);
router.delete('/:id', authenticate, deletePermission);

module.exports = router;

