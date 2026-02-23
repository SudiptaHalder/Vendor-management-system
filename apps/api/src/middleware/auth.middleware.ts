// // import { Request, Response, NextFunction } from 'express'
// // import jwt from 'jsonwebtoken'
// // import { prisma } from '@vendor-management/database'

// // export const authMiddleware = async (
// //   req: Request,
// //   res: Response,
// //   next: NextFunction
// // ) => {
// //   try {
// //     // Skip auth for login and health check
// //     if (req.path === '/api/auth/login' || 
// //         req.path === '/api/auth/me' || 
// //         req.path === '/api/health') {
// //       return next()
// //     }

// //     const authHeader = req.headers.authorization
// //     if (!authHeader) {
// //       return res.status(401).json({ error: 'Authentication required' })
// //     }

// //     const token = authHeader.replace('Bearer ', '')
// //     const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key')
    
// //     const user = await prisma.users.findUnique({
// //       where: { id: decoded.userId }
// //     })

// //     if (!user) {
// //       return res.status(401).json({ error: 'User not found' })
// //     }

// //     // Super admin has full access
// //     if (user.role === 'super_admin') {
// //       req.user = user
// //       return next()
// //     }

// //     return res.status(403).json({ error: 'Access denied' })
// //   } catch (error) {
// //     console.error('Auth error:', error)
// //     res.status(401).json({ error: 'Invalid token' })
// //   }
// // }
// import { Request, Response, NextFunction } from 'express'
// import jwt from 'jsonwebtoken'
// import { prisma } from '@vendor-management/database'

// // Extend Express Request type
// declare global {
//   namespace Express {
//     interface Request {
//       user?: any
//     }
//   }
// }

// export const authMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // Skip auth for login and health check
//     if (req.path === '/api/auth/login' || 
//         req.path === '/api/auth/me' || 
//         req.path === '/api/health') {
//       return next()
//     }

//     const authHeader = req.headers.authorization
//     if (!authHeader) {
//       return res.status(401).json({ error: 'Authentication required' })
//     }

//     const token = authHeader.replace('Bearer ', '')
//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key')
    
//     const user = await prisma.users.findUnique({
//       where: { id: decoded.userId || decoded.id }
//     })

//     if (!user) {
//       return res.status(401).json({ error: 'User not found' })
//     }

//     // Attach user to request
//     req.user = user
//     next()
//   } catch (error) {
//     console.error('Auth error:', error)
//     res.status(401).json({ error: 'Invalid token' })
//   }
// }
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
    // Skip auth for login and health check
    if (req.path === '/api/auth/login' || 
        req.path === '/api/auth/me' || 
        req.path === '/api/health') {
      return next()
    }

    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // ✅ DEVELOPMENT MODE: Accept mock token
    if (process.env.NODE_ENV === 'development' && token === 'dev-mock-token-12345') {
      console.log('🔧 Dev mode: Using mock authentication')
      // Get the dev user from your dev-auth constants
      const devUser = {
        id: 'cmlictvjl000311zcsn7ze0wi',
        email: 'admin@construction.com',
        name: 'John Admin',
        role: 'admin',
        companyId: 'cmlictvjk000111zclu3i9hi4'
      }
      
      // Attach user to request
      req.user = devUser
      return next()
    }

    // Production mode: Verify JWT
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key')
      
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId || decoded.id }
      })

      if (!user) {
        return res.status(401).json({ error: 'User not found' })
      }

      // Attach user to request
      req.user = user
      next()
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError)
      return res.status(401).json({ error: 'Invalid token' })
    }
  } catch (error) {
    console.error('Auth error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
}