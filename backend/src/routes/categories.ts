import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const categoryRoutes = Router();

// All routes require authentication
categoryRoutes.use(authenticate);

// Get all categories with subcategories and products
categoryRoutes.get('/', async (req: AuthRequest, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        subCategories: {
          where: { isActive: true },
          include: {
            products: {
              where: { isActive: true },
              include: {
                buyerPrices: {
                  include: {
                    buyer: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
              orderBy: { name: 'asc' },
            },
          },
          orderBy: [{ order: 'asc' }],
        },
      },
      orderBy: [{ order: 'asc' }],
    });

    res.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get category by ID
categoryRoutes.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: {
          include: {
            products: {
              include: {
                buyerPrices: {
                  include: {
                    buyer: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
});

// Create category
categoryRoutes.post(
  '/',
  [body('name').trim().notEmpty()],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, description, order } = req.body;

      const category = await prisma.category.create({
        data: {
          name,
          description,
          order: order || 0,
        },
      });

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update category
categoryRoutes.put(
  '/:id',
  [body('name').optional().trim().notEmpty()],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { name, description, order, isActive } = req.body;

      const existingCategory = await prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new AppError('Category not found', 404);
      }

      const category = await prisma.category.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(order !== undefined && { order }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete category (soft delete)
categoryRoutes.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Category deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Subcategory routes
categoryRoutes.post(
  '/:categoryId/subcategories',
  [body('name').trim().notEmpty()],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { categoryId } = req.params;
      const { name, description, order } = req.body;

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      const subCategory = await prisma.subCategory.create({
        data: {
          categoryId,
          name,
          description,
          order: order || 0,
        },
      });

      res.status(201).json({
        success: true,
        data: subCategory,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update subcategory
categoryRoutes.put(
  '/subcategories/:id',
  [body('name').optional().trim().notEmpty()],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { name, description, order, isActive } = req.body;

      const existingSubCategory = await prisma.subCategory.findUnique({
        where: { id },
      });

      if (!existingSubCategory) {
        throw new AppError('Subcategory not found', 404);
      }

      const subCategory = await prisma.subCategory.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(order !== undefined && { order }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        success: true,
        data: subCategory,
      });
    } catch (error) {
      next(error);
    }
  }
);

