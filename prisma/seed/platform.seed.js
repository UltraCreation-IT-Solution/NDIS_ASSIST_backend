/**
 * Platform Seed
 * =============
 * Creates the foundational platform data:
 * - Platform Admins (Super Admin, Support, Billing)
 * - Feature Flags
 * 
 * This MUST run first - without Super Admin, no one can login!
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Seed Platform Admins
 */
async function seedPlatformAdmins(prisma) {
  console.log('\n  📌 Creating Platform Admins...');

  const admins = [
    {
      email: 'superadmin@ndassist.com.au',
      password: 'SuperAdmin@123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
    },
    {
      email: 'support@ndassist.com.au',
      password: 'Support@123',
      firstName: 'Support',
      lastName: 'Team',
      role: 'PLATFORM_SUPPORT',
    },
    {
      email: 'billing@ndassist.com.au',
      password: 'Billing@123',
      firstName: 'Billing',
      lastName: 'Admin',
      role: 'PLATFORM_BILLING',
    },
  ];

  const created = [];

  for (const admin of admins) {
    const passwordHash = await bcrypt.hash(admin.password, SALT_ROUNDS);

    const record = await prisma.platformAdmin.upsert({
      where: { email: admin.email },
      update: {
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        isActive: true,
      },
      create: {
        email: admin.email,
        passwordHash,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        isActive: true,
      },
    });

    created.push({
      email: admin.email,
      password: admin.password,
      role: admin.role,
    });

    console.log(`     ✓ ${admin.role}: ${admin.email}`);
  }

  return created;
}

/**
 * Seed Feature Flags
 */
async function seedFeatureFlags(prisma) {
  console.log('\n  📌 Creating Feature Flags...');

  // Platform-wide feature flags (organizationId = null)
  const flags = [
    // Integrations
    { featureKey: 'XERO_INTEGRATION', isEnabled: true, metadata: { name: 'Xero Integration', category: 'INTEGRATION' } },
    { featureKey: 'MYOB_INTEGRATION', isEnabled: false, metadata: { name: 'MYOB Integration', category: 'INTEGRATION' } },
    { featureKey: 'PRODA_INTEGRATION', isEnabled: true, metadata: { name: 'PRODA Integration', category: 'INTEGRATION' } },

    // Communication
    { featureKey: 'SMS_NOTIFICATIONS', isEnabled: true, metadata: { name: 'SMS Notifications', category: 'COMMUNICATION' } },
    { featureKey: 'PUSH_NOTIFICATIONS', isEnabled: true, metadata: { name: 'Push Notifications', category: 'COMMUNICATION' } },
    { featureKey: 'EMAIL_DIGESTS', isEnabled: true, metadata: { name: 'Email Digests', category: 'COMMUNICATION' } },

    // Scheduling
    { featureKey: 'MOBILE_CLOCK_IN', isEnabled: true, metadata: { name: 'Mobile Clock In', category: 'SCHEDULING' } },
    { featureKey: 'GEOFENCING', isEnabled: true, metadata: { name: 'Geofencing', category: 'SCHEDULING' } },
    { featureKey: 'RECURRING_SHIFTS', isEnabled: true, metadata: { name: 'Recurring Shifts', category: 'SCHEDULING' } },
    { featureKey: 'SHIFT_SWAPPING', isEnabled: true, metadata: { name: 'Shift Swapping', category: 'SCHEDULING' } },
    { featureKey: 'AI_SCHEDULING', isEnabled: false, metadata: { name: 'AI Scheduling', category: 'SCHEDULING' } },

    // Billing
    { featureKey: 'BULK_INVOICING', isEnabled: true, metadata: { name: 'Bulk Invoicing', category: 'BILLING' } },
    { featureKey: 'AUTO_INVOICING', isEnabled: false, metadata: { name: 'Auto Invoicing', category: 'BILLING' } },
    { featureKey: 'PAYMENT_REMINDERS', isEnabled: true, metadata: { name: 'Payment Reminders', category: 'BILLING' } },

    // Documents
    { featureKey: 'DOCUMENT_OCR', isEnabled: false, metadata: { name: 'Document OCR', category: 'DOCUMENTS' } },
    { featureKey: 'E_SIGNATURES', isEnabled: true, metadata: { name: 'E-Signatures', category: 'DOCUMENTS' } },

    // Reports
    { featureKey: 'ADVANCED_REPORTS', isEnabled: true, metadata: { name: 'Advanced Reports', category: 'REPORTS' } },
    { featureKey: 'SCHEDULED_REPORTS', isEnabled: true, metadata: { name: 'Scheduled Reports', category: 'REPORTS' } },
    { featureKey: 'EXPORT_TO_EXCEL', isEnabled: true, metadata: { name: 'Export to Excel', category: 'REPORTS' } },

    // Client Portal
    { featureKey: 'CLIENT_PORTAL', isEnabled: false, metadata: { name: 'Client Portal', category: 'CLIENT' } },
    { featureKey: 'FAMILY_PORTAL', isEnabled: false, metadata: { name: 'Family Portal', category: 'CLIENT' } },

    // Forms
    { featureKey: 'CUSTOM_FORMS', isEnabled: true, metadata: { name: 'Custom Forms', category: 'FORMS' } },
    { featureKey: 'FORM_TEMPLATES', isEnabled: true, metadata: { name: 'Form Templates', category: 'FORMS' } },
  ];

  let count = 0;
  for (const flag of flags) {
    // Find existing or create new (handles nullable unique constraint)
    const existing = await prisma.featureFlag.findFirst({
      where: { 
        organizationId: null, 
        featureKey: flag.featureKey 
      }
    });

    if (existing) {
      await prisma.featureFlag.update({
        where: { id: existing.id },
        data: {
          isEnabled: flag.isEnabled,
          metadata: flag.metadata,
        },
      });
    } else {
      await prisma.featureFlag.create({
        data: {
          organizationId: null,
          featureKey: flag.featureKey,
          isEnabled: flag.isEnabled,
          metadata: flag.metadata,
        },
      });
    }
    count++;
  }

  console.log(`     ✓ ${count} feature flags created`);
  return flags;
}

/**
 * Main seed function
 */
export async function seedPlatform(prisma) {
  console.log('\n════════════════════════════════════════');
  console.log('  🚀 SEEDING PLATFORM DATA');
  console.log('════════════════════════════════════════');

  const results = {
    admins: await seedPlatformAdmins(prisma),
    featureFlags: await seedFeatureFlags(prisma),
  };

  console.log('\n════════════════════════════════════════');
  console.log('  ✅ PLATFORM SEED COMPLETE');
  console.log('════════════════════════════════════════');
  console.log('\n  📋 Login Credentials:');
  console.log('  ─────────────────────────────────────');
  for (const admin of results.admins) {
    const roleDisplay = admin.role.replace('PLATFORM_', '').replace('_', ' ');
    console.log(`  ${roleDisplay.padEnd(15)} ${admin.email}`);
    console.log(`                 Password: ${admin.password}`);
  }
  console.log('  ─────────────────────────────────────\n');

  return results;
}