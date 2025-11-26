const prisma = require('../config/database');
const { createAuditLog } = require('../utils/auditLog.helper');

const getDocumentPermissions = async (req, res) => {
  try {
    const { documentId } = req.params;

    const permissions = await prisma.permission.findMany({
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
        role: true,
        department: true
      }
    });

    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createPermission = async (req, res) => {
  try {
    const { documentId, userId, roleId, departmentId, canRead, canWrite, canDelete } = req.body;

    // Validate that at least one of userId, roleId, or departmentId is provided
    if (!userId && !roleId && !departmentId) {
      return res.status(400).json({
        success: false,
        message: 'At least one of userId, roleId, or departmentId must be provided'
      });
    }

    const permission = await prisma.permission.create({
      data: {
        documentId,
        userId: userId || null,
        roleId: roleId || null,
        departmentId: departmentId || null,
        canRead: canRead || false,
        canWrite: canWrite || false,
        canDelete: canDelete || false
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        role: true,
        department: true
      }
    });

    await createAuditLog(
      req.user.id,
      'permission_create',
      documentId,
      `Created permission for document`,
      req
    );

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { canRead, canWrite, canDelete } = req.body;

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        ...(canRead !== undefined && { canRead }),
        ...(canWrite !== undefined && { canWrite }),
        ...(canDelete !== undefined && { canDelete })
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        role: true,
        department: true
      }
    });

    await createAuditLog(
      req.user.id,
      'permission_update',
      permission.documentId,
      `Updated permission`,
      req
    );

    res.json({
      success: true,
      message: 'Permission updated successfully',
      data: permission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const permission = await prisma.permission.findUnique({
      where: { id }
    });

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    await prisma.permission.delete({
      where: { id }
    });

    await createAuditLog(
      req.user.id,
      'permission_delete',
      permission.documentId,
      `Deleted permission`,
      req
    );

    res.json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDocumentPermissions,
  createPermission,
  updatePermission,
  deletePermission
};

