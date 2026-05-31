import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const authRoutes = Router();

// Register business owner
authRoutes.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          error: {
            // express-validator ValidationError provides `msg` (not `message`)
            message: errors.array().map((e) => e.msg).join(', ')
          },
          errors: errors.array() 
        });
      }

      const { email, password, firstName, lastName, phone, address, city, state, zipCode, country } = req.body;

      // Check if owner already exists
      const existingOwner = await prisma.businessOwner.findUnique({
        where: { email },
      });

      if (existingOwner) {
        throw new AppError('Business owner with this email already exists', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create owner
      const owner = await prisma.businessOwner.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          address,
          city,
          state,
          zipCode,
          country: country || 'USA',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          createdAt: true,
        },
      });

      // Generate JWT
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not configured');
      }

      const token = jwt.sign({ userId: owner.id }, secret, { expiresIn: '7d' });

      res.status(201).json({
        success: true,
        data: {
          owner,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
authRoutes.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      const owner = await prisma.businessOwner.findUnique({
        where: { email },
      });

      if (!owner) {
        throw new AppError('Invalid email or password', 401);
      }

      const isValidPassword = await bcrypt.compare(password, owner.password);

      if (!isValidPassword) {
        throw new AppError('Invalid email or password', 401);
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not configured');
      }

      const token = jwt.sign({ userId: owner.id }, secret, { expiresIn: '7d' });

      res.json({
        success: true,
        data: {
          owner: {
            id: owner.id,
            email: owner.email,
            firstName: owner.firstName,
            lastName: owner.lastName,
            phone: owner.phone,
            address: owner.address,
            city: owner.city,
            state: owner.state,
            zipCode: owner.zipCode,
            country: owner.country,
            createdAt: owner.createdAt,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current user
authRoutes.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const owner = await prisma.businessOwner.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!owner) {
      throw new AppError('Owner not found', 404);
    }

    res.json({
      success: true,
      data: owner,
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
authRoutes.put(
  '/profile',
  authenticate,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, firstName, lastName, phone, address, city, state, zipCode, country } = req.body;

      // If email is being updated, check for conflicts
      if (email) {
        const existingOwner = await prisma.businessOwner.findFirst({
          where: {
            email,
            NOT: { id: req.userId },
          },
        });

        if (existingOwner) {
          throw new AppError('Email already in use', 409);
        }
      }

      const owner = await prisma.businessOwner.update({
        where: { id: req.userId! },
        data: {
          ...(email && { email }),
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(zipCode !== undefined && { zipCode }),
          ...(country && { country }),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        data: owner,
      });
    } catch (error) {
      next(error);
    }
  }
);







