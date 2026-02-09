// src/modules/staff/staff.repository.js

import prisma from '../../config/database.js';

// ============================================================================
// CORE STAFF QUERIES
// ============================================================================

export async function findAll(organizationId, options = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    employmentType,
    department,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const where = {
    organizationId,
    ...(status && { employmentStatus: status }),
    ...(employmentType && { employmentType }),
    ...(department && { department: { contains: department, mode: 'insensitive' } }),
    ...(search && {
      OR: [
        { employeeId: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ]
    })
  };

  // Handle sorting - some fields are on User relation
  let orderBy;
  if (['firstName', 'lastName'].includes(sortBy)) {
    orderBy = { user: { [sortBy]: sortOrder } };
  } else {
    orderBy = { [sortBy]: sortOrder };
  }

  const [data, total] = await Promise.all([
    prisma.staffMember.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true
          }
        }
      }
    }),
    prisma.staffMember.count({ where })
  ]);

  return { data, total };
}

export async function findById(organizationId, staffId) {
  return prisma.staffMember.findFirst({
    where: {
      id: staffId,
      organizationId
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true
        }
      }
    }
  });
}

export async function findByUserId(organizationId, userId) {
  return prisma.staffMember.findFirst({
    where: {
      userId,
      organizationId
    }
  });
}

export async function findByEmployeeId(organizationId, employeeId) {
  return prisma.staffMember.findFirst({
    where: {
      employeeId,
      organizationId
    }
  });
}

export async function create(data) {
  return prisma.staffMember.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true
        }
      }
    }
  });
}

export async function createWithUser(staffData, userData) {
  return prisma.$transaction(async (tx) => {
    // Create user first
    const user = await tx.user.create({
      data: userData
    });

    // Create staff member linked to user
    const staff = await tx.staffMember.create({
      data: {
        ...staffData,
        userId: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true
          }
        }
      }
    });

    return staff;
  });
}

export async function update(organizationId, staffId, data) {
  return prisma.staffMember.update({
    where: {
      id: staffId,
      organizationId
    },
    data,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true
        }
      }
    }
  });
}

export async function updateWithUser(organizationId, staffId, staffData, userData) {
  return prisma.$transaction(async (tx) => {
    // Get staff to find userId
    const staff = await tx.staffMember.findFirst({
      where: { id: staffId, organizationId }
    });

    if (!staff) return null;

    // Update user if userData provided
    if (userData && Object.keys(userData).length > 0) {
      await tx.user.update({
        where: { id: staff.userId },
        data: userData
      });
    }

    // Update staff member
    return tx.staffMember.update({
      where: { id: staffId },
      data: staffData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true
          }
        }
      }
    });
  });
}

export async function softDelete(organizationId, staffId) {
  return prisma.staffMember.update({
    where: {
      id: staffId,
      organizationId
    },
    data: {
      employmentStatus: 'TERMINATED',
      endDate: new Date()
    }
  });
}

// ============================================================================
// SKILLS QUERIES
// ============================================================================

export async function findAllSkills(staffId, options = {}) {
  const {
    page = 1,
    limit = 20,
    certified,
    proficiencyLevel,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const where = {
    staffId,
    ...(certified !== undefined && { certified }),
    ...(proficiencyLevel && { proficiencyLevel })
  };

  const [data, total] = await Promise.all([
    prisma.staffSkill.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.staffSkill.count({ where })
  ]);

  return { data, total };
}

export async function findSkillById(staffId, skillId) {
  return prisma.staffSkill.findFirst({
    where: {
      id: skillId,
      staffId
    }
  });
}

export async function findSkillByName(staffId, skillName) {
  return prisma.staffSkill.findFirst({
    where: {
      staffId,
      skillName: { equals: skillName, mode: 'insensitive' }
    }
  });
}

export async function createSkill(data) {
  return prisma.staffSkill.create({ data });
}

export async function updateSkill(staffId, skillId, data) {
  return prisma.staffSkill.update({
    where: {
      id: skillId,
      staffId
    },
    data
  });
}

export async function deleteSkill(staffId, skillId) {
  return prisma.staffSkill.delete({
    where: {
      id: skillId,
      staffId
    }
  });
}

// ============================================================================
// DOCUMENTS QUERIES
// ============================================================================

export async function findAllDocuments(staffId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    documentType,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const where = {
    staffId,
    ...(status && { status }),
    ...(documentType && { documentType: { contains: documentType, mode: 'insensitive' } })
  };

  const [data, total] = await Promise.all([
    prisma.staffDocument.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.staffDocument.count({ where })
  ]);

  return { data, total };
}

export async function findDocumentById(staffId, documentId) {
  return prisma.staffDocument.findFirst({
    where: {
      id: documentId,
      staffId
    }
  });
}

export async function createDocument(data) {
  return prisma.staffDocument.create({ data });
}

export async function updateDocument(staffId, documentId, data) {
  return prisma.staffDocument.update({
    where: {
      id: documentId,
      staffId
    },
    data
  });
}

export async function deleteDocument(staffId, documentId) {
  return prisma.staffDocument.delete({
    where: {
      id: documentId,
      staffId
    }
  });
}

// ============================================================================
// AVAILABILITY QUERIES
// ============================================================================

export async function findAvailability(staffId) {
  return prisma.staffAvailability.findMany({
    where: { staffId },
    orderBy: {
      dayOfWeek: 'asc'
    }
  });
}

export async function setAvailability(staffId, availabilityData) {
  // Delete existing and insert new (replace all)
  return prisma.$transaction(async (tx) => {
    await tx.staffAvailability.deleteMany({
      where: { staffId }
    });

    if (availabilityData.length > 0) {
      await tx.staffAvailability.createMany({
        data: availabilityData.map(slot => ({
          staffId,
          ...slot
        }))
      });
    }

    return tx.staffAvailability.findMany({
      where: { staffId },
      orderBy: { dayOfWeek: 'asc' }
    });
  });
}

// ============================================================================
// LEAVE QUERIES
// ============================================================================

export async function findAllLeave(staffId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    leaveType,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const where = {
    staffId,
    ...(status && { status }),
    ...(leaveType && { leaveType }),
    ...(startDate && { startDate: { gte: new Date(startDate) } }),
    ...(endDate && { endDate: { lte: new Date(endDate) } })
  };

  const [data, total] = await Promise.all([
    prisma.staffLeaveRequest.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }),
    prisma.staffLeaveRequest.count({ where })
  ]);

  return { data, total };
}

export async function findLeaveById(staffId, leaveId) {
  return prisma.staffLeaveRequest.findFirst({
    where: {
      id: leaveId,
      staffId
    },
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
}

export async function findOverlappingLeave(staffId, startDate, endDate, excludeId = null) {
  const where = {
    staffId,
    status: { in: ['PENDING', 'APPROVED'] },
    OR: [
      {
        startDate: { lte: new Date(endDate) },
        endDate: { gte: new Date(startDate) }
      }
    ],
    ...(excludeId && { id: { not: excludeId } })
  };

  return prisma.staffLeaveRequest.findFirst({ where });
}

export async function createLeave(data) {
  return prisma.staffLeaveRequest.create({
    data,
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
}

export async function updateLeave(staffId, leaveId, data) {
  return prisma.staffLeaveRequest.update({
    where: {
      id: leaveId,
      staffId
    },
    data,
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
}

// ============================================================================
// PERFORMANCE REVIEW QUERIES
// ============================================================================

export async function findAllReviews(staffId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    startDate,
    endDate,
    sortBy = 'reviewDate',
    sortOrder = 'desc'
  } = options;

  const where = {
    staffId,
    ...(status && { status }),
    ...(startDate && { reviewDate: { gte: new Date(startDate) } }),
    ...(endDate && { reviewDate: { lte: new Date(endDate) } })
  };

  const [data, total] = await Promise.all([
    prisma.staffPerformanceReview.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }),
    prisma.staffPerformanceReview.count({ where })
  ]);

  return { data, total };
}

export async function findReviewById(staffId, reviewId) {
  return prisma.staffPerformanceReview.findFirst({
    where: {
      id: reviewId,
      staffId
    },
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
}

export async function createReview(data) {
  return prisma.staffPerformanceReview.create({
    data,
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
}

export async function updateReview(staffId, reviewId, data) {
  return prisma.staffPerformanceReview.update({
    where: {
      id: reviewId,
      staffId
    },
    data,
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
}

// ============================================================================
// TRAINING QUERIES
// ============================================================================

export async function findAllTraining(staffId, options = {}) {
  const {
    page = 1,
    limit = 20,
    expired,
    provider,
    sortBy = 'completionDate',
    sortOrder = 'desc'
  } = options;

  const now = new Date();
  
  const where = {
    staffId,
    ...(provider && { provider: { contains: provider, mode: 'insensitive' } }),
    ...(expired === true && { expiryDate: { lt: now } }),
    ...(expired === false && {
      OR: [
        { expiryDate: null },
        { expiryDate: { gte: now } }
      ]
    })
  };

  const [data, total] = await Promise.all([
    prisma.staffTrainingRecord.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.staffTrainingRecord.count({ where })
  ]);

  return { data, total };
}

export async function findTrainingById(staffId, trainingId) {
  return prisma.staffTrainingRecord.findFirst({
    where: {
      id: trainingId,
      staffId
    }
  });
}

export async function createTraining(data) {
  return prisma.staffTrainingRecord.create({ data });
}

export async function updateTraining(staffId, trainingId, data) {
  return prisma.staffTrainingRecord.update({
    where: {
      id: trainingId,
      staffId
    },
    data
  });
}

export async function deleteTraining(staffId, trainingId) {
  return prisma.staffTrainingRecord.delete({
    where: {
      id: trainingId,
      staffId
    }
  });
}

// ============================================================================
// UTILITY QUERIES
// ============================================================================

export async function countByOrganization(organizationId) {
  return prisma.staffMember.count({
    where: { organizationId }
  });
}

export async function countByStatus(organizationId) {
  const results = await prisma.staffMember.groupBy({
    by: ['employmentStatus'],
    where: { organizationId },
    _count: { id: true }
  });

  return results.reduce((acc, item) => {
    acc[item.employmentStatus] = item._count.id;
    return acc;
  }, {});
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Core Staff
  findAll,
  findById,
  findByUserId,
  findByEmployeeId,
  create,
  createWithUser,
  update,
  updateWithUser,
  softDelete,
  
  // Skills
  findAllSkills,
  findSkillById,
  findSkillByName,
  createSkill,
  updateSkill,
  deleteSkill,
  
  // Documents
  findAllDocuments,
  findDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  
  // Availability
  findAvailability,
  setAvailability,
  
  // Leave
  findAllLeave,
  findLeaveById,
  findOverlappingLeave,
  createLeave,
  updateLeave,
  
  // Performance Reviews
  findAllReviews,
  findReviewById,
  createReview,
  updateReview,
  
  // Training
  findAllTraining,
  findTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
  
  // Utility
  countByOrganization,
  countByStatus
};