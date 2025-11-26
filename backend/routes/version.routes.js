const express = require('express');
const router = express.Router();
const {
  getDocumentVersions,
  createVersion,
  restoreVersion
} = require('../controllers/version.controller');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/document/:documentId', authenticate, getDocumentVersions);
router.post('/document/:documentId', authenticate, upload.single('file'), createVersion);
router.post('/:id/restore', authenticate, restoreVersion);

module.exports = router;

