// src/modules/team/team.controller.js

import * as service from './team.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

// ============================================================================
// TEAM CONTROLLERS
// ============================================================================

export async function listTeams(req, res) {
  const result = await service.listTeams(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Teams retrieved');
}

export async function getTeam(req, res) {
  const team = await service.getTeamById(req.organizationId, req.params.teamId);
  return success(res, team, 'Team retrieved');
}

export async function createTeam(req, res) {
  const team = await service.createTeam(req.organizationId, req.body);
  return created(res, team, 'Team created');
}

export async function updateTeam(req, res) {
  const team = await service.updateTeam(req.organizationId, req.params.teamId, req.body);
  return success(res, team, 'Team updated');
}

export async function deleteTeam(req, res) {
  await service.deleteTeam(req.organizationId, req.params.teamId);
  return success(res, null, 'Team deleted');
}

// ============================================================================
// TEAM MEMBER CONTROLLERS
// ============================================================================

export async function listMembers(req, res) {
  const result = await service.listMembers(req.organizationId, req.params.teamId, req.query);
  return paginated(res, result.data, result.pagination, 'Team members retrieved');
}

export async function addMember(req, res) {
  const member = await service.addMember(req.organizationId, req.params.teamId, req.body.staffId);
  return created(res, member, 'Member added to team');
}

export async function removeMember(req, res) {
  await service.removeMember(req.organizationId, req.params.teamId, req.params.staffId);
  return success(res, null, 'Member removed from team');
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  listMembers,
  addMember,
  removeMember
};