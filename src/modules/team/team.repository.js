// src/modules/team/team.repository.js

import prisma from '../../config/database.js';

// ============================================================================
// TEAM QUERIES
// ============================================================================

const teamSelect = {
  id: true,
  organizationId: true,
  name: true,
  description: true,
  leaderId: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { members: true }
  },
  members: {
    include: {
      staff: {
        select: {
          id: true,
          employeeId: true,
          position: true,
          department: true,
          employmentStatus: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      }
    },
    orderBy: { joinedAt: 'desc' }
  }
};

async function attachLeaders(teams) {
  const leaderIds = [...new Set(teams.map((team) => team.leaderId).filter(Boolean))];
  if (leaderIds.length === 0) {
    return teams.map((team) => ({ ...team, leader: null }));
  }

  const leaders = await prisma.staffMember.findMany({
    where: { id: { in: leaderIds } },
    select: {
      id: true,
      employeeId: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  const leaderById = new Map(leaders.map((leader) => [leader.id, leader]));
  return teams.map((team) => ({
    ...team,
    leader: team.leaderId ? leaderById.get(team.leaderId) || null : null
  }));
}

export async function findAll(organizationId, options = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      select: teamSelect
    }),
    prisma.team.count({ where })
  ]);

  const data = await attachLeaders(teams);
  return { data, total };
}

export async function findById(organizationId, teamId) {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      organizationId
    },
    select: teamSelect
  });
  if (!team) {
    return null;
  }
  const [withLeader] = await attachLeaders([team]);
  return withLeader;
}

export async function findByName(organizationId, name) {
  return prisma.team.findFirst({
    where: {
      organizationId,
      name: { equals: name, mode: 'insensitive' }
    }
  });
}

export async function create(data) {
  const team = await prisma.team.create({
    data,
    select: teamSelect
  });
  const [withLeader] = await attachLeaders([team]);
  return withLeader;
}

export async function update(organizationId, teamId, data) {
  const team = await prisma.team.update({
    where: {
      id: teamId,
      organizationId
    },
    data,
    select: teamSelect
  });
  const [withLeader] = await attachLeaders([team]);
  return withLeader;
}

export async function deleteTeam(organizationId, teamId) {
  // Delete team and all memberships (cascade)
  return prisma.$transaction(async (tx) => {
    // Remove all members first
    await tx.teamMember.deleteMany({
      where: { teamId }
    });

    // Delete the team
    return tx.team.delete({
      where: {
        id: teamId,
        organizationId
      }
    });
  });
}

// ============================================================================
// TEAM MEMBER QUERIES
// ============================================================================

export async function findAllMembers(teamId, options = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    sortBy = 'joinedAt',
    sortOrder = 'desc'
  } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    teamId,
    ...(search && {
      staff: {
        OR: [
          { employeeId: { contains: search, mode: 'insensitive' } },
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ]
      }
    })
  };

  // Handle sorting
  let orderBy;
  if (sortBy === 'joinedAt') {
    orderBy = { joinedAt: sortOrder };
  } else {
    orderBy = { staff: { user: { [sortBy]: sortOrder } } };
  }

  const [data, total] = await Promise.all([
    prisma.teamMember.findMany({
      where,
      orderBy,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      include: {
        staff: {
          select: {
            id: true,
            employeeId: true,
            position: true,
            department: true,
            employmentStatus: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    }),
    prisma.teamMember.count({ where })
  ]);

  return { data, total };
}

export async function findMember(teamId, staffId) {
  return prisma.teamMember.findFirst({
    where: {
      teamId,
      staffId
    },
    include: {
      staff: {
        select: {
          id: true,
          employeeId: true,
          position: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }
    }
  });
}

export async function addMember(teamId, staffId) {
  return prisma.teamMember.create({
    data: {
      teamId,
      staffId,
      joinedAt: new Date()
    },
    include: {
      staff: {
        select: {
          id: true,
          employeeId: true,
          position: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }
    }
  });
}

export async function removeMember(teamId, staffId) {
  return prisma.teamMember.delete({
    where: {
      teamId_staffId: {
        teamId,
        staffId
      }
    }
  });
}

export async function countMembersByTeam(teamId) {
  return prisma.teamMember.count({
    where: { teamId }
  });
}

export async function getStaffTeams(staffId) {
  return prisma.teamMember.findMany({
    where: { staffId },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  });
}

// ============================================================================
// UTILITY QUERIES
// ============================================================================

export async function countByOrganization(organizationId) {
  return prisma.team.count({
    where: { organizationId }
  });
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Teams
  findAll,
  findById,
  findByName,
  create,
  update,
  deleteTeam,
  
  // Members
  findAllMembers,
  findMember,
  addMember,
  removeMember,
  countMembersByTeam,
  getStaffTeams,
  
  // Utility
  countByOrganization
};