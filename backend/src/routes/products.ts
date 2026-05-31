import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const productRoutes = Router();

// All routes require authentication
productRoutes.use(authenticate);

// Get all products
productRoutes.get(
  '/',
  [query('isActive').optional().isBoolean()],
  async (req: AuthRequest, res, next) => {
    try {
      const { isActive, search } = req.query;

      const where: any = {};
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }
      if (search) {
        where.OR = [
          { name: { contains: search as string } },
          { brand: { contains: search as string } },
          { model: { contains: search as string } },
        ];
      }

      const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          subCategory: {
            include: {
              category: true,
            },
          },
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
      });

      res.json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get product by ID
productRoutes.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
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
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

// Create product
productRoutes.post(
  '/',
  [body('name').trim().notEmpty()],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, brand, model, description, colorCode, imageUrl, subCategoryId } = req.body;

      const product = await prisma.product.create({
        data: {
          name,
          brand,
          model,
          description,
          colorCode,
          imageUrl,
          subCategoryId: subCategoryId || undefined,
        },
      });

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update product
productRoutes.put(
  '/:id',
  [body('name').optional().trim().notEmpty()],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { name, brand, model, description, colorCode, imageUrl, subCategoryId, isActive } = req.body;

      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new AppError('Product not found', 404);
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(brand !== undefined && { brand }),
          ...(model !== undefined && { model }),
          ...(description !== undefined && { description }),
          ...(colorCode !== undefined && { colorCode }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(subCategoryId !== undefined && { subCategoryId: subCategoryId || null }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete product (soft delete by setting isActive to false)
productRoutes.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Product deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
});

