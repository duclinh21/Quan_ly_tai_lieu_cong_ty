const prisma = require('../config/database');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.helper');
const { createAuditLog } = require('../utils/auditLog.helper');

// Get all documents
const getAllDocuments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      categoryId,
      departmentId,
      search,
      tagId
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      isActive: true
    };

    if (categoryId) where.categoryId = categoryId;
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }
    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId
        }
      };
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          category: true,
          department: true,
          owner: {
            select: {
              id: true,
              username: true,
              fullName: true,
              email: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              versions: true,
              permissions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.document.count({ where })
    ]);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get document by ID
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        category: true,
        department: true,
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        versions: {
          orderBy: {
            version: 'desc'
          },
          take: 10
        },
        permissions: {
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
        }
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Kiểm tra nếu tài liệu bị khóa (checkout)
    const checkout = await prisma.checkout.findUnique({
      where: { documentId: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });

    // Nếu tài liệu bị khóa, chỉ admin mới có thể xem
    if (checkout) {
      // Kiểm tra nếu checkout đã hết hạn
      if (checkout.expiresAt && checkout.expiresAt < new Date()) {
        // Xóa checkout hết hạn
        await prisma.checkout.delete({
          where: { documentId: id }
        });
      } else {
        // Tài liệu đang bị khóa - chỉ admin mới có thể xem
        const isAdmin = req.user.role.name === 'admin';

        if (!isAdmin) {
          return res.status(403).json({
            success: false,
            message: 'Tài liệu đang bị khóa. Chỉ admin mới có thể truy cập tài liệu này.',
            data: {
              isLocked: true,
              lockedBy: checkout.user
            }
          });
        }
      }
    }

    await createAuditLog(req.user.id, 'document_view', id, `Viewed document: ${document.title}`, req);

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Upload document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, categoryId, departmentId, tags } = req.body;
    const file = req.file;

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(file.buffer, 'dms/documents');

    // Parse tags if provided
    let tagIds = [];
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      for (const tagName of tagArray) {
        let tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (!tag) {
          tag = await prisma.tag.create({ data: { name: tagName } });
        }
        tagIds.push(tag.id);
      }
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        title,
        description,
        fileName: file.originalname,
        fileUrl: cloudinaryResult.secure_url,
        fileSize: file.size,
        mimeType: file.mimetype,
        categoryId: categoryId || null,
        departmentId: departmentId || null,
        ownerId: req.user.id,
        tags: {
          create: tagIds.map(tagId => ({
            tagId
          }))
        }
      },
      include: {
        category: true,
        department: true,
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    // Create initial version
    await prisma.version.create({
      data: {
        documentId: document.id,
        version: 1,
        fileName: file.originalname,
        fileUrl: cloudinaryResult.secure_url,
        fileSize: file.size,
        mimeType: file.mimetype,
        createdBy: req.user.id,
        changeNote: 'Initial version'
      }
    });

    await createAuditLog(req.user.id, 'document_upload', document.id, `Uploaded document: ${title}`, req);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update document
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId, departmentId, tags } = req.body;

    // Check if document exists
    const existingDocument = await prisma.document.findUnique({
      where: { id }
    });

    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update tags if provided
    let tagUpdates = {};
    if (tags !== undefined) {
      // Remove existing tags
      await prisma.documentTag.deleteMany({
        where: { documentId: id }
      });

      // Add new tags
      if (tags && tags.length > 0) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        const tagConnections = [];
        for (const tagName of tagArray) {
          let tag = await prisma.tag.findUnique({ where: { name: tagName } });
          if (!tag) {
            tag = await prisma.tag.create({ data: { name: tagName } });
          }
          tagConnections.push({ tagId: tag.id });
        }
        tagUpdates = {
          create: tagConnections
        };
      }
    }

    // Update document
    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(departmentId !== undefined && { departmentId: departmentId || null }),
        ...(Object.keys(tagUpdates).length > 0 && { tags: tagUpdates })
      },
      include: {
        category: true,
        department: true,
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    await createAuditLog(req.user.id, 'document_update', id, `Updated document: ${document.title}`, req);

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete from Cloudinary
    try {
      const publicId = document.fileUrl.split('/').slice(-2).join('/').split('.')[0];
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
    }

    // Soft delete (set isActive to false)
    await prisma.document.update({
      where: { id },
      data: { isActive: false }
    });

    await createAuditLog(req.user.id, 'document_delete', id, `Deleted document: ${document.title}`, req);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument
};

