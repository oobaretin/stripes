import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const adminRoutes = Router();

// All routes require authentication
adminRoutes.use(authenticate);

/**
 * Admin endpoint to seed the database
 * WARNING: This should be protected in production!
 * For now, any authenticated user can trigger seeding
 */
adminRoutes.post('/seed', async (req: AuthRequest, res, next) => {
  try {
    // In production, you might want to add additional checks here
    // For example, check if user is admin, or add a secret token
    
    console.log('🌱 Starting database seeding via API...');
    
    // Import seed functions
    const { seedBuyers } = await import('../scripts/seedBuyers');
    const seedNortheastMedicalProducts = (await import('../scripts/seedNortheastMedicalProducts')).default;
    
    const results: any = {
      buyers: { success: false, message: '' },
      products: { success: false, message: '' },
    };
    
    try {
      // Step 1: Seed buyers
      console.log('📋 Seeding buyers...');
      await seedBuyers();
      results.buyers = { success: true, message: 'Buyers seeded successfully' };
      console.log('✅ Buyers seeded');
    } catch (error: any) {
      console.error('❌ Error seeding buyers:', error);
      results.buyers = { success: false, message: error.message || 'Failed to seed buyers' };
    }
    
    try {
      // Step 2: Seed product catalog + Northeast pricing (idempotent)
      console.log('📦 Seeding products and Northeast Medical Exchange pricing...');
      await seedNortheastMedicalProducts();
      results.products = { success: true, message: 'Products seeded successfully' };
      console.log('✅ Products seeded');
    } catch (error: any) {
      console.error('❌ Error seeding products:', error);
      results.products = { success: false, message: error.message || 'Failed to seed products' };
    }
    
    const [buyerCount, categoryCount, productCount] = await Promise.all([
      prisma.buyer.count(),
      prisma.category.count(),
      prisma.product.count(),
    ]);

    const allSuccess =
      results.buyers.success &&
      results.products.success &&
      categoryCount > 0 &&
      productCount > 0;
    
    res.json({
      success: allSuccess,
      message: allSuccess 
        ? 'Database seeded successfully!' 
        : 'Seeding completed with some errors. Check results for details.',
      results,
      counts: {
        buyers: buyerCount,
        categories: categoryCount,
        products: productCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Check seeding status
 */
adminRoutes.get('/seed/status', async (req: AuthRequest, res, next) => {
  try {
    const [buyerCount, categoryCount, productCount] = await Promise.all([
      prisma.buyer.count(),
      prisma.category.count(),
      prisma.product.count(),
    ]);
    
    res.json({
      success: true,
      data: {
        buyers: buyerCount,
        categories: categoryCount,
        products: productCount,
        isSeeded: buyerCount > 0 && categoryCount > 0 && productCount > 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Seed additional buyer price sheets (no terminal required)
 *
 * Body:
 *  - { keys?: string[] } where keys can include:
 *      "charles-harris" | "chris-sampson" | "path-medical" | "ralph-walton" | "max-med"
 *    If omitted, seeds all.
 */
adminRoutes.post('/seed/prices', async (req: AuthRequest, res, next) => {
  try {
    const keys: string[] = Array.isArray(req.body?.keys) ? req.body.keys : [];
    const requested = keys.length > 0 ? new Set(keys) : null;

    const results: Record<string, { success: boolean; message: string }> = {};

    const runIfRequested = async (
      key: string,
      runner: () => Promise<void>
    ) => {
      if (requested && !requested.has(key)) return;
      try {
        await runner();
        results[key] = { success: true, message: 'ok' };
      } catch (e: any) {
        results[key] = { success: false, message: e?.message || 'failed' };
      }
    };

    // Import runners lazily (avoid loading large modules unless needed)
    await runIfRequested('charles-harris', async () => {
      const mod = await import('../scripts/addCharlesHarrisPrices');
      await mod.addCharlesHarrisPrices();
    });
    await runIfRequested('chris-sampson', async () => {
      const mod = await import('../scripts/addChrisSampsonPrices');
      await mod.addChrisSampsonPrices();
    });
    await runIfRequested('path-medical', async () => {
      const mod = await import('../scripts/addPathMedicalPrices');
      await mod.addPathMedicalPrices();
    });
    await runIfRequested('ralph-walton', async () => {
      const mod = await import('../scripts/addRalphWaltonPrices');
      await mod.addRalphWaltonPrices();
    });
    await runIfRequested('max-med', async () => {
      const mod = await import('../scripts/addMaxMedPrices');
      await mod.addMaxMedPrices();
    });

    // Report current pricing coverage
    const buyerPriceCount = await prisma.buyerProductPrice.count();

    const allOk = Object.values(results).every((r) => r.success);
    res.json({
      success: allOk,
      results,
      counts: {
        buyerPrices: buyerPriceCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Cleanup empty categories/subcategories (removes empty sections from the UI).
 */
adminRoutes.post('/cleanup/empty', async (req: AuthRequest, res, next) => {
  try {
    const mod = await import('../scripts/cleanupEmptyCatalog');
    const result = await mod.cleanupEmptyCatalog();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});


