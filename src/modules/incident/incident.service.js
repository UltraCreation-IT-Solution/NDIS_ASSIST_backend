// src/modules/incident/incident.service.js

import * as repo from './incident.repository.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';

// ============================================================================
// INCIDENTS
// ============================================================================

export async function listIncidents(organizationId, options = {}) {
  const page = Number.parseInt(options.page, 10) || 1;
  const limit = Number.parseInt(options.limit, 10) || 20;
  const { data, total } = await repo.findAllIncidents(organizationId, options);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

export async function getIncidentById(organizationId, id) {
  const incident = await repo.findIncidentById(id, organizationId);
  if (!incident) throw new NotFoundError('Incident not found');
  return incident;
}

export async function createIncident(organizationId, data, reportedById) {
  const incidentNumber = await repo.getNextIncidentNumber(organizationId);

  // Filter out undefined values from data to prevent Prisma errors
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );

  return repo.createIncident({
    organizationId,
    incidentNumber,
    ...filteredData,
    reportedById: reportedById || null,
    dateOccurred: new Date(data.dateOccurred),
    dateReported: new Date(),
  });
}

export async function updateIncident(organizationId, id, data) {
  const incident = await repo.findIncidentById(id, organizationId);
  if (!incident) throw new NotFoundError('Incident not found');

  if (incident.status === 'CLOSED') {
    throw new BadRequestError('Cannot update a closed incident — reopen it first');
  }

  const updateData = { ...data };
  if (data.dateOccurred) updateData.dateOccurred = new Date(data.dateOccurred);
  if (data.resolvedAt) updateData.resolvedAt = new Date(data.resolvedAt);

  // Auto-set resolvedAt when status changes to RESOLVED or CLOSED
  if (['RESOLVED', 'CLOSED'].includes(data.status) && !incident.resolvedAt && !data.resolvedAt) {
    updateData.resolvedAt = new Date();
  }

  return repo.updateIncident(id, updateData);
}

// ============================================================================
// FOLLOW-UPS
// ============================================================================

export async function createFollowUp(organizationId, incidentId, data, createdById) {
  const incident = await repo.findIncidentById(incidentId, organizationId);
  if (!incident) throw new NotFoundError('Incident not found');

  return repo.createFollowUp({
    incidentId,
    ...data,
    createdById,
    followUpDate: data.followUpDate ? new Date(data.followUpDate) : new Date(),
  });
}

export async function updateFollowUp(organizationId, incidentId, followUpId, data) {
  const incident = await repo.findIncidentById(incidentId, organizationId);
  if (!incident) throw new NotFoundError('Incident not found');

  const followUp = await repo.findFollowUpById(followUpId, incidentId);
  if (!followUp) throw new NotFoundError('Follow-up not found');

  const updateData = { ...data };
  if (data.followUpDate) updateData.followUpDate = new Date(data.followUpDate);

  return repo.updateFollowUp(followUpId, updateData);
}

// ============================================================================
// COMPLAINTS
// ============================================================================

export async function listComplaints(organizationId, options = {}) {
  const page = Number.parseInt(options.page, 10) || 1;
  const limit = Number.parseInt(options.limit, 10) || 20;
  const { data, total } = await repo.findAllComplaints(organizationId, options);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

export async function getComplaintById(organizationId, id) {
  const complaint = await repo.findComplaintById(id, organizationId);
  if (!complaint) throw new NotFoundError('Complaint not found');
  return complaint;
}

export async function createComplaint(organizationId, data, reportedById) {
  const complaintNumber = await repo.getNextComplaintNumber(organizationId);

  return repo.createComplaint({
    organizationId,
    complaintNumber,
    ...data,
    reportedById,
  });
}

export async function updateComplaint(organizationId, id, data) {
  const complaint = await repo.findComplaintById(id, organizationId);
  if (!complaint) throw new NotFoundError('Complaint not found');

  if (complaint.status === 'CLOSED') {
    throw new BadRequestError('Cannot update a closed complaint');
  }

  const updateData = { ...data };
  if (data.resolvedAt) updateData.resolvedAt = new Date(data.resolvedAt);

  if (['RESOLVED', 'CLOSED'].includes(data.status) && !complaint.resolvedAt && !data.resolvedAt) {
    updateData.resolvedAt = new Date();
  }

  return repo.updateComplaint(id, updateData);
}

export default {
  listIncidents, getIncidentById, createIncident, updateIncident,
  createFollowUp, updateFollowUp,
  listComplaints, getComplaintById, createComplaint, updateComplaint,
};
