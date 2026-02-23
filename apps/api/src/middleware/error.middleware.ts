import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    })
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    })
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.message.includes('Unique constraint')) {
      return res.status(409).json({
        error: 'Resource already exists'
      })
    }
  }

  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  })
}
