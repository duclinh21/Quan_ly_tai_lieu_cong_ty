const prisma = require('../config/database');

const createAuditLog = async (userId, action, documentId = null, details = null, req = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        documentId,
        action,
        details,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('user-agent')
      }
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error - audit logging should not break the main flow
  }
};

module.exports = {
  createAuditLog
};

