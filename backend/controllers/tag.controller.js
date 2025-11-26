const prisma = require('../config/database');

const getAllTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            documents: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getTagById = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        documents: {
          where: {
            isActive: true
          },
          include: {
            document: {
              include: {
                owner: {
                  select: {
                    id: true,
                    username: true,
                    fullName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createTag = async (req, res) => {
  try {
    const { name } = req.body;

    const tag = await prisma.tag.create({
      data: { name }
    });

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Tag name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tag.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  deleteTag
};

