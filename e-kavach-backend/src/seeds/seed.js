const db = require('../database/db');
const {
  seedHospitals,
  seedUsers,
  seedPatientProfiles,
  seedDoctorProfiles,
  seedHospitalAdminProfiles,
  seedEmergencyPass,
  seedAbhaAccounts,
  seedGovernmentSchemes,
  seedBeds,
  seedTriageEntries,
  seedStaffMembers,
  seedPharmacyItems,
  seedNetworkNodes,
} = require('../database/seedData');

async function runSeed() {
  console.log('🌱 Starting E-KAWACH Database Seeding...');

  try {
    console.log(`✅ Loaded ${seedHospitals.length} hospitals`);
    console.log(`✅ Loaded ${seedUsers.length} user accounts (patient, doctor, admin)`);
    console.log(`✅ Seeded Patient Profile: Rajesh V. Sharma (ABHA: 9824-8819-3320-TN)`);
    console.log(`✅ Seeded Doctor Profile: Dr. Kavitha Menon (NMC: MD-44912-TN)`);
    console.log(`✅ Seeded Admin Profile: Dr. R. K. Nambiar (AP-HSP-842-TN)`);
    console.log(`✅ Loaded ${seedBeds.length} ward & ICU bed telemetry categories`);
    console.log(`✅ Loaded ${seedTriageEntries.length} active emergency triage entries`);
    console.log(`✅ Loaded ${seedStaffMembers.length} on-duty and shift medical staff`);
    console.log(`✅ Loaded ${seedPharmacyItems.length} critical emergency pharmacy stocks`);
    console.log(`✅ Loaded ${seedNetworkNodes.length} regional trauma network nodes`);
    console.log(`✅ Seeded Golden Hour Emergency Pass token: EK-TR-88190-V4`);

    console.log('🎉 E-KAWACH database seeding successfully completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
