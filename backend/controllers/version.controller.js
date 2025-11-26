const prisma = require('../config/database');
const { uploadToCloudinary } = require('../utils/cloudinary.helper');
const { createAuditLog } = require('../utils/auditLog.helper');

const getDocumentVersions = async (req, res) => {
  try {
    const { documentId } = req.params;

    const versions = await prisma.version.findMany({
      where: { documentId },
      orderBy: {
        version: 'desc'
      },
      include: {
        document: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createVersion = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { changeNote } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get current document
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Upload new version to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'dms/documents');

    // Create new version
    const newVersion = document.version + 1;
    const version = await prisma.version.create({
      data: {
        documentId,
        version: newVersion,
        fileName: req.file.originalname,
        fileUrl: cloudinaryResult.secure_url,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        changeNote: changeNote || `Version ${newVersion}`,
        createdBy: req.user.id
      }
    });

    // Update document with new version info
    await prisma.document.update({
      where: { id: documentId },
      data: {
        version: newVersion,
        fileName: req.file.originalname,
        fileUrl: cloudinaryResult.secure_url,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });

    await createAuditLog(
      req.user.id,
      'document_version_create',
      documentId,
      `Created version ${newVersion} for document: ${document.title}`,
      req
    );

    res.status(201).json({
      success: true,
      message: 'Version created successfully',
      data: version
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const restoreVersion = async (req, res) => {
  try {
    const { id } = req.params;

    const version = await prisma.version.findUnique({
      where: { id },
      include: {
        document: true
      }
    });

    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Version not found'
      });
    }

    // Update document to use this version
    await prisma.document.update({
      where: { id: version.documentId },
      data: {
        fileName: version.fileName,
        fileUrl: version.fileUrl,
        fileSize: version.fileSize,
        mimeType: version.mimeType
      }
    });

    await createAuditLog(
      req.user.id,
      'document_version_restore',
      version.documentId,
      `Restored to version ${version.version}`,
      req
    );

    res.json({
      success: true,
      message: 'Version restored successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDocumentVersions,
  createVersion,
  restoreVersion
};

