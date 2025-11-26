const express = require('express');
const router = express.Router();
const {
    getAllTags,
    getTagById,
    createTag,
    deleteTag
} = require('../controllers/tag.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, getAllTags);
router.get('/:id', authenticate, getTagById);
router.post('/', authenticate, createTag);
router.delete('/:id', authenticate, deleteTag);

module.exports = router;

