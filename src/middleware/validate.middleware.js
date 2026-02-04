/**
 * Validation Middleware
 * ======================
 * 
 * WHAT: Runs Joi validation on request data
 * WHY:  Validate input BEFORE it reaches controller
 * 
 * USAGE in routes:
 *   import { validate } from '../middleware/validate.middleware.js';
 *   import { loginSchema } from './platform.validator.js';
 *   
 *   router.post('/login', validate(loginSchema), controller);
 * 
 * USAGE in validator file:
 *   export const loginSchema = {
 *     body: Joi.object({ email: Joi.string().email().required() })
 *   };
 * 
 * NOTE: Express 5 makes req.query and req.params read-only,
 *       so we update properties instead of replacing the object.
 */

import { ValidationError } from '../shared/errors/AppError.js';

/**
 * Validate Request Middleware Factory
 * 
 * @param {object} schema - Object containing Joi schemas for body, params, query
 * @param {Joi.Schema} schema.body - Schema for request body
 * @param {Joi.Schema} schema.params - Schema for URL params
 * @param {Joi.Schema} schema.query - Schema for query string
 * @returns {function} Express middleware function
 */
export function validate(schema) {
  return (req, res, next) => {
    // Collect all validation errors
    const errors = [];

    // Joi validation options
    const options = {
      abortEarly: false,      // Collect ALL errors, not just first
      stripUnknown: true,     // Remove unknown fields
      convert: true,          // Convert strings to numbers, etc.
    };

    // Validate body
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, options);
      if (error) {
        errors.push(...formatJoiErrors(error, 'body'));
      } else {
        req.body = value;  // req.body is writable in Express 5
      }
    }

    // Validate params
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, options);
      if (error) {
        errors.push(...formatJoiErrors(error, 'params'));
      } else {
        // Express 5: req.params may be read-only, update properties instead
        Object.keys(req.params).forEach(key => delete req.params[key]);
        Object.assign(req.params, value);
      }
    }

    // Validate query
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, options);
      if (error) {
        errors.push(...formatJoiErrors(error, 'query'));
      } else {
        // Express 5: req.query is read-only, update properties instead
        Object.keys(req.query).forEach(key => delete req.query[key]);
        Object.assign(req.query, value);
      }
    }

    // If any errors, throw ValidationError
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    // All valid, continue
    next();
  };
}

/**
 * Format Joi errors into consistent structure
 * 
 * @param {Joi.ValidationError} error - Joi error object
 * @param {string} source - Where error came from (body, params, query)
 * @returns {Array} Array of formatted errors
 */
function formatJoiErrors(error, source) {
  return error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message.replace(/"/g, ''),
    source,
  }));
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default validate;