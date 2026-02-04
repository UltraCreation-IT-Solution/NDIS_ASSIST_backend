/**
 * Demo Seed
 * =========
 * Creates a complete demo organization with realistic sample data.
 * Matches the actual Prisma schema structure.
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'Demo@123';

/**
 * Seed Demo Organization
 */
async function seedOrganization(prisma) {
  console.log('\n  📌 Creating Demo Organization...');

  const organization = await prisma.organization.upsert({
    where: { slug: 'careconnect-demo' },
    update: {},
    create: {
      name: 'CareConnect Disability Services',
      slug: 'careconnect-demo',
      email: 'admin@careconnect.com.au',
      phone: '+61 2 9000 1234',
      abn: '12345678901',
      ndisRegistrationNo: 'NDIS4123456789',
      addressLine1: '123 George Street',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      country: 'AU',
      timezone: 'Australia/Sydney',
      status: 'ACTIVE',
    },
  });

  // Create Subscription
  await prisma.subscription.upsert({
    where: { organizationId: organization.id },
    update: {},
    create: {
      organizationId: organization.id,
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      maxStaff: 50,
      maxClients: 200,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`     ✓ Organization: ${organization.name}`);
  return organization;
}

/**
 * Seed Service Types
 */
async function seedServiceTypes(prisma, organizationId) {
  console.log('\n  📌 Creating Service Types...');

  const serviceTypes = [
    { serviceCode: 'PC', serviceName: 'Personal Care', description: 'Assistance with daily personal activities', defaultRate: 67.56, supportItemNo: '01_011_0107_1_1' },
    { serviceCode: 'PC-HI', serviceName: 'Personal Care - High Intensity', description: 'Complex personal care', defaultRate: 74.68, supportItemNo: '01_012_0107_1_1' },
    { serviceCode: 'CA', serviceName: 'Community Access', description: 'Support to access community', defaultRate: 67.56, supportItemNo: '04_104_0125_6_1' },
    { serviceCode: 'DA', serviceName: 'Domestic Assistance', description: 'Help with household tasks', defaultRate: 67.56, supportItemNo: '01_020_0107_1_1' },
    { serviceCode: 'TR', serviceName: 'Transport', description: 'Transport to appointments', defaultRate: 67.56, supportItemNo: '02_050_0108_1_1' },
    { serviceCode: 'GA-2', serviceName: 'Group Activity (1:2)', description: 'Group activities 1:2 ratio', defaultRate: 33.78, supportItemNo: '04_102_0125_6_1' },
    { serviceCode: 'SC', serviceName: 'Support Coordination', description: 'Coordination of supports', defaultRate: 100.14, supportItemNo: '07_002_0106_8_3' },
    { serviceCode: 'SM', serviceName: 'Staff Meeting', description: 'Internal meetings', defaultRate: 0, supportItemNo: null },
  ];

  const created = [];
  for (const st of serviceTypes) {
    const record = await prisma.serviceType.upsert({
      where: { organizationId_serviceCode: { organizationId, serviceCode: st.serviceCode } },
      update: {},
      create: { ...st, organizationId, isActive: true },
    });
    created.push(record);
  }

  console.log(`     ✓ ${created.length} Service Types created`);
  return created;
}

/**
 * Seed Teams
 */
async function seedTeams(prisma, organizationId) {
  console.log('\n  📌 Creating Teams...');

  const teamsData = [
    { name: 'Sydney Metro Team', description: 'Sydney CBD, Inner West, Eastern Suburbs' },
    { name: 'Western Sydney Team', description: 'Parramatta, Blacktown, Penrith' },
    { name: 'Complex Care Team', description: 'High-intensity and complex care' },
  ];

  const teams = [];
  for (const team of teamsData) {
    const record = await prisma.team.create({ data: { ...team, organizationId } });
    teams.push(record);
  }

  console.log(`     ✓ ${teams.length} Teams created`);
  return teams;
}

/**
 * Seed Users and Staff Members
 */
async function seedStaff(prisma, organizationId, teams) {
  console.log('\n  📌 Creating Users & Staff Members...');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  const staffData = [
    { firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah.mitchell@careconnect.com.au', role: 'ORG_OWNER', employmentType: 'FULL_TIME', position: 'Managing Director', hourlyRate: 75.00, teamIndex: null },
    { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@careconnect.com.au', role: 'ADMIN', employmentType: 'FULL_TIME', position: 'Operations Manager', hourlyRate: 55.00, teamIndex: null },
    { firstName: 'Emily', lastName: 'Chen', email: 'emily.chen@careconnect.com.au', role: 'MANAGER', employmentType: 'FULL_TIME', position: 'Team Leader - Sydney', hourlyRate: 48.00, teamIndex: 0 },
    { firstName: 'Michael', lastName: 'Thompson', email: 'michael.thompson@careconnect.com.au', role: 'MANAGER', employmentType: 'FULL_TIME', position: 'Team Leader - Western', hourlyRate: 48.00, teamIndex: 1 },
    { firstName: 'Jessica', lastName: 'Patel', email: 'jessica.patel@careconnect.com.au', role: 'COORDINATOR', employmentType: 'FULL_TIME', position: 'Service Coordinator', hourlyRate: 42.00, teamIndex: 0 },
    { firstName: 'Emma', lastName: 'Williams', email: 'emma.williams@careconnect.com.au', role: 'SUPPORT_WORKER', employmentType: 'FULL_TIME', position: 'Senior Support Worker', hourlyRate: 36.00, teamIndex: 0 },
    { firstName: 'Oliver', lastName: 'Brown', email: 'oliver.brown@careconnect.com.au', role: 'SUPPORT_WORKER', employmentType: 'FULL_TIME', position: 'Support Worker', hourlyRate: 32.00, teamIndex: 0 },
    { firstName: 'Sophie', lastName: 'Taylor', email: 'sophie.taylor@careconnect.com.au', role: 'SUPPORT_WORKER', employmentType: 'PART_TIME', position: 'Support Worker', hourlyRate: 32.00, teamIndex: 0 },
    { firstName: 'Amelia', lastName: 'Garcia', email: 'amelia.garcia@careconnect.com.au', role: 'SUPPORT_WORKER', employmentType: 'FULL_TIME', position: 'Senior Support Worker', hourlyRate: 36.00, teamIndex: 1 },
    { firstName: 'Jack', lastName: 'Martinez', email: 'jack.martinez@careconnect.com.au', role: 'SUPPORT_WORKER', employmentType: 'FULL_TIME', position: 'Support Worker', hourlyRate: 32.00, teamIndex: 1 },
    { firstName: 'Mia', lastName: 'Lee', email: 'mia.lee@careconnect.com.au', role: 'SUPPORT_WORKER', employmentType: 'PART_TIME', position: 'Support Worker', hourlyRate: 32.00, teamIndex: 1 },
    { firstName: 'Charlotte', lastName: 'Moore', email: 'charlotte.moore@careconnect.com.au', role: 'SUPPORT_WORKER', employmentType: 'FULL_TIME', position: 'Complex Care Specialist', hourlyRate: 40.00, teamIndex: 2 },
  ];

  const staffMembers = [];
  const users = [];

  for (let i = 0; i < staffData.length; i++) {
    const s = staffData[i];
    
    // Create User first
    const user = await prisma.user.upsert({
      where: { organizationId_email: { organizationId, email: s.email } },
      update: {},
      create: {
        organizationId,
        email: s.email,
        passwordHash,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: `+61 400 ${String(100 + i).padStart(3, '0')} ${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        role: s.role,
        status: 'ACTIVE',
      },
    });
    users.push(user);

    // Create StaffMember linked to User
    const staff = await prisma.staffMember.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        organizationId,
        userId: user.id,
        employeeId: `EMP${String(1001 + i).padStart(4, '0')}`,
        position: s.position,
        employmentType: s.employmentType,
        employmentStatus: 'ACTIVE',
        hourlyRate: s.hourlyRate,
        startDate: new Date('2023-01-15'),
        hasNdisWorkerScreening: true,
        hasPoliceCheck: true,
        hasWorkingWithChildren: true,
        hasFirstAid: true,
      },
    });
    staffMembers.push(staff);

    // Add to Team
    if (s.teamIndex !== null && teams[s.teamIndex]) {
      await prisma.teamMember.create({
        data: {
          teamId: teams[s.teamIndex].id,
          staffId: staff.id,
        },
      });
    }
  }

  console.log(`     ✓ ${users.length} Users created`);
  console.log(`     ✓ ${staffMembers.length} Staff Members created`);

  return { staffMembers, users };
}

/**
 * Seed Clients
 */
async function seedClients(prisma, organizationId) {
  console.log('\n  📌 Creating Clients...');

  const clientsData = [
    { firstName: 'David', lastName: 'Harrison', ndisNumber: '430000001' },
    { firstName: 'Jennifer', lastName: 'Moore', ndisNumber: '430000002' },
    { firstName: 'Robert', lastName: 'Thompson', ndisNumber: '430000003' },
    { firstName: 'Amanda', lastName: 'Garcia', ndisNumber: '430000004' },
    { firstName: 'Christopher', lastName: 'Lee', ndisNumber: '430000005' },
    { firstName: 'Michelle', lastName: 'White', ndisNumber: '430000006' },
    { firstName: 'Daniel', lastName: 'Brown', ndisNumber: '430000007' },
    { firstName: 'Laura', lastName: 'Johnson', ndisNumber: '430000008' },
  ];

  const clients = [];

  for (let i = 0; i < clientsData.length; i++) {
    const c = clientsData[i];
    
    const client = await prisma.client.upsert({
      where: { organizationId_ndisNumber: { organizationId, ndisNumber: c.ndisNumber } },
      update: {},
      create: {
        organizationId,
        firstName: c.firstName,
        lastName: c.lastName,
        preferredName: c.firstName,
        email: `${c.firstName.toLowerCase()}.${c.lastName.toLowerCase()}@email.com`,
        phone: `+61 400 300 ${String(i + 1).padStart(3, '0')}`,
        dateOfBirth: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: ['Male', 'Female'][Math.floor(Math.random() * 2)],
        address: `${Math.floor(Math.random() * 200) + 1} Client Street`,
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        ndisNumber: c.ndisNumber,
        ndisPlanStartDate: new Date('2024-07-01'),
        ndisPlanEndDate: new Date('2025-06-30'),
        ndisPlanManager: 'Plan Partners',
        ndisPlanManagerEmail: 'claims@planpartners.com.au',
        status: 'ACTIVE',
      },
    });
    clients.push(client);

    // Create ClientGoal
    await prisma.clientGoal.create({
      data: {
        clientId: client.id,
        goalTitle: 'Increase independence in daily living',
        description: 'Work towards completing morning routine tasks independently',
        targetDate: new Date('2025-06-30'),
        status: 'IN_PROGRESS',
        progressPercentage: Math.floor(Math.random() * 50) + 10,
      },
    });
  }

  console.log(`     ✓ ${clients.length} Clients created`);
  console.log(`     ✓ Client goals created`);

  return clients;
}

/**
 * Seed Shifts
 */
async function seedShifts(prisma, organizationId, staffMembers, clients, serviceTypes) {
  console.log('\n  📌 Creating Shifts...');

  const supportWorkers = staffMembers.filter((_, i) => i >= 5);
  const billableServiceTypes = serviceTypes.filter(st => st.defaultRate > 0 && st.serviceCode !== 'SC');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let shiftCount = 0;

  // Generate shifts for past 2 weeks + next 2 weeks
  for (let dayOffset = -14; dayOffset <= 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    
    if (date.getDay() === 0) continue; // Skip Sundays

    const shiftsPerDay = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < shiftsPerDay; i++) {
      const client = clients[Math.floor(Math.random() * clients.length)];
      const staff = supportWorkers[Math.floor(Math.random() * supportWorkers.length)];
      const serviceType = billableServiceTypes[Math.floor(Math.random() * billableServiceTypes.length)];
      
      const startHour = 7 + Math.floor(Math.random() * 10);
      const duration = 60; // 1 hour default
      
      const scheduledStart = new Date(date);
      scheduledStart.setHours(startHour, 0, 0, 0);
      
      const scheduledEnd = new Date(scheduledStart);
      scheduledEnd.setMinutes(scheduledEnd.getMinutes() + duration);

      let status = 'PUBLISHED';
      let actualStart = null;
      let actualEnd = null;

      if (dayOffset < 0) {
        status = Math.random() > 0.05 ? 'COMPLETED' : 'CANCELLED';
        if (status === 'COMPLETED') {
          actualStart = new Date(scheduledStart);
          actualEnd = new Date(scheduledEnd);
        }
      }

      await prisma.shift.create({
        data: {
          organizationId,
          clientId: client.id,
          staffId: staff.id,
          serviceTypeId: serviceType.id,
          scheduledStart,
          scheduledEnd,
          actualStart,
          actualEnd,
          status,
          hourlyRate: serviceType.defaultRate,
          notes: `${serviceType.serviceName} for ${client.firstName}`,
        },
      });
      shiftCount++;
    }
  }

  console.log(`     ✓ ${shiftCount} Shifts created`);
  return { shiftCount };
}

/**
 * Main seed function
 */
export async function seedDemo(prisma) {
  console.log('\n════════════════════════════════════════');
  console.log('  🎯 SEEDING DEMO ORGANIZATION');
  console.log('════════════════════════════════════════');

  const organization = await seedOrganization(prisma);
  const serviceTypes = await seedServiceTypes(prisma, organization.id);
  const teams = await seedTeams(prisma, organization.id);
  const { staffMembers, users } = await seedStaff(prisma, organization.id, teams);
  const clients = await seedClients(prisma, organization.id);
  const shifts = await seedShifts(prisma, organization.id, staffMembers, clients, serviceTypes);

  console.log('\n════════════════════════════════════════');
  console.log('  ✅ DEMO SEED COMPLETE');
  console.log('════════════════════════════════════════');
  console.log('\n  📊 Summary:');
  console.log('  ─────────────────────────────────────');
  console.log(`     Organization:     ${organization.name}`);
  console.log(`     Service Types:    ${serviceTypes.length}`);
  console.log(`     Teams:            ${teams.length}`);
  console.log(`     Users:            ${users.length}`);
  console.log(`     Staff Members:    ${staffMembers.length}`);
  console.log(`     Clients:          ${clients.length}`);
  console.log(`     Shifts:           ${shifts.shiftCount}`);
  console.log('  ─────────────────────────────────────');
  console.log('\n  🔑 Demo Login:');
  console.log('  ─────────────────────────────────────');
  console.log(`     Email:    sarah.mitchell@careconnect.com.au`);
  console.log(`     Password: ${DEFAULT_PASSWORD}`);
  console.log('  ─────────────────────────────────────\n');

  return { organization, serviceTypes: serviceTypes.length, teams: teams.length, users: users.length, staff: staffMembers.length, clients: clients.length, shifts: shifts.shiftCount };
}