import { Request, Response, NextFunction } from 'express'

// DEVELOPMENT ONLY: Bypass all authentication checks
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Always allow access in development
  console.log('🔓 Development mode - Bypassing authentication')
  
  // Set default development user if no headers provided
  if (!req.headers['x-user-id']) {
    req.headers['x-user-id'] = 'dev-user-id'
  }
  if (!req.headers['x-company-id']) {
    req.headers['x-company-id'] = 'dev-company-id'
  }
  
  next()
}
