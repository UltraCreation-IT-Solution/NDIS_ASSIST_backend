// src/modules/wage-calculator/wageCalculator.service.js

import prisma from '../../config/database.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';
import { checkIsPublicHoliday } from '../public-holiday/publicHoliday.service.js';

/**
 * Calculate wages for a shift (on-demand)
 * Takes shift parameters and returns a detailed pay breakdown.
 *
 * @param {string} organizationId
 * @param {object} params - { staffId, date, startTime, endTime, breakMinutes }
 * @returns {object} Pay breakdown with segments, totals, and metadata
 */
export async function calculateWage(organizationId, params) {
  const { staffId, date, startTime, endTime, breakMinutes = 0 } = params;

  // 1. Get staff member with pay group
  const staff = await prisma.staffMember.findFirst({
    where: { id: staffId, organizationId },
    include: { payGroup: true },
  });

  if (!staff) {
    throw new NotFoundError('Staff member not found');
  }

  const baseRate = parseFloat(staff.hourlyRate);
  const payGroup = staff.payGroup;

  if (!payGroup) {
    throw new BadRequestError(
      'Staff member has no pay group assigned. Assign a pay group before calculating wages.'
    );
  }

  // 2. Parse shift times into Date objects
  const shiftStart = parseShiftDateTime(date, startTime);
  const shiftEnd = parseShiftDateTime(date, endTime, shiftStart);

  if (shiftEnd <= shiftStart) {
    throw new BadRequestError('Shift end time must be after start time');
  }

  // 3. Get organization state for public holiday checks
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { state: true },
  });

  // 4. Split shift into time segments
  const segments = await splitIntoSegments(
    organizationId,
    shiftStart,
    shiftEnd,
    payGroup,
    baseRate,
    org?.state
  );

  // 5. Apply break deduction proportionally
  const grossHours = segments.reduce((sum, s) => sum + s.hours, 0);
  const breakHours = breakMinutes / 60;
  const paidHours = Math.max(0, grossHours - breakHours);
  const breakRatio = grossHours > 0 ? paidHours / grossHours : 0;

  // 6. Calculate amounts per segment
  let totalAmount = 0;
  const breakdown = segments.map((segment) => {
    const adjustedHours = parseFloat((segment.hours * breakRatio).toFixed(4));
    const amount = parseFloat((adjustedHours * segment.effectiveRate).toFixed(2));
    totalAmount += amount;

    return {
      period: segment.period,
      dayType: segment.dayType,
      timeType: segment.timeType,
      startTime: segment.startTime,
      endTime: segment.endTime,
      grossHours: parseFloat(segment.hours.toFixed(4)),
      paidHours: adjustedHours,
      baseRate,
      dayMultiplier: segment.dayMultiplier,
      timeLoadingPct: segment.timeLoadingPct,
      effectiveRate: segment.effectiveRate,
      amount,
    };
  });

  totalAmount = parseFloat(totalAmount.toFixed(2));

  return {
    staffId: staff.id,
    employeeId: staff.employeeId,
    payGroupId: payGroup.id,
    payGroupName: payGroup.name,
    baseHourlyRate: baseRate,
    compoundLoadings: payGroup.compoundLoadings,
    shiftDate: date,
    shiftStart: formatTime(shiftStart),
    shiftEnd: formatTime(shiftEnd),
    grossHours: parseFloat(grossHours.toFixed(4)),
    breakMinutes,
    paidHours: parseFloat(paidHours.toFixed(4)),
    breakdown,
    totalAmount,
  };
}

/**
 * Recalculate wages for an existing shift and update the shift record.
 *
 * @param {string} organizationId
 * @param {string} shiftId
 * @returns {object} Updated shift with pay breakdown
 */
export async function recalculateShift(organizationId, shiftId) {
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, organizationId },
    include: { staff: true },
  });

  if (!shift) {
    throw new NotFoundError('Shift not found');
  }

  if (!shift.staffId) {
    throw new BadRequestError('Shift has no staff assigned — cannot calculate wages');
  }

  // Use actual times if available, otherwise scheduled times
  const start = shift.actualStart || shift.scheduledStart;
  const end = shift.actualEnd || shift.scheduledEnd;
  const shiftDate = start.toISOString().split('T')[0];
  const startTime = formatTime(start);
  const endTime = formatTime(end);

  const result = await calculateWage(organizationId, {
    staffId: shift.staffId,
    date: shiftDate,
    startTime,
    endTime,
    breakMinutes: shift.breakMinutes || 0,
  });

  // Determine the primary rate type from the breakdown
  const primaryRateType = determinePrimaryRateType(result.breakdown);

  // Update the shift with calculated values
  const updatedShift = await prisma.shift.update({
    where: { id: shiftId },
    data: {
      hourlyRate: result.baseHourlyRate,
      totalHours: result.paidHours,
      totalAmount: result.totalAmount,
      rateType: primaryRateType,
    },
  });

  return {
    shift: updatedShift,
    wageBreakdown: result,
  };
}

/**
 * Auto-calculate helper — called from shift service on create/update.
 * Returns the calculated fields to merge into the shift data.
 *
 * @param {string} organizationId
 * @param {object} shiftData - { staffId, scheduledStart, scheduledEnd, breakMinutes }
 * @returns {object} { hourlyRate, totalHours, totalAmount, rateType }
 */
export async function autoCalculateForShift(organizationId, shiftData) {
  const { staffId, scheduledStart, scheduledEnd, breakMinutes = 0 } = shiftData;

  if (!staffId) return null;

  // Check if staff has a pay group
  const staff = await prisma.staffMember.findFirst({
    where: { id: staffId, organizationId },
    include: { payGroup: true },
  });

  if (!staff || !staff.payGroup) return null;

  const start = new Date(scheduledStart);
  const end = new Date(scheduledEnd);
  const shiftDate = start.toISOString().split('T')[0];

  try {
    const result = await calculateWage(organizationId, {
      staffId,
      date: shiftDate,
      startTime: formatTime(start),
      endTime: formatTime(end),
      breakMinutes,
    });

    return {
      hourlyRate: result.baseHourlyRate,
      totalHours: result.paidHours,
      totalAmount: result.totalAmount,
      rateType: determinePrimaryRateType(result.breakdown),
    };
  } catch {
    // If calculation fails (e.g., no pay group), return null — don't block shift creation
    return null;
  }
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Split a shift into time segments based on:
 * - Calendar day boundaries (midnight crossings)
 * - Time-of-day boundaries (day/evening/night from pay group)
 * Each segment gets its own day multiplier and time loading.
 */
async function splitIntoSegments(organizationId, shiftStart, shiftEnd, payGroup, baseRate, orgState) {
  const segments = [];
  let current = new Date(shiftStart);

  const dayStart = parseTimeString(payGroup.dayStartTime || '06:00');
  const eveningStart = parseTimeString(payGroup.eveningStartTime || '20:00');
  const nightStart = parseTimeString(payGroup.nightStartTime || '00:00');
  const compounding = payGroup.compoundLoadings;

  while (current < shiftEnd) {
    // Determine the next boundary (midnight, or time-of-day boundary)
    const currentDate = new Date(current);
    const nextMidnight = getNextMidnight(current);
    const boundaries = getTimeBoundariesForDay(currentDate, dayStart, eveningStart);

    // Find the earliest boundary after `current` that's before shiftEnd
    let segmentEnd = new Date(Math.min(shiftEnd.getTime(), nextMidnight.getTime()));

    for (const boundary of boundaries) {
      if (boundary > current && boundary < segmentEnd) {
        segmentEnd = boundary;
      }
    }

    // Determine time type for this segment
    const segmentHour = current.getHours();
    const segmentMinute = current.getMinutes();
    const segmentTimeMinutes = segmentHour * 60 + segmentMinute;
    const timeType = getTimeType(segmentTimeMinutes, dayStart, eveningStart);

    // Determine day type (check public holiday first)
    const dayType = await getDayType(organizationId, current, orgState);

    // Get multiplier and loading
    const dayMultiplier = getDayMultiplier(dayType, payGroup);
    const timeLoadingPct = getTimeLoadingPct(timeType, payGroup);

    // Calculate effective rate
    const effectiveRate = calculateEffectiveRate(
      baseRate,
      dayMultiplier,
      timeLoadingPct,
      compounding
    );

    const hours = (segmentEnd - current) / (1000 * 60 * 60);

    if (hours > 0) {
      segments.push({
        period: `${formatTime(current)}-${formatTime(segmentEnd)}`,
        dayType,
        timeType,
        startTime: formatTime(current),
        endTime: formatTime(segmentEnd),
        hours,
        dayMultiplier,
        timeLoadingPct,
        effectiveRate: parseFloat(effectiveRate.toFixed(2)),
      });
    }

    current = segmentEnd;
  }

  return segments;
}

/**
 * Calculate effective hourly rate based on compound or highest-wins strategy
 */
function calculateEffectiveRate(baseRate, dayMultiplier, timeLoadingPct, compounding) {
  if (compounding) {
    // Additive compound: base × dayMultiplier + base × (loading/100)
    // e.g., Sunday 2.0× + evening 15% = base × (2.0 + 0.15) = base × 2.15
    return baseRate * (dayMultiplier + timeLoadingPct / 100);
  } else {
    // Highest wins: max of day multiplier vs time loading as multiplier
    const timeMultiplier = 1 + timeLoadingPct / 100;
    const effectiveMultiplier = Math.max(dayMultiplier, timeMultiplier);
    return baseRate * effectiveMultiplier;
  }
}

/**
 * Determine day type from date — checks public holiday, then day of week
 */
async function getDayType(organizationId, date, state) {
  const holiday = await checkIsPublicHoliday(organizationId, date, state);
  if (holiday) return 'PUBLIC_HOLIDAY';

  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
  if (dayOfWeek === 0) return 'SUNDAY';
  if (dayOfWeek === 6) return 'SATURDAY';
  return 'WEEKDAY';
}

/**
 * Get day multiplier from pay group based on day type
 */
function getDayMultiplier(dayType, payGroup) {
  switch (dayType) {
    case 'PUBLIC_HOLIDAY':
      return parseFloat(payGroup.holidayMultiplier);
    case 'SUNDAY':
      return parseFloat(payGroup.sundayMultiplier);
    case 'SATURDAY':
      return parseFloat(payGroup.saturdayMultiplier);
    default:
      return 1.0;
  }
}

/**
 * Determine time type (day/evening/night) from minutes since midnight
 */
function getTimeType(timeMinutes, dayStart, eveningStart) {
  // dayStart = e.g. 360 (06:00), eveningStart = e.g. 1200 (20:00)
  // Night: 00:00 → dayStart
  // Day: dayStart → eveningStart
  // Evening: eveningStart → 24:00

  if (timeMinutes >= dayStart && timeMinutes < eveningStart) {
    return 'DAY';
  } else if (timeMinutes >= eveningStart) {
    return 'EVENING';
  } else {
    return 'NIGHT'; // 00:00 to dayStart
  }
}

/**
 * Get time-of-day loading percentage from pay group
 */
function getTimeLoadingPct(timeType, payGroup) {
  switch (timeType) {
    case 'EVENING':
      return parseFloat(payGroup.eveningLoadingPct);
    case 'NIGHT':
      return parseFloat(payGroup.nightLoadingPct);
    default:
      return 0;
  }
}

/**
 * Get time-of-day boundaries for a given calendar day
 */
function getTimeBoundariesForDay(date, dayStartMinutes, eveningStartMinutes) {
  const d = new Date(date);
  const boundaries = [];

  // Day start boundary
  const dayBoundary = new Date(d);
  dayBoundary.setHours(Math.floor(dayStartMinutes / 60), dayStartMinutes % 60, 0, 0);
  boundaries.push(dayBoundary);

  // Evening start boundary
  const eveningBoundary = new Date(d);
  eveningBoundary.setHours(Math.floor(eveningStartMinutes / 60), eveningStartMinutes % 60, 0, 0);
  boundaries.push(eveningBoundary);

  return boundaries;
}

function getNextMidnight(date) {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}

function parseTimeString(timeStr) {
  // "HH:MM" → minutes since midnight
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function parseShiftDateTime(date, time, referenceStart = null) {
  const dt = new Date(`${date}T${time}:00`);

  // If end time is before start time, it crosses midnight — add a day
  if (referenceStart && dt <= referenceStart) {
    dt.setDate(dt.getDate() + 1);
  }

  return dt;
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Determine the primary rate type from a wage breakdown.
 * Uses the segment with the most paid hours.
 */
function determinePrimaryRateType(breakdown) {
  if (!breakdown || breakdown.length === 0) return 'WEEKDAY_DAY';

  // Find segment with the most hours
  const primarySegment = breakdown.reduce((max, seg) =>
    seg.paidHours > max.paidHours ? seg : max
  );

  const { dayType, timeType } = primarySegment;

  if (dayType === 'PUBLIC_HOLIDAY') return 'PUBLIC_HOLIDAY';
  if (dayType === 'SUNDAY') return 'SUNDAY';
  if (dayType === 'SATURDAY') return 'SATURDAY';
  if (timeType === 'EVENING') return 'WEEKDAY_EVENING';
  if (timeType === 'NIGHT') return 'WEEKDAY_NIGHT';
  return 'WEEKDAY_DAY';
}

export default {
  calculateWage,
  recalculateShift,
  autoCalculateForShift,
};