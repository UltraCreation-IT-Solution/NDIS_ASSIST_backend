// src/modules/incident/incident.repository.js

import prisma from '../../config/database.js';

// Incidents
export async function findAllIncidents(organizationId, options = {}) {
  const { page = 1, limit = 20, search, status, severity, incidentType, clientId, staffId, dateFrom, dateTo, sortBy = 'dateReported', sortOrder = 'desc' } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(status && { status }),
    ...(severity && { severity }),
    ...(incidentType && { incidentType }),
    ...(clientId && { clientId }),
    ...(staffId && { staffId }),
    ...(search && { OR: [
      { incidentNumber: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]}),
    ...((dateFrom || dateTo) && { dateOccurred: {
      ...(dateFrom && { gte: new Date(dateFrom) }),
      ...(dateTo && { lte: new Date(dateTo) }),
    }}),
  };

  const [data, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } } },
        _count: { select: { followUps: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.incident.count({ where }),
  ]);
  return { data, total };
}

export async function findIncidentById(id, organizationId) {
  return prisma.incident.findFirst({
    where: { id, organizationId },
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      staff: { select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } } },
      followUps: { orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function getNextIncidentNumber(organizationId) {
  const last = await prisma.incident.findFirst({ where: { organizationId }, orderBy: { createdAt: 'desc' }, select: { incidentNumber: true } });
  if (!last) return 'INC-000001';
  const num = parseInt(last.incidentNumber.replace('INC-', ''), 10) || 0;
  return `INC-${String(num + 1).padStart(6, '0')}`;
}

export async function createIncident(data) { return prisma.incident.create({ data }); }
export async function updateIncident(id, data) { return prisma.incident.update({ where: { id }, data }); }

// Follow-ups
export async function findFollowUpById(id, incidentId) { return prisma.incidentFollowUp.findFirst({ where: { id, incidentId } }); }
export async function createFollowUp(data) { return prisma.incidentFollowUp.create({ data }); }
export async function updateFollowUp(id, data) { return prisma.incidentFollowUp.update({ where: { id }, data }); }

// Complaints
export async function findAllComplaints(organizationId, options = {}) {
  const { page = 1, limit = 20, search, status, complaintType, clientId, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(status && { status }),
    ...(complaintType && { complaintType }),
    ...(clientId && { clientId }),
    ...(search && { OR: [
      { complaintNumber: { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]}),
  };

  const [data, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      include: { client: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.complaint.count({ where }),
  ]);
  return { data, total };
}

export async function findComplaintById(id, organizationId) {
  return prisma.complaint.findFirst({
    where: { id, organizationId },
    include: { client: { select: { id: true, firstName: true, lastName: true } } },
  });
}

export async function getNextComplaintNumber(organizationId) {
  const last = await prisma.complaint.findFirst({ where: { organizationId }, orderBy: { createdAt: 'desc' }, select: { complaintNumber: true } });
  if (!last) return 'CMP-000001';
  const num = parseInt(last.complaintNumber.replace('CMP-', ''), 10) || 0;
  return `CMP-${String(num + 1).padStart(6, '0')}`;
}

export async function createComplaint(data) { return prisma.complaint.create({ data }); }
export async function updateComplaint(id, data) { return prisma.complaint.update({ where: { id }, data }); }

export default {
  findAllIncidents, findIncidentById, getNextIncidentNumber, createIncident, updateIncident,
  findFollowUpById, createFollowUp, updateFollowUp,
  findAllComplaints, findComplaintById, getNextComplaintNumber, createComplaint, updateComplaint,
};
