const express = require('express');
const router = express.Router();
const {
  checkoutDocument,
  checkinDocument,
  getCheckoutStatus
} = require('../controllers/checkout.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/:documentId/checkout', authenticate, checkoutDocument);
router.post('/:documentId/checkin', authenticate, checkinDocument);
router.get('/:documentId/status', authenticate, getCheckoutStatus);

module.exports = router;

