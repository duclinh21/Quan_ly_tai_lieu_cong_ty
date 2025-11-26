const prisma = require('../config/database');
const { createAuditLog } = require('../utils/auditLog.helper');

const checkoutDocument = async (req, res) => {
  try {
    // Chỉ admin mới có thể khóa tài liệu
    if (req.user.role.name !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền khóa tài liệu'
      });
    }

    const { documentId } = req.params;
    const { expiresInHours = 24 } = req.body;

    // Check if document is already checked out
    const existingCheckout = await prisma.checkout.findUnique({
      where: { documentId }
    });

    if (existingCheckout) {
      // Check if checkout has expired
      if (existingCheckout.expiresAt && existingCheckout.expiresAt < new Date()) {
        // Delete expired checkout
        await prisma.checkout.delete({
          where: { documentId }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Document is already checked out'
        });
      }
    }

    // Create checkout
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(expiresInHours));

    const checkout = await prisma.checkout.create({
      data: {
        documentId,
        userId: req.user.id,
        expiresAt
      },
      include: {
        document: {
          select: {
            id: true,
            title: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });

    await createAuditLog(
      req.user.id,
      'document_checkout',
      documentId,
      `Checked out document`,
      req
    );

    res.status(201).json({
      success: true,
      message: 'Document checked out successfully',
      data: checkout
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const checkinDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const checkout = await prisma.checkout.findUnique({
      where: { documentId }
    });

    if (!checkout) {
      return res.status(404).json({
        success: false,
        message: 'Document is not checked out'
      });
    }

    // Chỉ admin mới có thể mở khóa (hoặc người đã khóa)
    if (checkout.userId !== req.user.id && req.user.role?.name !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin hoặc người đã khóa mới có thể mở khóa tài liệu'
      });
    }

    await prisma.checkout.delete({
      where: { documentId }
    });

    await createAuditLog(
      req.user.id,
      'document_checkin',
      documentId,
      `Checked in document`,
      req
    );

    res.json({
      success: true,
      message: 'Document checked in successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getCheckoutStatus = async (req, res) => {
  try {
    const { documentId } = req.params;

    const checkout = await prisma.checkout.findUnique({
      where: { documentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        },
        document: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!checkout) {
      return res.json({
        success: true,
        data: null,
        message: 'Document is not checked out'
      });
    }

    // Check if expired
    if (checkout.expiresAt && checkout.expiresAt < new Date()) {
      await prisma.checkout.delete({
        where: { documentId }
      });
      return res.json({
        success: true,
        data: null,
        message: 'Checkout has expired'
      });
    }

    res.json({
      success: true,
      data: checkout
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  checkoutDocument,
  checkinDocument,
  getCheckoutStatus
};

