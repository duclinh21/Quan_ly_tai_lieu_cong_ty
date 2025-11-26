const express = require('express');
const router = express.Router();
const {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/document.controller');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', authenticate, getAllDocuments);
router.get('/:id', authenticate, getDocumentById);
router.post('/', authenticate, upload.single('file'), uploadDocument);
router.put('/:id', authenticate, updateDocument);
router.delete('/:id', authenticate, deleteDocument);

module.exports = router;

