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
      timestamp: new Date().toISOString()
    })

    // Skip auth for login and health check
    if (req.path === '/api/auth/login' || 
        req.path === '/api/auth/me' || 
        req.path === '/api/health') {
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
    
    // ✅ DEVELOPMENT MODE: Accept mock token
    if (process.env.NODE_ENV === 'development' && token === 'dev-mock-token-12345') {
      console.log('🔧 Dev mode: Using mock authentication')
      const devUser = {
        id: 'cmlictvjl000311zcsn7ze0wi',
        email: 'admin@construction.com',
        name: 'John Admin',
        role: 'admin',
        companyId: 'cmlictvjk000111zclu3i9hi4'
      }
      req.user = devUser
      return next()
    }

    // Production mode: Verify JWT
    try {
      console.log('🔑 Verifying JWT token...')
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key')
      console.log('✅ Token verified successfully')
      console.log('📦 Decoded payload:', JSON.stringify(decoded, null, 2))
      
      // Try to find user by either userId or id field
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
      console.log('🎉 Authentication successful, proceeding to next middleware')
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
