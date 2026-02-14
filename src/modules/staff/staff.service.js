// src/modules/staff/staff.service.js

import * as repo from './staff.repository.js';
import { 
  NotFoundError, 
  ConflictError, 
  BadRequestError,
  ForbiddenError 
} from '../../shared/errors/AppError.js';
import { generateShortId } from '../../shared/utils/helpers.js';
import { PAGINATION } from '../../config/constants.js';

// ============================================================================
// CORE STAFF SERVICES
// ============================================================================

export async function listStaff(organizationId, options = {}) {
  const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = options;
  const { data, total } = await repo.findAll(organizationId, options);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  };
}

export async function getStaffById(organizationId, staffId) {
  const staff = await repo.findById(organizationId, staffId);
  
  if (!staff) {
    throw new NotFoundError('Staff member not found');
  }
  
  return staff;
}

export async function createStaff(organizationId, data) {
  const { 
    userId, 
    email, 
    firstName, 
    lastName, 
    phone,
    hourlyRate, 
    ...staffData 
  } = data;

  // Generate unique employee ID
  const employeeId = await generateUniqueEmployeeId(organizationId);

  // Option 1: Link to existing user
  if (userId) {
    // Check if user already has a staff record
    const existingStaff = await repo.findByUserId(organizationId, userId);
    if (existingStaff) {
      throw new ConflictError('This user is already linked to a staff member');
    }

    return repo.create({
      organizationId,
      userId,
      employeeId,
      hourlyRate: hourlyRate ?? 0, 
      ...staffData
    });
  }

  // Option 2: Create new user and staff record together
  if (!email) {
    throw new BadRequestError('Email is required when creating a new user');
  }

  const userData = {
    organizationId,
    email,
    firstName,
    lastName,
    phone,
    role: 'SUPPORT_WORKER', // Default role for staff
    status: 'INVITED'
  };

  return repo.createWithUser(
    {
      organizationId,
      employeeId,
      hourlyRate: hourlyRate ?? 0, 
      ...staffData
    },
    userData
  );
}

export async function updateStaff(organizationId, staffId, data) {
  // Verify staff exists
  const existing = await repo.findById(organizationId, staffId);
  if (!existing) {
    throw new NotFoundError('Staff member not found');
  }

  // Separate user fields from staff fields
  const { firstName, lastName, phone, ...staffData } = data;
  const userData = {};
  
  if (firstName !== undefined) userData.firstName = firstName;
  if (lastName !== undefined) userData.lastName = lastName;
  if (phone !== undefined) userData.phone = phone;

  // Update both if there are user fields
  if (Object.keys(userData).length > 0) {
    return repo.updateWithUser(organizationId, staffId, staffData, userData);
  }

  return repo.update(organizationId, staffId, staffData);
}

export async function deleteStaff(organizationId, staffId) {
  // Verify staff exists
  const existing = await repo.findById(organizationId, staffId);
  if (!existing) {
    throw new NotFoundError('Staff member not found');
  }

  // Check if already terminated
  if (existing.employmentStatus === 'TERMINATED') {
    throw new ConflictError('Staff member is already terminated');
  }

  return repo.softDelete(organizationId, staffId);
}

// Helper: Generate unique employee ID
async function generateUniqueEmployeeId(organizationId) {
  let employeeId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    employeeId = `EMP-${generateShortId()}`;
    const existing = await repo.findByEmployeeId(organizationId, employeeId);
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique employee ID');
  }

  return employeeId;
}

// ============================================================================
// SKILLS SERVICES
// ============================================================================

export async function listSkills(organizationId, staffId, options = {}) {
  // Verify staff exists and belongs to org
  await getStaffById(organizationId, staffId);

  const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = options;
  const { data, total } = await repo.findAllSkills(staffId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  };
}

export async function createSkill(organizationId, staffId, data) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  // Check for duplicate skill name
  const existing = await repo.findSkillByName(staffId, data.skillName);
  if (existing) {
    throw new ConflictError('Staff member already has this skill');
  }

  return repo.createSkill({
    staffId,
    ...data
  });
}

export async function updateSkill(organizationId, staffId, skillId, data) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  // Verify skill exists
  const existing = await repo.findSkillById(staffId, skillId);
  if (!existing) {
    throw new NotFoundError('Skill not found');
  }

  // Check for duplicate skill name if updating name
  if (data.skillName && data.skillName !== existing.skillName) {
    const duplicate = await repo.findSkillByName(staffId, data.skillName);
    if (duplicate) {
      throw new ConflictError('Staff member already has this skill');
    }
  }

  return repo.updateSkill(staffId, skillId, data);
}

export async function deleteSkill(organizationId, staffId, skillId) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  // Verify skill exists
  const existing = await repo.findSkillById(staffId, skillId);
  if (!existing) {
    throw new NotFoundError('Skill not found');
  }

  return repo.deleteSkill(staffId, skillId);
}

// ============================================================================
// DOCUMENTS SERVICES
// ============================================================================

export async function listDocuments(organizationId, staffId, options = {}) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = options;
  const { data, total } = await repo.findAllDocuments(staffId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  };
}

export async function createDocument(organizationId, staffId, data) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  // Calculate initial status based on expiry date
  let status = 'ACTIVE';
  if (data.expiryDate) {
    const expiry = new Date(data.expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (expiry < now) {
      status = 'EXPIRED';
    } else if (expiry <= thirtyDaysFromNow) {
      status = 'EXPIRING_SOON';
    }
  }

  return repo.createDocument({
    staffId,
    status,
    ...data
  });
}

export async function updateDocument(organizationId, staffId, documentId, data) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  // Verify document exists
  const existing = await repo.findDocumentById(staffId, documentId);
  if (!existing) {
    throw new NotFoundError('Document not found');
  }

  // Recalculate status if expiry date changed
  if (data.expiryDate !== undefined) {
    if (data.expiryDate === null) {
      data.status = 'ACTIVE';
    } else {
      const expiry = new Date(data.expiryDate);
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      if (expiry < now) {
        data.status = 'EXPIRED';
      } else if (expiry <= thirtyDaysFromNow) {
        data.status = 'EXPIRING_SOON';
      } else {
        data.status = 'ACTIVE';
      }
    }
  }

  return repo.updateDocument(staffId, documentId, data);
}

export async function deleteDocument(organizationId, staffId, documentId) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  // Verify document exists
  const existing = await repo.findDocumentById(staffId, documentId);
  if (!existing) {
    throw new NotFoundError('Document not found');
  }

  return repo.deleteDocument(staffId, documentId);
}

// ============================================================================
// AVAILABILITY SERVICES
// ============================================================================

export async function getAvailability(organizationId, staffId) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  const availability = await repo.findAvailability(staffId);
  
  return availability;
}

export async function setAvailability(organizationId, staffId, data) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  const { availability } = data;

  // Validate no duplicate days
  const days = availability.map(a => a.dayOfWeek);
  const uniqueDays = new Set(days);
  if (days.length !== uniqueDays.size) {
    throw new BadRequestError('Duplicate days in availability schedule');
  }

  // Validate time ranges
  for (const slot of availability) {
    if (slot.startTime >= slot.endTime) {
      throw new BadRequestError(`Invalid time range for ${slot.dayOfWeek}: start time must be before end time`);
    }
  }

  return repo.setAvailability(staffId, availability);
}

// ============================================================================
// LEAVE SERVICES
// ============================================================================

/**
 * List all leave requests across the organization (for managers)
 */
export async function listAllLeave(organizationId, options = {}) {
  const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = options;
  const { data, total } = await repo.findAllLeaveForOrg(organizationId, options);

  // Transform data to include staff name
  const transformedData = data.map(leave => ({
    ...leave,
    staffName: leave.staff?.user 
      ? `${leave.staff.user.firstName} ${leave.staff.user.lastName}`
      : 'Unknown',
    staffEmail: leave.staff?.user?.email || null,
    staffEmployeeId: leave.staff?.employeeId || null
  }));

  return {
    data: transformedData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  };
}

export async function listLeave(organizationId, staffId, options = {}) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = options;
  const { data, total } = await repo.findAllLeave(staffId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  };
}

export async function createLeave(organizationId, staffId, data) {
  // Verify staff exists
  const staff = await getStaffById(organizationId, staffId);

  // Check staff is active
  if (staff.employmentStatus !== 'ACTIVE' && staff.employmentStatus !== 'ON_LEAVE') {
    throw new BadRequestError('Cannot create leave request for inactive staff member');
  }

  // Check for overlapping leave
  const overlapping = await repo.findOverlappingLeave(staffId, data.startDate, data.endDate);
  if (overlapping) {
    throw new ConflictError('Leave request overlaps with an existing request');
  }

  // Calculate total days
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return repo.createLeave({
    staffId,
    ...data,
    totalDays,
    status: 'PENDING'
  });
}

export async function updateLeave(organizationId, staffId, leaveId, data, reviewerId = null) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  // Verify leave exists
  const existing = await repo.findLeaveById(staffId, leaveId);
  if (!existing) {
    throw new NotFoundError('Leave request not found');
  }

  // If status is being changed (approval/rejection)
  if (data.status && data.status !== existing.status) {
    // Can only approve/reject PENDING requests
    if (existing.status !== 'PENDING') {
      throw new BadRequestError(`Cannot change status of ${existing.status} leave request`);
    }

    // Add reviewer info
    if (reviewerId && (data.status === 'APPROVED' || data.status === 'REJECTED')) {
      data.reviewedBy = reviewerId;
      data.reviewedAt = new Date();
    }
  }

  // If dates are being changed, validate no overlap
  if (data.startDate || data.endDate) {
    const newStart = data.startDate || existing.startDate;
    const newEnd = data.endDate || existing.endDate;
    
    const overlapping = await repo.findOverlappingLeave(staffId, newStart, newEnd, leaveId);
    if (overlapping) {
      throw new ConflictError('Leave request overlaps with an existing request');
    }

    // Recalculate total days
    const start = new Date(newStart);
    const end = new Date(newEnd);
    data.totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }

  return repo.updateLeave(staffId, leaveId, data);
}

// ============================================================================
// PERFORMANCE REVIEW SERVICES
// ============================================================================

export async function listReviews(organizationId, staffId, options = {}) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = options;
  const { data, total } = await repo.findAllReviews(staffId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  };
}

export async function createReview(organizationId, staffId, data, reviewerId) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  if (!reviewerId) {
    throw new BadRequestError('Reviewer ID is required');
  }

  return repo.createReview({
    staffId,
    reviewerId,
    ...data,
    status: 'PENDING'
  });
}

export async function updateReview(organizationId, staffId, reviewId, data) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  // Verify review exists
  const existing = await repo.findReviewById(staffId, reviewId);
  if (!existing) {
    throw new NotFoundError('Performance review not found');
  }

  return repo.updateReview(staffId, reviewId, data);
}

// ============================================================================
// TRAINING SERVICES
// ============================================================================

export async function listTraining(organizationId, staffId, options = {}) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = options;
  const { data, total } = await repo.findAllTraining(staffId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  };
}

export async function createTraining(organizationId, staffId, data) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  return repo.createTraining({
    staffId,
    ...data
  });
}

export async function updateTraining(organizationId, staffId, trainingId, data) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  // Verify training exists
  const existing = await repo.findTrainingById(staffId, trainingId);
  if (!existing) {
    throw new NotFoundError('Training record not found');
  }

  return repo.updateTraining(staffId, trainingId, data);
}

export async function deleteTraining(organizationId, staffId, trainingId) {
  // Verify staff exists
  await getStaffById(organizationId, staffId);

  // Verify training exists
  const existing = await repo.findTrainingById(staffId, trainingId);
  if (!existing) {
    throw new NotFoundError('Training record not found');
  }

  return repo.deleteTraining(staffId, trainingId);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Core Staff
  listStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  
  // Skills
  listSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  
  // Documents
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  
  // Availability
  getAvailability,
  setAvailability,
  
  // Leave
  listAllLeave,
  listLeave,
  createLeave,
  updateLeave,
  
  // Performance Reviews
  listReviews,
  createReview,
  updateReview,
  
  // Training
  listTraining,
  createTraining,
  updateTraining,
  deleteTraining
};