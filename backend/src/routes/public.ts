import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const publicRoutes = Router();

/**
 * Public product options for the seller quote form (/sell).
 * No auth required.
 */
publicRoutes.get('/products', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        ndcCode: true,
        subCategory: {
          select: {
            name: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        ndcCode: p.ndcCode || null,
        subCategoryName: p.subCategory?.name || null,
        categoryName: p.subCategory?.category?.name || null,
      })),
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
});


