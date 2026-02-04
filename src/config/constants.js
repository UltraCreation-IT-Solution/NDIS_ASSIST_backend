/**
 * App-Wide Constants
 * ===================
 * 
 * WHAT: Central place for all configuration constants
 * WHY:  Avoid magic numbers/strings scattered in code
 */

// ============================================================================
// SESSION & TOKEN SETTINGS
// ============================================================================

export const SESSION = {
  // Platform admin session (database-based)
  PLATFORM_EXPIRY_DAYS: 7,
  
  // Organization user tokens (JWT-based)
  ACCESS_TOKEN_EXPIRY: '15m',      // Short-lived
  REFRESH_TOKEN_EXPIRY_DAYS: 7,    // Long-lived
  
  // Password reset token
  RESET_TOKEN_EXPIRY_HOURS: 1,
  
  // Email verification token
  VERIFY_TOKEN_EXPIRY_HOURS: 24,
  
  // Invitation token
  INVITE_TOKEN_EXPIRY_DAYS: 7,
};

// ============================================================================
// SECURITY SETTINGS
// ============================================================================

export const SECURITY = {
  // Bcrypt salt rounds (10-12 recommended)
  BCRYPT_ROUNDS: 10,
  
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
    MAX_REQUESTS: 100,           // Per window
    
    // Stricter limits for auth endpoints
    AUTH_WINDOW_MS: 15 * 60 * 1000,
    AUTH_MAX_REQUESTS: 5,        // 5 login attempts per 15 min
  },
  
  // Token length (in bytes, hex string will be 2x)
  TOKEN_BYTES: 32,
};

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// ============================================================================
// FILE UPLOAD LIMITS
// ============================================================================

export const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,  // 10MB
  MAX_FILES: 5,
  
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOC_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

// ============================================================================
// AUDIT LOG ACTIONS
// ============================================================================

export const AUDIT_ACTIONS = {
  // Auth actions
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  
  // CRUD actions
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  
  // Special actions
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  SUBMIT: 'SUBMIT',
  CANCEL: 'CANCEL',
};

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export const NOTIFICATION_TYPES = {
  // Shift related
  SHIFT_ASSIGNED: 'SHIFT_ASSIGNED',
  SHIFT_UPDATED: 'SHIFT_UPDATED',
  SHIFT_CANCELLED: 'SHIFT_CANCELLED',
  SHIFT_REMINDER: 'SHIFT_REMINDER',
  
  // Leave related
  LEAVE_REQUESTED: 'LEAVE_REQUESTED',
  LEAVE_APPROVED: 'LEAVE_APPROVED',
  LEAVE_REJECTED: 'LEAVE_REJECTED',
  
  // Document related
  DOCUMENT_EXPIRING: 'DOCUMENT_EXPIRING',
  DOCUMENT_EXPIRED: 'DOCUMENT_EXPIRED',
  
  // Incident related
  INCIDENT_REPORTED: 'INCIDENT_REPORTED',
  INCIDENT_UPDATED: 'INCIDENT_UPDATED',
  
  // Invoice related
  INVOICE_GENERATED: 'INVOICE_GENERATED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  
  // System
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
};

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const REGEX = {
  // Australian phone: 04XX XXX XXX or +614XX XXX XXX
  AU_PHONE: /^(\+?61|0)4\d{8}$/,
  
  // Australian postcode: 4 digits
  AU_POSTCODE: /^\d{4}$/,
  
  // ABN: 11 digits
  ABN: /^\d{11}$/,
  
  // NDIS number: 9 digits
  NDIS_NUMBER: /^\d{9}$/,
  
  // Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Slug: lowercase letters, numbers, hyphens
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

// ============================================================================
// ORGANIZATION
// ============================================================================

export const ORGANIZATION = {
  // Trial period
  TRIAL_DAYS: 14,
  
  // Slug constraints
  MIN_SLUG_LENGTH: 3,
  MAX_SLUG_LENGTH: 50,
  
  // Subscription plan limits
  PLAN_LIMITS: {
    FREE_TRIAL: {
      maxUsers: 5,
      maxClients: 20,
      maxStaff: 10,
    },
    STARTER: {
      maxUsers: 10,
      maxClients: 50,
      maxStaff: 25,
    },
    PROFESSIONAL: {
      maxUsers: 50,
      maxClients: 200,
      maxStaff: 100,
    },
    ENTERPRISE: {
      maxUsers: -1,  // Unlimited
      maxClients: -1,
      maxStaff: -1,
    },
  },
};

// ============================================================================
// SCHEDULING
// ============================================================================

export const SCHEDULING = {
  // Shift duration
  DEFAULT_SHIFT_HOURS: 8,
  MIN_SHIFT_MINUTES: 15,
  MAX_SHIFT_HOURS: 24,
  
  // Clock in/out tolerance
  EARLY_CLOCK_IN_MINUTES: 15,
  LATE_CLOCK_OUT_GRACE_MINUTES: 5,
  
  // Geofencing
  DEFAULT_GEOFENCE_RADIUS_METERS: 100,
  
  // Recurring
  MAX_RECURRING_WEEKS: 52,
};

// ============================================================================
// BILLING
// ============================================================================

export const BILLING = {
  // Invoice
  INVOICE_DUE_DAYS: 14,
  INVOICE_PREFIX: 'INV',
  CREDIT_NOTE_PREFIX: 'CN',
  
  // GST (Australia)
  GST_RATE: 0.10,
  
  // Payment methods
  PAYMENT_METHODS: [
    'BANK_TRANSFER',
    'CREDIT_CARD',
    'NDIS_MANAGED',
    'PLAN_MANAGED',
    'SELF_MANAGED',
  ],
};

// ============================================================================
// INCIDENT
// ============================================================================

export const INCIDENT = {
  // Severities requiring NDIS notification
  NDIS_REPORTABLE: ['CRITICAL', 'MAJOR'],
  
  // Auto-escalation (hours)
  ESCALATION_HOURS: {
    CRITICAL: 1,
    MAJOR: 4,
    MINOR: 24,
    LOW: 72,
  },
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  SESSION,
  SECURITY,
  PAGINATION,
  UPLOAD,
  AUDIT_ACTIONS,
  NOTIFICATION_TYPES,
  REGEX,
  ORGANIZATION,
  SCHEDULING,
  BILLING,
  INCIDENT,
};