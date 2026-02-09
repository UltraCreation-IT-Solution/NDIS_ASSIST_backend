// src/modules/team/team.service.js

import * as repo from './team.repository.js';
import * as staffRepo from '../staff/staff.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError.js';
import { PAGINATION } from '../../config/constants.js';

// ============================================================================
// TEAM SERVICES
// ============================================================================

export async function listTeams(organizationId, options = {}) {
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

export async function getTeamById(organizationId, teamId) {
  const team = await repo.findById(organizationId, teamId);

  if (!team) {
    throw new NotFoundError('Team not found');
  }

  return team;
}

export async function createTeam(organizationId, data) {
  const { name, description, leaderId } = data;

  // Check for duplicate team name
  const existing = await repo.findByName(organizationId, name);
  if (existing) {
    throw new ConflictError('A team with this name already exists');
  }

  // Validate leader exists if provided
  if (leaderId) {
    const leader = await staffRepo.findById(organizationId, leaderId);
    if (!leader) {
      throw new NotFoundError('Team leader (staff member) not found');
    }
    if (leader.employmentStatus === 'TERMINATED' || leader.employmentStatus === 'RESIGNED') {
      throw new BadRequestError('Cannot assign terminated or resigned staff as team leader');
    }
  }

  return repo.create({
    organizationId,
    name,
    description,
    leaderId
  });
}

export async function updateTeam(organizationId, teamId, data) {
  // Verify team exists
  const existing = await repo.findById(organizationId, teamId);
  if (!existing) {
    throw new NotFoundError('Team not found');
  }

  // Check for duplicate name if name is being changed
  if (data.name && data.name !== existing.name) {
    const duplicate = await repo.findByName(organizationId, data.name);
    if (duplicate) {
      throw new ConflictError('A team with this name already exists');
    }
  }

  // Validate leader exists if being changed
  if (data.leaderId) {
    const leader = await staffRepo.findById(organizationId, data.leaderId);
    if (!leader) {
      throw new NotFoundError('Team leader (staff member) not found');
    }
    if (leader.employmentStatus === 'TERMINATED' || leader.employmentStatus === 'RESIGNED') {
      throw new BadRequestError('Cannot assign terminated or resigned staff as team leader');
    }
  }

  return repo.update(organizationId, teamId, data);
}

export async function deleteTeam(organizationId, teamId) {
  // Verify team exists
  const existing = await repo.findById(organizationId, teamId);
  if (!existing) {
    throw new NotFoundError('Team not found');
  }

  return repo.deleteTeam(organizationId, teamId);
}

// ============================================================================
// TEAM MEMBER SERVICES
// ============================================================================

export async function listMembers(organizationId, teamId, options = {}) {
  // Verify team exists
  await getTeamById(organizationId, teamId);

  const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = options;
  const { data, total } = await repo.findAllMembers(teamId, options);

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

export async function addMember(organizationId, teamId, staffId) {
  // Verify team exists
  await getTeamById(organizationId, teamId);

  // Verify staff exists and belongs to same org
  const staff = await staffRepo.findById(organizationId, staffId);
  if (!staff) {
    throw new NotFoundError('Staff member not found');
  }

  // Check staff is active
  if (staff.employmentStatus === 'TERMINATED' || staff.employmentStatus === 'RESIGNED') {
    throw new BadRequestError('Cannot add terminated or resigned staff to a team');
  }

  // Check if already a member
  const existingMember = await repo.findMember(teamId, staffId);
  if (existingMember) {
    throw new ConflictError('Staff member is already in this team');
  }

  return repo.addMember(teamId, staffId);
}

export async function removeMember(organizationId, teamId, staffId) {
  // Verify team exists
  const team = await getTeamById(organizationId, teamId);

  // Check if member exists
  const member = await repo.findMember(teamId, staffId);
  if (!member) {
    throw new NotFoundError('Staff member is not in this team');
  }

  // Check if trying to remove the team leader
  if (team.leaderId === staffId) {
    throw new BadRequestError('Cannot remove team leader from team. Assign a new leader first.');
  }

  return repo.removeMember(teamId, staffId);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Teams
  listTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,

  // Members
  listMembers,
  addMember,
  removeMember
};