import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const customerRoutes = Router();

// All routes require authentication
customerRoutes.use(authenticate);

// Get all customers
customerRoutes.get(
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
          { phone: { contains: search as string } },
        ];
      }

      const customers = await prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { purchases: true },
          },
        },
      });

      res.json({
        success: true,
        data: customers,
        count: customers.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get customer by ID
customerRoutes.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { purchaseDate: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
});

// Create customer
customerRoutes.post(
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

      const { firstName, lastName, email, phone, address, city, state, zipCode, country, notes } = req.body;

      const customer = await prisma.customer.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          address,
          city,
          state,
          zipCode,
          country: country || 'USA',
          notes,
        },
      });

      res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update customer
customerRoutes.put(
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
      const { firstName, lastName, email, phone, address, city, state, zipCode, country, notes, isActive } = req.body;

      const existingCustomer = await prisma.customer.findUnique({
        where: { id },
      });

      if (!existingCustomer) {
        throw new AppError('Customer not found', 404);
      }

      const customer = await prisma.customer.update({
        where: { id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email !== undefined && { email }),
          ...(phone && { phone }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(zipCode !== undefined && { zipCode }),
          ...(country && { country }),
          ...(notes !== undefined && { notes }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete customer (soft delete by setting isActive to false)
customerRoutes.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    await prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Customer deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
});

