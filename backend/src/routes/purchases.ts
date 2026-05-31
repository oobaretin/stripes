import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const purchaseRoutes = Router();

// All routes require authentication
purchaseRoutes.use(authenticate);

// Get all purchases
purchaseRoutes.get('/', async (req: AuthRequest, res, next) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { purchaseDate: 'desc' },
    });

    res.json({
      success: true,
      data: purchases,
      count: purchases.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get purchase by ID
purchaseRoutes.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new AppError('Purchase not found', 404);
    }

    res.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
});

// Create purchase
purchaseRoutes.post(
  '/',
  [
    body('customerId').notEmpty(),
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

      const { customerId, purchaseDate, items, notes, purchaseMethod } = req.body;

      // Verify customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      // Calculate total and validate items
      let totalAmount = 0;
      const purchaseItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new AppError(`Product with ID ${item.productId} not found`, 404);
        }

        const totalPrice = item.quantity * item.unitPrice;
        totalAmount += totalPrice;

        purchaseItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
          expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
          lotNumber: item.lotNumber || null,
        });
      }

      // Create purchase with items in a transaction
      const purchase = await prisma.purchase.create({
        data: {
          customerId,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          purchaseMethod: purchaseMethod || 'in-person',
          totalAmount,
          notes,
          items: {
            create: purchaseItems,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: purchase,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update purchase
purchaseRoutes.put(
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
      const { customerId, purchaseDate, purchaseMethod, items, notes } = req.body;

      const existingPurchase = await prisma.purchase.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existingPurchase) {
        throw new AppError('Purchase not found', 404);
      }

      // If items are being updated, recalculate total
      let updateData: any = {
        ...(customerId && { customerId }),
        ...(purchaseDate && { purchaseDate: new Date(purchaseDate) }),
        ...(purchaseMethod && { purchaseMethod }),
        ...(notes !== undefined && { notes }),
      };

      if (items) {
        // Delete existing items and create new ones
        await prisma.purchaseItem.deleteMany({
          where: { purchaseId: id },
        });

        let totalAmount = 0;
        const purchaseItems = [];

        for (const item of items) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new AppError(`Product with ID ${item.productId} not found`, 404);
          }

          const totalPrice = item.quantity * item.unitPrice;
          totalAmount += totalPrice;

          purchaseItems.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice,
            expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
            lotNumber: item.lotNumber || null,
          });
        }

        updateData.totalAmount = totalAmount;
        updateData.items = {
          create: purchaseItems,
        };
      }

      const purchase = await prisma.purchase.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: purchase,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete purchase
purchaseRoutes.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
    });

    if (!purchase) {
      throw new AppError('Purchase not found', 404);
    }

    // Items will be deleted automatically due to onDelete: Cascade
    await prisma.purchase.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Purchase deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

