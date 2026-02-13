/**
 * Pagination Middleware
 * =====================
 * 
 * Ensures pagination query params are integers (Prisma requires Int, not String).
 * Runs BEFORE validate middleware to catch all pagination params.
 */

export function ensurePaginationInts(req, res, next) {
  // Express 5: req.query is read-only, so we update properties directly
  if (req.query.page !== undefined) {
    const parsed = parseInt(req.query.page, 10);
    if (!isNaN(parsed)) {
      // Delete and reassign to work around read-only
      delete req.query.page;
      req.query.page = parsed;
    }
  }
  
  if (req.query.limit !== undefined) {
    const parsed = parseInt(req.query.limit, 10);
    if (!isNaN(parsed)) {
      delete req.query.limit;
      req.query.limit = parsed;
    }
  }
  
  if (req.query.n !== undefined) {
    const parsed = parseInt(req.query.n, 10);
    if (!isNaN(parsed)) {
      delete req.query.n;
      req.query.n = parsed;
    }
  }
  
  next();
}

export default ensurePaginationInts;