/**
 * Response Utilities
 * ==================
 * 
 * WHAT: Standardized API response helpers
 * WHY:  Consistent format across all endpoints
 * 
 * SUCCESS: { success: true, message, data }
 * ERROR:   { success: false, message, code, errors }
 * 
 * USAGE:
 *   import { success, unauthorized } from '../shared/utils/response.util.js';
 *   return success(res, { user }, 'Login successful');
 *   return unauthorized(res, 'Invalid credentials');
 */

// ============================================================================
// SUCCESS RESPONSES
// ============================================================================

/**
 * Success Response (200)
 */
export function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Created Response (201)
 */
export function created(res, data = null, message = 'Created successfully') {
  return success(res, data, message, 201);
}

/**
 * No Content Response (204)
 */
export function noContent(res) {
  return res.status(204).send();
}

/**
 * Paginated Response
 */
export function paginated(res, data, pagination, message = 'Success') {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasMore: pagination.page < Math.ceil(pagination.total / pagination.limit),
    },
  });
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/**
 * Error Response (Generic)
 */
export function error(res, message = 'Error', statusCode = 500, code = 'ERROR', errors = null) {
  const response = {
    success: false,
    message,
    code,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

/**
 * Bad Request (400)
 */
export function badRequest(res, message = 'Bad request', code = 'BAD_REQUEST') {
  return error(res, message, 400, code);
}

/**
 * Unauthorized (401)
 */
export function unauthorized(res, message = 'Unauthorized', code = 'UNAUTHORIZED') {
  return error(res, message, 401, code);
}

/**
 * Forbidden (403)
 */
export function forbidden(res, message = 'Forbidden', code = 'FORBIDDEN') {
  return error(res, message, 403, code);
}

/**
 * Not Found (404)
 */
export function notFound(res, message = 'Resource not found', code = 'NOT_FOUND') {
  return error(res, message, 404, code);
}

/**
 * Conflict (409)
 */
export function conflict(res, message = 'Resource already exists', code = 'CONFLICT') {
  return error(res, message, 409, code);
}

/**
 * Validation Error (422)
 */
export function validationError(res, errors, message = 'Validation failed') {
  return error(res, message, 422, 'VALIDATION_ERROR', errors);
}

/**
 * Internal Server Error (500)
 */
export function internalError(res, message = 'Internal server error') {
  return error(res, message, 500, 'INTERNAL_ERROR');
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  success,
  created,
  noContent,
  paginated,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  internalError,
};