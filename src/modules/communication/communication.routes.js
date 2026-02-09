// src/modules/communication/communication.routes.js

import { Router } from 'express';
import * as c from './communication.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as v from './communication.validator.js';

const router = Router();

// Messages (all authenticated users can use messaging)
router.get('/messages', authenticate, validate(v.listMessagesSchema), c.listMessages);
router.post('/messages', authenticate, validate(v.sendMessageSchema), c.sendMessage);
router.get('/messages/unread-count', authenticate, c.getUnreadCount);
router.get('/messages/:id', authenticate, validate(v.getMessageSchema), c.getMessage);
router.delete('/messages/:id', authenticate, validate(v.deleteMessageSchema), c.deleteMessage);

// Announcements (read: all, write: settings permission)
router.get('/announcements', authenticate, validate(v.listAnnouncementsSchema), c.listAnnouncements);
router.post('/announcements', authenticate, requirePermission('settings:write'), validate(v.createAnnouncementSchema), c.createAnnouncement);
router.get('/announcements/:id', authenticate, validate(v.getAnnouncementSchema), c.getAnnouncement);
router.patch('/announcements/:id', authenticate, requirePermission('settings:write'), validate(v.updateAnnouncementSchema), c.updateAnnouncement);

// Notifications (user-specific)
router.get('/notifications', authenticate, validate(v.listNotificationsSchema), c.listNotifications);
router.get('/notifications/unread-count', authenticate, c.getNotificationUnreadCount);
router.patch('/notifications/:id/read', authenticate, validate(v.markAsReadSchema), c.markAsRead);
router.post('/notifications/mark-all-read', authenticate, c.markAllAsRead);

export default router;
