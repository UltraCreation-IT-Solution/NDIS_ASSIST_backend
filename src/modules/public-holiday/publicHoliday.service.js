// src/modules/public-holiday/publicHoliday.service.js

import * as repo from './publicHoliday.repository.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../../shared/errors/AppError.js';

export async function listPublicHolidays(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await repo.findAll(organizationId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function getPublicHolidayById(organizationId, id) {
  const holiday = await repo.findById(id);
  if (!holiday) {
    throw new NotFoundError('Public holiday not found');
  }

  // Ensure the holiday belongs to this org or is a national holiday
  if (holiday.organizationId && holiday.organizationId !== organizationId) {
    throw new NotFoundError('Public holiday not found');
  }

  return holiday;
}

export async function createPublicHoliday(organizationId, data) {
  return repo.create({
    organizationId,
    ...data,
    holidayDate: new Date(data.holidayDate),
  });
}

export async function updatePublicHoliday(organizationId, id, data) {
  const holiday = await repo.findById(id);
  if (!holiday) {
    throw new NotFoundError('Public holiday not found');
  }

  // Can only edit org-specific holidays, not system-wide national ones
  if (!holiday.organizationId) {
    throw new ForbiddenError('Cannot edit system-wide national holidays. Create an org-specific override instead.');
  }

  if (holiday.organizationId !== organizationId) {
    throw new NotFoundError('Public holiday not found');
  }

  const updateData = { ...data };
  if (data.holidayDate) {
    updateData.holidayDate = new Date(data.holidayDate);
  }

  return repo.update(id, updateData);
}

export async function deletePublicHoliday(organizationId, id) {
  const holiday = await repo.findById(id);
  if (!holiday) {
    throw new NotFoundError('Public holiday not found');
  }

  if (!holiday.organizationId) {
    throw new ForbiddenError('Cannot delete system-wide national holidays');
  }

  if (holiday.organizationId !== organizationId) {
    throw new NotFoundError('Public holiday not found');
  }

  return repo.remove(id);
}

export async function seedAustralianHolidays(organizationId, year) {
  const holidays = generateAustralianHolidays(year);

  const records = holidays.map((h) => ({
    organizationId,
    holidayName: h.name,
    holidayDate: h.date,
    state: h.state || null,
    isNational: h.isNational,
    isRecurring: false,
  }));

  const result = await repo.createMany(records);
  return { count: result.count, year };
}

/**
 * Check if a specific date is a public holiday for an organization
 * Used by the wage calculator
 */
export async function checkIsPublicHoliday(organizationId, date, state = null) {
  return repo.isPublicHoliday(organizationId, date, state);
}

// --- Australian Public Holiday Generator ---

function generateAustralianHolidays(year) {
  const holidays = [];

  // Fixed national holidays
  holidays.push(
    { name: "New Year's Day", date: new Date(`${year}-01-01`), isNational: true },
    { name: 'Australia Day', date: new Date(`${year}-01-26`), isNational: true },
    { name: 'Anzac Day', date: new Date(`${year}-04-25`), isNational: true },
    { name: 'Christmas Day', date: new Date(`${year}-12-25`), isNational: true },
    { name: 'Boxing Day', date: new Date(`${year}-12-26`), isNational: true }
  );

  // Easter (variable dates) — calculate using anonymous Gregorian algorithm
  const easter = calculateEasterDate(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  const easterSaturday = new Date(easter);
  easterSaturday.setDate(easter.getDate() - 1);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  holidays.push(
    { name: 'Good Friday', date: goodFriday, isNational: true },
    { name: 'Easter Saturday', date: easterSaturday, isNational: true },
    { name: 'Easter Monday', date: easterMonday, isNational: true }
  );

  // Queen's/King's Birthday — second Monday in June (most states)
  const kingsBirthday = getNthWeekdayOfMonth(year, 5, 1, 2); // June (0-indexed month 5), Monday (1), 2nd
  holidays.push(
    { name: "King's Birthday", date: kingsBirthday, isNational: false, state: 'NSW' },
    { name: "King's Birthday", date: kingsBirthday, isNational: false, state: 'VIC' },
    { name: "King's Birthday", date: kingsBirthday, isNational: false, state: 'SA' },
    { name: "King's Birthday", date: kingsBirthday, isNational: false, state: 'TAS' },
    { name: "King's Birthday", date: kingsBirthday, isNational: false, state: 'ACT' }
  );

  // QLD — King's Birthday is in October (last Monday)
  const qldKingsBirthday = getLastWeekdayOfMonth(year, 9, 1); // October, Monday
  holidays.push({ name: "King's Birthday", date: qldKingsBirthday, isNational: false, state: 'QLD' });

  // WA — King's Birthday is fourth Monday in September
  const waKingsBirthday = getNthWeekdayOfMonth(year, 8, 1, 4); // September, Monday, 4th
  holidays.push({ name: "King's Birthday", date: waKingsBirthday, isNational: false, state: 'WA' });

  // State-specific holidays
  // Canberra Day — second Monday in March (ACT)
  holidays.push({
    name: 'Canberra Day',
    date: getNthWeekdayOfMonth(year, 2, 1, 2),
    isNational: false,
    state: 'ACT',
  });

  // Melbourne Cup — first Tuesday in November (VIC)
  holidays.push({
    name: 'Melbourne Cup',
    date: getNthWeekdayOfMonth(year, 10, 2, 1),
    isNational: false,
    state: 'VIC',
  });

  // Recreation Day — first Monday in November (TAS, north only, but included for completeness)
  holidays.push({
    name: 'Recreation Day',
    date: getNthWeekdayOfMonth(year, 10, 1, 1),
    isNational: false,
    state: 'TAS',
  });

  return holidays;
}

function calculateEasterDate(year) {
  // Anonymous Gregorian algorithm
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getNthWeekdayOfMonth(year, month, weekday, n) {
  // weekday: 0=Sunday, 1=Monday, ... 6=Saturday
  const firstDay = new Date(year, month, 1);
  let dayOffset = weekday - firstDay.getDay();
  if (dayOffset < 0) dayOffset += 7;
  const date = new Date(year, month, 1 + dayOffset + (n - 1) * 7);
  return date;
}

function getLastWeekdayOfMonth(year, month, weekday) {
  const lastDay = new Date(year, month + 1, 0);
  let dayOffset = lastDay.getDay() - weekday;
  if (dayOffset < 0) dayOffset += 7;
  return new Date(year, month + 1, -dayOffset);
}

export default {
  listPublicHolidays,
  getPublicHolidayById,
  createPublicHoliday,
  updatePublicHoliday,
  deletePublicHoliday,
  seedAustralianHolidays,
  checkIsPublicHoliday,
};