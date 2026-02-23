// import { Router } from 'express'
// import { prisma } from '@vendor-management/database'
// import { z } from 'zod'

// const router = Router()

// // Validation schemas
// const createPurchaseOrderSchema = z.object({
//   vendorId: z.string().min(1, 'Vendor is required'),
//   title: z.string().min(1, 'Title is required'),
//   description: z.string().optional(),
//   priority: z.string().default('medium'),
//   expectedDate: z.string().optional(),
//   subtotal: z.number().min(0),
//   taxAmount: z.number().default(0),
//   discount: z.number().default(0),
//   total: z.number().min(0),
//   currency: z.string().default('USD'),
//   notes: z.string().optional(),
//   terms: z.string().optional(),
//   lineItems: z.array(z.object({
//     description: z.string().min(1),
//     quantity: z.number().min(0.01),
//     unitPrice: z.number().min(0),
//     total: z.number().min(0),
//     notes: z.string().optional()
//   }))
// })

// const updatePurchaseOrderSchema = z.object({
//   title: z.string().min(1).optional(),
//   description: z.string().optional(),
//   status: z.string().optional(),
//   priority: z.string().optional(),
//   expectedDate: z.string().optional(),
//   notes: z.string().optional(),
//   terms: z.string().optional()
// }).partial()

// // Generate PO Number
// const generatePONumber = async () => {
//   const year = new Date().getFullYear()
//   const count = await prisma.purchase_orders.count({
//     where: {
//       createdAt: {
//         gte: new Date(year, 0, 1),
//         lt: new Date(year + 1, 0, 1)
//       }
//     }
//   })
//   return `PO-${year}-${(count + 1).toString().padStart(5, '0')}`
// }

// // GET all purchase orders
// router.get('/', async (req, res, next) => {
//   try {
//     console.log('📦 Fetching all purchase orders')
    
//     const purchaseOrders = await prisma.purchase_orders.findMany({
//       where: {
//         deletedAt: null
//       },
//       include: {
//         vendor: {
//           select: {
//             id: true,
//             name: true,
//             email: true
//           }
//         },
//         lineItems: {
//           orderBy: {
//             lineNumber: 'asc'
//           }
//         },
//         createdBy: {
//           select: {
//             id: true,
//             name: true,
//             email: true
//           }
//         }
//       },
//       orderBy: {
//         createdAt: 'desc'
//       }
//     })

//     console.log(`Found ${purchaseOrders.length} purchase orders`)
//     res.json({
//       success: true,
//       data: purchaseOrders
//     })
//   } catch (error) {
//     console.error('Error fetching purchase orders:', error)
//     next(error)
//   }
// })

// // GET single purchase order
// router.get('/:id', async (req, res, next) => {
//   try {
//     const { id } = req.params
    
//     const purchaseOrder = await prisma.purchase_orders.findUnique({
//       where: { id },
//       include: {
//         vendor: true,
//         lineItems: {
//           orderBy: {
//             lineNumber: 'asc'
//           }
//         },
//         createdBy: {
//           select: {
//             id: true,
//             name: true,
//             email: true
//           }
//         },
//         approvedBy: {
//           select: {
//             id: true,
//             name: true,
//             email: true
//           }
//         },
//         rfqs: true,
//         receipts: true
//       }
//     })

//     if (!purchaseOrder || purchaseOrder.deletedAt) {
//       return res.status(404).json({
//         success: false,
//         error: 'Purchase order not found'
//       })
//     }

//     res.json({
//       success: true,
//       data: purchaseOrder
//     })
//   } catch (error) {
//     console.error('Error fetching purchase order:', error)
//     next(error)
//   }
// })

// // POST create purchase order
// router.post('/', async (req, res, next) => {
//   try {
//     console.log('📦 Creating purchase order:', req.body)

//     const validated = createPurchaseOrderSchema.parse(req.body)
    
//     const userId = (req as any).user?.id
    
//     if (!userId) {
//       console.error('❌ User not authenticated - no user ID found in request')
//       return res.status(401).json({
//         success: false,
//         error: 'User not authenticated'
//       })
//     }

//     console.log('✅ User authenticated:', userId)

//     const poNumber = await generatePONumber()

//     const purchaseOrder = await prisma.purchase_orders.create({
//       data: {
//         poNumber,
//         vendorId: validated.vendorId,
//         title: validated.title,
//         description: validated.description,
//         priority: validated.priority,
//         expectedDate: validated.expectedDate ? new Date(validated.expectedDate) : null,
//         subtotal: validated.subtotal,
//         taxAmount: validated.taxAmount,
//         discount: validated.discount,
//         total: validated.total,
//         currency: validated.currency,
//         notes: validated.notes,
//         terms: validated.terms,
//         createdById: userId,
//         status: 'draft',
//         companyId: null,
//         lineItems: {
//           create: validated.lineItems.map((item, index) => ({
//             lineNumber: index + 1, // ✅ Add lineNumber (1-based index)
//             description: item.description,
//             quantity: item.quantity,
//             unitPrice: item.unitPrice,
//             total: item.total,
//             notes: item.notes || null
//           }))
//         }
//       },
//       include: {
//         vendor: true,
//         lineItems: {
//           orderBy: {
//             lineNumber: 'asc'
//           }
//         },
//         createdBy: {
//           select: {
//             name: true,
//             email: true
//           }
//         }
//       }
//     })

//     console.log('✅ Purchase order created:', purchaseOrder.poNumber)
//     res.status(201).json({
//       success: true,
//       data: purchaseOrder
//     })
//   } catch (error) {
//     console.error('Error creating purchase order:', error)
//     next(error)
//   }
// })

// // PUT update purchase order
// router.put('/:id', async (req, res, next) => {
//   try {
//     const { id } = req.params
//     const validated = updatePurchaseOrderSchema.parse(req.body)

//     const purchaseOrder = await prisma.purchase_orders.update({
//       where: { id },
//       data: {
//         ...validated,
//         expectedDate: validated.expectedDate ? new Date(validated.expectedDate) : undefined
//       },
//       include: {
//         vendor: true,
//         lineItems: {
//           orderBy: {
//             lineNumber: 'asc'
//           }
//         }
//       }
//     })

//     console.log('✅ Purchase order updated:', purchaseOrder.poNumber)
//     res.json({
//       success: true,
//       data: purchaseOrder
//     })
//   } catch (error) {
//     console.error('Error updating purchase order:', error)
//     next(error)
//   }
// })

// // PUT update status
// router.put('/:id/status', async (req, res, next) => {
//   try {
//     const { id } = req.params
//     const { status } = z.object({
//       status: z.enum(['draft', 'sent', 'acknowledged', 'confirmed', 'shipped', 'delivered', 'cancelled'])
//     }).parse(req.body)

//     const purchaseOrder = await prisma.purchase_orders.update({
//       where: { id },
//       data: {
//         status,
//         ...(status === 'delivered' ? { deliveredAt: new Date() } : {})
//       }
//     })

//     console.log('✅ Purchase order status updated:', purchaseOrder.poNumber, status)
//     res.json({
//       success: true,
//       data: purchaseOrder
//     })
//   } catch (error) {
//     console.error('Error updating purchase order status:', error)
//     next(error)
//   }
// })

// // DELETE purchase order (soft delete)
// router.delete('/:id', async (req, res, next) => {
//   try {
//     const { id } = req.params

//     await prisma.purchase_orders.update({
//       where: { id },
//       data: { deletedAt: new Date() }
//     })

//     console.log('✅ Purchase order deleted:', id)
//     res.json({
//       success: true,
//       message: 'Purchase order deleted successfully'
//     })
//   } catch (error) {
//     console.error('Error deleting purchase order:', error)
//     next(error)
//   }
// })

// export default router
import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createPurchaseOrderSchema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.string().default('medium'),
  expectedDate: z.string().optional(),
  subtotal: z.number().min(0),
  taxAmount: z.number().default(0),
  discount: z.number().default(0),
  total: z.number().min(0),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().min(0.01),
    unitPrice: z.number().min(0),
    total: z.number().min(0),
    notes: z.string().optional().nullable()
  }))
})

const updatePurchaseOrderSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  expectedDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  subtotal: z.number().min(0).optional(),
  taxAmount: z.number().default(0).optional(),
  discount: z.number().default(0).optional(),
  total: z.number().min(0).optional(),
  currency: z.string().default('USD').optional(),
  lineItems: z.array(z.object({
    lineNumber: z.number(),
    description: z.string().min(1),
    quantity: z.number().min(0.01),
    unitPrice: z.number().min(0),
    total: z.number().min(0),
    notes: z.string().optional().nullable()
  })).optional()
}).partial()

// Generate PO Number
const generatePONumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.purchase_orders.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `PO-${year}-${(count + 1).toString().padStart(5, '0')}`
}

// GET all purchase orders
router.get('/', async (req, res, next) => {
  try {
    console.log('📦 Fetching all purchase orders')
    
    const purchaseOrders = await prisma.purchase_orders.findMany({
      where: {
        deletedAt: null
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            contactPerson: true
          }
        },
        lineItems: {
          orderBy: {
            lineNumber: 'asc'
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${purchaseOrders.length} purchase orders`)
    res.json({
      success: true,
      data: purchaseOrders
    })
  } catch (error) {
    console.error('❌ Error fetching purchase orders:', error)
    next(error)
  }
})

// GET single purchase order
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    
    const purchaseOrder = await prisma.purchase_orders.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            contactPerson: true
          }
        },
        lineItems: {
          orderBy: {
            lineNumber: 'asc'
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!purchaseOrder || purchaseOrder.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found'
      })
    }

    res.json({
      success: true,
      data: purchaseOrder
    })
  } catch (error) {
    console.error('❌ Error fetching purchase order:', error)
    next(error)
  }
})

// POST create purchase order
router.post('/', async (req, res, next) => {
  try {
    console.log('📦 Creating purchase order')

    const validated = createPurchaseOrderSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    
    if (!userId) {
      console.error('❌ User not authenticated - no user ID found in request')
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    console.log('✅ User authenticated:', userId)

    const poNumber = await generatePONumber()

    const purchaseOrder = await prisma.purchase_orders.create({
      data: {
        poNumber,
        vendorId: validated.vendorId,
        title: validated.title,
        description: validated.description,
        priority: validated.priority,
        expectedDate: validated.expectedDate ? new Date(validated.expectedDate) : null,
        subtotal: validated.subtotal,
        taxAmount: validated.taxAmount,
        discount: validated.discount,
        total: validated.total,
        currency: validated.currency,
        notes: validated.notes || null,
        terms: validated.terms || null,
        createdById: userId,
        status: 'draft',
        companyId: null,
        lineItems: {
          create: validated.lineItems.map((item, index) => ({
            lineNumber: index + 1,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            notes: item.notes || null
          }))
        }
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            contactPerson: true
          }
        },
        lineItems: {
          orderBy: {
            lineNumber: 'asc'
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log('✅ Purchase order created:', purchaseOrder.poNumber)
    res.status(201).json({
      success: true,
      data: purchaseOrder
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors)
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    console.error('❌ Error creating purchase order:', error)
    next(error)
  }
})

// PUT update purchase order - FULL UPDATE including line items
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const validated = updatePurchaseOrderSchema.parse(req.body)

    console.log('📦 Updating purchase order:', id)

    // Start a transaction to handle PO update and line items
    const purchaseOrder = await prisma.$transaction(async (tx) => {
      // 1. Update the purchase order main details
      const updateData: any = {}
      
      if (validated.title !== undefined) updateData.title = validated.title
      if (validated.description !== undefined) updateData.description = validated.description
      if (validated.priority !== undefined) updateData.priority = validated.priority
      if (validated.expectedDate !== undefined) updateData.expectedDate = validated.expectedDate ? new Date(validated.expectedDate) : null
      if (validated.notes !== undefined) updateData.notes = validated.notes || null
      if (validated.terms !== undefined) updateData.terms = validated.terms || null
      if (validated.subtotal !== undefined) updateData.subtotal = validated.subtotal
      if (validated.taxAmount !== undefined) updateData.taxAmount = validated.taxAmount
      if (validated.discount !== undefined) updateData.discount = validated.discount
      if (validated.total !== undefined) updateData.total = validated.total
      if (validated.currency !== undefined) updateData.currency = validated.currency
      if (validated.status !== undefined) updateData.status = validated.status

      await tx.purchase_orders.update({
        where: { id },
        data: updateData
      })

      // 2. If line items are provided, replace all of them
      if (validated.lineItems && validated.lineItems.length > 0) {
        // Delete all existing line items
        await tx.purchase_order_line_items.deleteMany({
          where: { purchaseOrderId: id }
        })

        // Create new line items with fresh IDs
        await tx.purchase_order_line_items.createMany({
          data: validated.lineItems.map((item, index) => ({
            purchaseOrderId: id,
            lineNumber: item.lineNumber || index + 1,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            notes: item.notes || null
          }))
        })
      }

      // 3. Return the updated PO with all relations - VENDOR INCLUDED
      return await tx.purchase_orders.findUnique({
        where: { id },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              contactPerson: true
            }
          },
          lineItems: {
            orderBy: {
              lineNumber: 'asc'
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    })

    console.log('✅ Purchase order updated:', purchaseOrder?.poNumber)
    res.json({
      success: true,
      data: purchaseOrder
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors)
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    console.error('❌ Error updating purchase order:', error)
    next(error)
  }
})

// PUT update status
router.put('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = z.object({
      status: z.enum(['draft', 'sent', 'acknowledged', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    }).parse(req.body)

    const purchaseOrder = await prisma.purchase_orders.update({
      where: { id },
      data: {
        status,
        ...(status === 'delivered' ? { deliveredAt: new Date() } : {})
      }
    })

    console.log('✅ Purchase order status updated:', purchaseOrder.poNumber, status)
    res.json({
      success: true,
      data: purchaseOrder
    })
  } catch (error) {
    console.error('❌ Error updating purchase order status:', error)
    next(error)
  }
})

// DELETE purchase order (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const purchaseOrder = await prisma.purchase_orders.findUnique({
      where: { id }
    })

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found'
      })
    }

    if (purchaseOrder.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete purchase order that is not in draft status'
      })
    }

    await prisma.purchase_orders.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    console.log('✅ Purchase order deleted:', id)
    res.json({
      success: true,
      message: 'Purchase order deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting purchase order:', error)
    next(error)
  }
})

export default router

