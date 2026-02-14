/**
 * Shift Template Service
 * ======================
 * Business logic for shift templates
 */

import * as repo from './shiftTemplate.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError.js';

/**
 * List shift templates with pagination
 */
export async function listTemplates(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await repo.findAll(organizationId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

/**
 * Get template by ID
 */
export async function getTemplateById(organizationId, templateId) {
  const template = await repo.findById(templateId, organizationId);

  if (!template) {
    throw new NotFoundError('Shift template not found');
  }

  return template;
}

/**
 * Create new shift template
 */
export async function createTemplate(organizationId, data) {
  // Check for duplicate name
  const existing = await repo.findByName(organizationId, data.name);
  if (existing) {
    throw new ConflictError('A template with this name already exists');
  }

  // Calculate duration in minutes
  const durationMinutes = calculateDuration(data.startTime, data.endTime);

  // Prepare template data
  const templateData = {
    organizationId,
    name: data.name,
    description: data.description || null,
    serviceTypeId: data.serviceTypeId || null,
    startTime: data.startTime,
    endTime: data.endTime,
    durationMinutes,
    tasks: data.tasks || [],
    isDefault: data.isDefault || false,
    isActive: true,
    usageCount: 0,
  };

  return repo.create(templateData);
}

/**
 * Update shift template
 */
export async function updateTemplate(organizationId, templateId, data) {
  // Verify template exists
  const existing = await repo.findById(templateId, organizationId);
  if (!existing) {
    throw new NotFoundError('Shift template not found');
  }

  // Check for duplicate name if name is being changed
  if (data.name && data.name !== existing.name) {
    const duplicate = await repo.findByName(organizationId, data.name, templateId);
    if (duplicate) {
      throw new ConflictError('A template with this name already exists');
    }
  }

  // Calculate duration if times are provided
  let durationMinutes = existing.durationMinutes;
  if (data.startTime && data.endTime) {
    durationMinutes = calculateDuration(data.startTime, data.endTime);
  }

  // Prepare update data
  const updateData = {
    ...(data.name && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.serviceTypeId !== undefined && { serviceTypeId: data.serviceTypeId }),
    ...(data.startTime && { startTime: data.startTime }),
    ...(data.endTime && { endTime: data.endTime }),
    ...(data.startTime && data.endTime && { durationMinutes }),
    ...(data.tasks !== undefined && { tasks: data.tasks }),
    ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
  };

  return repo.update(templateId, organizationId, updateData);
}

/**
 * Delete shift template
 */
export async function deleteTemplate(organizationId, templateId, hard = false) {
  // Verify template exists
  const existing = await repo.findById(templateId, organizationId);
  if (!existing) {
    throw new NotFoundError('Shift template not found');
  }

  if (hard) {
    await repo.hardDelete(templateId, organizationId);
    return { deleted: true };
  } else {
    await repo.softDelete(templateId, organizationId);
    return { deactivated: true };
  }
}

/**
 * Toggle default status
 */
export async function toggleDefault(organizationId, templateId) {
  const template = await repo.findById(templateId, organizationId);
  if (!template) {
    throw new NotFoundError('Shift template not found');
  }

  return repo.update(templateId, organizationId, {
    isDefault: !template.isDefault,
  });
}

/**
 * Record template usage
 */
export async function recordUsage(templateId) {
  return repo.incrementUsage(templateId);
}

/**
 * Get template statistics
 */
export async function getStats(organizationId) {
  return repo.getStats(organizationId);
}

/**
 * Calculate duration in minutes from start and end time strings
 */
function calculateDuration(startTime, endTime) {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  let minutes = (endH * 60 + endM) - (startH * 60 + startM);
  
  // Handle overnight shifts
  if (minutes < 0) {
    minutes += 24 * 60;
  }
  
  return minutes;
}

export default {
  listTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleDefault,
  recordUsage,
  getStats,
};
