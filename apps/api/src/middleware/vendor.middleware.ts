import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '@vendor-management/database'

export const vendorMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key')
    
    if (decoded.type !== 'vendor') {
      return res.status(403).json({ error: 'Access denied. Vendor access only.' })
    }

    const vendor = await prisma.vendors.findUnique({
      where: { id: decoded.vendorId }
    })

    if (!vendor) {
      return res.status(401).json({ error: 'Vendor not found' })
    }

    // Attach vendor to request
    ;(req as any).vendor = vendor
    ;(req as any).user = { vendorId: vendor.id, type: 'vendor' }
    next()
  } catch (error) {
    console.error('Vendor middleware error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
}
