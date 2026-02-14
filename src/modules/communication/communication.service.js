// src/modules/communication/communication.service.js

import * as repo from './communication.repository.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors/AppError.js';

// ============================================================================
// MESSAGES
// ============================================================================

export async function listMessages(organizationId, userId, options = {}) {
  const page = Number.parseInt(options.page, 10) || 1;
  const limit = Number.parseInt(options.limit, 10) || 20;
  const { data, total } = await repo.findAllMessages(organizationId, userId, options);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

export async function getMessageById(organizationId, id, userId) {
  const message = await repo.findMessageById(id, organizationId);
  if (!message) throw new NotFoundError('Message not found');

  // Only sender or recipient can view
  if (message.senderId !== userId && message.recipientId !== userId) {
    throw new ForbiddenError('You do not have access to this message');
  }

  // Auto-mark as read if recipient views
  if (message.recipientId === userId && !message.isRead) {
    await repo.updateMessage(id, { isRead: true, readAt: new Date() });
    message.isRead = true;
    message.readAt = new Date();
  }

  return message;
}

export async function sendMessage(organizationId, data, senderId) {
  if (senderId === data.recipientId) {
    throw new BadRequestError('Cannot send a message to yourself');
  }

  return repo.createMessage({
    organizationId,
    senderId,
    ...data,
  });
}

export async function deleteMessage(organizationId, id, userId) {
  const message = await repo.findMessageById(id, organizationId);
  if (!message) throw new NotFoundError('Message not found');

  if (message.senderId !== userId && message.recipientId !== userId) {
    throw new ForbiddenError('You do not have access to this message');
  }

  return repo.updateMessage(id, { isDeleted: true });
}

export async function getUnreadCount(organizationId, userId) {
  const count = await repo.getUnreadCount(organizationId, userId);
  return { unreadCount: count };
}

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export async function listAnnouncements(organizationId, options = {}) {
  const page = Number.parseInt(options.page, 10) || 1;
  const limit = Number.parseInt(options.limit, 10) || 20;
  const { data, total } = await repo.findAllAnnouncements(organizationId, options);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

export async function getAnnouncementById(organizationId, id) {
  const announcement = await repo.findAnnouncementById(id, organizationId);
  if (!announcement) throw new NotFoundError('Announcement not found');
  return announcement;
}

export async function createAnnouncement(organizationId, data, userId) {
  return repo.createAnnouncement({
    organizationId,
    createdById: userId,
    ...data,
    ...(data.publishAt && { publishAt: new Date(data.publishAt) }),
    ...(data.expiresAt && { expiresAt: new Date(data.expiresAt) }),
  });
}

export async function updateAnnouncement(organizationId, id, data) {
  const announcement = await repo.findAnnouncementById(id, organizationId);
  if (!announcement) throw new NotFoundError('Announcement not found');

  const updateData = { ...data };
  if (data.publishAt) updateData.publishAt = new Date(data.publishAt);
  if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);

  return repo.updateAnnouncement(id, updateData);
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function listNotifications(organizationId, userId, options = {}) {
  const page = Number.parseInt(options.page, 10) || 1;
  const limit = Number.parseInt(options.limit, 10) || 20;
  const { data, total } = await repo.findAllNotifications(organizationId, userId, options);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

export async function markAsRead(organizationId, id, userId) {
  return repo.markNotificationRead(id);
}

export async function markAllAsRead(organizationId, userId) {
  const result = await repo.markAllNotificationsRead(organizationId, userId);
  return { markedRead: result.count };
}

export async function getNotificationUnreadCount(organizationId, userId) {
  const count = await repo.getNotificationUnreadCount(organizationId, userId);
  return { unreadCount: count };
}

// Helper: send notification to user (used by other services)
export async function sendNotification(organizationId, userId, notification) {
  return repo.createNotification({
    organizationId,
    userId,
    ...notification,
  });
}

// Helper: send notification to multiple users
export async function sendBulkNotifications(organizationId, userIds, notification) {
  const items = userIds.map((userId) => ({
    organizationId,
    userId,
    ...notification,
  }));
  return repo.createManyNotifications(items);
}

export default {
  listMessages, getMessageById, sendMessage, deleteMessage, getUnreadCount,
  listAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement,
  listNotifications, markAsRead, markAllAsRead, getNotificationUnreadCount,
  sendNotification, sendBulkNotifications,
};
