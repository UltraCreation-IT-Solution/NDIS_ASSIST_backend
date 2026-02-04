/**
 * Seed Orchestrator
 * =================
 * Runs all seed files in the correct order.
 * 
 * Usage:
 *   npm run seed                     # Run all seeds
 *   npm run seed -- --only platform  # Only platform data
 *   npm run seed -- --only master    # Only master data
 *   npm run seed -- --only demo      # Only demo organization
 *   npm run seed -- --reset          # Clear database and reseed
 *   npm run seed -- --help           # Show help
 */

import prisma from '../../../src/config/database.js';
import { seedPlatform } from './platform.seed.js';
import { seedMasterData } from './masterData.seed.js';
import { seedDemo } from './demo.seed.js';

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    help: args.includes('--help') || args.includes('-h'),
    reset: args.includes('--reset'),
    only: args.find((_, i, arr) => arr[i - 1] === '--only'),
  };
}

/**
 * Display help
 */
function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║              ndassist Database Seeder                      ║
╚════════════════════════════════════════════════════════════╝

Usage: npm run seed [options]

Options:
  --help, -h       Show this help message
  --reset          Clear all data before seeding
  --only <type>    Run only specific seed:
                     • platform  - Platform admins & settings
                     • master    - NDIS price guide, skills, holidays
                     • demo      - Demo organization with sample data

Examples:
  npm run seed                      # Run all seeds
  npm run seed -- --reset           # Clear database and reseed
  npm run seed -- --only platform   # Seed only platform data
  npm run seed -- --only master     # Seed only master data
  npm run seed -- --only demo       # Seed only demo organization

Seed Order:
  1. Platform  → Super Admin, Platform Settings, Feature Flags
  2. Master    → NDIS Price Guide, Skills, Public Holidays
  3. Demo      → Demo Organization with Staff, Clients, Shifts
`);
}

/**
 * Reset database - delete all data in correct order
 */
async function resetDatabase() {
  console.log('\n⚠️  Resetting database...');
  console.log('   This will delete ALL data. Please wait...\n');

  // Delete in reverse order of dependencies
  const deleteOperations = [
    // Notifications & Communication
    'notificationRecipient',
    'notification',
    'messageRecipient',
    'message',
    
    // Billing
    'payment',
    'invoiceItem',
    'invoice',
    'creditNoteItem',
    'creditNote',
    'payrollItem',
    'payrollRun',
    
    // Scheduling
    'progressNote',
    'clockEvent',
    'shiftSwapRequest',
    'recurringShiftException',
    'recurringShift',
    'shift',
    
    // Incidents
    'incidentFollowUp',
    'incident',
    
    // Staff
    'teamMember',
    'team',
    'staffSkill',
    'staffAvailability',
    'leaveRequest',
    'trainingRecord',
    'staffDocument',
    
    // Clients
    'clientNote',
    'goalMilestone',
    'clientGoal',
    'budgetLine',
    'fundingSource',
    'carePlan',
    'familyMember',
    'clientDocument',
    'serviceAgreementLine',
    'clientAgreement',
    'clientStaffPreference',
    'clientAssessment',
    
    // Forms
    'formSubmissionField',
    'formSubmission',
    'formField',
    'form',
    
    // Documents
    'documentVersion',
    'document',
    
    // Users & Auth
    'userInvitation',
    'userSession',
    'user',
    
    // Core
    'client',
    'staffMember',
    'serviceType',
    'organizationSettings',
    'organizationFeature',
    'organization',
    
    // Platform
    'platformAdminSession',
    'platformAdmin',
    'featureFlag',
    'systemSetting',
    'platformSettings',
    
    // Master Data
    'publicHoliday',
    'skill',
    'nDISPriceGuide',
    
    // System
    'auditLog',
    'activityLog',
  ];

  for (const table of deleteOperations) {
    try {
      if (prisma[table]) {
        await prisma[table].deleteMany();
        console.log(`   ✓ Cleared ${table}`);
      }
    } catch (error) {
      // Table might not exist or have dependencies
      console.log(`   ⚠ Skipped ${table}: ${error.message}`);
    }
  }

  console.log('\n   ✅ Database reset complete\n');
}

/**
 * Main seed function
 */
async function main() {
  const startTime = Date.now();
  const args = parseArgs();

  // Show help
  if (args.help) {
    showHelp();
    process.exit(0);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              ndassist Database Seeder                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Connect to database
    await prisma.$connect();
    console.log('\n✅ Connected to database');

    // Reset if requested
    if (args.reset) {
      await resetDatabase();
    }

    // Run seeds based on --only flag
    const results = {};

    if (!args.only || args.only === 'platform') {
      results.platform = await seedPlatform(prisma);
    }

    if (!args.only || args.only === 'master') {
      results.master = await seedMasterData(prisma);
    }

    if (!args.only || args.only === 'demo') {
      results.demo = await seedDemo(prisma);
    }

    // Final summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              🎉 SEEDING COMPLETE                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n   Duration: ${duration} seconds`);
    
    if (results.platform) {
      console.log('\n   📋 Platform Admin Credentials:');
      console.log('   ─────────────────────────────────────────────────────────');
      for (const admin of results.platform.admins) {
        console.log(`      ${admin.email}`);
        console.log(`      Password: ${admin.password}`);
        console.log('');
      }
    }

    if (results.demo) {
      console.log('   📋 Demo Organization Credentials:');
      console.log('   ─────────────────────────────────────────────────────────');
      console.log('      sarah.mitchell@careconnect.com.au');
      console.log('      Password: Demo@123');
      console.log('');
    }

    console.log('   ─────────────────────────────────────────────────────────');
    console.log('   Ready to start the application! 🚀\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run
main();