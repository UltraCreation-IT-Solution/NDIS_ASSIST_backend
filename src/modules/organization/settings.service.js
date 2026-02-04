/**
 * Organization Service
 * =====================
 * 
 * Business logic for Organization module
 * Handles CRUD operations, validation, and subscription management
 */

import * as orgRepo from './organization.repository.js';
import { 
  NotFoundError, 
  ConflictError, 
  BadRequestError 
} from '../../shared/errors/AppError.js';
import { ORGANIZATION } from '../../config/constants.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate slug from organization name
 * 
 * @param {string} name - Organization name
 * @returns {string} - URL-friendly slug
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')    // Remove special chars
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/-+/g, '-')         // Replace multiple hyphens
    .substring(0, ORGANIZATION.MAX_SLUG_LENGTH);
}

/**
 * Ensure slug is unique by appending number if needed
 * 
 * @param {string} baseSlug - Base slug
 * @returns {Promise<string>} - Unique slug
 */
async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  
  while (await orgRepo.findBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Calculate trial end date
 * 
 * @returns {Date} - Trial end date (14 days from now)
 */
function calculateTrialEndDate() {
  const date = new Date();
  date.setDate(date.getDate() + ORGANIZATION.TRIAL_DAYS);
  return date;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * List organizations with pagination and filters
 * 
 * @param {object} options - Query options
 * @returns {Promise<object>} - { data, pagination }
 */
export async function listOrganizations(options = {}) {
  const { page = 1, limit = 20 } = options;
  
  const { data, total } = await orgRepo.findAll(options);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get organization by ID
 * 
 * @param {string} id - Organization ID
 * @returns {Promise<object>} - Organization
 * @throws {NotFoundError} - If not found
 */
export async function getOrganization(id) {
  const organization = await orgRepo.findById(id);
  
  if (!organization) {
    throw new NotFoundError('Organization not found');
  }
  
  return organization;
}

/**
 * Create new organization
 * 
 * @param {object} data - Organization data
 * @returns {Promise<object>} - Created organization
 * @throws {ConflictError} - If slug/ABN/NDIS already exists
 */
export async function createOrganization(data) {
  const { name, slug: customSlug, abn, ndisRegistrationNo, ...rest } = data;
  
  // Generate or validate slug
  let slug;
  if (customSlug) {
    // Check custom slug is unique
    const existingSlug = await orgRepo.findBySlug(customSlug);
    if (existingSlug) {
      throw new ConflictError('Organization slug already exists');
    }
    slug = customSlug;
  } else {
    // Auto-generate unique slug from name
    const baseSlug = generateSlug(name);
    slug = await ensureUniqueSlug(baseSlug);
  }
  
  // Check ABN uniqueness if provided
  if (abn) {
    const existingAbn = await orgRepo.findByAbn(abn);
    if (existingAbn) {
      throw new ConflictError('Organization with this ABN already exists');
    }
  }
  
  // Check NDIS registration uniqueness if provided
  if (ndisRegistrationNo) {
    const existingNdis = await orgRepo.findByNdisRegistrationNo(ndisRegistrationNo);
    if (existingNdis) {
      throw new ConflictError('Organization with this NDIS registration number already exists');
    }
  }
  
  // Prepare organization data
  const orgData = {
    name,
    slug,
    abn,
    ndisRegistrationNo,
    ...rest,
  };
  
  // Prepare subscription data (FREE_TRIAL by default)
  const subscriptionData = {
    plan: 'FREE_TRIAL',
    status: 'TRIALING',
    trialEndsAt: calculateTrialEndDate(),
    maxStaff: ORGANIZATION.PLAN_LIMITS.FREE_TRIAL.maxStaff,
    maxClients: ORGANIZATION.PLAN_LIMITS.FREE_TRIAL.maxClients,
  };
  
  // Create organization with subscription
  const organization = await orgRepo.create(orgData, subscriptionData);
  
  return organization;
}

/**
 * Update organization
 * 
 * @param {string} id - Organization ID
 * @param {object} data - Update data
 * @returns {Promise<object>} - Updated organization
 * @throws {NotFoundError} - If not found
 * @throws {ConflictError} - If slug/ABN/NDIS conflicts
 */
export async function updateOrganization(id, data) {
  // Check organization exists
  const existing = await orgRepo.findById(id);
  if (!existing) {
    throw new NotFoundError('Organization not found');
  }
  
  const { slug, abn, ndisRegistrationNo, ...rest } = data;
  
  // Check slug uniqueness if changing
  if (slug && slug !== existing.slug) {
    const existingSlug = await orgRepo.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictError('Organization slug already exists');
    }
  }
  
  // Check ABN uniqueness if changing
  if (abn && abn !== existing.abn) {
    const existingAbn = await orgRepo.findByAbn(abn);
    if (existingAbn) {
      throw new ConflictError('Organization with this ABN already exists');
    }
  }
  
  // Check NDIS registration uniqueness if changing
  if (ndisRegistrationNo && ndisRegistrationNo !== existing.ndisRegistrationNo) {
    const existingNdis = await orgRepo.findByNdisRegistrationNo(ndisRegistrationNo);
    if (existingNdis) {
      throw new ConflictError('Organization with this NDIS registration number already exists');
    }
  }
  
  // Update organization
  const organization = await orgRepo.update(id, {
    slug,
    abn,
    ndisRegistrationNo,
    ...rest,
  });
  
  return organization;
}

/**
 * Suspend organization
 * 
 * @param {string} id - Organization ID
 * @param {string} reason - Suspension reason (for audit)
 * @returns {Promise<object>} - Updated organization
 * @throws {NotFoundError} - If not found
 * @throws {BadRequestError} - If already suspended
 */
export async function suspendOrganization(id, reason) {
  const existing = await orgRepo.findById(id);
  
  if (!existing) {
    throw new NotFoundError('Organization not found');
  }
  
  if (existing.status === 'SUSPENDED') {
    throw new BadRequestError('Organization is already suspended');
  }
  
  const organization = await orgRepo.updateStatus(id, 'SUSPENDED');
  
  // TODO: Add audit log entry
  // TODO: Invalidate all user sessions for this org (future)
  // TODO: Send notification email (future)
  
  return organization;
}

/**
 * Activate organization
 * 
 * @param {string} id - Organization ID
 * @returns {Promise<object>} - Updated organization
 * @throws {NotFoundError} - If not found
 * @throws {BadRequestError} - If already active
 */
export async function activateOrganization(id) {
  const existing = await orgRepo.findById(id);
  
  if (!existing) {
    throw new NotFoundError('Organization not found');
  }
  
  if (existing.status === 'ACTIVE') {
    throw new BadRequestError('Organization is already active');
  }
  
  const organization = await orgRepo.updateStatus(id, 'ACTIVE');
  
  // TODO: Add audit log entry
  
  return organization;
}

/**
 * Deactivate organization (soft delete)
 * 
 * @param {string} id - Organization ID
 * @returns {Promise<object>} - Updated organization
 * @throws {NotFoundError} - If not found
 */
export async function deactivateOrganization(id) {
  const existing = await orgRepo.findById(id);
  
  if (!existing) {
    throw new NotFoundError('Organization not found');
  }
  
  const organization = await orgRepo.updateStatus(id, 'DEACTIVATED');
  
  // TODO: Add audit log entry
  // TODO: Invalidate all user sessions (future)
  
  return organization;
}

/**
 * Get organization stats for dashboard
 * 
 * @returns {Promise<object>} - Stats object
 */
export async function getOrganizationStats() {
  return orgRepo.getStats();
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  suspendOrganization,
  activateOrganization,
  deactivateOrganization,
  getOrganizationStats,
};