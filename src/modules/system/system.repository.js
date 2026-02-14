// src/modules/system/system.repository.js

import prisma from '../../config/database.js';

// ============================================================================
// ORGANIZATION SETTINGS (key-value config per org)
// ============================================================================

export async function findAllSettings(organizationId) {
  return prisma.orgSetting.findMany({
    where: { organizationId },
    orderBy: { key: 'asc' },
  });
}

export async function findSettingByKey(organizationId, key) {
  return prisma.orgSetting.findFirst({
    where: { organizationId, key },
  });
}

export async function upsertSetting(organizationId, key, value, updatedById) {
  return prisma.orgSetting.upsert({
    where: { organizationId_key: { organizationId, key } },
    update: { value, updatedById, updatedAt: new Date() },
    create: { organizationId, key, value, updatedById },
  });
}

export async function deleteSetting(organizationId, key) {
  return prisma.orgSetting.delete({
    where: { organizationId_key: { organizationId, key } },
  });
}

// ============================================================================
// AUDIT LOGS (immutable record of important actions)
// ============================================================================

export async function findAllAuditLogs(organizationId, options = {}) {
  const { page = 1, limit = 20, action, entityType, entityId, userId, dateFrom, dateTo, sortOrder = 'desc' } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(action && { action }),
    ...(entityType && { entityType }),
    ...(entityId && { entityId }),
    ...(userId && { userId }),
    ...((dateFrom || dateTo) && {
      createdAt: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, total };
}

export async function createAuditLog(data) {
  return prisma.auditLog.create({ data });
}

// ============================================================================
// ACTIVITY LOGS (lightweight user activity tracking)
// ============================================================================

export async function findAllActivityLogs(organizationId, options = {}) {
  const { page = 1, limit = 20, userId, activityType, dateFrom, dateTo } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(userId && { userId }),
    ...(activityType && { activityType }),
    ...((dateFrom || dateTo) && {
      createdAt: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { data, total };
}

export async function createActivityLog(data) {
  return prisma.activityLog.create({ data });
}

// ============================================================================
// SYSTEM HEALTH / STATS (for org admins)
// ============================================================================

export async function getOrgStats(organizationId) {
  const [users, staff, clients, shifts, invoices, incidents] = await Promise.all([
    prisma.user.count({ where: { organizationId } }),
    prisma.staffMember.count({ where: { organizationId } }),
    prisma.client.count({ where: { organizationId } }),
    prisma.shift.count({ where: { organizationId } }),
    prisma.invoice.count({ where: { organizationId } }),
    prisma.incident.count({ where: { organizationId } }),
  ]);

  return { users, staff, clients, shifts, invoices, incidents };
}

export default {
  findAllSettings, findSettingByKey, upsertSetting, deleteSetting,
  findAllAuditLogs, createAuditLog,
  findAllActivityLogs, createActivityLog,
  getOrgStats,
};
