import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '@vendor-management/database'

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('='.repeat(50))
    console.log('🔒 Auth Middleware - Request:', {
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      timestamp: new Date().toISOString()
    })

    // PUBLIC PATHS - No authentication required
    const publicPaths = [
      '/api/auth/login',
      '/api/auth/me',
      '/api/health',
      '/api/vendor/public/login',
      '/api/vendor/public/verify-invitation',
      '/api/vendor/public/set-password'
    ]

    // Check if current path starts with any public path
    const isPublicPath = publicPaths.some(path => 
      req.path.startsWith(path) || req.originalUrl.startsWith(path)
    )

    if (isPublicPath) {
      console.log('✅ Skipping auth for public path:', req.path)
      return next()
    }

    const authHeader = req.headers.authorization
    console.log('📋 Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.log('❌ No auth header provided')
      return res.status(401).json({ error: 'Authentication required' })
    }

    console.log('Auth header value:', authHeader.substring(0, 30) + '...')
    
    const token = authHeader.replace('Bearer ', '')
    console.log('Token extracted, length:', token.length)
    
    try {
      console.log('🔑 Verifying JWT token...')
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key')
      console.log('✅ Token verified successfully')
      console.log('📦 Decoded payload:', JSON.stringify(decoded, null, 2))
      
      // Check if it's a vendor token
      if (decoded.type === 'vendor') {
        console.log('🔍 Vendor token detected, looking up vendor...')
        
        const vendor = await prisma.vendors.findUnique({
          where: { id: decoded.vendorId }
        })

        if (!vendor) {
          console.log('❌ Vendor not found for ID:', decoded.vendorId)
          return res.status(401).json({ error: 'Vendor not found' })
        }

        console.log('✅ Vendor found:', { id: vendor.id, name: vendor.supplierName })
        
        // Attach vendor to request
        ;(req as any).vendor = vendor
        ;(req as any).user = { type: 'vendor', id: vendor.id }
        console.log('🎉 Vendor authentication successful')
        console.log('='.repeat(50))
        return next()
      }
      
      // It's an admin token
      console.log('�� Admin token detected, looking up user...')
      const userId = decoded.userId || decoded.id
      console.log('🔍 Looking for user with ID:', userId)
      
      const user = await prisma.users.findUnique({
        where: { id: userId }
      })

      if (!user) {
        console.log('❌ User not found in database for ID:', userId)
        return res.status(401).json({ error: 'User not found' })
      }

      console.log('✅ User found:', { id: user.id, email: user.email, role: user.role })

      // Attach user to request
      req.user = user
      console.log('🎉 Admin authentication successful')
      console.log('='.repeat(50))
      next()
      
    } catch (jwtError) {
      console.error('❌ JWT verification error:', jwtError)
      return res.status(401).json({ error: 'Invalid token' })
    }
  } catch (error) {
    console.error('💥 Auth error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
}
