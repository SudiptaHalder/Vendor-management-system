import { Router } from 'express';
import { prisma } from '@vendor-management/database';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Get all purchase orders with vendor details
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.purchase_orders.findMany({
      include: {
        vendor: {
          select: {
            supplierCode: true,
            supplierName: true,
            email: true
          }
        },
        lineItems: {
          take: 10,
          orderBy: { lineNumber: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchase orders'
    });
  }
});

// Get purchase order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.purchase_orders.findUnique({
      where: { id },
      include: {
        vendor: true,
        lineItems: {
          orderBy: { lineNumber: 'asc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchase order'
    });
  }
});

export default router;
