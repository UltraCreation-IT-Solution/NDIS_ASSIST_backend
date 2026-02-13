/**
 * Organization Service
 * =====================
 * 
 * Business logic for Organization module
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

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, ORGANIZATION.MAX_SLUG_LENGTH);
}

async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  
  while (await orgRepo.findBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

function calculateTrialEndDate() {
  const date = new Date();
  date.setDate(date.getDate() + ORGANIZATION.TRIAL_DAYS);
  return date;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

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

export async function getOrganization(id) {
  const organization = await orgRepo.findById(id);
  
  if (!organization) {
    throw new NotFoundError('Organization not found');
  }
  
  return organization;
}

export async function createOrganization(data = {}) {
  if (!data || typeof data !== 'object') {
    throw new BadRequestError('Invalid request body');
  }

  const { name, slug: customSlug, abn, ndisRegistrationNo, ...rest } = data;

  if (!name) {
    throw new BadRequestError('Organization name is required');
  }
  
  // Generate or validate slug
  let slug;
  if (customSlug) {
    const existingSlug = await orgRepo.findBySlug(customSlug);
    if (existingSlug) {
      throw new ConflictError('Organization slug already exists');
    }
    slug = customSlug;
  } else {
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
  
  const organization = await orgRepo.create(orgData, subscriptionData);
  
  return organization;
}

export async function updateOrganization(id, data) {
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
  
  const organization = await orgRepo.update(id, {
    slug,
    abn,
    ndisRegistrationNo,
    ...rest,
  });
  
  return organization;
}

export async function suspendOrganization(id, reason) {
  const existing = await orgRepo.findById(id);
  
  if (!existing) {
    throw new NotFoundError('Organization not found');
  }
  
  if (existing.status === 'SUSPENDED') {
    throw new BadRequestError('Organization is already suspended');
  }
  
  const organization = await orgRepo.updateStatus(id, 'SUSPENDED');
  
  return organization;
}

export async function activateOrganization(id) {
  const existing = await orgRepo.findById(id);
  
  if (!existing) {
    throw new NotFoundError('Organization not found');
  }
  
  if (existing.status === 'ACTIVE') {
    throw new BadRequestError('Organization is already active');
  }
  
  const organization = await orgRepo.updateStatus(id, 'ACTIVE');
  
  return organization;
}

export async function deactivateOrganization(id) {
  const existing = await orgRepo.findById(id);
  
  if (!existing) {
    throw new NotFoundError('Organization not found');
  }
  
  const organization = await orgRepo.updateStatus(id, 'DEACTIVATED');
  
  return organization;
}

export async function getOrganizationStats() {
  return orgRepo.getStats();
}

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
