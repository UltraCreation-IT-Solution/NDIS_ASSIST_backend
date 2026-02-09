// src/modules/team/team.routes.js

import { Router } from 'express';
import * as controller from './team.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  listTeamsSchema,
  getTeamSchema,
  createTeamSchema,
  updateTeamSchema,
  deleteTeamSchema,
  listMembersSchema,
  addMemberSchema,
  removeMemberSchema
} from './team.validator.js';

const router = Router();

// ============================================================================
// TEAM ROUTES
// ============================================================================

// GET /teams - List all teams
router.get(
  '/',
  authenticate,
  requirePermission('staff:read'),
  validate(listTeamsSchema),
  controller.listTeams
);

// POST /teams - Create team
router.post(
  '/',
  authenticate,
  requirePermission('staff:write'),
  validate(createTeamSchema),
  controller.createTeam
);

// GET /teams/:teamId - Get team by ID
router.get(
  '/:teamId',
  authenticate,
  requirePermission('staff:read'),
  validate(getTeamSchema),
  controller.getTeam
);

// PATCH /teams/:teamId - Update team
router.patch(
  '/:teamId',
  authenticate,
  requirePermission('staff:write'),
  validate(updateTeamSchema),
  controller.updateTeam
);

// DELETE /teams/:teamId - Delete team
router.delete(
  '/:teamId',
  authenticate,
  requirePermission('staff:write'),
  validate(deleteTeamSchema),
  controller.deleteTeam
);

// ============================================================================
// TEAM MEMBER ROUTES
// ============================================================================

// GET /teams/:teamId/members - List team members
router.get(
  '/:teamId/members',
  authenticate,
  requirePermission('staff:read'),
  validate(listMembersSchema),
  controller.listMembers
);

// POST /teams/:teamId/members - Add member to team
router.post(
  '/:teamId/members',
  authenticate,
  requirePermission('staff:write'),
  validate(addMemberSchema),
  controller.addMember
);

// DELETE /teams/:teamId/members/:staffId - Remove member from team
router.delete(
  '/:teamId/members/:staffId',
  authenticate,
  requirePermission('staff:write'),
  validate(removeMemberSchema),
  controller.removeMember
);

export default router;