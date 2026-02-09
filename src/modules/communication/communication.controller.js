// src/modules/communication/communication.controller.js

import * as service from './communication.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

// Messages
export async function listMessages(req, res) {
  const result = await service.listMessages(req.organizationId, req.userId, req.query);
  return paginated(res, result.data, result.pagination, 'Messages retrieved');
}

export async function getMessage(req, res) {
  const message = await service.getMessageById(req.organizationId, req.params.id, req.userId);
  return success(res, message, 'Message retrieved');
}

export async function sendMessage(req, res) {
  const message = await service.sendMessage(req.organizationId, req.body, req.userId);
  return created(res, message, 'Message sent');
}

export async function deleteMessage(req, res) {
  await service.deleteMessage(req.organizationId, req.params.id, req.userId);
  return success(res, null, 'Message deleted');
}

export async function getUnreadCount(req, res) {
  const result = await service.getUnreadCount(req.organizationId, req.userId);
  return success(res, result, 'Unread count retrieved');
}

// Announcements
export async function listAnnouncements(req, res) {
  const result = await service.listAnnouncements(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Announcements retrieved');
}

export async function getAnnouncement(req, res) {
  const announcement = await service.getAnnouncementById(req.organizationId, req.params.id);
  return success(res, announcement, 'Announcement retrieved');
}

export async function createAnnouncement(req, res) {
  const announcement = await service.createAnnouncement(req.organizationId, req.body, req.userId);
  return created(res, announcement, 'Announcement created');
}

export async function updateAnnouncement(req, res) {
  const announcement = await service.updateAnnouncement(req.organizationId, req.params.id, req.body);
  return success(res, announcement, 'Announcement updated');
}

// Notifications
export async function listNotifications(req, res) {
  const result = await service.listNotifications(req.organizationId, req.userId, req.query);
  return paginated(res, result.data, result.pagination, 'Notifications retrieved');
}

export async function markAsRead(req, res) {
  await service.markAsRead(req.organizationId, req.params.id, req.userId);
  return success(res, null, 'Notification marked as read');
}

export async function markAllAsRead(req, res) {
  const result = await service.markAllAsRead(req.organizationId, req.userId);
  return success(res, result, 'All notifications marked as read');
}

export async function getNotificationUnreadCount(req, res) {
  const result = await service.getNotificationUnreadCount(req.organizationId, req.userId);
  return success(res, result, 'Unread count retrieved');
}

export default {
  listMessages, getMessage, sendMessage, deleteMessage, getUnreadCount,
  listAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement,
  listNotifications, markAsRead, markAllAsRead, getNotificationUnreadCount,
};
