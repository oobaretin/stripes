import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const saleRoutes = Router();

// All routes require authentication
saleRoutes.use(authenticate);

// Get all sales
saleRoutes.get('/', async (req: AuthRequest, res, next) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        buyer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { saleDate: 'desc' },
    });

    res.json({
      success: true,
      data: sales,
      count: sales.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get sale by ID
saleRoutes.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        buyer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
});

// Create sale
saleRoutes.post(
  '/',
  [
    body('buyerId').notEmpty(),
    body('items').isArray({ min: 1 }),
    body('items.*.productId').notEmpty(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('items.*.unitPrice').isFloat({ min: 0 }),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { buyerId, saleDate, items, notes } = req.body;

      // Verify buyer exists
      const buyer = await prisma.buyer.findUnique({
        where: { id: buyerId },
      });

      if (!buyer) {
        throw new AppError('Buyer not found', 404);
      }

      // Calculate total and validate items
      let totalAmount = 0;
      let totalCost = 0;
      const saleItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new AppError(`Product with ID ${item.productId} not found`, 404);
        }

        const totalPrice = item.quantity * item.unitPrice;
        totalAmount += totalPrice;

        // Calculate cost: Get average purchase price for this product
        const purchaseItems = await prisma.purchaseItem.findMany({
          where: { productId: item.productId },
          orderBy: { createdAt: 'desc' },
          take: 10, // Get recent purchases for average
        });

        let avgCost = 0;
        if (purchaseItems.length > 0) {
          const totalCostForProduct = purchaseItems.reduce((sum, pi) => sum + pi.totalPrice, 0);
          const totalQtyForProduct = purchaseItems.reduce((sum, pi) => sum + pi.quantity, 0);
          avgCost = totalQtyForProduct > 0 ? totalCostForProduct / totalQtyForProduct : 0;
        }

        const itemCost = avgCost * item.quantity;
        totalCost += itemCost;

        saleItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
        });
      }

      // Calculate profit and profit margin
      const profit = totalAmount - totalCost;
      const profitMargin = totalAmount > 0 ? (profit / totalAmount) * 100 : 0;

      // Create sale with items in a transaction
      const sale = await prisma.sale.create({
        data: {
          buyerId,
          saleDate: saleDate ? new Date(saleDate) : new Date(),
          totalAmount,
          profit,
          profitMargin,
          notes,
          items: {
            create: saleItems,
          },
        },
        include: {
          buyer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update sale
saleRoutes.put(
  '/:id',
  [
    body('items').optional().isArray({ min: 1 }),
    body('items.*.productId').optional().notEmpty(),
    body('items.*.quantity').optional().isInt({ min: 1 }),
    body('items.*.unitPrice').optional().isFloat({ min: 0 }),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { buyerId, saleDate, items, notes } = req.body;

      const existingSale = await prisma.sale.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existingSale) {
        throw new AppError('Sale not found', 404);
      }

      // If items are being updated, recalculate total
      let updateData: any = {
        ...(buyerId && { buyerId }),
        ...(saleDate && { saleDate: new Date(saleDate) }),
        ...(notes !== undefined && { notes }),
      };

      if (items) {
        // Delete existing items and create new ones
        await prisma.saleItem.deleteMany({
          where: { saleId: id },
        });

        let totalAmount = 0;
        let totalCost = 0;
        const saleItems = [];

        for (const item of items) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new AppError(`Product with ID ${item.productId} not found`, 404);
          }

          const totalPrice = item.quantity * item.unitPrice;
          totalAmount += totalPrice;

          // Calculate cost: Get average purchase price for this product
          const purchaseItems = await prisma.purchaseItem.findMany({
            where: { productId: item.productId },
            orderBy: { createdAt: 'desc' },
            take: 10,
          });

          let avgCost = 0;
          if (purchaseItems.length > 0) {
            const totalCostForProduct = purchaseItems.reduce((sum, pi) => sum + pi.totalPrice, 0);
            const totalQtyForProduct = purchaseItems.reduce((sum, pi) => sum + pi.quantity, 0);
            avgCost = totalQtyForProduct > 0 ? totalCostForProduct / totalQtyForProduct : 0;
          }

          const itemCost = avgCost * item.quantity;
          totalCost += itemCost;

          saleItems.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice,
          });
        }

        // Calculate profit and profit margin
        const profit = totalAmount - totalCost;
        const profitMargin = totalAmount > 0 ? (profit / totalAmount) * 100 : 0;

        updateData.totalAmount = totalAmount;
        updateData.profit = profit;
        updateData.profitMargin = profitMargin;
        updateData.items = {
          create: saleItems,
        };
      }

      const sale = await prisma.sale.update({
        where: { id },
        data: updateData,
        include: {
          buyer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete sale
saleRoutes.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
    });

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    // Items will be deleted automatically due to onDelete: Cascade
    await prisma.sale.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Sale deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

