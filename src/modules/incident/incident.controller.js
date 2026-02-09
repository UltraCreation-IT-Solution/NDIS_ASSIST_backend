// src/modules/incident/incident.controller.js

import * as service from './incident.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

// Incidents
export async function listIncidents(req, res) {
  const result = await service.listIncidents(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Incidents retrieved');
}

export async function getIncident(req, res) {
  const incident = await service.getIncidentById(req.organizationId, req.params.id);
  return success(res, incident, 'Incident retrieved');
}

export async function createIncident(req, res) {
  const incident = await service.createIncident(req.organizationId, req.body, req.userId);
  return created(res, incident, 'Incident reported');
}

export async function updateIncident(req, res) {
  const incident = await service.updateIncident(req.organizationId, req.params.id, req.body);
  return success(res, incident, 'Incident updated');
}

// Follow-ups
export async function createFollowUp(req, res) {
  const followUp = await service.createFollowUp(req.organizationId, req.params.id, req.body, req.userId);
  return created(res, followUp, 'Follow-up added');
}

export async function updateFollowUp(req, res) {
  const followUp = await service.updateFollowUp(req.organizationId, req.params.id, req.params.followUpId, req.body);
  return success(res, followUp, 'Follow-up updated');
}

// Complaints
export async function listComplaints(req, res) {
  const result = await service.listComplaints(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Complaints retrieved');
}

export async function getComplaint(req, res) {
  const complaint = await service.getComplaintById(req.organizationId, req.params.id);
  return success(res, complaint, 'Complaint retrieved');
}

export async function createComplaint(req, res) {
  const complaint = await service.createComplaint(req.organizationId, req.body, req.userId);
  return created(res, complaint, 'Complaint lodged');
}

export async function updateComplaint(req, res) {
  const complaint = await service.updateComplaint(req.organizationId, req.params.id, req.body);
  return success(res, complaint, 'Complaint updated');
}

export default {
  listIncidents, getIncident, createIncident, updateIncident,
  createFollowUp, updateFollowUp,
  listComplaints, getComplaint, createComplaint, updateComplaint,
};
