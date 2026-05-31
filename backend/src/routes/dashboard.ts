import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const dashboardRoutes = Router();

// All routes require authentication
dashboardRoutes.use(authenticate);

// Get dashboard statistics
dashboardRoutes.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    // Get counts
    const [
      totalCustomers,
      activeCustomers,
      totalBuyers,
      activeBuyers,
      totalProducts,
      activeProducts,
      totalPurchases,
      totalSales,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.buyer.count(),
      prisma.buyer.count({ where: { isActive: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.purchase.count(),
      prisma.sale.count(),
    ]);

    // Get financial totals
    const purchaseStats = await prisma.purchase.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    const saleStats = await prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    const totalPurchasesAmount = purchaseStats._sum.totalAmount || 0;
    const totalSalesAmount = saleStats._sum.totalAmount || 0;
    const profit = totalSalesAmount - totalPurchasesAmount;

    // Get recent activity
    const recentPurchases = await prisma.purchase.findMany({
      take: 5,
      orderBy: { purchaseDate: 'desc' },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const recentSales = await prisma.sale.findMany({
      take: 5,
      orderBy: { saleDate: 'desc' },
      include: {
        buyer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        counts: {
          customers: { total: totalCustomers, active: activeCustomers },
          buyers: { total: totalBuyers, active: activeBuyers },
          products: { total: totalProducts, active: activeProducts },
          purchases: totalPurchases,
          sales: totalSales,
        },
        financials: {
          totalPurchases: totalPurchasesAmount,
          totalSales: totalSalesAmount,
          profit,
          profitMargin: totalSalesAmount > 0 ? (profit / totalSalesAmount) * 100 : 0,
        },
        recentActivity: {
          purchases: recentPurchases,
          sales: recentSales,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});




