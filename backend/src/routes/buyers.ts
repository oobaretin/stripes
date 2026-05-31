import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const buyerRoutes = Router();

// All routes require authentication
buyerRoutes.use(authenticate);

// Get all buyers
buyerRoutes.get(
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
          { firstName: { contains: search as string } },
          { lastName: { contains: search as string } },
          { email: { contains: search as string } },
          { paymentEmail: { contains: search as string } },
          { phone: { contains: search as string } },
        ];
      }
      
      // Filter by preferred buyers if requested
      if (req.query.preferred === 'true') {
        where.isPreferred = true;
      }

      const buyers = await prisma.buyer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { sales: true },
          },
        },
      });

      res.json({
        success: true,
        data: buyers,
        count: buyers.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get buyer by ID
buyerRoutes.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const buyer = await prisma.buyer.findUnique({
      where: { id },
      include: {
        sales: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { saleDate: 'desc' },
        },
      },
    });

    if (!buyer) {
      throw new AppError('Buyer not found', 404);
    }

    res.json({
      success: true,
      data: buyer,
    });
  } catch (error) {
    next(error);
  }
});

// Create buyer
buyerRoutes.post(
  '/',
  [
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        firstName,
        lastName,
        email,
        paymentEmail,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        priceSheetUrl,
        bestFormOfContact,
        facebookLink,
        removeLabels,
        reachOutPriorToInvoicing,
        paymentMethods,
        isPreferred,
        notes,
      } = req.body;

      const buyer = await prisma.buyer.create({
        data: {
          firstName,
          lastName,
          email,
          paymentEmail,
          phone,
          address,
          city,
          state,
          zipCode,
          country: country || 'USA',
          priceSheetUrl,
          bestFormOfContact,
          facebookLink,
          removeLabels: removeLabels ?? false,
          reachOutPriorToInvoicing: reachOutPriorToInvoicing ?? false,
          paymentMethods,
          isPreferred: isPreferred ?? false,
          notes,
        },
      });

      res.status(201).json({
        success: true,
        data: buyer,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update buyer
buyerRoutes.put(
  '/:id',
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const {
        firstName,
        lastName,
        email,
        paymentEmail,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        priceSheetUrl,
        bestFormOfContact,
        facebookLink,
        removeLabels,
        reachOutPriorToInvoicing,
        paymentMethods,
        isPreferred,
        notes,
        isActive,
      } = req.body;

      const existingBuyer = await prisma.buyer.findUnique({
        where: { id },
      });

      if (!existingBuyer) {
        throw new AppError('Buyer not found', 404);
      }

      const buyer = await prisma.buyer.update({
        where: { id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email !== undefined && { email }),
          ...(paymentEmail !== undefined && { paymentEmail }),
          ...(phone && { phone }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(zipCode !== undefined && { zipCode }),
          ...(country && { country }),
          ...(priceSheetUrl !== undefined && { priceSheetUrl }),
          ...(bestFormOfContact !== undefined && { bestFormOfContact }),
          ...(facebookLink !== undefined && { facebookLink }),
          ...(removeLabels !== undefined && { removeLabels }),
          ...(reachOutPriorToInvoicing !== undefined && { reachOutPriorToInvoicing }),
          ...(paymentMethods !== undefined && { paymentMethods }),
          ...(isPreferred !== undefined && { isPreferred }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        success: true,
        data: buyer,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete buyer (soft delete by setting isActive to false)
buyerRoutes.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const buyer = await prisma.buyer.findUnique({
      where: { id },
    });

    if (!buyer) {
      throw new AppError('Buyer not found', 404);
    }

    await prisma.buyer.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Buyer deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
});

