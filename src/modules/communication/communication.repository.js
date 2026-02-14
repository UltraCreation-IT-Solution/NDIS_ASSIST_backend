// src/modules/communication/communication.repository.js

import prisma from '../../config/database.js';

// ============================================================================
// MESSAGES (Internal messaging between org users)
// ============================================================================

export async function findAllMessages(organizationId, userId, options = {}) {
  const { page = 1, limit = 20, folder = 'inbox', isRead, search, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(folder === 'inbox' && { recipientId: userId }),
    ...(folder === 'sent' && { senderId: userId }),
    ...(typeof isRead === 'boolean' && { isRead }),
    ...(search && {
      OR: [
        { subject: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.message.findMany({
      where,
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true } },
        recipient: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.message.count({ where }),
  ]);

  return { data, total };
}

export async function findMessageById(id, organizationId) {
  return prisma.message.findFirst({
    where: { id, organizationId },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, email: true } },
      recipient: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
}

export async function createMessage(data) {
  return prisma.message.create({
    data,
    include: {
      sender: { select: { id: true, firstName: true, lastName: true } },
      recipient: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function updateMessage(id, data) {
  return prisma.message.update({ where: { id }, data });
}

export async function getUnreadCount(organizationId, userId) {
  return prisma.message.count({
    where: { organizationId, recipientId: userId, isRead: false },
  });
}

// ============================================================================
// ANNOUNCEMENTS (Org-wide broadcasts)
// ============================================================================

export async function findAllAnnouncements(organizationId, options = {}) {
  const { page = 1, limit = 20, isActive, priority, search, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(typeof isActive === 'boolean' && { isActive }),
    ...(priority && { priority }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      include: {
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.announcement.count({ where }),
  ]);

  return { data, total };
}

export async function findAnnouncementById(id, organizationId) {
  return prisma.announcement.findFirst({
    where: { id, organizationId },
    include: {
      createdByUser: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function createAnnouncement(data) {
  return prisma.announcement.create({ data });
}

export async function updateAnnouncement(id, data) {
  return prisma.announcement.update({ where: { id }, data });
}

// ============================================================================
// NOTIFICATIONS (System-generated alerts)
// ============================================================================

export async function findAllNotifications(organizationId, userId, options = {}) {
  const { page = 1, limit = 20, isRead, type } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    userId,
    ...(typeof isRead === 'boolean' && { isRead }),
    ...(type && { type }),
  };

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.notification.count({ where }),
  ]);

  return { data, total };
}

export async function createNotification(data) {
  return prisma.notification.create({ data });
}

export async function createManyNotifications(items) {
  return prisma.notification.createMany({ data: items });
}

export async function markNotificationRead(id) {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllNotificationsRead(organizationId, userId) {
  return prisma.notification.updateMany({
    where: { organizationId, userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function getNotificationUnreadCount(organizationId, userId) {
  return prisma.notification.count({
    where: { organizationId, userId, isRead: false },
  });
}

export default {
  findAllMessages, findMessageById, createMessage, updateMessage, getUnreadCount,
  findAllAnnouncements, findAnnouncementById, createAnnouncement, updateAnnouncement,
  findAllNotifications, createNotification, createManyNotifications, markNotificationRead, markAllNotificationsRead, getNotificationUnreadCount,
};
