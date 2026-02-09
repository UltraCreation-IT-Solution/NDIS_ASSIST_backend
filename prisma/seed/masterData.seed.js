/**
 * Master Data Seed
 * ================
 * Creates reference data used across the platform:
 * - NDIS Price Guide (2024-25 rates)
 * - Australian Public Holidays
 * 
 * This data is platform-wide (organizationId = null).
 */

/**
 * Seed NDIS Price Guide 2024-25
 */
async function seedNDISPriceGuide(prisma) {
  console.log('\n  📌 Creating NDIS Price Guide 2024-25...');

  const priceGuideItems = [
    // Personal Care Standard
    { supportItemNumber: '01_011_0107_1_1', supportItemName: 'Assistance With Self-Care Activities - Standard', registrationGroup: '0107', supportCategory: 'CORE', unit: 'H', priceWeekday: 67.56, priceWeekdayEvening: 74.39, priceWeekdayNight: 74.98, priceSaturday: 94.86, priceSunday: 122.16, pricePublicHoliday: 149.46 },
    
    // Personal Care High Intensity
    { supportItemNumber: '01_012_0107_1_1', supportItemName: 'Assistance With Self-Care Activities - High Intensity', registrationGroup: '0107', supportCategory: 'CORE', unit: 'H', priceWeekday: 74.68, priceWeekdayEvening: 82.21, priceWeekdayNight: 82.86, priceSaturday: 104.82, priceSunday: 134.96, pricePublicHoliday: 165.10 },
    
    // Sleepover
    { supportItemNumber: '01_010_0107_1_1', supportItemName: 'Night-Time Sleepover', registrationGroup: '0107', supportCategory: 'CORE', unit: 'EA', priceWeekday: 242.04, priceWeekdayEvening: null, priceWeekdayNight: null, priceSaturday: null, priceSunday: null, pricePublicHoliday: null },
    
    // Community Access
    { supportItemNumber: '04_104_0125_6_1', supportItemName: 'Access Community Social And Rec Activities - Standard', registrationGroup: '0125', supportCategory: 'CORE', unit: 'H', priceWeekday: 67.56, priceWeekdayEvening: 74.39, priceWeekdayNight: 74.98, priceSaturday: 94.86, priceSunday: 122.16, pricePublicHoliday: 149.46 },
    
    // Group Activities 1:2
    { supportItemNumber: '04_102_0125_6_1', supportItemName: 'Group Activities - 1:2 Ratio', registrationGroup: '0125', supportCategory: 'CORE', unit: 'H', priceWeekday: 33.78, priceWeekdayEvening: 37.20, priceWeekdayNight: 37.49, priceSaturday: 47.43, priceSunday: 61.08, pricePublicHoliday: 74.73 },
    
    // Group Activities 1:3
    { supportItemNumber: '04_103_0125_6_1', supportItemName: 'Group Activities - 1:3 Ratio', registrationGroup: '0125', supportCategory: 'CORE', unit: 'H', priceWeekday: 22.52, priceWeekdayEvening: 24.80, priceWeekdayNight: 24.99, priceSaturday: 31.62, priceSunday: 40.72, pricePublicHoliday: 49.82 },
    
    // Transport - Kilometres
    { supportItemNumber: '02_051_0108_1_1', supportItemName: 'Provider Travel - Kilometres', registrationGroup: '0108', supportCategory: 'CORE', unit: 'KM', priceWeekday: 0.97, priceWeekdayEvening: null, priceWeekdayNight: null, priceSaturday: null, priceSunday: null, pricePublicHoliday: null },
    
    // Transport Assistance
    { supportItemNumber: '02_050_0108_1_1', supportItemName: 'Transport Assistance', registrationGroup: '0108', supportCategory: 'CORE', unit: 'H', priceWeekday: 67.56, priceWeekdayEvening: 74.39, priceWeekdayNight: 74.98, priceSaturday: 94.86, priceSunday: 122.16, pricePublicHoliday: 149.46 },
    
    // Support Coordination Level 1
    { supportItemNumber: '07_001_0106_8_3', supportItemName: 'Support Coordination - Level 1', registrationGroup: '0106', supportCategory: 'CAPACITY_BUILDING', unit: 'H', priceWeekday: 65.47, priceWeekdayEvening: null, priceWeekdayNight: null, priceSaturday: null, priceSunday: null, pricePublicHoliday: null },
    
    // Support Coordination Level 2
    { supportItemNumber: '07_002_0106_8_3', supportItemName: 'Support Coordination - Level 2', registrationGroup: '0106', supportCategory: 'CAPACITY_BUILDING', unit: 'H', priceWeekday: 100.14, priceWeekdayEvening: null, priceWeekdayNight: null, priceSaturday: null, priceSunday: null, pricePublicHoliday: null },
    
    // Specialist Support Coordination
    { supportItemNumber: '07_004_0106_8_3', supportItemName: 'Specialist Support Coordination', registrationGroup: '0106', supportCategory: 'CAPACITY_BUILDING', unit: 'H', priceWeekday: 134.03, priceWeekdayEvening: null, priceWeekdayNight: null, priceSaturday: null, priceSunday: null, pricePublicHoliday: null },
    
    // Domestic Assistance
    { supportItemNumber: '01_020_0107_1_1', supportItemName: 'Assistance with Household Tasks', registrationGroup: '0107', supportCategory: 'CORE', unit: 'H', priceWeekday: 67.56, priceWeekdayEvening: 74.39, priceWeekdayNight: 74.98, priceSaturday: 94.86, priceSunday: 122.16, pricePublicHoliday: 149.46 },
    
    // Short Notice Cancellation
    { supportItemNumber: '01_019_0107_1_1', supportItemName: 'Short Notice Cancellation', registrationGroup: '0107', supportCategory: 'CORE', unit: 'H', priceWeekday: 67.56, priceWeekdayEvening: null, priceWeekdayNight: null, priceSaturday: null, priceSunday: null, pricePublicHoliday: null },
    
    // Provider Travel Labour
    { supportItemNumber: '01_799_0104_1_1', supportItemName: 'Provider Travel - Labour Costs', registrationGroup: '0104', supportCategory: 'CORE', unit: 'H', priceWeekday: 45.04, priceWeekdayEvening: null, priceWeekdayNight: null, priceSaturday: null, priceSunday: null, pricePublicHoliday: null },
  ];

  let count = 0;
  for (const item of priceGuideItems) {
    // Find existing or create new
    const existing = await prisma.ndisPriceGuideEntry.findFirst({
      where: { 
        organizationId: null, 
        supportItemNumber: item.supportItemNumber 
      }
    });

    if (existing) {
      await prisma.ndisPriceGuideEntry.update({
        where: { id: existing.id },
        data: {
          supportItemName: item.supportItemName,
          registrationGroup: item.registrationGroup,
          supportCategory: item.supportCategory,
          unit: item.unit,
          priceWeekday: item.priceWeekday,
          priceWeekdayEvening: item.priceWeekdayEvening,
          priceWeekdayNight: item.priceWeekdayNight,
          priceSaturday: item.priceSaturday,
          priceSunday: item.priceSunday,
          pricePublicHoliday: item.pricePublicHoliday,
        },
      });
    } else {
      await prisma.ndisPriceGuideEntry.create({
        data: {
          organizationId: null,
          supportItemNumber: item.supportItemNumber,
          supportItemName: item.supportItemName,
          registrationGroup: item.registrationGroup,
          supportCategory: item.supportCategory,
          unit: item.unit,
          priceWeekday: item.priceWeekday,
          priceWeekdayEvening: item.priceWeekdayEvening,
          priceWeekdayNight: item.priceWeekdayNight,
          priceSaturday: item.priceSaturday,
          priceSunday: item.priceSunday,
          pricePublicHoliday: item.pricePublicHoliday,
          isActive: true,
          effectiveFrom: new Date('2024-07-01'),
          effectiveTo: new Date('2025-06-30'),
        },
      });
    }
    count++;
  }

  console.log(`     ✓ ${count} NDIS Price Guide items created`);
  return priceGuideItems;
}

/**
 * Seed Australian Public Holidays
 */
async function seedPublicHolidays(prisma) {
  console.log('\n  📌 Creating Australian Public Holidays...');

  const holidays = [
    // 2024 Remaining
    { holidayName: 'Christmas Day', holidayDate: new Date('2024-12-25'), state: null, isNational: true },
    { holidayName: 'Boxing Day', holidayDate: new Date('2024-12-26'), state: null, isNational: true },

    // 2025 National
    { holidayName: "New Year's Day", holidayDate: new Date('2025-01-01'), state: null, isNational: true },
    { holidayName: 'Australia Day', holidayDate: new Date('2025-01-27'), state: null, isNational: true },
    { holidayName: 'Good Friday', holidayDate: new Date('2025-04-18'), state: null, isNational: true },
    { holidayName: 'Easter Saturday', holidayDate: new Date('2025-04-19'), state: null, isNational: true },
    { holidayName: 'Easter Monday', holidayDate: new Date('2025-04-21'), state: null, isNational: true },
    { holidayName: 'Anzac Day', holidayDate: new Date('2025-04-25'), state: null, isNational: true },
    { holidayName: "Queen's Birthday", holidayDate: new Date('2025-06-09'), state: null, isNational: true },
    { holidayName: 'Christmas Day', holidayDate: new Date('2025-12-25'), state: null, isNational: true },
    { holidayName: 'Boxing Day', holidayDate: new Date('2025-12-26'), state: null, isNational: true },

    // 2025 State-specific
    { holidayName: 'Canberra Day', holidayDate: new Date('2025-03-10'), state: 'ACT', isNational: false },
    { holidayName: 'Melbourne Cup Day', holidayDate: new Date('2025-11-04'), state: 'VIC', isNational: false },
    { holidayName: 'Adelaide Cup Day', holidayDate: new Date('2025-03-10'), state: 'SA', isNational: false },

    // 2026 National
    { holidayName: "New Year's Day", holidayDate: new Date('2026-01-01'), state: null, isNational: true },
    { holidayName: 'Australia Day', holidayDate: new Date('2026-01-26'), state: null, isNational: true },
    { holidayName: 'Good Friday', holidayDate: new Date('2026-04-03'), state: null, isNational: true },
    { holidayName: 'Easter Monday', holidayDate: new Date('2026-04-06'), state: null, isNational: true },
    { holidayName: 'Anzac Day', holidayDate: new Date('2026-04-25'), state: null, isNational: true },
    { holidayName: "Queen's Birthday", holidayDate: new Date('2026-06-08'), state: null, isNational: true },
    { holidayName: 'Christmas Day', holidayDate: new Date('2026-12-25'), state: null, isNational: true },
    { holidayName: 'Boxing Day', holidayDate: new Date('2026-12-26'), state: null, isNational: true },
  ];

  let count = 0;
  for (const holiday of holidays) {
    // Find existing or create new
    const existing = await prisma.publicHoliday.findFirst({
      where: { 
        organizationId: null, 
        holidayDate: holiday.holidayDate,
        state: holiday.state,
      }
    });

    if (existing) {
      await prisma.publicHoliday.update({
        where: { id: existing.id },
        data: {
          holidayName: holiday.holidayName,
          isNational: holiday.isNational,
        },
      });
    } else {
      await prisma.publicHoliday.create({
        data: {
          organizationId: null,
          holidayName: holiday.holidayName,
          holidayDate: holiday.holidayDate,
          state: holiday.state,
          isNational: holiday.isNational,
        },
      });
    }
    count++;
  }

  console.log(`     ✓ ${count} Public Holidays created`);
  return holidays;
}

/**
 * Main seed function
 */
export async function seedMasterData(prisma) {
  console.log('\n════════════════════════════════════════');
  console.log('  📚 SEEDING MASTER DATA');
  console.log('════════════════════════════════════════');

  const results = {
    priceGuide: await seedNDISPriceGuide(prisma),
    holidays: await seedPublicHolidays(prisma),
  };

  console.log('\n════════════════════════════════════════');
  console.log('  ✅ MASTER DATA SEED COMPLETE');
  console.log('════════════════════════════════════════');
  console.log('\n  📊 Summary:');
  console.log('  ─────────────────────────────────────');
  console.log(`     NDIS Price Guide:  ${results.priceGuide.length} items`);
  console.log(`     Public Holidays:   ${results.holidays.length} items`);
  console.log('  ─────────────────────────────────────\n');

  return results;
}