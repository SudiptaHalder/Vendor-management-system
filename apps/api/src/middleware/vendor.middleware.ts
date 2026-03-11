import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '@vendor-management/database'

export const vendorMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('='.repeat(50))
    console.log('🔒 Vendor Middleware - Request:', req.path)
    
    const authHeader = req.headers.authorization
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.log('❌ No auth header provided')
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Token length:', token.length)
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key')
    console.log('✅ Token verified, type:', decoded.type)
    
    if (decoded.type !== 'vendor') {
      console.log('❌ Not a vendor token, type:', decoded.type)
      return res.status(403).json({ error: 'Access denied. Vendor access only.' })
    }

    const vendor = await prisma.vendors.findUnique({
      where: { id: decoded.vendorId }
    })

    if (!vendor) {
      console.log('❌ Vendor not found for ID:', decoded.vendorId)
      return res.status(401).json({ error: 'Vendor not found' })
    }

    console.log('✅ Vendor authenticated:', vendor.supplierName)
    ;(req as any).vendor = vendor
    ;(req as any).user = { vendorId: vendor.id, type: 'vendor' }
    console.log('='.repeat(50))
    next()
  } catch (error) {
    console.error('❌ Vendor middleware error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
}
