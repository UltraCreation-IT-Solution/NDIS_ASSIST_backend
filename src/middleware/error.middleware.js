/**
 * Error Handler Middleware
 * =========================
 * 
 * WHAT: Global error handler - catches ALL errors
 * WHY:  One place to handle all errors consistently
 * 
 * HANDLES:
 * - Our custom AppError classes
 * - Prisma database errors
 * - Joi validation errors
 * - JWT token errors
 * - Unknown errors
 * 
 * USAGE in app.js:
 *   import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
 *   
 *   // After all routes
 *   app.use(notFoundHandler);  // 404 for undefined routes
 *   app.use(errorHandler);     // Catch all errors
 */

import { AppError } from '../shared/errors/AppError.js';

// ============================================================================
// ERROR HANDLER
// ============================================================================

/**
 * Global Error Handler
 * 
 * Express recognizes this as error handler because it has 4 parameters
 * 
 * @param {Error} err - The error object
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
export function errorHandler(err, req, res, next) {
  // Log error (always log in development, only errors in production)
  if (process.env.NODE_ENV === 'development') {
    console.error('═══════════════════════════════════════════════════════════');
    console.error('ERROR:', new Date().toISOString());
    console.error('Method:', req.method);
    console.error('Path:', req.originalUrl);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('═══════════════════════════════════════════════════════════');
  } else {
    console.error(`ERROR: ${req.method} ${req.originalUrl} - ${err.message}`);
  }

  // 1. Handle our custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // 2. Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    const prismaError = handlePrismaError(err);
    return res.status(prismaError.statusCode).json({
      success: false,
      message: prismaError.message,
      code: prismaError.code,
    });
  }

  // 3. Handle Joi validation errors
  if (err.isJoi) {
    const errors = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, ''),
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors,
    });
  }

  // 4. Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  // 5. Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
      code: 'INVALID_JSON',
    });
  }

  // 6. Unknown error - don't expose details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return res.status(500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: err.stack }),
  });
}

// ============================================================================
// PRISMA ERROR HANDLER
// ============================================================================

/**
 * Handle Prisma Database Errors
 * 
 * Common Prisma error codes:
 * - P2002: Unique constraint violation
 * - P2025: Record not found
 * - P2003: Foreign key constraint failed
 * - P2014: Required relation violation
 */
function handlePrismaError(err) {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      const field = err.meta?.target?.[0] || 'field';
      return {
        statusCode: 409,
        message: `A record with this ${field} already exists`,
        code: 'DUPLICATE_ENTRY',
      };

    case 'P2025':
      // Record not found
      return {
        statusCode: 404,
        message: err.meta?.cause || 'Record not found',
        code: 'NOT_FOUND',
      };

    case 'P2003':
      // Foreign key constraint failed
      return {
        statusCode: 400,
        message: 'Related record not found',
        code: 'FOREIGN_KEY_ERROR',
      };

    case 'P2014':
      // Required relation violation
      return {
        statusCode: 400,
        message: 'Required relation is missing',
        code: 'RELATION_ERROR',
      };

    default:
      // Unknown Prisma error
      return {
        statusCode: 500,
        message: 'Database error',
        code: 'DATABASE_ERROR',
      };
  }
}

// ============================================================================
// 404 NOT FOUND HANDLER
// ============================================================================

/**
 * Not Found Handler
 * 
 * Catches requests to undefined routes
 * Add this AFTER all routes, BEFORE errorHandler
 */
export function notFoundHandler(req, res, next) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
  });
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  errorHandler,
  notFoundHandler,
};