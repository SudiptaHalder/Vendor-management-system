import { Router } from 'express'
import { prisma } from '@vendor-management/database'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const router = Router()

// Validation schemas
const createReportSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  description: z.string().optional().nullable(),
  type: z.string(),
  category: z.string(),
  parameters: z.any().optional().nullable(),
  isScheduled: z.boolean().default(false),
  schedule: z.string().optional().nullable(),
  format: z.string().default('json'),
  status: z.string().default('draft')
})

// Generate Report Number
const generateReportNumber = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.reports.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    }
  })
  return `RPT-${year}-${(count + 1).toString().padStart(4, '0')}`
}

// ============ REPORT CATEGORIES ============

// GET report categories
router.get('/categories', async (req, res) => {
  try {
    const reports = await prisma.reports.findMany({
      where: { deletedAt: null },
      select: { category: true, type: true },
      distinct: ['category', 'type']
    })

    const categories = Array.from(new Set(reports.map(r => r.category)))
    const types = Array.from(new Set(reports.map(r => r.type)))

    res.json({
      success: true,
      data: {
        categories,
        types
      }
    })
  } catch (error) {
    console.error('Error fetching report categories:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report categories'
    })
  }
})

// ============ REPORTS ============

// GET all reports
router.get('/', async (req, res) => {
  try {
    const { type, category, status, search } = req.query
    
    const where: any = {
      deletedAt: null
    }
    
    if (type) where.type = type
    if (category) where.category = category
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { reportNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    const reports = await prisma.reports.findMany({
      where,
      include: {
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

    res.json({
      success: true,
      data: reports
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    })
  }
})

// GET single report
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const report = await prisma.reports.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!report || report.deletedAt) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report'
    })
  }
})

// POST create report
router.post('/', async (req, res) => {
  try {
    console.log('Creating report:', JSON.stringify(req.body, null, 2))
    
    const validated = createReportSchema.parse(req.body)
    
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const reportNumber = await generateReportNumber()

    const report = await prisma.reports.create({
      data: {
        reportNumber,
        name: validated.name,
        description: validated.description,
        type: validated.type,
        category: validated.category,
        parameters: validated.parameters || {},
        isScheduled: validated.isScheduled,
        schedule: validated.schedule,
        format: validated.format,
        status: validated.status,
        createdById: userId,
        companyId: user?.companyId || null
      }
    })

    console.log('✅ Report created:', report.reportNumber)
    
    res.status(201).json({
      success: true,
      data: report
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error creating report:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create report',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// PUT update report
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validated = createReportSchema.partial().parse(req.body)

    const report = await prisma.reports.update({
      where: { id },
      data: {
        name: validated.name,
        description: validated.description,
        type: validated.type,
        category: validated.category,
        parameters: validated.parameters,
        isScheduled: validated.isScheduled,
        schedule: validated.schedule,
        format: validated.format,
        status: validated.status
      }
    })

    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }
    console.error('Error updating report:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update report'
    })
  }
})

// POST run report
router.post('/:id/run', async (req, res) => {
  try {
    const { id } = req.params
    const { params } = req.body

    const report = await prisma.reports.findUnique({
      where: { id }
    })

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    // Merge saved parameters with runtime parameters
    const runParams = {
      ...(report.parameters as any || {}),
      ...(params || {})
    }

    // Generate report data based on type
    let data = null
    const startTime = Date.now()

    switch (report.type) {
      case 'vendor':
        data = await generateVendorReport(runParams)
        break
      case 'procurement':
        data = await generateProcurementReport(runParams)
        break
      case 'financial':
        data = await generateFinancialReport(runParams)
        break
      case 'project':
        data = await generateProjectReport(runParams)
        break
      default:
        data = await generateGenericReport(runParams)
    }

    // Update report with run info
    await prisma.reports.update({
      where: { id },
      data: {
        lastRunAt: new Date(),
        data: data as any
      }
    })

    const executionTime = Date.now() - startTime

    res.json({
      success: true,
      data: {
        report,
        result: data,
        executionTime,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error running report:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to run report'
    })
  }
})

// GET export report
router.get('/:id/export', async (req, res) => {
  try {
    const { id } = req.params
    const { format } = req.query

    const report = await prisma.reports.findUnique({
      where: { id }
    })

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    if (!report.data) {
      return res.status(400).json({
        success: false,
        error: 'No data available. Please run the report first.'
      })
    }

    let exportData: Buffer | string
    let contentType: string
    let filename: string

    switch (format) {
      case 'csv':
        exportData = convertToCSV(report.data)
        contentType = 'text/csv'
        filename = `${report.reportNumber}_${Date.now()}.csv`
        break
      case 'excel':
        exportData = convertToExcel(report.data)
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = `${report.reportNumber}_${Date.now()}.xlsx`
        break
      case 'pdf':
      default:
        exportData = convertToPDF(report.data)
        contentType = 'application/pdf'
        filename = `${report.reportNumber}_${Date.now()}.pdf`
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(exportData)
  } catch (error) {
    console.error('Error exporting report:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to export report'
    })
  }
})

// DELETE report (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.reports.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    res.json({
      success: true,
      message: 'Report deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting report:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete report'
    })
  }
})

// ============ REPORT GENERATORS ============

async function generateVendorReport(params: any) {
  const where: any = { deletedAt: null }
  
  if (params.status) where.status = params.status
  if (params.category) where.categoryId = params.category
  if (params.rating) where.rating = { gte: params.rating }

  const vendors = await prisma.vendors.findMany({
    where,
    include: {
      category: true,
      _count: {
        select: {
          contracts: true,
          purchaseOrders: true,
          quotes: true
        }
      }
    }
  })

  const totalContracts = vendors.reduce((sum, v) => sum + v._count.contracts, 0)
  const totalPOs = vendors.reduce((sum, v) => sum + v._count.purchaseOrders, 0)
  const avgRating = vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length

  return {
    summary: {
      totalVendors: vendors.length,
      activeVendors: vendors.filter(v => v.status === 'active').length,
      pendingVendors: vendors.filter(v => v.status === 'pending').length,
      totalContracts,
      totalPOs,
      averageRating: avgRating.toFixed(2)
    },
    vendors: vendors.map(v => ({
      id: v.id,
      name: v.name,
      status: v.status,
      category: v.category?.name,
      rating: v.rating,
      contracts: v._count.contracts,
      purchaseOrders: v._count.purchaseOrders,
      quotes: v._count.quotes
    })),
    filters: params
  }
}

async function generateProcurementReport(params: any) {
  const { startDate, endDate, status } = params
  
  const dateFilter: any = {}
  if (startDate || endDate) {
    dateFilter.createdAt = {}
    if (startDate) dateFilter.createdAt.gte = new Date(startDate)
    if (endDate) dateFilter.createdAt.lte = new Date(endDate)
  }

  const where: any = { deletedAt: null, ...dateFilter }
  if (status) where.status = status

  const [purchaseOrders, rfqs, quotes, contracts] = await Promise.all([
    prisma.purchase_orders.findMany({ where, include: { vendor: true } }),
    prisma.rfqs.findMany({ where, include: { createdBy: true } }),
    prisma.quotes.findMany({ where, include: { vendor: true, rfq: true } }),
    prisma.contracts.findMany({ where, include: { vendor: true } })
  ])

  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + Number(po.total), 0)
  const totalContractValue = contracts.reduce((sum, c) => sum + Number(c.value || 0), 0)

  return {
    summary: {
      totalPOs: purchaseOrders.length,
      totalRFQs: rfqs.length,
      totalQuotes: quotes.length,
      totalContracts: contracts.length,
      totalPOValue,
      totalContractValue,
      averagePOValue: purchaseOrders.length ? totalPOValue / purchaseOrders.length : 0
    },
    purchaseOrders: purchaseOrders.map(po => ({
      number: po.poNumber,
      vendor: po.vendor.name,
      status: po.status,
      total: po.total,
      date: po.createdAt
    })),
    filters: params
  }
}

async function generateFinancialReport(params: any) {
  const { fiscalYear, startDate, endDate } = params

  const where: any = { deletedAt: null }
  if (fiscalYear) {
    const year = parseInt(fiscalYear)
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)
    where.createdAt = { gte: start, lte: end }
  } else if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)
  }

  const [invoices, payments, expenses] = await Promise.all([
    prisma.invoices.findMany({ where, include: { vendor: true } }),
    prisma.payments.findMany({ where, include: { invoice: true } }),
    prisma.expenses.findMany({ where, include: { project: true, vendor: true } })
  ])

  const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total), 0)
  const totalPaid = payments.reduce((sum, p) => sum + (p.status === 'completed' ? Number(p.amount) : 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return {
    summary: {
      totalInvoices: invoices.length,
      totalPayments: payments.length,
      totalExpenses: expenses.length,
      totalInvoiced,
      totalPaid,
      totalExpenses,
      outstandingBalance: totalInvoiced - totalPaid,
      netIncome: totalPaid - totalExpenses
    },
    invoices: invoices.map(inv => ({
      number: inv.invoiceNumber,
      vendor: inv.vendor.name,
      total: inv.total,
      status: inv.status,
      date: inv.createdAt
    })),
    filters: params
  }
}

async function generateProjectReport(params: any) {
  const { status, priority, managerId } = params

  const where: any = { deletedAt: null }
  if (status) where.status = status
  if (priority) where.priority = priority
  if (managerId) where.managerId = managerId

  const projects = await prisma.projects.findMany({
    where,
    include: {
      manager: true,
      _count: {
        select: {
          workOrders: true,
          vendors: true,
          purchaseOrders: true
        }
      }
    }
  })

  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0)
  const totalCost = projects.reduce((sum, p) => sum + Number(p.actualCost || 0), 0)

  return {
    summary: {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalBudget,
      totalCost,
      variance: totalBudget - totalCost
    },
    projects: projects.map(p => ({
      number: p.projectNumber,
      name: p.name,
      status: p.status,
      priority: p.priority,
      manager: p.manager?.name,
      budget: p.budget,
      actualCost: p.actualCost,
      progress: p.progressPercent
    })),
    filters: params
  }
}

async function generateGenericReport(params: any) {
  return {
    message: 'Generic report data',
    params,
    generatedAt: new Date().toISOString()
  }
}

// ============ EXPORT HELPERS ============

function convertToCSV(data: any): Buffer {
  // Simple CSV conversion
  let csv = ''
  if (data.summary) {
    csv += 'Summary\n'
    Object.entries(data.summary).forEach(([key, value]) => {
      csv += `${key},${value}\n`
    })
    csv += '\n'
  }
  
  if (data.vendors || data.purchaseOrders || data.invoices || data.projects) {
    const items = data.vendors || data.purchaseOrders || data.invoices || data.projects
    if (items && items.length > 0) {
      csv += 'Details\n'
      csv += Object.keys(items[0]).join(',') + '\n'
      items.forEach((item: any) => {
        csv += Object.values(item).join(',') + '\n'
      })
    }
  }
  
  return Buffer.from(csv)
}

function convertToExcel(data: any): Buffer {
  // For simplicity, return CSV buffer
  // In production, use a library like exceljs
  return convertToCSV(data)
}

function convertToPDF(data: any): Buffer {
  // For simplicity, return JSON buffer
  // In production, use a library like pdfkit
  return Buffer.from(JSON.stringify(data, null, 2))
}

export default router