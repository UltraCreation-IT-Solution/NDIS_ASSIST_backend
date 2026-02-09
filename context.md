# NDASSIST BACKEND — FULL AI CONTEXT (v3.0)
> Upload ONLY this file to resume development. Contains all code, schema, conventions.

## STACK & ARCH
- Node.js, Express 5, Prisma ORM, PostgreSQL, JavaScript ESM, Joi validation
- Pattern: Repository→Service→Controller (layered, multi-tenant)
- Auth: JWT (org users) + Session (platform admins)
- API Prefix: `/api/v1`

## CONVENTIONS
1. ESM everywhere (`import`/`export`)
2. Express 5: `req.query`/`req.params` read-only — validate middleware uses `Object.keys().forEach(delete)` + `Object.assign()`
3. Express 5: Async errors auto-caught — no `asyncHandler`
4. Named + default exports in every file
5. Joi schemas: `{ body, params, query }` shape
6. AU validations: Phone `/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/`, ABN 11 digits, Postcode 4 digits
7. Employee IDs: `EMP-XXXXXX` via `generateShortId()`
8. Staff creation: supports linking existing User OR creating new User
9. Teams: separate module at `/api/v1/teams`
10. Permissions: `resource:action` with wildcard (`*`, `resource:*`)
11. Route mounting: `app.use(\`${config.apiPrefix}/resource\`, routes)`
12. Middleware chain: `authenticate → requirePermission → validate → controller`
13. Pagination: `{ data, pagination: { page, limit, total, totalPages, hasMore } }`
14. Soft deletes via status change, not actual deletion
15. Document uploads: metadata only (no S3 yet)

## PROGRESS
```
DONE: config/, middleware/, shared/, modules/platform, modules/organization, modules/auth, modules/user
TODO: staff, team, client, scheduling, billing, incident, communication, forms, documents, reports, system
```

---
## CONFIG FILES

### config/index.js
```javascript
import dotenv from 'dotenv';
dotenv.config();
const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'ndassist',
  },
  platformJwt: {
    secret: process.env.PLATFORM_JWT_SECRET || process.env.JWT_SECRET || 'platform-super-secret-key',
    accessTokenExpiry: process.env.PLATFORM_JWT_ACCESS_EXPIRY || '1h',
    refreshTokenExpiry: process.env.PLATFORM_JWT_REFRESH_EXPIRY || '24h',
    issuer: process.env.JWT_ISSUER || 'ndassist-platform',
  },
  bcrypt: { saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12 },
  cors: { origin: process.env.CORS_ORIGIN || '*', credentials: true },
  rateLimit: { windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100 },
  logging: { level: process.env.LOG_LEVEL || 'info' },
};
function validateConfig() {
  const required = ['DATABASE_URL'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) { console.error('❌ Missing required environment variables:'); missing.forEach((key) => console.error(`   - ${key}`)); if (config.isProduction) process.exit(1); else console.warn('⚠️  Running in development mode with missing variables'); }
  if (config.isProduction) { if (config.jwt.secret === 'your-super-secret-key-change-in-production') { console.error('❌ JWT_SECRET must be set in production'); process.exit(1); } }
}
validateConfig();
export default config;
```

### config/database.js
```javascript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
const globalForPrisma = globalThis;
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter, log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"] });
export async function connectDatabase() { try { await prisma.$connect(); console.log('✅ Database connected successfully'); } catch (error) { console.error('❌ Database connection failed:', error); process.exit(1); } }
export async function disconnectDatabase() { await prisma.$disconnect(); console.log('📤 Database disconnected'); }
export default prisma;
```

### config/constants.js
```javascript
export const SESSION = { PLATFORM_EXPIRY_DAYS: 7, ACCESS_TOKEN_EXPIRY: '15m', REFRESH_TOKEN_EXPIRY_DAYS: 7, RESET_TOKEN_EXPIRY_HOURS: 1, VERIFY_TOKEN_EXPIRY_HOURS: 24, INVITE_TOKEN_EXPIRY_DAYS: 7 };
export const SECURITY = { BCRYPT_ROUNDS: 10, RATE_LIMIT: { WINDOW_MS: 15 * 60 * 1000, MAX_REQUESTS: 100, AUTH_WINDOW_MS: 15 * 60 * 1000, AUTH_MAX_REQUESTS: 5 }, TOKEN_BYTES: 32 };
export const PAGINATION = { DEFAULT_PAGE: 1, DEFAULT_LIMIT: 20, MAX_LIMIT: 100 };
export const UPLOAD = { MAX_FILE_SIZE: 10 * 1024 * 1024, MAX_FILES: 5, ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], ALLOWED_DOC_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] };
export const AUDIT_ACTIONS = { LOGIN: 'LOGIN', LOGOUT: 'LOGOUT', LOGIN_FAILED: 'LOGIN_FAILED', PASSWORD_CHANGED: 'PASSWORD_CHANGED', PASSWORD_RESET: 'PASSWORD_RESET', CREATE: 'CREATE', READ: 'READ', UPDATE: 'UPDATE', DELETE: 'DELETE', EXPORT: 'EXPORT', IMPORT: 'IMPORT', APPROVE: 'APPROVE', REJECT: 'REJECT', SUBMIT: 'SUBMIT', CANCEL: 'CANCEL' };
export const NOTIFICATION_TYPES = { SHIFT_ASSIGNED: 'SHIFT_ASSIGNED', SHIFT_UPDATED: 'SHIFT_UPDATED', SHIFT_CANCELLED: 'SHIFT_CANCELLED', SHIFT_REMINDER: 'SHIFT_REMINDER', LEAVE_REQUESTED: 'LEAVE_REQUESTED', LEAVE_APPROVED: 'LEAVE_APPROVED', LEAVE_REJECTED: 'LEAVE_REJECTED', DOCUMENT_EXPIRING: 'DOCUMENT_EXPIRING', DOCUMENT_EXPIRED: 'DOCUMENT_EXPIRED', INCIDENT_REPORTED: 'INCIDENT_REPORTED', INCIDENT_UPDATED: 'INCIDENT_UPDATED', INVOICE_GENERATED: 'INVOICE_GENERATED', PAYMENT_RECEIVED: 'PAYMENT_RECEIVED', SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT' };
export const REGEX = { AU_PHONE: /^(\+?61|0)4\d{8}$/, AU_POSTCODE: /^\d{4}$/, ABN: /^\d{11}$/, NDIS_NUMBER: /^\d{9}$/, STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ };
export const ORGANIZATION = { TRIAL_DAYS: 14, MIN_SLUG_LENGTH: 3, MAX_SLUG_LENGTH: 50, PLAN_LIMITS: { FREE_TRIAL: { maxUsers: 5, maxClients: 20, maxStaff: 10 }, STARTER: { maxUsers: 10, maxClients: 50, maxStaff: 25 }, PROFESSIONAL: { maxUsers: 50, maxClients: 200, maxStaff: 100 }, ENTERPRISE: { maxUsers: -1, maxClients: -1, maxStaff: -1 } } };
export const SCHEDULING = { DEFAULT_SHIFT_HOURS: 8, MIN_SHIFT_MINUTES: 15, MAX_SHIFT_HOURS: 24, EARLY_CLOCK_IN_MINUTES: 15, LATE_CLOCK_OUT_GRACE_MINUTES: 5, DEFAULT_GEOFENCE_RADIUS_METERS: 100, MAX_RECURRING_WEEKS: 52 };
export const BILLING = { INVOICE_DUE_DAYS: 14, INVOICE_PREFIX: 'INV', CREDIT_NOTE_PREFIX: 'CN', GST_RATE: 0.10, PAYMENT_METHODS: ['BANK_TRANSFER', 'CREDIT_CARD', 'NDIS_MANAGED', 'PLAN_MANAGED', 'SELF_MANAGED'] };
export const INCIDENT = { NDIS_REPORTABLE: ['CRITICAL', 'MAJOR'], ESCALATION_HOURS: { CRITICAL: 1, MAJOR: 4, MINOR: 24, LOW: 72 } };
export default { SESSION, SECURITY, PAGINATION, UPLOAD, AUDIT_ACTIONS, NOTIFICATION_TYPES, REGEX, ORGANIZATION, SCHEDULING, BILLING, INCIDENT };
```

---
## SHARED CODE

### shared/errors/AppError.js
```javascript
export class AppError extends Error { constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') { super(message); this.statusCode = statusCode; this.code = code; this.isOperational = true; Error.captureStackTrace(this, this.constructor); } }
export class BadRequestError extends AppError { constructor(message = 'Bad request', code = 'BAD_REQUEST') { super(message, 400, code); } }
export class UnauthorizedError extends AppError { constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') { super(message, 401, code); } }
export class ForbiddenError extends AppError { constructor(message = 'Forbidden', code = 'FORBIDDEN') { super(message, 403, code); } }
export class NotFoundError extends AppError { constructor(message = 'Resource not found', code = 'NOT_FOUND') { super(message, 404, code); } }
export class ConflictError extends AppError { constructor(message = 'Resource already exists', code = 'CONFLICT') { super(message, 409, code); } }
export class ValidationError extends AppError { constructor(message = 'Validation failed', errors = []) { super(message, 422, 'VALIDATION_ERROR'); this.errors = errors; } }
export class RateLimitError extends AppError { constructor(message = 'Too many requests', code = 'RATE_LIMIT_EXCEEDED') { super(message, 429, code); } }
export class InternalError extends AppError { constructor(message = 'Internal server error', code = 'INTERNAL_ERROR') { super(message, 500, code); } }
export default { AppError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError, RateLimitError, InternalError };
```

### shared/utils/response.util.js
```javascript
export function success(res, data = null, message = 'Success', statusCode = 200) { return res.status(statusCode).json({ success: true, message, data }); }
export function created(res, data = null, message = 'Created successfully') { return success(res, data, message, 201); }
export function noContent(res) { return res.status(204).send(); }
export function paginated(res, data, pagination, message = 'Success') { return res.status(200).json({ success: true, message, data, pagination: { page: pagination.page, limit: pagination.limit, total: pagination.total, totalPages: Math.ceil(pagination.total / pagination.limit), hasMore: pagination.page < Math.ceil(pagination.total / pagination.limit) } }); }
export function error(res, message = 'Error', statusCode = 500, code = 'ERROR', errors = null) { const response = { success: false, message, code }; if (errors) response.errors = errors; return res.status(statusCode).json(response); }
export function badRequest(res, message = 'Bad request', code = 'BAD_REQUEST') { return error(res, message, 400, code); }
export function unauthorized(res, message = 'Unauthorized', code = 'UNAUTHORIZED') { return error(res, message, 401, code); }
export function forbidden(res, message = 'Forbidden', code = 'FORBIDDEN') { return error(res, message, 403, code); }
export function notFound(res, message = 'Resource not found', code = 'NOT_FOUND') { return error(res, message, 404, code); }
export function conflict(res, message = 'Resource already exists', code = 'CONFLICT') { return error(res, message, 409, code); }
export function validationError(res, errors, message = 'Validation failed') { return error(res, message, 422, 'VALIDATION_ERROR', errors); }
export function internalError(res, message = 'Internal server error') { return error(res, message, 500, 'INTERNAL_ERROR'); }
export default { success, created, noContent, paginated, error, badRequest, unauthorized, forbidden, notFound, conflict, validationError, internalError };
```

### shared/utils/helpers.js
```javascript
import crypto from 'crypto';
export function generateToken(bytes = 32) { return crypto.randomBytes(bytes).toString('hex'); }
export function generateShortId(length = 6) { return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length).toUpperCase(); }
export function slugify(text) { return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, ''); }
export function capitalize(text) { if (!text) return ''; return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(); }
export function titleCase(text) { if (!text) return ''; return text.toLowerCase().split(' ').map(word => capitalize(word)).join(' '); }
export function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }
export function addHours(date, hours) { const result = new Date(date); result.setTime(result.getTime() + hours * 60 * 60 * 1000); return result; }
export function addMinutes(date, minutes) { const result = new Date(date); result.setTime(result.getTime() + minutes * 60 * 1000); return result; }
export function isExpired(date) { return new Date() > new Date(date); }
export function getClientIp(req) { const forwarded = req.headers['x-forwarded-for']; if (forwarded) return forwarded.split(',')[0].trim(); return req.headers['x-real-ip'] || req.ip || req.socket?.remoteAddress || 'unknown'; }
export function getUserAgent(req) { return req.headers['user-agent'] || 'unknown'; }
export function pick(obj, fields) { return fields.reduce((result, field) => { if (obj.hasOwnProperty(field)) result[field] = obj[field]; return result; }, {}); }
export function omit(obj, fields) { const result = { ...obj }; fields.forEach(field => delete result[field]); return result; }
export function isEmpty(value) { if (value === null || value === undefined) return true; if (typeof value === 'string') return value.trim() === ''; if (Array.isArray(value)) return value.length === 0; if (typeof value === 'object') return Object.keys(value).length === 0; return false; }
export default { generateToken, generateShortId, slugify, capitalize, titleCase, addDays, addHours, addMinutes, isExpired, getClientIp, getUserAgent, pick, omit, isEmpty };
```

---
## MIDDLEWARE

### middleware/auth.middleware.js
```javascript
import * as tokenService from '../modules/auth/token.service.js';
import * as authRepo from '../modules/auth/auth.repository.js';
import { UnauthorizedError, ForbiddenError } from '../shared/errors/AppError.js';
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new UnauthorizedError('Authorization header is required');
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') throw new UnauthorizedError('Invalid authorization format. Use: Bearer <token>');
  const token = parts[1];
  if (!token) throw new UnauthorizedError('Token is required');
  let decoded;
  try { decoded = tokenService.verifyAccessToken(token); } catch (error) { if (error.name === 'TokenExpiredError') throw new UnauthorizedError('Token expired'); if (error.name === 'JsonWebTokenError') throw new UnauthorizedError('Invalid token'); throw new UnauthorizedError('Token verification failed'); }
  const user = await authRepo.findUserById(decoded.sub);
  if (!user) throw new UnauthorizedError('User not found');
  if (user.status !== 'ACTIVE') throw new UnauthorizedError('Account is not active');
  if (user.organization.status !== 'ACTIVE') throw new UnauthorizedError('Organization is suspended');
  req.user = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, permissions: decoded.permissions };
  req.organizationId = user.organizationId;
  req.organization = user.organization;
  next();
}
export function requirePermission(permission) { return (req, res, next) => { if (!req.user) throw new UnauthorizedError('Not authenticated'); const { permissions } = req.user; if (permissions.includes('*')) return next(); if (permissions.includes(permission)) return next(); const [resource] = permission.split(':'); if (permissions.includes(`${resource}:*`)) return next(); throw new ForbiddenError(`Permission required: ${permission}`); }; }
export function requireRole(...roles) { return (req, res, next) => { if (!req.user) throw new UnauthorizedError('Not authenticated'); if (!roles.includes(req.user.role)) throw new ForbiddenError(`Role required: ${roles.join(' or ')}`); next(); }; }
export function requireAdmin(req, res, next) { if (!req.user) throw new UnauthorizedError('Not authenticated'); if (!['ORG_OWNER', 'ADMIN'].includes(req.user.role)) throw new ForbiddenError('Admin access required'); next(); }
export default { authenticate, requirePermission, requireRole, requireAdmin };
```

### middleware/platformAuth.middleware.js
```javascript
import * as platformService from '../modules/platform/platform.service.js';
import { UnauthorizedError, ForbiddenError } from '../shared/errors/AppError.js';
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new UnauthorizedError('Authorization header is required');
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') throw new UnauthorizedError('Invalid authorization format. Use: Bearer <token>');
  const token = parts[1];
  if (!token) throw new UnauthorizedError('Token is required');
  const admin = await platformService.validateSession(token);
  req.admin = admin; req.token = token; next();
}
export function requireRoles(...allowedRoles) { return (req, res, next) => { if (!req.admin) throw new UnauthorizedError('Not authenticated'); if (!allowedRoles.includes(req.admin.role)) throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`); next(); }; }
export function requireSuperAdmin(req, res, next) { if (!req.admin) throw new UnauthorizedError('Not authenticated'); if (req.admin.role !== 'SUPER_ADMIN') throw new ForbiddenError('Access denied. Super Admin only.'); next(); }
export const PLATFORM_ROLE_PERMISSIONS = { SUPER_ADMIN: ['platform:*', 'admins:*', 'organizations:*', 'settings:*', 'features:*', 'dashboard:*'], PLATFORM_SUPPORT: ['organizations:read', 'organizations:support', 'dashboard:read', 'settings:read'], PLATFORM_VIEWER: ['organizations:read', 'dashboard:read'] };
export function requirePermission(permission) { return (req, res, next) => { if (!req.admin) throw new UnauthorizedError('Not authenticated'); const adminPermissions = PLATFORM_ROLE_PERMISSIONS[req.admin.role] || []; const hasPermission = adminPermissions.some((p) => { if (p === 'platform:*') return true; if (p.endsWith(':*')) return permission.startsWith(p.replace(':*', '')); return p === permission; }); if (!hasPermission) throw new ForbiddenError(`Access denied. Required permission: ${permission}`); next(); }; }
export default { authenticate, requireRoles, requireSuperAdmin, requirePermission, PLATFORM_ROLE_PERMISSIONS };
```

### middleware/validate.middleware.js
```javascript
import { ValidationError } from '../shared/errors/AppError.js';
export function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    const options = { abortEarly: false, stripUnknown: true, convert: true };
    if (schema.body) { const { error, value } = schema.body.validate(req.body, options); if (error) errors.push(...formatJoiErrors(error, 'body')); else req.body = value; }
    if (schema.params) { const { error, value } = schema.params.validate(req.params, options); if (error) errors.push(...formatJoiErrors(error, 'params')); else { Object.keys(req.params).forEach(key => delete req.params[key]); Object.assign(req.params, value); } }
    if (schema.query) { const { error, value } = schema.query.validate(req.query, options); if (error) errors.push(...formatJoiErrors(error, 'query')); else { Object.keys(req.query).forEach(key => delete req.query[key]); Object.assign(req.query, value); } }
    if (errors.length > 0) throw new ValidationError('Validation failed', errors);
    next();
  };
}
function formatJoiErrors(error, source) { return error.details.map(detail => ({ field: detail.path.join('.'), message: detail.message.replace(/"/g, ''), source })); }
export default validate;
```

### middleware/error.middleware.js
```javascript
import { AppError } from '../shared/errors/AppError.js';
export function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV === 'development') { console.error('ERROR:', err.message, err.stack); } else { console.error(`ERROR: ${req.method} ${req.originalUrl} - ${err.message}`); }
  if (err instanceof AppError) { return res.status(err.statusCode).json({ success: false, message: err.message, code: err.code, ...(err.errors && { errors: err.errors }) }); }
  if (err.code && err.code.startsWith('P')) { const prismaError = handlePrismaError(err); return res.status(prismaError.statusCode).json({ success: false, message: prismaError.message, code: prismaError.code }); }
  if (err.isJoi) { const errors = err.details.map(d => ({ field: d.path.join('.'), message: d.message.replace(/"/g, '') })); return res.status(422).json({ success: false, message: 'Validation failed', code: 'VALIDATION_ERROR', errors }); }
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token', code: 'INVALID_TOKEN' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) return res.status(400).json({ success: false, message: 'Invalid JSON in request body', code: 'INVALID_JSON' });
  const isDev = process.env.NODE_ENV === 'development';
  return res.status(500).json({ success: false, message: isDev ? err.message : 'Internal server error', code: 'INTERNAL_ERROR', ...(isDev && { stack: err.stack }) });
}
function handlePrismaError(err) { switch (err.code) { case 'P2002': return { statusCode: 409, message: `A record with this ${err.meta?.target?.[0] || 'field'} already exists`, code: 'DUPLICATE_ENTRY' }; case 'P2025': return { statusCode: 404, message: err.meta?.cause || 'Record not found', code: 'NOT_FOUND' }; case 'P2003': return { statusCode: 400, message: 'Related record not found', code: 'FOREIGN_KEY_ERROR' }; case 'P2014': return { statusCode: 400, message: 'Required relation is missing', code: 'RELATION_ERROR' }; default: return { statusCode: 500, message: 'Database error', code: 'DATABASE_ERROR' }; } }
export function notFoundHandler(req, res, next) { return res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}`, code: 'NOT_FOUND' }); }
export default { errorHandler, notFoundHandler };
```

---
## APP & SERVER

### app.js
```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import platformRoutes from './modules/platform/platform.routes.js';
import organizationRoutes from './modules/organization/organization.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
const app = express();
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: config.cors.credentials, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (config.isDevelopment) { app.use((req, res, next) => { const start = Date.now(); res.on('finish', () => console.log(`${req.method} ${req.path} - ${res.statusCode} (${Date.now() - start}ms)`)); next(); }); }
app.get('/health', (req, res) => { res.status(200).json({ success: true, message: 'NDAssist API is running', timestamp: new Date().toISOString(), environment: config.env }); });
app.use(`${config.apiPrefix}/platform`, platformRoutes);
app.use(`${config.apiPrefix}/platform/organizations`, organizationRoutes);
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/users`, userRoutes);
// Future: app.use(`${config.apiPrefix}/staff`, staffRoutes);
// Future: app.use(`${config.apiPrefix}/teams`, teamRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
```

### server.js
```javascript
import app from './app.js';
import config from './config/index.js';
import prisma from './config/database.js';
async function startServer() {
  try {
    console.log('🔌 Connecting to database...'); await prisma.$connect(); console.log('✅ Database connected successfully');
    const server = app.listen(config.port, config.host, () => { console.log(`🚀 NDAssist API Server Started | ${config.env} | http://${config.host}:${config.port}${config.apiPrefix}`); });
    const gracefulShutdown = async (signal) => { console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`); server.close(async () => { await prisma.$disconnect(); console.log('👋 Goodbye!'); process.exit(0); }); setTimeout(() => { console.error('⚠️  Forcing shutdown after timeout'); process.exit(1); }, 10000); };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) { console.error('❌ Failed to start server:', error); await prisma.$disconnect(); process.exit(1); }
}
process.on('uncaughtException', (error) => { console.error('❌ UNCAUGHT EXCEPTION:', error); process.exit(1); });
process.on('unhandledRejection', (reason, promise) => { console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason); process.exit(1); });
startServer();
```

---
## MODULE: AUTH (modules/auth/)

### auth.routes.js
```javascript
import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, updateProfileSchema } from './auth.validator.js';
const router = Router();
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', authenticate, authController.getProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.get('/sessions', authenticate, authController.getSessions);
export default router;
```

### auth.controller.js
```javascript
import * as authService from './auth.service.js';
import { success, created } from '../../shared/utils/response.util.js';
function getClientIp(req) { const forwarded = req.headers['x-forwarded-for']; if (forwarded) return forwarded.split(',')[0].trim(); return req.ip || req.socket?.remoteAddress || 'unknown'; }
function getUserAgent(req) { return req.headers['user-agent'] || 'unknown'; }
export async function register(req, res) { const result = await authService.register(req.body, getClientIp(req), getUserAgent(req)); return created(res, result, 'Registration successful'); }
export async function login(req, res) { const { email, password } = req.body; const result = await authService.login(email, password, getClientIp(req), getUserAgent(req)); return success(res, result, 'Login successful'); }
export async function refresh(req, res) { const { refreshToken } = req.body; const result = await authService.refresh(refreshToken, getClientIp(req), getUserAgent(req)); return success(res, result, 'Token refreshed'); }
export async function forgotPassword(req, res) { await authService.forgotPassword(req.body.email); return success(res, null, 'If the email exists, a reset link has been sent'); }
export async function resetPassword(req, res) { const { token, newPassword } = req.body; await authService.resetPassword(token, newPassword); return success(res, null, 'Password reset successful'); }
export async function logout(req, res) { await authService.logout(req.sessionToken); return success(res, null, 'Logged out successfully'); }
export async function logoutAll(req, res) { const result = await authService.logoutAll(req.user.id); return success(res, result, 'Logged out from all devices'); }
export async function getProfile(req, res) { const profile = await authService.getProfile(req.user.id); return success(res, profile, 'Profile retrieved'); }
export async function updateProfile(req, res) { const profile = await authService.updateProfile(req.user.id, req.body); return success(res, profile, 'Profile updated'); }
export async function changePassword(req, res) { const { currentPassword, newPassword } = req.body; await authService.changePassword(req.user.id, currentPassword, newPassword); return success(res, null, 'Password changed successfully'); }
export async function getSessions(req, res) { const sessions = await authService.getSessions(req.user.id); return success(res, sessions, 'Sessions retrieved'); }
export default { register, login, refresh, forgotPassword, resetPassword, logout, logoutAll, getProfile, updateProfile, changePassword, getSessions };
```

### auth.service.js
```javascript
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as authRepo from './auth.repository.js';
import * as tokenService from './token.service.js';
import { UnauthorizedError, NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError.js';
import { SECURITY, SESSION, ORGANIZATION } from '../../config/constants.js';
async function hashPassword(password) { return bcrypt.hash(password, SECURITY.BCRYPT_ROUNDS); }
async function comparePassword(plain, hashed) { return bcrypt.compare(plain, hashed); }
function generateSlug(name) { return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, ORGANIZATION.MAX_SLUG_LENGTH); }
async function ensureUniqueSlug(baseSlug) { let slug = baseSlug; let counter = 1; while (await authRepo.findOrganizationBySlug(slug)) { slug = `${baseSlug}-${counter}`; counter++; } return slug; }
function sanitizeUser(user) { const { passwordHash, ...safeUser } = user; return safeUser; }

export async function register(data, ipAddress, userAgent) {
  const { organizationName, email, password, firstName, lastName, phone } = data;
  const existingUser = await authRepo.findUserByEmail(email);
  if (existingUser) throw new ConflictError('Email already registered');
  const baseSlug = generateSlug(organizationName); const slug = await ensureUniqueSlug(baseSlug);
  const passwordHash = await hashPassword(password);
  const trialEndsAt = new Date(); trialEndsAt.setDate(trialEndsAt.getDate() + ORGANIZATION.TRIAL_DAYS);
  const orgData = { name: organizationName, slug, email: email.toLowerCase() };
  const userData = { email: email.toLowerCase(), passwordHash, firstName, lastName, phone, role: 'ORG_OWNER', status: 'ACTIVE' };
  const subscriptionData = { plan: 'FREE_TRIAL', status: 'TRIALING', trialEndsAt, maxStaff: ORGANIZATION.PLAN_LIMITS.FREE_TRIAL.maxStaff, maxClients: ORGANIZATION.PLAN_LIMITS.FREE_TRIAL.maxClients };
  const organization = await authRepo.createOrganizationWithOwner(orgData, userData, subscriptionData);
  const user = organization.users[0];
  const sessionToken = tokenService.generateSessionToken(); const expiresAt = tokenService.getSessionExpiry();
  await authRepo.createSession({ userId: user.id, token: sessionToken, ipAddress, userAgent, expiresAt });
  const accessToken = tokenService.generateAccessToken(user, organization);
  const refreshToken = tokenService.generateRefreshToken(user.id, sessionToken);
  return { accessToken, refreshToken, expiresAt, user: sanitizeUser(user), organization: { id: organization.id, name: organization.name, slug: organization.slug, subscription: organization.subscription } };
}

export async function login(email, password, ipAddress, userAgent) {
  const user = await authRepo.findUserByEmail(email);
  if (!user) throw new UnauthorizedError('Invalid email or password');
  if (user.status !== 'ACTIVE') throw new UnauthorizedError('Account is not active. Please contact support.');
  if (user.organization.status !== 'ACTIVE') throw new UnauthorizedError('Organization is suspended. Please contact support.');
  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) throw new UnauthorizedError('Invalid email or password');
  const sessionToken = tokenService.generateSessionToken(); const expiresAt = tokenService.getSessionExpiry();
  await authRepo.createSession({ userId: user.id, token: sessionToken, ipAddress, userAgent, expiresAt });
  await authRepo.updateLastLogin(user.id, ipAddress);
  const accessToken = tokenService.generateAccessToken(user, user.organization);
  const refreshToken = tokenService.generateRefreshToken(user.id, sessionToken);
  return { accessToken, refreshToken, expiresAt, user: sanitizeUser(user) };
}

export async function refresh(refreshToken, ipAddress, userAgent) {
  let decoded; try { decoded = tokenService.verifyRefreshToken(refreshToken); } catch (error) { throw new UnauthorizedError('Invalid refresh token'); }
  const session = await authRepo.findSessionByToken(decoded.sessionToken);
  if (!session) throw new UnauthorizedError('Session not found');
  if (new Date() > session.expiresAt) { await authRepo.deleteSession(decoded.sessionToken); throw new UnauthorizedError('Session expired'); }
  const user = session.user;
  if (user.status !== 'ACTIVE') { await authRepo.deleteSession(decoded.sessionToken); throw new UnauthorizedError('Account is not active'); }
  if (user.organization.status !== 'ACTIVE') { await authRepo.deleteSession(decoded.sessionToken); throw new UnauthorizedError('Organization is suspended'); }
  await authRepo.deleteSession(decoded.sessionToken);
  const newSessionToken = tokenService.generateSessionToken(); const expiresAt = tokenService.getSessionExpiry();
  await authRepo.createSession({ userId: user.id, token: newSessionToken, ipAddress, userAgent, expiresAt });
  const newAccessToken = tokenService.generateAccessToken(user, user.organization);
  const newRefreshToken = tokenService.generateRefreshToken(user.id, newSessionToken);
  return { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresAt };
}

export async function logout(sessionToken) { try { await authRepo.deleteSession(sessionToken); } catch (error) {} return { success: true }; }
export async function logoutAll(userId) { const result = await authRepo.deleteAllUserSessions(userId); return { success: true, sessionsRemoved: result.count }; }
export async function getProfile(userId) { const user = await authRepo.findUserById(userId); if (!user) throw new NotFoundError('User not found'); return sanitizeUser(user); }
export async function updateProfile(userId, data) { const user = await authRepo.findUserById(userId); if (!user) throw new NotFoundError('User not found'); const updated = await authRepo.updateUser(userId, data); return sanitizeUser(updated); }
export async function forgotPassword(email) { const user = await authRepo.findUserByEmail(email); if (!user) return { success: true }; const token = crypto.randomBytes(32).toString('hex'); const expiresAt = new Date(); expiresAt.setHours(expiresAt.getHours() + SESSION.RESET_TOKEN_EXPIRY_HOURS); await authRepo.createPasswordReset({ userId: user.id, token, expiresAt }); console.log(`Password reset token for ${email}: ${token}`); return { success: true }; }
export async function resetPassword(token, newPassword) { const reset = await authRepo.findPasswordResetByToken(token); if (!reset) throw new BadRequestError('Invalid or expired reset token'); const passwordHash = await hashPassword(newPassword); await authRepo.updateUser(reset.userId, { passwordHash }); await authRepo.deletePasswordReset(reset.id); await authRepo.deleteAllUserSessions(reset.userId); return { success: true }; }
export async function changePassword(userId, currentPassword, newPassword) { const user = await authRepo.findUserById(userId); if (!user) throw new NotFoundError('User not found'); const isValid = await comparePassword(currentPassword, user.passwordHash); if (!isValid) throw new BadRequestError('Current password is incorrect'); const passwordHash = await hashPassword(newPassword); await authRepo.updateUser(userId, { passwordHash }); return { success: true }; }
export async function getSessions(userId) { return authRepo.getUserSessions(userId); }
export default { register, login, refresh, logout, logoutAll, getProfile, updateProfile, forgotPassword, resetPassword, changePassword, getSessions };
```

### auth.repository.js
```javascript
import prisma from '../../config/database.js';
export async function findUserByEmail(email, organizationId = null) { const where = { email: email.toLowerCase(), ...(organizationId && { organizationId }) }; return prisma.user.findFirst({ where, include: { organization: { include: { subscription: true } }, customRole: true } }); }
export async function findUserById(id) { return prisma.user.findUnique({ where: { id }, include: { organization: { include: { subscription: true } }, customRole: true, staffProfile: true } }); }
export async function createUser(data) { return prisma.user.create({ data, include: { organization: true } }); }
export async function updateUser(id, data) { return prisma.user.update({ where: { id }, data, include: { organization: true, customRole: true } }); }
export async function updateLastLogin(id, ipAddress) { return prisma.user.update({ where: { id }, data: { lastLoginAt: new Date(), lastLoginIp: ipAddress } }); }
export async function createSession({ userId, token, ipAddress, userAgent, deviceType, expiresAt }) { return prisma.session.create({ data: { userId, token, ipAddress, userAgent, deviceType, expiresAt } }); }
export async function findSessionByToken(token) { return prisma.session.findUnique({ where: { token }, include: { user: { include: { organization: true, customRole: true } } } }); }
export async function deleteSession(token) { return prisma.session.delete({ where: { token } }); }
export async function deleteAllUserSessions(userId) { return prisma.session.deleteMany({ where: { userId } }); }
export async function getUserSessions(userId) { return prisma.session.findMany({ where: { userId, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' }, select: { id: true, ipAddress: true, userAgent: true, deviceType: true, createdAt: true, expiresAt: true } }); }
export async function createPasswordReset({ userId, token, expiresAt }) { await prisma.passwordReset.deleteMany({ where: { userId } }); return prisma.passwordReset.create({ data: { userId, token, expiresAt } }); }
export async function findPasswordResetByToken(token) { return prisma.passwordReset.findFirst({ where: { token, expiresAt: { gt: new Date() } }, include: { user: true } }); }
export async function deletePasswordReset(id) { return prisma.passwordReset.delete({ where: { id } }); }
export async function deleteUserPasswordResets(userId) { return prisma.passwordReset.deleteMany({ where: { userId } }); }
export async function findOrganizationBySlug(slug) { return prisma.organization.findUnique({ where: { slug } }); }
export async function createOrganizationWithOwner(orgData, userData, subscriptionData) { return prisma.organization.create({ data: { ...orgData, subscription: { create: subscriptionData }, users: { create: userData } }, include: { subscription: true, users: true } }); }
export default { findUserByEmail, findUserById, createUser, updateUser, updateLastLogin, createSession, findSessionByToken, deleteSession, deleteAllUserSessions, getUserSessions, createPasswordReset, findPasswordResetByToken, deletePasswordReset, deleteUserPasswordResets, findOrganizationBySlug, createOrganizationWithOwner };
```

### token.service.js
```javascript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../../config/index.js';
export const ROLE_PERMISSIONS = {
  ORG_OWNER: ['*'],
  ADMIN: ['dashboard:read', 'staff:*', 'client:*', 'scheduling:*', 'billing:*', 'incidents:*', 'reports:*', 'settings:*', 'users:*'],
  MANAGER: ['dashboard:read', 'staff:read', 'staff:write', 'client:*', 'scheduling:*', 'incidents:*', 'reports:read'],
  SCHEDULER: ['dashboard:read', 'staff:read', 'client:read', 'scheduling:*'],
  FINANCE: ['dashboard:read', 'billing:*', 'reports:read', 'client:read'],
  COORDINATOR: ['dashboard:read', 'staff:read', 'client:*', 'scheduling:read', 'incidents:read', 'incidents:write'],
  SUPPORT_WORKER: ['dashboard:read', 'client:read', 'scheduling:read', 'shift:clock', 'incidents:write'],
  AUDITOR: ['dashboard:read', 'staff:read', 'client:read', 'scheduling:read', 'billing:read', 'incidents:read', 'reports:read'],
};
export function generateAccessToken(user, organization) { const permissions = getPermissions(user.role, user.customRole); const payload = { sub: user.id, email: user.email, organizationId: organization.id, organizationSlug: organization.slug, role: user.role, permissions, type: 'access' }; return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessTokenExpiry, issuer: config.jwt.issuer }); }
export function generateRefreshToken(userId, sessionToken) { const payload = { sub: userId, sessionToken, type: 'refresh' }; return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.refreshTokenExpiry || '7d', issuer: config.jwt.issuer }); }
export function generateSessionToken() { return crypto.randomBytes(32).toString('hex'); }
export function verifyAccessToken(token) { const decoded = jwt.verify(token, config.jwt.secret, { issuer: config.jwt.issuer }); if (decoded.type !== 'access') throw new Error('Invalid token type'); return decoded; }
export function verifyRefreshToken(token) { const decoded = jwt.verify(token, config.jwt.secret, { issuer: config.jwt.issuer }); if (decoded.type !== 'refresh') throw new Error('Invalid token type'); return decoded; }
export function getPermissions(role, customRole) { if (customRole?.permissions && Array.isArray(customRole.permissions)) return customRole.permissions; return ROLE_PERMISSIONS[role] || []; }
export function getSessionExpiry(days = 7) { const expiry = new Date(); expiry.setDate(expiry.getDate() + days); return expiry; }
export default { generateAccessToken, generateRefreshToken, generateSessionToken, verifyAccessToken, verifyRefreshToken, getPermissions, getSessionExpiry, ROLE_PERMISSIONS };
```

### auth.validator.js
```javascript
import Joi from 'joi';
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordMessages = { 'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character (@$!%*?&)' };
export const registerSchema = { body: Joi.object({ organizationName: Joi.string().trim().min(2).max(200).required(), email: Joi.string().email().required().lowercase().trim(), password: Joi.string().required().pattern(passwordPattern).messages(passwordMessages), firstName: Joi.string().trim().min(1).max(100).required(), lastName: Joi.string().trim().min(1).max(100).required(), phone: Joi.string().trim().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).optional().allow('') }) };
export const loginSchema = { body: Joi.object({ email: Joi.string().email().required().lowercase().trim(), password: Joi.string().required() }) };
export const refreshSchema = { body: Joi.object({ refreshToken: Joi.string().required() }) };
export const forgotPasswordSchema = { body: Joi.object({ email: Joi.string().email().required().lowercase().trim() }) };
export const resetPasswordSchema = { body: Joi.object({ token: Joi.string().required(), newPassword: Joi.string().required().pattern(passwordPattern).messages(passwordMessages) }) };
export const changePasswordSchema = { body: Joi.object({ currentPassword: Joi.string().required(), newPassword: Joi.string().required().pattern(passwordPattern).messages(passwordMessages) }) };
export const updateProfileSchema = { body: Joi.object({ firstName: Joi.string().trim().min(1).max(100).optional(), lastName: Joi.string().trim().min(1).max(100).optional(), phone: Joi.string().trim().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).optional().allow('', null), avatarUrl: Joi.string().trim().uri().optional().allow('', null) }).min(1) };
export default { registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, updateProfileSchema };
```

---
## MODULE: PLATFORM (modules/platform/)

### platform.routes.js
```javascript
import { Router } from 'express';
import * as platformController from './platform.controller.js';
import { authenticate } from '../../middleware/platformAuth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { loginSchema } from './platform.validator.js';
const router = Router();
router.get('/health', platformController.healthCheck);
router.post('/auth/login', validate(loginSchema), platformController.login);
router.get('/auth/me', authenticate, platformController.getProfile);
router.post('/auth/logout', authenticate, platformController.logout);
router.post('/auth/logout-all', authenticate, platformController.logoutAllDevices);
export default router;
```

### platform.controller.js
```javascript
import * as platformService from './platform.service.js';
import { success } from '../../shared/utils/response.util.js';
function getClientIp(req) { const forwarded = req.headers['x-forwarded-for']; if (forwarded) return forwarded.split(',')[0].trim(); return req.ip || req.socket?.remoteAddress || 'unknown'; }
export async function login(req, res) { const { email, password } = req.body; const ipAddress = getClientIp(req); const userAgent = req.headers['user-agent'] || 'unknown'; const result = await platformService.login(email, password, ipAddress, userAgent); return success(res, result, 'Login successful'); }
export async function logout(req, res) { await platformService.logout(req.token); return success(res, null, 'Logged out successfully'); }
export async function getProfile(req, res) { const admin = await platformService.getProfile(req.admin.id); return success(res, admin, 'Profile retrieved successfully'); }
export async function logoutAllDevices(req, res) { const result = await platformService.logoutAllDevices(req.admin.id); return success(res, { sessionsRemoved: result.count }, 'Logged out from all devices'); }
export async function healthCheck(req, res) { return success(res, { timestamp: new Date().toISOString(), uptime: process.uptime() }, 'Platform API is running'); }
export default { login, logout, getProfile, logoutAllDevices, healthCheck };
```

### platform.service.js
```javascript
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import * as platformRepo from './platform.repository.js';
import { UnauthorizedError, NotFoundError } from '../../shared/errors/AppError.js';
import { SESSION, SECURITY } from '../../config/constants.js';
const SALT_ROUNDS = SECURITY.BCRYPT_ROUNDS;
const SESSION_EXPIRY_DAYS = SESSION.PLATFORM_EXPIRY_DAYS;
export async function hashPassword(plainPassword) { return bcrypt.hash(plainPassword, SALT_ROUNDS); }
export async function comparePassword(plainPassword, hashedPassword) { return bcrypt.compare(plainPassword, hashedPassword); }
export function generateToken() { return crypto.randomBytes(32).toString('hex'); }
export function getSessionExpiry() { const expiry = new Date(); expiry.setDate(expiry.getDate() + SESSION_EXPIRY_DAYS); return expiry; }

export async function login(email, password, ipAddress, userAgent) {
  const admin = await platformRepo.findAdminByEmail(email);
  if (!admin) throw new UnauthorizedError('Invalid email or password');
  if (!admin.isActive) throw new UnauthorizedError('Account is deactivated. Please contact support.');
  const isPasswordValid = await comparePassword(password, admin.passwordHash);
  if (!isPasswordValid) throw new UnauthorizedError('Invalid email or password');
  const token = generateToken(); const expiresAt = getSessionExpiry();
  await platformRepo.createSession({ adminId: admin.id, token, ipAddress, userAgent, expiresAt });
  await platformRepo.updateLastLogin(admin.id, ipAddress);
  return { token, expiresAt, admin: { id: admin.id, email: admin.email, firstName: admin.firstName, lastName: admin.lastName, role: admin.role } };
}

export async function logout(token) { try { await platformRepo.deleteSession(token); } catch (error) {} return { success: true }; }

export async function validateSession(token) {
  const session = await platformRepo.findSessionByToken(token);
  if (!session) throw new UnauthorizedError('Invalid session');
  if (new Date() > session.expiresAt) { await platformRepo.deleteSession(token); throw new UnauthorizedError('Session expired'); }
  if (!session.admin.isActive) { await platformRepo.deleteSession(token); throw new UnauthorizedError('Account is deactivated'); }
  return session.admin;
}

export async function getProfile(adminId) { const admin = await platformRepo.findAdminById(adminId); if (!admin) throw new NotFoundError('Admin not found'); return admin; }
export async function logoutAllDevices(adminId) { const result = await platformRepo.deleteAllAdminSessions(adminId); return { success: true, count: result.count }; }
export default { hashPassword, comparePassword, generateToken, getSessionExpiry, login, logout, validateSession, getProfile, logoutAllDevices };
```

### platform.repository.js
```javascript
import prisma from '../../config/database.js';
export async function findAdminByEmail(email) { return prisma.platformAdmin.findUnique({ where: { email: email.toLowerCase() } }); }
export async function findAdminById(id) { return prisma.platformAdmin.findUnique({ where: { id }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, avatarUrl: true, lastLoginAt: true, createdAt: true, updatedAt: true } }); }
export async function updateLastLogin(id, ipAddress) { return prisma.platformAdmin.update({ where: { id }, data: { lastLoginAt: new Date(), lastLoginIp: ipAddress } }); }
export async function createSession({ adminId, token, ipAddress, userAgent, expiresAt }) { return prisma.platformSession.create({ data: { platformAdminId: adminId, token, ipAddress, userAgent, expiresAt } }); }
export async function findSessionByToken(token) { return prisma.platformSession.findUnique({ where: { token }, include: { admin: { select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true } } } }); }
export async function deleteSession(token) { return prisma.platformSession.delete({ where: { token } }); }
export async function deleteAllAdminSessions(adminId) { return prisma.platformSession.deleteMany({ where: { platformAdminId: adminId } }); }
export async function deleteExpiredSessions() { return prisma.platformSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }); }
```

### platform.validator.js
```javascript
import Joi from 'joi';
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordMessages = { 'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character (@$!%*?&)' };
export const loginSchema = { body: Joi.object({ email: Joi.string().email().required().lowercase().trim(), password: Joi.string().required() }) };
export const changePasswordSchema = { body: Joi.object({ currentPassword: Joi.string().required(), newPassword: Joi.string().required().pattern(passwordPattern).messages(passwordMessages), confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({ 'any.only': 'Passwords do not match' }) }) };
export const createAdminSchema = { body: Joi.object({ email: Joi.string().email().required().lowercase().trim(), password: Joi.string().required().pattern(passwordPattern).messages(passwordMessages), firstName: Joi.string().required().trim().min(1).max(100), lastName: Joi.string().required().trim().min(1).max(100), phone: Joi.string().optional().allow('').pattern(/^(\+?61|0)4\d{8}$/), role: Joi.string().valid('SUPER_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_VIEWER').default('PLATFORM_VIEWER') }) };
export const updateAdminSchema = { params: Joi.object({ id: Joi.string().uuid().required() }), body: Joi.object({ firstName: Joi.string().trim().min(1).max(100).optional(), lastName: Joi.string().trim().min(1).max(100).optional(), phone: Joi.string().allow('').pattern(/^(\+?61|0)4\d{8}$/).optional(), role: Joi.string().valid('SUPER_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_VIEWER').optional(), isActive: Joi.boolean().optional() }).min(1) };
export const getAdminSchema = { params: Joi.object({ id: Joi.string().uuid().required() }) };
export const paginationSchema = { query: Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20), search: Joi.string().trim().max(100).optional(), sortBy: Joi.string().valid('createdAt', 'email', 'firstName', 'lastName').default('createdAt'), sortOrder: Joi.string().valid('asc', 'desc').default('desc') }) };
export default { loginSchema, changePasswordSchema, createAdminSchema, updateAdminSchema, getAdminSchema, paginationSchema };
```

---
## MODULE: ORGANIZATION (modules/organization/)

### organization.routes.js
```javascript
import { Router } from 'express';
import * as orgController from './organization.controller.js';
import { authenticate, requireSuperAdmin } from '../../middleware/platformAuth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { listOrganizationsSchema, getOrganizationSchema, createOrganizationSchema, updateOrganizationSchema, suspendOrganizationSchema, activateOrganizationSchema, deleteOrganizationSchema } from './organization.validator.js';
const router = Router();
router.get('/', authenticate, validate(listOrganizationsSchema), orgController.list);
router.get('/stats', authenticate, orgController.getStats);
router.get('/:id', authenticate, validate(getOrganizationSchema), orgController.getById);
router.post('/', authenticate, requireSuperAdmin, validate(createOrganizationSchema), orgController.create);
router.patch('/:id', authenticate, requireSuperAdmin, validate(updateOrganizationSchema), orgController.update);
router.post('/:id/suspend', authenticate, requireSuperAdmin, validate(suspendOrganizationSchema), orgController.suspend);
router.post('/:id/activate', authenticate, requireSuperAdmin, validate(activateOrganizationSchema), orgController.activate);
router.delete('/:id', authenticate, requireSuperAdmin, validate(deleteOrganizationSchema), orgController.deactivate);
export default router;
```

### organization.controller.js
```javascript
import * as orgService from './organization.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';
export async function list(req, res) { const result = await orgService.listOrganizations(req.query); return paginated(res, result.data, result.pagination, 'Organizations retrieved successfully'); }
export async function getById(req, res) { const organization = await orgService.getOrganization(req.params.id); return success(res, organization, 'Organization retrieved successfully'); }
export async function getStats(req, res) { const stats = await orgService.getOrganizationStats(); return success(res, stats, 'Organization stats retrieved successfully'); }
export async function create(req, res) { const organization = await orgService.createOrganization(req.body); return created(res, organization, 'Organization created successfully'); }
export async function update(req, res) { const organization = await orgService.updateOrganization(req.params.id, req.body); return success(res, organization, 'Organization updated successfully'); }
export async function suspend(req, res) { const organization = await orgService.suspendOrganization(req.params.id, req.body.reason); return success(res, organization, 'Organization suspended successfully'); }
export async function activate(req, res) { const organization = await orgService.activateOrganization(req.params.id); return success(res, organization, 'Organization activated successfully'); }
export async function deactivate(req, res) { const organization = await orgService.deactivateOrganization(req.params.id); return success(res, organization, 'Organization deactivated successfully'); }
export default { list, getById, getStats, create, update, suspend, activate, deactivate };
```

### organization.service.js
```javascript
import * as orgRepo from './organization.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError.js';
import { ORGANIZATION } from '../../config/constants.js';
function generateSlug(name) { return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, ORGANIZATION.MAX_SLUG_LENGTH); }
async function ensureUniqueSlug(baseSlug) { let slug = baseSlug; let counter = 1; while (await orgRepo.findBySlug(slug)) { slug = `${baseSlug}-${counter}`; counter++; } return slug; }
function calculateTrialEndDate() { const date = new Date(); date.setDate(date.getDate() + ORGANIZATION.TRIAL_DAYS); return date; }

export async function listOrganizations(options = {}) { const { page = 1, limit = 20 } = options; const { data, total } = await orgRepo.findAll(options); return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }; }
export async function getOrganization(id) { const organization = await orgRepo.findById(id); if (!organization) throw new NotFoundError('Organization not found'); return organization; }

export async function createOrganization(data) {
  const { name, slug: customSlug, abn, ndisRegistrationNo, ...rest } = data;
  let slug; if (customSlug) { const existingSlug = await orgRepo.findBySlug(customSlug); if (existingSlug) throw new ConflictError('Organization slug already exists'); slug = customSlug; } else { const baseSlug = generateSlug(name); slug = await ensureUniqueSlug(baseSlug); }
  if (abn) { const existingAbn = await orgRepo.findByAbn(abn); if (existingAbn) throw new ConflictError('Organization with this ABN already exists'); }
  if (ndisRegistrationNo) { const existingNdis = await orgRepo.findByNdisRegistrationNo(ndisRegistrationNo); if (existingNdis) throw new ConflictError('Organization with this NDIS registration number already exists'); }
  const orgData = { name, slug, abn, ndisRegistrationNo, ...rest };
  const subscriptionData = { plan: 'FREE_TRIAL', status: 'TRIALING', trialEndsAt: calculateTrialEndDate(), maxStaff: ORGANIZATION.PLAN_LIMITS.FREE_TRIAL.maxStaff, maxClients: ORGANIZATION.PLAN_LIMITS.FREE_TRIAL.maxClients };
  return orgRepo.create(orgData, subscriptionData);
}

export async function updateOrganization(id, data) {
  const existing = await orgRepo.findById(id); if (!existing) throw new NotFoundError('Organization not found');
  const { slug, abn, ndisRegistrationNo, ...rest } = data;
  if (slug && slug !== existing.slug) { const existingSlug = await orgRepo.findBySlug(slug); if (existingSlug) throw new ConflictError('Organization slug already exists'); }
  if (abn && abn !== existing.abn) { const existingAbn = await orgRepo.findByAbn(abn); if (existingAbn) throw new ConflictError('Organization with this ABN already exists'); }
  if (ndisRegistrationNo && ndisRegistrationNo !== existing.ndisRegistrationNo) { const existingNdis = await orgRepo.findByNdisRegistrationNo(ndisRegistrationNo); if (existingNdis) throw new ConflictError('Organization with this NDIS registration number already exists'); }
  return orgRepo.update(id, { slug, abn, ndisRegistrationNo, ...rest });
}

export async function suspendOrganization(id, reason) { const existing = await orgRepo.findById(id); if (!existing) throw new NotFoundError('Organization not found'); if (existing.status === 'SUSPENDED') throw new BadRequestError('Organization is already suspended'); return orgRepo.updateStatus(id, 'SUSPENDED'); }
export async function activateOrganization(id) { const existing = await orgRepo.findById(id); if (!existing) throw new NotFoundError('Organization not found'); if (existing.status === 'ACTIVE') throw new BadRequestError('Organization is already active'); return orgRepo.updateStatus(id, 'ACTIVE'); }
export async function deactivateOrganization(id) { const existing = await orgRepo.findById(id); if (!existing) throw new NotFoundError('Organization not found'); return orgRepo.updateStatus(id, 'DEACTIVATED'); }
export async function getOrganizationStats() { return orgRepo.getStats(); }
export default { listOrganizations, getOrganization, createOrganization, updateOrganization, suspendOrganization, activateOrganization, deactivateOrganization, getOrganizationStats };
```

### organization.repository.js
```javascript
import prisma from '../../config/database.js';
export async function findAll(options = {}) {
  const { page = 1, limit = 20, search, status, subscriptionPlan, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const where = { ...(status && { status }), ...(subscriptionPlan && { subscription: { plan: subscriptionPlan } }), ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }, { abn: { contains: search, mode: 'insensitive' } }] }) };
  const [data, total] = await Promise.all([prisma.organization.findMany({ where, include: { subscription: { select: { id: true, plan: true, status: true, trialEndsAt: true, currentPeriodStart: true, currentPeriodEnd: true } }, _count: { select: { users: true, staffMembers: true, clients: true } } }, orderBy: { [sortBy]: sortOrder }, skip: (page - 1) * limit, take: limit }), prisma.organization.count({ where })]);
  return { data, total };
}
export async function findById(id) { return prisma.organization.findUnique({ where: { id }, include: { subscription: true, _count: { select: { users: true, staffMembers: true, clients: true } } } }); }
export async function findBySlug(slug) { return prisma.organization.findUnique({ where: { slug } }); }
export async function findByAbn(abn) { return prisma.organization.findUnique({ where: { abn } }); }
export async function findByNdisRegistrationNo(ndisRegistrationNo) { return prisma.organization.findUnique({ where: { ndisRegistrationNo } }); }
export async function create(data, subscriptionData) { return prisma.organization.create({ data: { ...data, subscription: { create: subscriptionData } }, include: { subscription: true } }); }
export async function update(id, data) { return prisma.organization.update({ where: { id }, data, include: { subscription: true, _count: { select: { users: true, staffMembers: true, clients: true } } } }); }
export async function updateStatus(id, status) { return prisma.organization.update({ where: { id }, data: { status }, include: { subscription: true } }); }
export async function deleteById(id) { return prisma.organization.delete({ where: { id } }); }
export async function getStats() { const [total, byStatus, byPlan] = await Promise.all([prisma.organization.count(), prisma.organization.groupBy({ by: ['status'], _count: { status: true } }), prisma.subscription.groupBy({ by: ['plan'], _count: { plan: true } })]); return { total, byStatus: byStatus.reduce((acc, item) => { acc[item.status] = item._count.status; return acc; }, {}), byPlan: byPlan.reduce((acc, item) => { acc[item.plan] = item._count.plan; return acc; }, {}) }; }
export default { findAll, findById, findBySlug, findByAbn, findByNdisRegistrationNo, create, update, updateStatus, deleteById, getStats };
```

### organization.validator.js
```javascript
import Joi from 'joi';
const australianStates = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];
const australianTimezones = ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth', 'Australia/Adelaide', 'Australia/Hobart', 'Australia/Darwin', 'Australia/Canberra'];
export const listOrganizationsSchema = { query: Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20), search: Joi.string().trim().max(100).optional(), status: Joi.string().valid('ACTIVE', 'SUSPENDED', 'DEACTIVATED').optional(), subscriptionPlan: Joi.string().valid('FREE_TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM').optional(), sortBy: Joi.string().valid('createdAt', 'name', 'email', 'status').default('createdAt'), sortOrder: Joi.string().valid('asc', 'desc').default('desc') }) };
export const getOrganizationSchema = { params: Joi.object({ id: Joi.string().required() }) };
export const createOrganizationSchema = { body: Joi.object({ name: Joi.string().trim().min(2).max(200).required(), slug: Joi.string().trim().lowercase().min(3).max(50).pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(), email: Joi.string().email().required().lowercase().trim(), abn: Joi.string().trim().pattern(/^\d{11}$/).optional().allow(''), ndisRegistrationNo: Joi.string().trim().optional().allow(''), phone: Joi.string().trim().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).optional().allow(''), website: Joi.string().trim().uri().optional().allow(''), logoUrl: Joi.string().trim().uri().optional().allow(''), addressLine1: Joi.string().trim().max(200).optional().allow(''), addressLine2: Joi.string().trim().max(200).optional().allow(''), suburb: Joi.string().trim().max(100).optional().allow(''), state: Joi.string().trim().valid(...australianStates).optional().allow(''), postcode: Joi.string().trim().pattern(/^\d{4}$/).optional().allow(''), country: Joi.string().trim().default('AU'), timezone: Joi.string().trim().valid(...australianTimezones).default('Australia/Sydney') }) };
export const updateOrganizationSchema = { params: Joi.object({ id: Joi.string().required() }), body: Joi.object({ name: Joi.string().trim().min(2).max(200).optional(), slug: Joi.string().trim().lowercase().min(3).max(50).pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(), email: Joi.string().email().lowercase().trim().optional(), abn: Joi.string().trim().pattern(/^\d{11}$/).optional().allow('', null), ndisRegistrationNo: Joi.string().trim().optional().allow('', null), phone: Joi.string().trim().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).optional().allow('', null), website: Joi.string().trim().uri().optional().allow('', null), logoUrl: Joi.string().trim().uri().optional().allow('', null), addressLine1: Joi.string().trim().max(200).optional().allow('', null), addressLine2: Joi.string().trim().max(200).optional().allow('', null), suburb: Joi.string().trim().max(100).optional().allow('', null), state: Joi.string().trim().valid(...australianStates).optional().allow('', null), postcode: Joi.string().trim().pattern(/^\d{4}$/).optional().allow('', null), country: Joi.string().trim().optional(), timezone: Joi.string().trim().valid(...australianTimezones).optional() }).min(1) };
export const suspendOrganizationSchema = { params: Joi.object({ id: Joi.string().required() }), body: Joi.object({ reason: Joi.string().trim().max(500).optional() }) };
export const activateOrganizationSchema = { params: Joi.object({ id: Joi.string().required() }) };
export const deleteOrganizationSchema = { params: Joi.object({ id: Joi.string().required() }) };
export default { listOrganizationsSchema, getOrganizationSchema, createOrganizationSchema, updateOrganizationSchema, suspendOrganizationSchema, activateOrganizationSchema, deleteOrganizationSchema };
```

---
## MODULE: USER (modules/user/)

### user.routes.js
```javascript
import { Router } from 'express';
import * as userController from './user.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { listUsersSchema, getUserSchema, inviteUserSchema, acceptInviteSchema, updateUserSchema, userIdParamSchema, listInvitationsSchema } from './user.validator.js';
const router = Router();
router.post('/accept-invite', validate(acceptInviteSchema), userController.acceptInvite);
router.get('/', authenticate, requirePermission('users:read'), validate(listUsersSchema), userController.list);
router.get('/invitations', authenticate, requirePermission('users:read'), validate(listInvitationsSchema), userController.listInvitations);
router.get('/:id', authenticate, requirePermission('users:read'), validate(getUserSchema), userController.getById);
router.post('/invite', authenticate, requirePermission('users:write'), validate(inviteUserSchema), userController.invite);
router.patch('/:id', authenticate, requirePermission('users:write'), validate(updateUserSchema), userController.update);
router.delete('/:id', authenticate, requirePermission('users:write'), validate(userIdParamSchema), userController.deactivate);
router.post('/:id/reactivate', authenticate, requirePermission('users:write'), validate(userIdParamSchema), userController.reactivate);
router.post('/:id/resend-invite', authenticate, requirePermission('users:write'), validate(userIdParamSchema), userController.resendInvite);
export default router;
```

### user.controller.js
```javascript
import * as userService from './user.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';
export async function list(req, res) { const result = await userService.listUsers(req.organizationId, req.query); return paginated(res, result.data, result.pagination, 'Users retrieved successfully'); }
export async function getById(req, res) { const user = await userService.getUser(req.organizationId, req.params.id); return success(res, user, 'User retrieved successfully'); }
export async function invite(req, res) { const result = await userService.inviteUser(req.organizationId, req.body, req.user.id); return created(res, result, 'Invitation sent successfully'); }
export async function acceptInvite(req, res) { const { token, password } = req.body; const result = await userService.acceptInvite(token, password); return success(res, result, 'Invitation accepted successfully'); }
export async function update(req, res) { const user = await userService.updateUser(req.organizationId, req.params.id, req.body, req.user); return success(res, user, 'User updated successfully'); }
export async function deactivate(req, res) { const user = await userService.deactivateUser(req.organizationId, req.params.id, req.user); return success(res, user, 'User deactivated successfully'); }
export async function reactivate(req, res) { const user = await userService.reactivateUser(req.organizationId, req.params.id); return success(res, user, 'User reactivated successfully'); }
export async function resendInvite(req, res) { const result = await userService.resendInvite(req.organizationId, req.params.id, req.user.id); return success(res, result, 'Invitation resent successfully'); }
export async function listInvitations(req, res) { const result = await userService.listInvitations(req.organizationId, req.query); return paginated(res, result.data, result.pagination, 'Invitations retrieved successfully'); }
export default { list, getById, invite, acceptInvite, update, deactivate, reactivate, resendInvite, listInvitations };
```

### user.service.js
```javascript
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as userRepo from './user.repository.js';
import { NotFoundError, ConflictError, BadRequestError, ForbiddenError } from '../../shared/errors/AppError.js';
import { SECURITY } from '../../config/constants.js';
async function hashPassword(password) { return bcrypt.hash(password, SECURITY.BCRYPT_ROUNDS); }
function generateInviteToken() { return crypto.randomBytes(32).toString('hex'); }
function getInviteExpiry(days = 7) { const d = new Date(); d.setDate(d.getDate() + days); return d; }

export async function listUsers(organizationId, options = {}) { const { page = 1, limit = 20 } = options; const { data, total } = await userRepo.findAll(organizationId, options); return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }; }
export async function getUser(organizationId, userId) { const user = await userRepo.findById(organizationId, userId); if (!user) throw new NotFoundError('User not found'); return user; }

export async function inviteUser(organizationId, data, invitedBy) {
  const { email, role, firstName, lastName, phone } = data;
  const existingUser = await userRepo.findByEmail(organizationId, email);
  if (existingUser) throw new ConflictError('User with this email already exists in the organization');
  const existingInvite = await userRepo.findInvitationByEmail(organizationId, email);
  if (existingInvite) throw new ConflictError('A pending invitation already exists for this email');
  if (role === 'ORG_OWNER') throw new ForbiddenError('Cannot invite another organization owner');
  const user = await userRepo.create({ organizationId, email: email.toLowerCase(), firstName, lastName, phone, role, status: 'INVITED' });
  const token = generateInviteToken(); const expiresAt = getInviteExpiry(7);
  const invitation = await userRepo.createInvitation({ organizationId, email: email.toLowerCase(), role, token, invitedBy, expiresAt });
  console.log(`Invite token for ${email}: ${token}`);
  return { user, invitation: { id: invitation.id, email: invitation.email, role: invitation.role, status: invitation.status, expiresAt: invitation.expiresAt, token: invitation.token } };
}

export async function acceptInvite(token, password) {
  const invitation = await userRepo.findInvitationByToken(token);
  if (!invitation) throw new BadRequestError('Invalid invitation token');
  if (invitation.status !== 'PENDING') throw new BadRequestError('Invitation has already been used or cancelled');
  if (new Date() > invitation.expiresAt) { await userRepo.updateInvitation(invitation.id, { status: 'EXPIRED' }); throw new BadRequestError('Invitation has expired. Please request a new one.'); }
  const user = await userRepo.findByEmail(invitation.organizationId, invitation.email);
  if (!user) throw new NotFoundError('User account not found');
  const passwordHash = await hashPassword(password);
  const updatedUser = await userRepo.update(user.id, { passwordHash, status: 'ACTIVE' });
  await userRepo.updateInvitation(invitation.id, { status: 'ACCEPTED', acceptedAt: new Date() });
  return { message: 'Invitation accepted successfully', user: { id: updatedUser.id, email: updatedUser.email, firstName: updatedUser.firstName, lastName: updatedUser.lastName, role: updatedUser.role }, organization: { id: invitation.organization.id, name: invitation.organization.name, slug: invitation.organization.slug } };
}

export async function updateUser(organizationId, userId, data, requestingUser) { const user = await userRepo.findById(organizationId, userId); if (!user) throw new NotFoundError('User not found'); if (user.role === 'ORG_OWNER' && requestingUser.role !== 'ORG_OWNER') throw new ForbiddenError('Cannot modify organization owner'); if (data.role === 'ORG_OWNER') throw new ForbiddenError('Cannot assign organization owner role'); if (userId === requestingUser.id && data.role) throw new BadRequestError('Cannot change your own role'); return await userRepo.update(userId, data); }
export async function deactivateUser(organizationId, userId, requestingUser) { const user = await userRepo.findById(organizationId, userId); if (!user) throw new NotFoundError('User not found'); if (user.role === 'ORG_OWNER') throw new ForbiddenError('Cannot deactivate organization owner'); if (userId === requestingUser.id) throw new BadRequestError('Cannot deactivate your own account'); return await userRepo.update(userId, { status: 'DISABLED' }); }
export async function reactivateUser(organizationId, userId) { const user = await userRepo.findById(organizationId, userId); if (!user) throw new NotFoundError('User not found'); if (user.status === 'ACTIVE') throw new BadRequestError('User is already active'); return await userRepo.update(userId, { status: 'ACTIVE' }); }
export async function resendInvite(organizationId, userId, invitedBy) { const user = await userRepo.findById(organizationId, userId); if (!user) throw new NotFoundError('User not found'); if (user.status !== 'INVITED') throw new BadRequestError('User has already accepted the invitation'); const existingInvite = await userRepo.findInvitationByEmail(organizationId, user.email); if (existingInvite) await userRepo.updateInvitation(existingInvite.id, { status: 'CANCELLED' }); const token = generateInviteToken(); const expiresAt = getInviteExpiry(7); const invitation = await userRepo.createInvitation({ organizationId, email: user.email, role: user.role, token, invitedBy, expiresAt }); console.log(`Resent invite token for ${user.email}: ${token}`); return { message: 'Invitation resent successfully', invitation: { id: invitation.id, email: invitation.email, expiresAt: invitation.expiresAt, token: invitation.token } }; }
export async function listInvitations(organizationId, options = {}) { const { page = 1, limit = 20 } = options; const { data, total } = await userRepo.listInvitations(organizationId, options); return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }; }
export default { listUsers, getUser, inviteUser, acceptInvite, updateUser, deactivateUser, reactivateUser, resendInvite, listInvitations };
```

### user.repository.js
```javascript
import prisma from '../../config/database.js';
export async function findAll(organizationId, options = {}) {
  const { page = 1, limit = 20, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const where = { organizationId, ...(role && { role }), ...(status && { status }), ...(search && { OR: [{ email: { contains: search, mode: 'insensitive' } }, { firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }, { phone: { contains: search, mode: 'insensitive' } }] }) };
  const [data, total] = await Promise.all([prisma.user.findMany({ where, select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true, role: true, status: true, lastLoginAt: true, createdAt: true, updatedAt: true, customRole: { select: { id: true, name: true } }, staffProfile: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { [sortBy]: sortOrder }, skip: (page - 1) * limit, take: limit }), prisma.user.count({ where })]);
  return { data, total };
}
export async function findById(organizationId, userId) { return prisma.user.findFirst({ where: { id: userId, organizationId }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true, role: true, customRoleId: true, status: true, lastLoginAt: true, lastLoginIp: true, createdAt: true, updatedAt: true, customRole: { select: { id: true, name: true, permissions: true } }, staffProfile: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } } }); }
export async function findByEmail(organizationId, email) { return prisma.user.findFirst({ where: { organizationId, email: email.toLowerCase() } }); }
export async function create(data) { return prisma.user.create({ data, select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, status: true, createdAt: true } }); }
export async function update(userId, data) { return prisma.user.update({ where: { id: userId }, data, select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true, role: true, customRoleId: true, status: true, lastLoginAt: true, createdAt: true, updatedAt: true, customRole: { select: { id: true, name: true } } } }); }
export async function countByRole(organizationId) { return prisma.user.groupBy({ by: ['role'], where: { organizationId }, _count: { role: true } }); }
export async function countActive(organizationId) { return prisma.user.count({ where: { organizationId, status: 'ACTIVE' } }); }
export async function createInvitation(data) { return prisma.userInvitation.create({ data }); }
export async function findInvitationByToken(token) { return prisma.userInvitation.findUnique({ where: { token }, include: { organization: true } }); }
export async function findInvitationByEmail(organizationId, email) { return prisma.userInvitation.findFirst({ where: { organizationId, email: email.toLowerCase(), status: 'PENDING' } }); }
export async function findInvitationById(id) { return prisma.userInvitation.findUnique({ where: { id } }); }
export async function updateInvitation(id, data) { return prisma.userInvitation.update({ where: { id }, data }); }
export async function listInvitations(organizationId, options = {}) { const { status, page = 1, limit = 20 } = options; const where = { organizationId, ...(status && { status }) }; const [data, total] = await Promise.all([prisma.userInvitation.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }), prisma.userInvitation.count({ where })]); return { data, total }; }
export async function deleteInvitation(id) { return prisma.userInvitation.delete({ where: { id } }); }
export default { findAll, findById, findByEmail, create, update, countByRole, countActive, createInvitation, findInvitationByToken, findInvitationByEmail, findInvitationById, updateInvitation, listInvitations, deleteInvitation };
```

### user.validator.js
```javascript
import Joi from 'joi';
const assignableRoles = ['ADMIN', 'MANAGER', 'SCHEDULER', 'FINANCE', 'COORDINATOR', 'SUPPORT_WORKER', 'AUDITOR'];
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const listUsersSchema = { query: Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20), search: Joi.string().trim().max(100).optional(), role: Joi.string().valid('ORG_OWNER', ...assignableRoles).optional(), status: Joi.string().valid('ACTIVE', 'INVITED', 'DISABLED', 'LOCKED').optional(), sortBy: Joi.string().valid('createdAt', 'firstName', 'lastName', 'email', 'role', 'status').default('createdAt'), sortOrder: Joi.string().valid('asc', 'desc').default('desc') }) };
export const getUserSchema = { params: Joi.object({ id: Joi.string().required() }) };
export const inviteUserSchema = { body: Joi.object({ email: Joi.string().email().required().lowercase().trim(), role: Joi.string().valid(...assignableRoles).required(), firstName: Joi.string().trim().min(1).max(100).required(), lastName: Joi.string().trim().min(1).max(100).required(), phone: Joi.string().trim().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).optional().allow('') }) };
export const acceptInviteSchema = { body: Joi.object({ token: Joi.string().required(), password: Joi.string().required().pattern(passwordPattern) }) };
export const updateUserSchema = { params: Joi.object({ id: Joi.string().required() }), body: Joi.object({ firstName: Joi.string().trim().min(1).max(100).optional(), lastName: Joi.string().trim().min(1).max(100).optional(), phone: Joi.string().trim().pattern(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/).optional().allow('', null), role: Joi.string().valid(...assignableRoles).optional(), customRoleId: Joi.string().optional().allow(null) }).min(1) };
export const userIdParamSchema = { params: Joi.object({ id: Joi.string().required() }) };
export const listInvitationsSchema = { query: Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20), status: Joi.string().valid('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED').optional() }) };
export default { listUsersSchema, getUserSchema, inviteUserSchema, acceptInviteSchema, updateUserSchema, userIdParamSchema, listInvitationsSchema };
```

---
## PRISMA SCHEMA (schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// ENUMS
enum PlatformRole { SUPER_ADMIN PLATFORM_SUPPORT PLATFORM_BILLING }
enum SubscriptionPlan { FREE_TRIAL STARTER PROFESSIONAL ENTERPRISE CUSTOM }
enum SubscriptionStatus { TRIALING ACTIVE PAST_DUE PAUSED CANCELLED EXPIRED }
enum PlatformInvoiceStatus { DRAFT SENT PAID OVERDUE CANCELLED REFUNDED }
enum OrgRole { ORG_OWNER ADMIN MANAGER SCHEDULER FINANCE COORDINATOR SUPPORT_WORKER AUDITOR }
enum OrgStatus { ACTIVE SUSPENDED DEACTIVATED }
enum UserStatus { ACTIVE INVITED DISABLED LOCKED }
enum InviteStatus { PENDING ACCEPTED EXPIRED CANCELLED }
enum EmploymentType { FULL_TIME PART_TIME CASUAL CONTRACT VOLUNTEER }
enum EmploymentStatus { ACTIVE ON_LEAVE SUSPENDED TERMINATED RESIGNED }
enum ProficiencyLevel { BEGINNER INTERMEDIATE ADVANCED EXPERT }
enum LeaveType { ANNUAL SICK PERSONAL UNPAID PARENTAL WORKERS_COMP COMPASSIONATE }
enum ApprovalStatus { PENDING APPROVED REJECTED CANCELLED }
enum ClientStatus { ACTIVE INACTIVE ON_HOLD DISCHARGED WAITLISTED DECEASED }
enum FundingType { NDIS_AGENCY_MANAGED NDIS_PLAN_MANAGED NDIS_SELF_MANAGED AGED_CARE_HCP AGED_CARE_CHSP PRIVATE INSURANCE DVA }
enum NdisBudgetCategory { CORE_SUPPORTS CAPACITY_BUILDING CAPITAL_SUPPORTS }
enum GoalStatus { NOT_STARTED IN_PROGRESS ACHIEVED ON_HOLD CANCELLED }
enum CarePlanStatus { DRAFT ACTIVE UNDER_REVIEW EXPIRED CANCELLED }
enum AgedCarePackageLevel { LEVEL_1 LEVEL_2 LEVEL_3 LEVEL_4 }
enum AssessmentType { INITIAL PERIODIC DISCHARGE FUNCTIONAL RISK BEHAVIORAL }
enum ShiftStatus { DRAFT PUBLISHED ACCEPTED IN_PROGRESS COMPLETED CANCELLED NO_SHOW PENDING_APPROVAL INVOICED }
enum RateType { WEEKDAY_DAY WEEKDAY_EVENING WEEKDAY_NIGHT SATURDAY SUNDAY PUBLIC_HOLIDAY SLEEPOVER }
enum RecurrenceType { DAILY WEEKLY FORTNIGHTLY MONTHLY }
enum DayOfWeek { MONDAY TUESDAY WEDNESDAY THURSDAY FRIDAY SATURDAY SUNDAY }
enum SwapStatus { PENDING APPROVED REJECTED CANCELLED }
enum ClockAction { CLOCK_IN CLOCK_OUT BREAK_START BREAK_END }
enum ClientMood { VERY_HAPPY HAPPY NEUTRAL UNHAPPY VERY_UNHAPPY ANXIOUS AGITATED NOT_ASSESSED }
enum InvoiceStatus { DRAFT APPROVED SENT PAID PARTIALLY_PAID OVERDUE CANCELLED VOID EXPORTED_TO_XERO }
enum PaymentMethod { BANK_TRANSFER CREDIT_CARD DIRECT_DEBIT NDIS_PORTAL BPAY CASH CHEQUE }
enum PaymentStatus { PENDING COMPLETED FAILED REFUNDED }
enum CreditNoteStatus { DRAFT ISSUED APPLIED CANCELLED }
enum XeroSyncStatus { PENDING SYNCED FAILED SKIPPED }
enum DocumentStatus { ACTIVE EXPIRING_SOON EXPIRED PENDING_REVIEW ARCHIVED }
enum IncidentType { INJURY NEAR_MISS PROPERTY_DAMAGE BEHAVIOURAL MEDICATION_ERROR ABUSE_NEGLECT RESTRICTIVE_PRACTICE DEATH SEXUAL_MISCONDUCT OTHER }
enum Severity { LOW MEDIUM HIGH CRITICAL }
enum IncidentStatus { OPEN UNDER_INVESTIGATION RESOLVED CLOSED ESCALATED REPORTED_TO_NDIS }
enum ComplaintType { SERVICE_QUALITY STAFF_BEHAVIOUR BILLING SCHEDULING COMMUNICATION SAFETY OTHER }
enum ComplaintStatus { OPEN UNDER_REVIEW RESOLVED ESCALATED CLOSED }
enum NotificationType { SHIFT_REMINDER SHIFT_CHANGE SHIFT_CANCELLED DOCUMENT_EXPIRY INVOICE_CREATED PAYMENT_RECEIVED LEAVE_UPDATE INCIDENT_REPORTED SOS_ALERT SYSTEM CUSTOM }
enum NotificationChannel { IN_APP EMAIL SMS PUSH }
enum EmailStatus { QUEUED SENT DELIVERED FAILED BOUNCED }
enum SmsStatus { QUEUED SENT DELIVERED FAILED }
enum FormFieldType { TEXT TEXTAREA NUMBER DROPDOWN CHECKBOX RADIO DATE TIME FILE_UPLOAD SIGNATURE SECTION_HEADER RATING }
enum FormSubmissionStatus { DRAFT SUBMITTED REVIEWED APPROVED }
enum LogLevel { DEBUG INFO WARNING ERROR CRITICAL }
enum ReportType { INVOICE PAYMENT TIME_TRACKER VALUATION COMPLIANCE SKILLS ACTION QUALIFICATION AREA_TRACKER LOG KPI DELETED_SHIFT CUSTOM }
enum ScheduleFrequency { DAILY WEEKLY FORTNIGHTLY MONTHLY QUARTERLY ANNUALLY }

// LAYER 1: PLATFORM
model PlatformAdmin {
  id String @id @default(cuid())
  email String @unique
  passwordHash String @map("password_hash")
  firstName String @map("first_name")
  lastName String @map("last_name")
  phone String?
  role PlatformRole @default(SUPER_ADMIN)
  isActive Boolean @default(true) @map("is_active")
  avatarUrl String? @map("avatar_url")
  lastLoginAt DateTime? @map("last_login_at")
  lastLoginIp String? @map("last_login_ip")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  sessions PlatformSession[]
  platformAuditLogs PlatformAuditLog[]
  @@map("platform_admins")
}

model PlatformSession {
  id String @id @default(cuid())
  platformAdminId String @map("platform_admin_id")
  token String @unique
  ipAddress String? @map("ip_address")
  userAgent String? @map("user_agent")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  admin PlatformAdmin @relation(fields: [platformAdminId], references: [id], onDelete: Cascade)
  @@index([token])
  @@map("platform_sessions")
}

model Organization {
  id String @id @default(cuid())
  name String
  slug String @unique
  abn String? @unique
  ndisRegistrationNo String? @unique @map("ndis_registration_no")
  email String
  phone String?
  website String?
  logoUrl String? @map("logo_url")
  addressLine1 String? @map("address_line_1")
  addressLine2 String? @map("address_line_2")
  suburb String?
  state String?
  postcode String?
  country String @default("AU")
  timezone String @default("Australia/Sydney")
  status OrgStatus @default(ACTIVE)
  onboardedAt DateTime? @map("onboarded_at")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  subscription Subscription?
  users User[]
  roles OrgCustomRole[]
  clients Client[]
  staffMembers StaffMember[]
  serviceTypes ServiceType[]
  shifts Shift[]
  recurringPatterns RecurringShiftPattern[]
  invoices Invoice[]
  payments Payment[]
  creditNotes CreditNote[]
  ndisPriceGuide NdisPriceGuideEntry[]
  payGroups PayGroup[]
  allowanceConfigs AllowanceConfig[]
  publicHolidays PublicHoliday[]
  incidents Incident[]
  complaints Complaint[]
  messages Message[]
  notifications Notification[]
  documents OrgDocument[]
  formTemplates FormTemplate[]
  scheduledReports ScheduledReport[]
  auditLogs AuditLog[]
  orgSettings OrgSetting[]
  masterData MasterDataItem[]
  xeroConnection XeroConnection?
  emailLogs EmailLog[]
  smsLogs SmsLog[]
  geofences Geofence[]
  kpiDefinitions KpiDefinition[]
  teams Team[]
  invitations UserInvitation[]
  @@index([slug])
  @@index([status])
  @@map("organizations")
}

model Subscription {
  id String @id @default(cuid())
  organizationId String @unique @map("organization_id")
  plan SubscriptionPlan @default(FREE_TRIAL)
  status SubscriptionStatus @default(TRIALING)
  maxStaff Int? @map("max_staff")
  maxClients Int? @map("max_clients")
  pricePerMonth Decimal? @map("price_per_month") @db.Decimal(8, 2)
  pricePerUser Decimal? @map("price_per_user") @db.Decimal(8, 2)
  currency String @default("AUD")
  trialEndsAt DateTime? @map("trial_ends_at")
  currentPeriodStart DateTime? @map("current_period_start")
  currentPeriodEnd DateTime? @map("current_period_end")
  cancelledAt DateTime? @map("cancelled_at")
  stripeCustomerId String? @map("stripe_customer_id")
  stripeSubscriptionId String? @map("stripe_subscription_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  invoices PlatformInvoice[]
  @@map("subscriptions")
}

model PlatformInvoice {
  id String @id @default(cuid())
  subscriptionId String @map("subscription_id")
  invoiceNumber String @unique @map("invoice_number")
  amount Decimal @db.Decimal(10, 2)
  taxAmount Decimal @default(0) @map("tax_amount") @db.Decimal(10, 2)
  totalAmount Decimal @map("total_amount") @db.Decimal(10, 2)
  currency String @default("AUD")
  status PlatformInvoiceStatus @default(DRAFT)
  periodStart DateTime @map("period_start")
  periodEnd DateTime @map("period_end")
  paidAt DateTime? @map("paid_at")
  stripeInvoiceId String? @map("stripe_invoice_id")
  createdAt DateTime @default(now()) @map("created_at")
  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  @@index([subscriptionId])
  @@map("platform_invoices")
}

model PlatformAuditLog {
  id String @id @default(cuid())
  platformAdminId String? @map("platform_admin_id")
  action String
  entityType String @map("entity_type")
  entityId String @map("entity_id")
  details Json?
  ipAddress String? @map("ip_address")
  createdAt DateTime @default(now()) @map("created_at")
  admin PlatformAdmin? @relation(fields: [platformAdminId], references: [id], onDelete: SetNull)
  @@index([entityType, entityId])
  @@index([createdAt])
  @@map("platform_audit_logs")
}

model FeatureFlag {
  id String @id @default(cuid())
  organizationId String? @map("organization_id")
  featureKey String @map("feature_key")
  isEnabled Boolean @default(false) @map("is_enabled")
  metadata Json?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@unique([organizationId, featureKey])
  @@map("feature_flags")
}

// LAYER 2: AUTH & RBAC
model User {
  id String @id @default(cuid())
  organizationId String @map("organization_id")
  email String
  passwordHash String? @map("password_hash")
  firstName String @map("first_name")
  lastName String @map("last_name")
  phone String?
  avatarUrl String? @map("avatar_url")
  role OrgRole @default(SUPPORT_WORKER)
  customRoleId String? @map("custom_role_id")
  status UserStatus @default(ACTIVE)
  lastLoginAt DateTime? @map("last_login_at")
  lastLoginIp String? @map("last_login_ip")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  customRole OrgCustomRole? @relation(fields: [customRoleId], references: [id], onDelete: SetNull)
  sessions Session[]
  passwordResets PasswordReset[]
  staffProfile StaffMember?
  clientProfile Client?
  familyLinks ClientFamilyMember[]
  sentMessages Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  notifications Notification[]
  auditLogs AuditLog[]
  activityLogs ActivityLog[]
  @@unique([organizationId, email])
  @@index([organizationId])
  @@map("users")
}

model OrgCustomRole {
  id String @id @default(cuid())
  organizationId String @map("organization_id")
  name String
  slug String
  permissions Json
  description String?
  isDefault Boolean @default(false) @map("is_default")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  users User[]
  @@unique([organizationId, slug])
  @@map("org_custom_roles")
}

model Session {
  id String @id @default(cuid())
  userId String @map("user_id")
  token String @unique
  ipAddress String? @map("ip_address")
  userAgent String? @map("user_agent")
  deviceType String? @map("device_type")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([token])
  @@map("sessions")
}

model PasswordReset {
  id String @id @default(cuid())
  userId String @map("user_id")
  token String @unique
  expiresAt DateTime @map("expires_at")
  usedAt DateTime? @map("used_at")
  createdAt DateTime @default(now()) @map("created_at")
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([token])
  @@map("password_resets")
}

model UserInvitation {
  id String @id @default(cuid())
  organizationId String @map("organization_id")
  email String
  role OrgRole
  token String @unique
  invitedBy String @map("invited_by")
  status InviteStatus @default(PENDING)
  expiresAt DateTime @map("expires_at")
  acceptedAt DateTime? @map("accepted_at")
  createdAt DateTime @default(now()) @map("created_at")
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@index([token])
  @@index([organizationId])
  @@map("user_invitations")
}

// LAYER 3A: STAFF
model StaffMember {
  id String @id @default(cuid())
  organizationId String @map("organization_id")
  userId String @unique @map("user_id")
  employeeId String @map("employee_id")
  position String
  department String?
  employmentType EmploymentType @map("employment_type")
  employmentStatus EmploymentStatus @default(ACTIVE) @map("employment_status")
  hourlyRate Decimal @map("hourly_rate") @db.Decimal(8, 2)
  payGroupId String? @map("pay_group_id")
  hasNdisWorkerScreening Boolean @default(false) @map("has_ndis_worker_screening")
  ndisScreeningNumber String? @map("ndis_screening_number")
  ndisScreeningExpiry DateTime? @map("ndis_screening_expiry")
  hasPoliceCheck Boolean @default(false) @map("has_police_check")
  policeCheckExpiry DateTime? @map("police_check_expiry")
  hasWorkingWithChildren Boolean @default(false) @map("has_working_with_children")
  wwcCheckExpiry DateTime? @map("wwc_check_expiry")
  hasFirstAid Boolean @default(false) @map("has_first_aid")
  firstAidExpiry DateTime? @map("first_aid_expiry")
  startDate DateTime @map("start_date")
  endDate DateTime? @map("end_date")
  emergencyContactName String? @map("emergency_contact_name")
  emergencyContactPhone String? @map("emergency_contact_phone")
  emergencyContactRelation String? @map("emergency_contact_relation")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  payGroup PayGroup? @relation(fields: [payGroupId], references: [id], onDelete: SetNull)
  skills StaffSkill[]
  documents StaffDocument[]
  availability StaffAvailability[]
  leaveRequests StaffLeaveRequest[]
  performanceReviews StaffPerformanceReview[]
  trainingRecords StaffTrainingRecord[]
  shifts Shift[]
  recurringPatterns RecurringShiftPattern[]
  clockEvents ClockEvent[]
  incidents Incident[] @relation("StaffIncident")
  originalSwaps ShiftSwap[] @relation("OriginalStaff")
  newSwaps ShiftSwap[] @relation("NewStaff")
  teamMembers TeamMember[]
  kpiValues KpiValue[]
  locationLogs StaffLocationLog[]
  @@unique([organizationId, employeeId])
  @@index([organizationId])
  @@index([employmentStatus])
  @@map("staff_members")
}

model StaffSkill {
  id String @id @default(cuid())
  staffId String @map("staff_id")
  skillName String @map("skill_name")
  proficiencyLevel ProficiencyLevel @default(BEGINNER) @map("proficiency_level")
  certified Boolean @default(false)
  certifiedDate DateTime? @map("certified_date")
  expiryDate DateTime? @map("expiry_date")
  createdAt DateTime @default(now()) @map("created_at")
  staff StaffMember @relation(fields: [staffId], references: [id], onDelete: Cascade)
  @@unique([staffId, skillName])
  @@map("staff_skills")
}

model StaffDocument {
  id String @id @default(cuid())
  staffId String @map("staff_id")
  categoryId String? @map("category_id")
  documentType String @map("document_type")
  title String
  fileName String @map("file_name")
  fileUrl String @map("file_url")
  fileSize Int? @map("file_size")
  expiryDate DateTime? @map("expiry_date")
  status DocumentStatus @default(ACTIVE)
  uploadedBy String? @map("uploaded_by")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  staff StaffMember @relation(fields: [staffId], references: [id], onDelete: Cascade)
  @@index([staffId])
  @@index([expiryDate])
  @@map("staff_documents")
}

model StaffAvailability {
  id String @id @default(cuid())
  staffId String @map("staff_id")
  dayOfWeek DayOfWeek @map("day_of_week")
  startTime String @map("start_time")
  endTime String @map("end_time")
  isAvailable Boolean @default(true) @map("is_available")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  staff StaffMember @relation(fields: [staffId], references: [id], onDelete: Cascade)
  @@unique([staffId, dayOfWeek])
  @@map("staff_availability")
}

model StaffLeaveRequest {
  id String @id @default(cuid())
  staffId String @map("staff_id")
  leaveType LeaveType @map("leave_type")
  startDate DateTime @map("start_date")
  endDate DateTime @map("end_date")
  totalDays Decimal? @map("total_days") @db.Decimal(4, 1)
  reason String?
  status ApprovalStatus @default(PENDING)
  reviewedBy String? @map("reviewed_by")
  reviewedAt DateTime? @map("reviewed_at")
  reviewNote String? @map("review_note")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  staff StaffMember @relation(fields: [staffId], references: [id], onDelete: Cascade)
  @@index([staffId])
  @@map("staff_leave_requests")
}

model StaffPerformanceReview {
  id String @id @default(cuid())
  staffId String @map("staff_id")
  reviewerId String? @map("reviewer_id")
  reviewDate DateTime @map("review_date")
  overallRating Int @map("overall_rating")
  strengths String?
  improvements String?
  goals String?
  comments String?
  status ApprovalStatus @default(PENDING)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  staff StaffMember @relation(fields: [staffId], references: [id], onDelete: Cascade)
  @@index([staffId])
  @@map("staff_performance_reviews")
}

model StaffTrainingRecord {
  id String @id @default(cuid())
  staffId String @map("staff_id")
  trainingName String @map("training_name")
  provider String?
  completionDate DateTime @map("completion_date")
  expiryDate DateTime? @map("expiry_date")
  certificateUrl String? @map("certificate_url")
  createdAt DateTime @default(now()) @map("created_at")
  staff StaffMember @relation(fields: [staffId], references: [id], onDelete: Cascade)
  @@index([staffId])
  @@map("staff_training_records")
}

model Team {
  id String @id @default(cuid())
  organizationId String @map("organization_id")
  name String
  description String?
  leaderId String? @map("leader_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  members TeamMember[]
  @@index([organizationId])
  @@map("teams")
}

model TeamMember {
  id String @id @default(cuid())
  teamId String @map("team_id")
  staffId String @map("staff_id")
  joinedAt DateTime @default(now()) @map("joined_at")
  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  staff StaffMember @relation(fields: [staffId], references: [id], onDelete: Cascade)
  @@unique([teamId, staffId])
  @@map("team_members")
}

// LAYER 3B: CLIENT
model Client {
  id String @id @default(cuid())
  organizationId String @map("organization_id")
  userId String? @unique @map("user_id")
  firstName String @map("first_name")
  lastName String @map("last_name")
  preferredName String? @map("preferred_name")
  dateOfBirth DateTime @map("date_of_birth")
  gender String?
  phone String?
  email String?
  address String?
  suburb String?
  state String?
  postcode String?
  ndisNumber String? @map("ndis_number")
  ndisPlanStartDate DateTime? @map("ndis_plan_start_date")
  ndisPlanEndDate DateTime? @map("ndis_plan_end_date")
  ndisPlanManager String? @map("ndis_plan_manager")
  ndisPlanManagerEmail String? @map("ndis_plan_manager_email")
  ndisPlanManagerPhone String? @map("ndis_plan_manager_phone")
  hasAgedCare Boolean @default(false) @map("has_aged_care")
  agedCarePackageLevel AgedCarePackageLevel? @map("aged_care_package_level")
  agedCareReferenceNo String? @map("aged_care_reference_no")
  clientTypeId String? @map("client_type_id")
  languageId String? @map("language_id")
  status ClientStatus @default(ACTIVE)
  onboardedAt DateTime? @map("onboarded_at")
  dischargedAt DateTime? @map("discharged_at")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
  fundingSources ClientFundingSource[]
  budgetLines ClientBudgetLine[]
  goals ClientGoal[]
  assessments ClientAssessment[]
  carePlans ClientCarePlan[]
  familyMembers ClientFamilyMember[]
  documents ClientDocument[]
  notes ClientNote[]
  serviceAgreements ClientServiceAgreement[]
  shifts Shift[]
  recurringShifts RecurringShiftPattern[]
  invoices Invoice[]
  payments Payment[]
  creditNotes CreditNote[]
  incidents Incident[]
  complaints Complaint[]
  @@unique([organizationId, ndisNumber])
  @@index([organizationId])
  @@index([status])
  @@map("clients")
}

// Remaining models: ClientFundingSource, ClientBudgetLine, ClientGoal, ClientGoalMilestone, ClientAssessment, ClientCarePlan, ClientFamilyMember, ClientDocument, ClientNote, ClientServiceAgreement, ServiceType, Shift, RecurringShiftPattern, ShiftProgressNote, ShiftSwap, ClockEvent, Geofence, StaffLocationLog, PublicHoliday, NdisPriceGuideEntry, PayGroup, AllowanceConfig, Invoice, InvoiceLineItem, Payment, CreditNote, XeroConnection, Incident, IncidentFollowUp, Complaint, Message, Notification, EmailLog, SmsLog, FormTemplate, FormSubmission, OrgDocument, OrgDocumentVersion, KpiDefinition, KpiValue, ScheduledReport, GeneratedReport, AuditLog, ActivityLog, SystemLog, OrgSetting, MasterDataItem
// (Full definitions exist in schema.prisma — these follow standard Prisma patterns with organizationId FK, timestamps, indexes, and @@map to snake_case table names)
```

> NOTE: The remaining ~40 models follow the same pattern. Key models for upcoming Staff module: StaffMember (1:1 with User via userId), StaffSkill (unique on [staffId, skillName]), StaffDocument, StaffAvailability (unique on [staffId, dayOfWeek]), StaffLeaveRequest, StaffPerformanceReview, StaffTrainingRecord, Team, TeamMember (unique on [teamId, staffId]).

---
## NEXT MODULE: STAFF MANAGEMENT

**Decisions:**
- Employee ID: Auto-generate as `EMP-XXXXXX` using `generateShortId()`
- Staff creation: Support BOTH linking existing User (by `userId`) AND creating new User simultaneously
- Teams: Separate module at `modules/team/` with routes at `/api/v1/teams`
- Performance reviews: Include in staff module
- Document uploads: Accept metadata only (title, documentType, fileUrl, etc.) — S3 not set up yet
- Route: `/api/v1/staff`
- Permission: `staff:read`, `staff:write`

**Staff sub-resources (nested under staff):**
- Skills: `/api/v1/staff/:staffId/skills`
- Documents: `/api/v1/staff/:staffId/documents`
- Availability: `/api/v1/staff/:staffId/availability`
- Leave: `/api/v1/staff/:staffId/leave`
- Performance: `/api/v1/staff/:staffId/performance-reviews`
- Training: `/api/v1/staff/:staffId/training`
