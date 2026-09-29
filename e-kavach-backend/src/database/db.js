const crypto = require('crypto');
const { seedRegistrations, seedHospitals, seedUsers, seedPatientProfiles, seedDoctorProfiles, seedHospitalAdminProfiles, seedEmergencyPass, seedAbhaAccounts, seedGovernmentSchemes, seedSchemeEnrollments, seedBeds, seedTriageEntries, seedStaffMembers, seedPharmacyItems, seedNetworkNodes, seedAppointments, seedMedicalRecords, seedConsentGrants, seedAccessLogs, HOSPITAL_SCHEMA_FIELDS, seedHospitalSchemaRecords } = require('./seedData');
const { encryptPII, decryptPII } = require('../utils/crypto');
const fs = require('fs');
const path = require('path');

const DB_FILE_PATH = path.join(__dirname, 'local_db.json');

/**
 * Normalization helpers for strict database constraint enforcement
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

function normalizeIdentifier(str) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().toUpperCase();
}

/**
 * Authoritative Database Table Constraints and Unique Indexes
 */
const DATABASE_TABLE_CONSTRAINTS = {
  user: [
    {
      name: 'uq_user_registration_id',
      fields: ['registration_id'],
      extract: (r) => normalizeIdentifier(r.registration_id),
      errorMessage: 'This registration ID is already registered.',
    },
    {
      name: 'uq_user_email',
      fields: ['email'],
      extract: (r) => normalizeEmail(r.email),
      errorMessage: 'An account with this email already exists.',
    },
    {
      name: 'uq_user_phone',
      fields: ['phone'],
      extract: (r) => normalizePhone(r.phone),
      errorMessage: 'This phone number is already registered.',
    },
  ],
  registration: [
    {
      name: 'pk_registration_id',
      fields: ['registration_id', 'id'],
      extract: (r) => normalizeIdentifier(r.registration_id || r.id),
      errorMessage: 'This registration ID is already registered.',
    },
    {
      name: 'uq_registration_auth_user_id',
      fields: ['auth_user_id'],
      extract: (r) => (r.auth_user_id ? String(r.auth_user_id).trim() : ''),
      errorMessage: 'User account is already registered.',
    },
    {
      name: 'uq_registration_email',
      fields: ['email'],
      extract: (r) => normalizeEmail(r.email),
      errorMessage: 'An account with this email already exists.',
    },
    {
      name: 'uq_registration_phone',
      fields: ['phone'],
      extract: (r) => normalizePhone(r.phone),
      errorMessage: 'This phone number is already registered.',
    },
  ],
  hospital: [
    {
      name: 'uq_hospital_registration_id',
      fields: ['registration_id'],
      extract: (r) => normalizeIdentifier(r.registration_id),
      errorMessage: 'This registration ID is already registered.',
    },
    {
      name: 'uq_hospital_code',
      fields: ['code'],
      extract: (r) => normalizeIdentifier(r.code),
      errorMessage: 'This registration number is already registered.',
    },
  ],
  hospitalSchemaRecords: [
    {
      name: 'uq_schema_registration_id',
      fields: ['registration_id'],
      extract: (r) => normalizeIdentifier(r.registration_id),
      errorMessage: 'This registration ID is already registered.',
    },
    {
      name: 'uq_schema_registration_number',
      fields: ['registration_number'],
      extract: (r) => normalizeIdentifier(r.registration_number),
      errorMessage: 'This registration number is already registered.',
    },
  ],
  doctorProfile: [
    {
      name: 'uq_doctor_user_id',
      fields: ['userId'],
      extract: (r) => (r.userId ? String(r.userId).trim() : ''),
      errorMessage: 'A doctor profile is already registered for this account.',
    },
    {
      name: 'uq_doctor_registration_id',
      fields: ['registration_id'],
      extract: (r) => normalizeIdentifier(r.registration_id),
      errorMessage: 'This registration ID is already registered.',
    },
    {
      name: 'uq_doctor_license',
      fields: ['nmcNumber', 'licenseId'],
      extract: (r) => normalizeIdentifier(r.nmcNumber || r.licenseId),
      errorMessage: 'This medical license number is already registered.',
    },
  ],
  patientProfile: [
    {
      name: 'uq_patient_user_id',
      fields: ['userId'],
      extract: (r) => (r.userId ? String(r.userId).trim() : ''),
      errorMessage: 'A patient profile is already registered for this account.',
    },
    {
      name: 'uq_patient_registration_id',
      fields: ['registration_id'],
      extract: (r) => normalizeIdentifier(r.registration_id),
      errorMessage: 'This registration ID is already registered.',
    },
    {
      name: 'uq_patient_abha',
      fields: ['abhaNumber'],
      extract: (r) => normalizeIdentifier(r.abhaNumber),
      errorMessage: 'This ABHA number is already registered.',
    },
    {
      name: 'uq_patient_aadhaar',
      fields: ['aadhaarNumber'],
      extract: (r) => (r.aadhaarNumber ? String(r.aadhaarNumber).replace(/\D/g, '') : ''),
      errorMessage: 'An account with this Aadhaar number already exists.',
    },
  ],
  hospitalAdminProfile: [
    {
      name: 'uq_admin_user_id',
      fields: ['userId'],
      extract: (r) => (r.userId ? String(r.userId).trim() : ''),
      errorMessage: 'A hospital admin profile is already registered for this account.',
    },
    {
      name: 'uq_admin_registration_id',
      fields: ['registration_id'],
      extract: (r) => normalizeIdentifier(r.registration_id),
      errorMessage: 'This registration ID is already registered.',
    },
  ],
};

/**
 * High-performance Persistent Local Repository Engine with Prisma Query Interface
 */
class InMemoryRepository {
  constructor() {
    this.HOSPITAL_SCHEMA_FIELDS = HOSPITAL_SCHEMA_FIELDS;
    this.loadFromDisk();
  }

  loadFromDisk() {
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
        this.data = JSON.parse(raw);
        console.log('✅ Connected to local disk database pipeline (local_db.json)');
        
        // Ensure all seed hospitals are present
        if (!this.data.hospital || !Array.isArray(this.data.hospital)) {
          this.data.hospital = JSON.parse(JSON.stringify(seedHospitals));
        } else {
          seedHospitals.forEach(sh => {
            if (!this.data.hospital.some(h => h.id === sh.id)) {
              this.data.hospital.push(JSON.parse(JSON.stringify(sh)));
            }
          });
        }

        // Ensure hospitalSchemaRecords is populated
        if (!this.data.hospitalSchemaRecords || !Array.isArray(this.data.hospitalSchemaRecords) || this.data.hospitalSchemaRecords.length === 0) {
          this.data.hospitalSchemaRecords = JSON.parse(JSON.stringify(seedHospitalSchemaRecords));
        } else {
          seedHospitalSchemaRecords.forEach(sr => {
            const matchIndex = this.data.hospitalSchemaRecords.findIndex(r => r.hospital_id === sr.hospital_id || r.id === sr.hospital_id);
            if (matchIndex === -1) {
              this.data.hospitalSchemaRecords.push(JSON.parse(JSON.stringify(sr)));
            }
          });
          // Guarantee each record has both id and hospital_id
          this.data.hospitalSchemaRecords.forEach(rec => {
            if (!rec.id) rec.id = rec.hospital_id;
            if (!rec.hospital_id) rec.hospital_id = rec.id;
          });
        }

        // Migrate and enforce registration integrity for all users and hospitals
        this._ensureRegistrationsAndIntegrity();
        this.saveToDisk();
        return;
      } catch (err) {
        console.warn('⚠️ Could not load existing local_db.json, re-initializing seed:', err.message);
      }
    }

    // Seed initial local database
    this.data = {
      registration: JSON.parse(JSON.stringify(seedRegistrations)),
      user: JSON.parse(JSON.stringify(seedUsers)),
      hospital: JSON.parse(JSON.stringify(seedHospitals)),
      hospitalSchemaRecords: JSON.parse(JSON.stringify(seedHospitalSchemaRecords)),
      patientProfile: JSON.parse(JSON.stringify(seedPatientProfiles)),
      doctorProfile: JSON.parse(JSON.stringify(seedDoctorProfiles)),
      hospitalAdminProfile: JSON.parse(JSON.stringify(seedHospitalAdminProfiles)),
      emergencyPass: JSON.parse(JSON.stringify(seedEmergencyPass)),
      abhaAccount: JSON.parse(JSON.stringify(seedAbhaAccounts)),
      governmentScheme: JSON.parse(JSON.stringify(seedGovernmentSchemes)),
      patientSchemeEnrollment: JSON.parse(JSON.stringify(seedSchemeEnrollments)),
      bed: JSON.parse(JSON.stringify(seedBeds)),
      triageEntry: JSON.parse(JSON.stringify(seedTriageEntries)),
      staffMember: JSON.parse(JSON.stringify(seedStaffMembers)),
      pharmacyItem: JSON.parse(JSON.stringify(seedPharmacyItems)),
      hospitalNetworkNode: JSON.parse(JSON.stringify(seedNetworkNodes)),
      appointment: JSON.parse(JSON.stringify(seedAppointments)),
      medicalRecord: JSON.parse(JSON.stringify(seedMedicalRecords)),
      consentGrant: JSON.parse(JSON.stringify(seedConsentGrants)),
      accessLog: JSON.parse(JSON.stringify(seedAccessLogs)),
      notification: [],
      conversation: [],
      message: [],
    };

    // Encrypt initial PII in patientProfile and abhaAccount
    this.data.patientProfile.forEach((p) => {
      p.abhaNumberEncrypted = encryptPII(p.abhaNumber);
    });
    this.data.abhaAccount.forEach((a) => {
      a.abhaNumberEncrypted = encryptPII(a.abhaNumber);
      a.linkedMobileEncrypted = encryptPII(a.linkedMobile);
    });

    this._safeDeduplicateLegacyRecords();
    this._ensureRegistrationsAndIntegrity();
    this.saveToDisk();
  }

  /**
   * Safe migration to inspect existing records for duplicates and resolve them without data loss.
   */
  _safeDeduplicateLegacyRecords() {
    if (!this.data.user || !Array.isArray(this.data.user)) return;

    // Check for duplicate normalized phones across existing user records
    const phoneMap = new Map();
    for (const u of this.data.user) {
      const p = normalizePhone(u.phone);
      if (!p) continue;
      if (phoneMap.has(p)) {
        const originalId = phoneMap.get(p);
        console.warn(`[SAFE MIGRATION] Conflicting phone ${p} detected between original ${originalId} and test record ${u.id}. Safely preserving both records by updating secondary test record.`);
        u.phone = `+91 ${p.slice(0, 5)}${Math.floor(10000 + Math.random() * 90000)}`;
      } else {
        phoneMap.set(p, u.id);
      }
    }

    // Synchronize registrations with users
    if (Array.isArray(this.data.registration)) {
      for (const reg of this.data.registration) {
        const matchingUser = this.data.user.find((u) => u.id === reg.auth_user_id || u.registration_id === reg.registration_id);
        if (matchingUser && matchingUser.phone) {
          reg.phone = matchingUser.phone;
        }
      }
    }
  }

  /**
   * Authoritative database-level uniqueness constraint validator.
   * Enforces UNIQUE constraints across single-table fields and cross-table registration bindings.
   */
  _validateUniqueConstraints(tableName, candidate, excludeId = null) {
    const tableConstraints = DATABASE_TABLE_CONSTRAINTS[tableName];
    const currentTable = this.data[tableName] || [];

    // 1. Table-level unique constraints
    if (tableConstraints && Array.isArray(tableConstraints)) {
      for (const constraint of tableConstraints) {
        const candidateVal = constraint.extract(candidate);
        if (!candidateVal) continue; // Empty/null optional fields don't collide

        const conflict = currentTable.find((existing) => {
          if (excludeId) {
            if (existing.id === excludeId) return false;
            if (existing.registration_id && existing.registration_id === excludeId) return false;
            if (existing.hospital_id && existing.hospital_id === excludeId) return false;
          }
          const existingVal = constraint.extract(existing);
          return existingVal && existingVal === candidateVal;
        });

        if (conflict) {
          const err = new Error(constraint.errorMessage);
          err.name = 'DatabaseConstraintError';
          err.code = 'SQLITE_CONSTRAINT_UNIQUE';
          err.statusCode = 409;
          err.table = tableName;
          err.constraint = constraint.name;
          err.field = constraint.fields[0];
          err.value = candidateVal;
          return err;
        }
      }
    }

    // 2. Cross-table registration uniqueness validation
    // Guarantees user and registration tables never accept conflicting accounts
    if (tableName === 'user') {
      const registrations = this.data.registration || [];
      const candEmail = normalizeEmail(candidate.email);
      const candPhone = normalizePhone(candidate.phone);
      const candRegId = normalizeIdentifier(candidate.registration_id);

      for (const r of registrations) {
        if (excludeId && (r.auth_user_id === excludeId || r.id === excludeId || r.registration_id === excludeId)) {
          continue;
        }
        if (candidate.id && (r.auth_user_id === candidate.id || r.id === candidate.id)) {
          continue;
        }
        if (candidate.registration_id && r.registration_id === candidate.registration_id) {
          continue;
        }
        if (candEmail && normalizeEmail(r.email) === candEmail) {
          const err = new Error('An account with this email already exists.');
          err.name = 'DatabaseConstraintError';
          err.code = 'SQLITE_CONSTRAINT_UNIQUE';
          err.statusCode = 409;
          return err;
        }
        if (candPhone && normalizePhone(r.phone) === candPhone) {
          const err = new Error('This phone number is already registered.');
          err.name = 'DatabaseConstraintError';
          err.code = 'SQLITE_CONSTRAINT_UNIQUE';
          err.statusCode = 409;
          return err;
        }
        if (candRegId && normalizeIdentifier(r.registration_id) === candRegId) {
          const err = new Error('This registration ID is already registered.');
          err.name = 'DatabaseConstraintError';
          err.code = 'SQLITE_CONSTRAINT_UNIQUE';
          err.statusCode = 409;
          return err;
        }
      }
    } else if (tableName === 'registration') {
      const users = this.data.user || [];
      const candEmail = normalizeEmail(candidate.email);
      const candPhone = normalizePhone(candidate.phone);
      const candRegId = normalizeIdentifier(candidate.registration_id);

      for (const u of users) {
        if (excludeId && (u.id === excludeId || u.registration_id === excludeId)) {
          continue;
        }
        if (candidate.auth_user_id && (u.id === candidate.auth_user_id || u.registration_id === candidate.registration_id)) {
          continue;
        }
        if (candEmail && normalizeEmail(u.email) === candEmail) {
          const err = new Error('An account with this email already exists.');
          err.name = 'DatabaseConstraintError';
          err.code = 'SQLITE_CONSTRAINT_UNIQUE';
          err.statusCode = 409;
          return err;
        }
        if (candPhone && normalizePhone(u.phone) === candPhone) {
          const err = new Error('This phone number is already registered.');
          err.name = 'DatabaseConstraintError';
          err.code = 'SQLITE_CONSTRAINT_UNIQUE';
          err.statusCode = 409;
          return err;
        }
        if (candRegId && normalizeIdentifier(u.registration_id) === candRegId) {
          const err = new Error('This registration ID is already registered.');
          err.name = 'DatabaseConstraintError';
          err.code = 'SQLITE_CONSTRAINT_UNIQUE';
          err.statusCode = 409;
          return err;
        }
      }
    } else if (tableName === 'hospital' || tableName === 'hospitalSchemaRecords') {
      const candCode = normalizeIdentifier(candidate.code || candidate.registration_number);
      const candRegId = normalizeIdentifier(candidate.registration_id);

      const hospitals = this.data.hospital || [];
      const schemas = this.data.hospitalSchemaRecords || [];

      if (candCode) {
        for (const h of hospitals) {
          if (excludeId && (h.id === excludeId || h.registration_id === excludeId)) continue;
          if (normalizeIdentifier(h.code) === candCode) {
            const err = new Error('This registration number is already registered.');
            err.name = 'DatabaseConstraintError';
            err.code = 'SQLITE_CONSTRAINT_UNIQUE';
            err.statusCode = 409;
            return err;
          }
        }
        for (const s of schemas) {
          if (excludeId && (s.hospital_id === excludeId || s.id === excludeId || s.registration_id === excludeId)) continue;
          if (normalizeIdentifier(s.registration_number) === candCode) {
            const err = new Error('This registration number is already registered.');
            err.name = 'DatabaseConstraintError';
            err.code = 'SQLITE_CONSTRAINT_UNIQUE';
            err.statusCode = 409;
            return err;
          }
        }
      }

      if (candRegId) {
        for (const h of hospitals) {
          if (excludeId && (h.id === excludeId || h.registration_id === excludeId)) continue;
          if (normalizeIdentifier(h.registration_id) === candRegId) {
            const err = new Error('This registration ID is already registered.');
            err.name = 'DatabaseConstraintError';
            err.code = 'SQLITE_CONSTRAINT_UNIQUE';
            err.statusCode = 409;
            return err;
          }
        }
        for (const s of schemas) {
          if (excludeId && (s.hospital_id === excludeId || s.id === excludeId || s.registration_id === excludeId)) continue;
          if (normalizeIdentifier(s.registration_id) === candRegId) {
            const err = new Error('This registration ID is already registered.');
            err.name = 'DatabaseConstraintError';
            err.code = 'SQLITE_CONSTRAINT_UNIQUE';
            err.statusCode = 409;
            return err;
          }
        }
      }
    }

    return null;
  }

  /**
   * Enforces referential integrity and guarantees unique registration_id on all accounts and hospital nodes
   */
  _ensureRegistrationsAndIntegrity() {
    if (!this.data.registration || !Array.isArray(this.data.registration)) {
      this.data.registration = [];
    }

    const regByAuthId = new Map(this.data.registration.map((r) => [r.auth_user_id, r]));
    const regById = new Map(this.data.registration.map((r) => [r.registration_id, r]));
    const seedRegByAuthId = new Map((seedRegistrations || []).map((r) => [r.auth_user_id, r]));

    // 1. Process all users and connect to registrations
    if (Array.isArray(this.data.user)) {
      for (const user of this.data.user) {
        let reg = regByAuthId.get(user.id);
        const seedReg = seedRegByAuthId.get(user.id);

        if (!reg && user.registration_id) {
          reg = regById.get(user.registration_id);
        }

        if (!reg) {
          const regId = user.registration_id || (seedReg ? seedReg.registration_id : `REG-${crypto.randomUUID().toUpperCase()}`);
          
          let profileName = user.email ? user.email.split('@')[0] : 'User';
          if (Array.isArray(this.data.patientProfile)) {
            const p = this.data.patientProfile.find((prof) => prof.userId === user.id);
            if (p?.name) profileName = p.name;
          }
          if (Array.isArray(this.data.doctorProfile)) {
            const d = this.data.doctorProfile.find((prof) => prof.userId === user.id);
            if (d?.name) profileName = d.name;
          }
          if (Array.isArray(this.data.hospitalAdminProfile)) {
            const h = this.data.hospitalAdminProfile.find((prof) => prof.userId === user.id);
            if (h?.name) profileName = h.name;
          }

          reg = {
            id: regId,
            registration_id: regId,
            auth_user_id: user.id,
            name: seedReg?.name || profileName,
            email: user.email,
            phone: user.phone || seedReg?.phone || '',
            role: user.role,
            status: user.status || 'ACTIVE',
            created_at: user.createdAt || seedReg?.created_at || new Date().toISOString(),
            updated_at: user.updatedAt || seedReg?.updated_at || new Date().toISOString(),
          };

          this.data.registration.push(reg);
          regByAuthId.set(user.id, reg);
          regById.set(regId, reg);
        }

        if (!user.registration_id) {
          user.registration_id = reg.registration_id;
        }
      }
    }

    // 2. Ensure each hospital has unique registration_id
    if (Array.isArray(this.data.hospital)) {
      this.data.hospital.forEach((h) => {
        if (!h.registration_id) {
          if (h.id === 'hosp-apollo-greams') h.registration_id = 'REG-HOSP-APOLLO-0842';
          else if (h.id === 'HOSP-1') h.registration_id = 'REG-HOSP-AIIMS-1001';
          else if (h.id === 'HOSP-2') h.registration_id = 'REG-HOSP-FORTIS-0002';
          else if (h.id === 'HOSP-3') h.registration_id = 'REG-HOSP-STANLEY-0003';
          else if (h.id === 'HOSP-4') h.registration_id = 'REG-HOSP-MANIPAL-0004';
          else h.registration_id = `REG-HOSP-${crypto.randomUUID().toUpperCase()}`;
        }
      });
    }

    if (Array.isArray(this.data.hospitalSchemaRecords)) {
      this.data.hospitalSchemaRecords.forEach((rec) => {
        if (!rec.registration_id) {
          const hosp = (this.data.hospital || []).find((h) => h.id === rec.hospital_id || h.id === rec.id || h.name === rec.hospital_name);
          rec.registration_id = hosp?.registration_id || (rec.hospital_id === 'hosp-apollo-greams' ? 'REG-HOSP-APOLLO-0842' : `REG-HOSP-${crypto.randomUUID().toUpperCase()}`);
        }
      });
    }

    // 3. Sync registration_id to patientProfile
    if (Array.isArray(this.data.patientProfile)) {
      this.data.patientProfile.forEach((p) => {
        const user = (this.data.user || []).find((u) => u.id === p.userId);
        if (user?.registration_id) {
          p.registration_id = user.registration_id;
          p.registrationId = user.registration_id;
        }
      });
    }

    // 4. Sync registration_id and hospitalRegistrationId to doctorProfile
    if (Array.isArray(this.data.doctorProfile)) {
      this.data.doctorProfile.forEach((d) => {
        const user = (this.data.user || []).find((u) => u.id === d.userId);
        if (user?.registration_id) {
          d.registration_id = user.registration_id;
          d.registrationId = user.registration_id;
        }
        if (!d.hospitalRegistrationId && d.hospitalAffiliation) {
          const hosp = (this.data.hospital || []).find((h) => h.id === d.hospitalAffiliation || h.name === d.hospitalAffiliation);
          if (hosp?.registration_id) d.hospitalRegistrationId = hosp.registration_id;
        }
      });
    }

    // 5. Sync registration_id and hospitalRegistrationId to hospitalAdminProfile
    if (Array.isArray(this.data.hospitalAdminProfile)) {
      this.data.hospitalAdminProfile.forEach((a) => {
        const user = (this.data.user || []).find((u) => u.id === a.userId);
        if (user?.registration_id) {
          a.registration_id = user.registration_id;
          a.registrationId = user.registration_id;
        }
        if (!a.hospitalRegistrationId) {
          const hosp = (this.data.hospital || []).find((h) => h.id === a.hospitalId);
          if (hosp?.registration_id) a.hospitalRegistrationId = hosp.registration_id;
        }
      });
    }
  }

  saveToDisk(immediate = false) {
    if (this._saveTimeout) {
      clearTimeout(this._saveTimeout);
      this._saveTimeout = null;
    }

    if (immediate) {
      try {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data), 'utf8');
      } catch (e) {
        console.error('❌ Failed writing local database state to disk:', e.message);
      }
      return;
    }

    this._saveTimeout = setTimeout(() => {
      this._saveTimeout = null;
      try {
        const payload = JSON.stringify(this.data);
        fs.writeFile(DB_FILE_PATH, payload, 'utf8', (err) => {
          if (err) console.error('❌ Failed writing local database state to disk:', err.message);
        });
      } catch (e) {
        console.error('❌ Failed serializing database state:', e.message);
      }
    }, 80);

    if (this._saveTimeout && typeof this._saveTimeout.unref === 'function') {
      this._saveTimeout.unref();
    }
  }

  _matchWhere(item, where) {
    if (!where) return true;
    for (const [key, value] of Object.entries(where)) {
      if (value === undefined) continue;

      if (key === 'OR' && Array.isArray(value)) {
        const matchesOr = value.some((subWhere) => this._matchWhere(item, subWhere));
        if (!matchesOr) return false;
        continue;
      }

      if (key === 'AND' && Array.isArray(value)) {
        const matchesAnd = value.every((subWhere) => this._matchWhere(item, subWhere));
        if (!matchesAnd) return false;
        continue;
      }

      if (typeof value === 'object' && value !== null) {
        if ('in' in value && Array.isArray(value.in)) {
          if (!value.in.includes(item[key])) return false;
        } else if ('contains' in value) {
          const itemVal = String(item[key] || '').toLowerCase();
          const searchVal = String(value.contains).toLowerCase();
          if (!itemVal.includes(searchVal)) return false;
        } else if ('equals' in value) {
          if (item[key] !== value.equals) return false;
        } else if ('mode' in value && value.mode === 'insensitive' && 'equals' in value) {
          if (String(item[key] || '').toLowerCase() !== String(value.equals || '').toLowerCase()) return false;
        }
      } else {
        const itemVal = item[key];
        // Handle id vs hospital_id interchangeability
        if (key === 'hospital_id' && item.hospital_id === undefined && item.id !== undefined) {
          if (item.id !== value) return false;
        } else if (key === 'id' && item.id === undefined && item.hospital_id !== undefined) {
          if (item.hospital_id !== value) return false;
        } else if (key === 'phone' || key === 'contact_number' || key === 'mobile') {
          const itemPhone = normalizePhone(itemVal);
          const searchPhone = normalizePhone(value);
          if (itemPhone && searchPhone && itemPhone === searchPhone) {
            continue;
          }
          if (itemVal !== value) return false;
        } else if (key === 'email') {
          const itemEmail = normalizeEmail(itemVal);
          const searchEmail = normalizeEmail(value);
          if (itemEmail && searchEmail && itemEmail === searchEmail) {
            continue;
          }
          if (itemVal !== value) return false;
        } else if (typeof itemVal === 'string' && typeof value === 'string') {
          if (itemVal.trim().toLowerCase() !== value.trim().toLowerCase() && itemVal !== value) {
            return false;
          }
        } else if (itemVal !== value) {
          return false;
        }
      }
    }
    return true;
  }

  _model(name) {
    let tableName = name;
    if (
      name === 'registration' ||
      name === 'registrations'
    ) {
      tableName = 'registration';
    } else if (
      name === 'hospitalSchema' ||
      name === 'hospitalSchemaRecord' ||
      name === 'hospitalSchemaRecords' ||
      name === 'hospital_schema' ||
      name === 'hospitalDetailsSchema'
    ) {
      tableName = 'hospitalSchemaRecords';
    }

    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }
    const currentTable = this.data[tableName];

    return {
      findUnique: async ({ where, include }) => {
        const found = currentTable.find((item) => this._matchWhere(item, where));
        return found ? this._attachRelations(name, JSON.parse(JSON.stringify(found)), include) : null;
      },
      findFirst: async ({ where, include, orderBy } = {}) => {
        let results = currentTable.filter((item) => this._matchWhere(item, where));
        if (orderBy) {
          results = this._sortResults(results, orderBy);
        }
        const found = results[0];
        return found ? this._attachRelations(name, JSON.parse(JSON.stringify(found)), include) : null;
      },
      findMany: async ({ where, include, orderBy, take, skip } = {}) => {
        let results = currentTable.filter((item) => this._matchWhere(item, where));
        if (orderBy) {
          results = this._sortResults(results, orderBy);
        }
        if (typeof skip === 'number') {
          results = results.slice(skip);
        }
        if (typeof take === 'number') {
          results = results.slice(0, take);
        }
        return results.map((item) => this._attachRelations(name, JSON.parse(JSON.stringify(item)), include));
      },
      create: async ({ data, include }) => {
        // 1. Auto-generate registration_id if not supplied (must never be client-only)
        if (tableName === 'registration' || tableName === 'user') {
          if (!data.registration_id) {
            data.registration_id = `REG-${crypto.randomUUID().toUpperCase()}`;
          }
          if (tableName === 'registration') {
            data.id = data.registration_id;
            data.created_at = data.created_at || new Date().toISOString();
            data.updated_at = new Date().toISOString();
          }
        } else if (tableName === 'hospital' || tableName === 'hospitalSchemaRecords') {
          if (!data.registration_id) {
            data.registration_id = `REG-HOSP-${crypto.randomUUID().toUpperCase()}`;
          }
        }

        // 2. Normalize email format if present
        if (data.email) {
          data.email = data.email.trim().toLowerCase();
        }

        // 3. Strict Database-Level Unique Constraint Enforcement
        const constraintViolation = this._validateUniqueConstraints(tableName, data);
        if (constraintViolation) {
          throw constraintViolation;
        }

        const newItem = {
          id: data.id || `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        currentTable.push(newItem);
        this.saveToDisk();
        return this._attachRelations(name, JSON.parse(JSON.stringify(newItem)), include);
      },
      update: async ({ where, data, include }) => {
        const index = currentTable.findIndex((item) => this._matchWhere(item, where));
        if (index === -1) {
          throw new Error(`Record to update not found in ${name}`);
        }
        const existingItem = currentTable[index];

        // Registration ID is immutable and can NEVER change after registration
        if (existingItem.registration_id && data.registration_id && data.registration_id !== existingItem.registration_id) {
          const err = new Error('Registration ID is immutable and cannot be changed.');
          err.statusCode = 400;
          throw err;
        }

        const candidate = {
          ...existingItem,
          ...data,
        };
        if (candidate.email) {
          candidate.email = candidate.email.trim().toLowerCase();
        }

        // Strict Database-Level Unique Constraint Enforcement for Updates
        const constraintViolation = this._validateUniqueConstraints(tableName, candidate, existingItem.id);
        if (constraintViolation) {
          throw constraintViolation;
        }

        currentTable[index] = {
          ...existingItem,
          ...data,
          updatedAt: new Date(),
        };
        this.saveToDisk();
        return this._attachRelations(name, JSON.parse(JSON.stringify(currentTable[index])), include);
      },
      upsert: async ({ where, create, update, include }) => {
        const index = currentTable.findIndex((item) => this._matchWhere(item, where));
        if (index === -1) {
          return this._model(name).create({ data: create, include });
        } else {
          return this._model(name).update({ where, data: update, include });
        }
      },
      delete: async ({ where }) => {
        const index = currentTable.findIndex((item) => this._matchWhere(item, where));
        if (index === -1) {
          throw new Error(`Record to delete not found in ${name}`);
        }
        const [deleted] = currentTable.splice(index, 1);
        this.saveToDisk();
        return deleted;
      },
      deleteMany: async ({ where }) => {
        const initialCount = currentTable.length;
        this.data[name] = currentTable.filter((item) => !this._matchWhere(item, where));
        this.saveToDisk();
        return { count: initialCount - this.data[name].length };
      },
      count: async ({ where } = {}) => {
        if (!where) return currentTable.length;
        return currentTable.filter((item) => this._matchWhere(item, where)).length;
      },
    };
  }

  _sortResults(results, orderBy) {
    if (!orderBy) return results;
    const [field, direction] = Object.entries(orderBy)[0] || [];
    if (!field) return results;
    return [...results].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (valA instanceof Date || (typeof valA === 'string' && !isNaN(Date.parse(valA)))) {
        valA = new Date(valA).getTime();
      }
      if (valB instanceof Date || (typeof valB === 'string' && !isNaN(Date.parse(valB)))) {
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return direction === 'desc' ? 1 : -1;
      if (valA > valB) return direction === 'desc' ? -1 : 1;
      return 0;
    });
  }

  _attachRelations(modelName, item, include) {
    if (!include || !item) return item;

    if (modelName === 'user') {
      if (include.registration) {
        item.registration = (this.data.registration || []).find((r) => r.auth_user_id === item.id || r.registration_id === item.registration_id) || null;
      }
      if (include.patientProfile) {
        item.patientProfile = this.data.patientProfile.find((p) => p.userId === item.id) || null;
      }
      if (include.doctorProfile) {
        item.doctorProfile = this.data.doctorProfile.find((d) => d.userId === item.id) || null;
      }
      if (include.hospitalAdminProfile) {
        item.hospitalAdminProfile = this.data.hospitalAdminProfile.find((h) => h.userId === item.id) || null;
      }
    } else if (modelName === 'registration' || modelName === 'registrations') {
      if (include.user) {
        item.user = (this.data.user || []).find((u) => u.id === item.auth_user_id || u.registration_id === item.registration_id) || null;
      }
      if (include.patientProfile) {
        item.patientProfile = (this.data.patientProfile || []).find((p) => p.userId === item.auth_user_id || p.registration_id === item.registration_id) || null;
      }
      if (include.doctorProfile) {
        item.doctorProfile = (this.data.doctorProfile || []).find((d) => d.userId === item.auth_user_id || d.registration_id === item.registration_id) || null;
      }
      if (include.hospitalAdminProfile) {
        item.hospitalAdminProfile = (this.data.hospitalAdminProfile || []).find((h) => h.userId === item.auth_user_id || h.registration_id === item.registration_id) || null;
      }
      if (include.hospital) {
        item.hospital = (this.data.hospital || []).find((h) => h.registration_id === item.registration_id || h.id === item.hospitalId) || null;
      }
    } else if (modelName === 'patientProfile') {
      if (include.emergencyPass) {
        item.emergencyPass = this.data.emergencyPass.find((e) => e.patientProfileId === item.id) || null;
      }
      if (include.abhaAccount) {
        item.abhaAccount = this.data.abhaAccount.find((a) => a.patientProfileId === item.id) || null;
      }
      if (include.user) {
        item.user = this.data.user.find((u) => u.id === item.userId) || null;
      }
    } else if (modelName === 'doctorProfile') {
      if (include.user) {
        item.user = this.data.user.find((u) => u.id === item.userId) || null;
      }
    } else if (modelName === 'hospitalAdminProfile') {
      if (include.user) {
        item.user = this.data.user.find((u) => u.id === item.userId) || null;
      }
      if (include.hospital) {
        item.hospital = this.data.hospital.find((h) => h.id === item.hospitalId) || null;
      }
    } else if (modelName === 'appointment') {
      if (include.doctorProfile) {
        item.doctorProfile = (this.data.doctorProfile || []).find((d) => 
          d.id === item.doctorProfileId || 
          d.userId === item.doctorProfileId || 
          d.registration_id === item.doctorProfileId ||
          (d.name && item.doctorProfileId && d.name.toLowerCase() === String(item.doctorProfileId).toLowerCase())
        ) || null;
      }
      if (include.patientProfile) {
        item.patientProfile = (this.data.patientProfile || []).find((p) => 
          p.id === item.patientProfileId || 
          p.userId === item.patientProfileId || 
          p.registration_id === item.patientProfileId
        ) || null;
      }
      if (include.hospital) {
        item.hospital = (this.data.hospital || []).find((h) => h.id === item.hospitalId || h.registration_id === item.hospitalId) || null;
      }
    }

    return item;
  }

  getHospitalSchema(hospitalId) {
    if (!this.data.hospitalSchemaRecords || !this.data.hospitalSchemaRecords.length) {
      this.data.hospitalSchemaRecords = JSON.parse(JSON.stringify(seedHospitalSchemaRecords));
    }
    if (!hospitalId) {
      return JSON.parse(JSON.stringify(this.data.hospitalSchemaRecords[0] || seedHospitalSchemaRecords[0]));
    }
    const rec = this.data.hospitalSchemaRecords.find(
      (h) =>
        h.hospital_id === hospitalId ||
        h.id === hospitalId ||
        h.registration_number === hospitalId ||
        (h.hospital_name && String(hospitalId).toLowerCase() === h.hospital_name.toLowerCase())
    );
    if (rec) return JSON.parse(JSON.stringify(rec));

    // Check if hospital exists in this.data.hospital
    const hosp = (this.data.hospital || []).find(h => h.id === hospitalId || (h.name && h.name.toLowerCase() === String(hospitalId).toLowerCase()));
    if (hosp) {
      return {
        hospital_id: hosp.id,
        id: hosp.id,
        registration_id: hosp.registration_id || `REG-${hosp.id}`,
        hospital_name: hosp.name,
        hospital_type: hosp.id.includes('STANLEY') || hosp.id.includes('AIIMS') ? 'Government' : 'Private',
        registration_number: hosp.code || `REG-${hosp.id}`,
        contact_number: hosp.contactNumbers?.er || '+91 44 2829 0200',
        email: 'info@hospital.org',
        website: '',
        address: hosp.address,
        city: hosp.city,
        district: hosp.city,
        state: hosp.state,
        pincode: hosp.pinCode,
        latitude: hosp.geoLat,
        longitude: hosp.geoLng,
        total_beds: hosp.wardBedsTotal || 350,
        available_beds: Math.max(10, (hosp.wardBedsTotal || 350) - (hosp.wardBedsOccupied || 280)),
        icu_beds: hosp.icuBedsTotal || 30,
        icu_available: Math.max(1, (hosp.icuBedsTotal || 30) - (hosp.icuBedsOccupied || 25)),
        emergency_beds: 12,
        emergency_available: 4,
        general_beds: Math.round((hosp.wardBedsTotal || 350) * 0.6),
        private_beds: Math.round((hosp.wardBedsTotal || 350) * 0.3),
        ambulance_count: 5,
        blood_bank_available: true,
        pharmacy_available: true,
        diagnostic_available: true,
        operation_theatre_count: 10,
        ventilator_count: 18,
        oxygen_beds: Math.round((hosp.wardBedsTotal || 350) * 0.3),
        specialities: hosp.departments || ['Emergency & Trauma', 'Critical Care'],
        services: ['24x7 Emergency Care', 'OPD Consultations', 'IPD Ward Inpatient', 'Pharmacy 24x7'],
        opening_time: '00:00',
        closing_time: '23:59',
        emergency_24x7: true,
        admin_name: 'Hospital Administrator',
        admin_phone: hosp.contactNumbers?.er || '+91 94440 28290',
        status: hosp.status || 'Approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // Fallback: return e-Kavach Universal Emergency Health & Trauma Hub
    const universalRecord = (this.data.hospitalSchemaRecords || []).find(r => r.hospital_id === 'hosp-universal-apex') || seedHospitalSchemaRecords[0];
    return JSON.parse(JSON.stringify(universalRecord));
  }

  saveHospitalSchema(schemaData = {}) {
    if (!this.data.hospitalSchemaRecords) {
      this.data.hospitalSchemaRecords = JSON.parse(JSON.stringify(seedHospitalSchemaRecords));
    }

    const hospital_id = schemaData.hospital_id || schemaData.id || `HOSP-${Date.now()}`;
    const existingIndex = this.data.hospitalSchemaRecords.findIndex(
      (h) =>
        h.hospital_id === hospital_id ||
        h.id === hospital_id ||
        (schemaData.registration_number && h.registration_number === schemaData.registration_number) ||
        (h.hospital_name && schemaData.hospital_name && h.hospital_name.toLowerCase() === schemaData.hospital_name.toLowerCase())
    );

    const existing = existingIndex !== -1 ? this.data.hospitalSchemaRecords[existingIndex] : null;
    const hospital_reg_id = schemaData.registration_id || existing?.registration_id || (hospital_id === 'hosp-apollo-greams' ? 'REG-HOSP-APOLLO-0842' : `REG-HOSP-${crypto.randomUUID().toUpperCase()}`);

    const normalizedRecord = {
      id: hospital_id,
      hospital_id,
      registration_id: hospital_reg_id,
      hospital_name: schemaData.hospital_name || existing?.hospital_name || 'Hospital Node',
      hospital_type: schemaData.hospital_type || existing?.hospital_type || 'Private',
      registration_number: schemaData.registration_number || existing?.registration_number || `REG-${Date.now().toString().slice(-6)}`,
      contact_number: schemaData.contact_number || existing?.contact_number || '+91 44 2829 0200',
      email: schemaData.email || existing?.email || 'admin@hospital.org',
      website: schemaData.website || existing?.website || '',
      address: schemaData.address || existing?.address || '',
      city: schemaData.city || existing?.city || 'Chennai',
      district: schemaData.district || existing?.district || 'Chennai',
      state: schemaData.state || existing?.state || 'Tamil Nadu',
      pincode: schemaData.pincode || schemaData.pinCode || existing?.pincode || '600001',
      latitude: parseFloat(schemaData.latitude) || existing?.latitude || 13.0604,
      longitude: parseFloat(schemaData.longitude) || existing?.longitude || 80.2496,
      total_beds: parseInt(schemaData.total_beds, 10) || existing?.total_beds || 100,
      available_beds: parseInt(schemaData.available_beds, 10) || existing?.available_beds || 40,
      icu_beds: parseInt(schemaData.icu_beds, 10) || existing?.icu_beds || 20,
      icu_available: parseInt(schemaData.icu_available, 10) || existing?.icu_available || 8,
      emergency_beds: parseInt(schemaData.emergency_beds, 10) || existing?.emergency_beds || 10,
      emergency_available: parseInt(schemaData.emergency_available, 10) || existing?.emergency_available || 4,
      general_beds: parseInt(schemaData.general_beds, 10) || existing?.general_beds || 50,
      private_beds: parseInt(schemaData.private_beds, 10) || existing?.private_beds || 20,
      ambulance_count: parseInt(schemaData.ambulance_count, 10) || existing?.ambulance_count || 3,
      blood_bank_available: schemaData.blood_bank_available !== undefined ? Boolean(schemaData.blood_bank_available) : (existing?.blood_bank_available ?? true),
      pharmacy_available: schemaData.pharmacy_available !== undefined ? Boolean(schemaData.pharmacy_available) : (existing?.pharmacy_available ?? true),
      diagnostic_available: schemaData.diagnostic_available !== undefined ? Boolean(schemaData.diagnostic_available) : (existing?.diagnostic_available ?? true),
      operation_theatre_count: parseInt(schemaData.operation_theatre_count, 10) || existing?.operation_theatre_count || 4,
      ventilator_count: parseInt(schemaData.ventilator_count, 10) || existing?.ventilator_count || 10,
      oxygen_beds: parseInt(schemaData.oxygen_beds, 10) || existing?.oxygen_beds || 30,
      specialities: Array.isArray(schemaData.specialities)
        ? schemaData.specialities
        : (typeof schemaData.specialities === 'string'
            ? schemaData.specialities.split(',').map((s) => s.trim()).filter(Boolean)
            : (existing?.specialities || ['Emergency & Trauma', 'Critical Care', 'Cardiology'])),
      services: Array.isArray(schemaData.services)
        ? schemaData.services
        : (typeof schemaData.services === 'string'
            ? schemaData.services.split(',').map((s) => s.trim()).filter(Boolean)
            : (existing?.services || ['Emergency', 'OPD', 'IPD', 'Lab', 'Pharmacy'])),
      opening_time: schemaData.opening_time || existing?.opening_time || '00:00',
      closing_time: schemaData.closing_time || existing?.closing_time || '23:59',
      emergency_24x7: schemaData.emergency_24x7 !== undefined ? Boolean(schemaData.emergency_24x7) : (existing?.emergency_24x7 ?? true),
      admin_name: schemaData.admin_name || existing?.admin_name || 'Hospital Administrator',
      admin_phone: schemaData.admin_phone || existing?.admin_phone || '+91 94440 28290',
      status: schemaData.status || existing?.status || 'Approved',
      created_at: existing?.created_at || schemaData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      this.data.hospitalSchemaRecords[existingIndex] = normalizedRecord;
    } else {
      this.data.hospitalSchemaRecords.push(normalizedRecord);
    }

    // Sync to this.data.hospital for unified state across the portal
    const hospIdx = this.data.hospital.findIndex(
      (h) => h.id === hospital_id || (h.name && h.name.toLowerCase() === normalizedRecord.hospital_name.toLowerCase())
    );
    const hospData = {
      id: hospital_id,
      registration_id: hospital_reg_id,
      name: normalizedRecord.hospital_name,
      code: normalizedRecord.registration_number,
      address: normalizedRecord.address,
      city: normalizedRecord.city,
      state: normalizedRecord.state,
      pinCode: normalizedRecord.pincode,
      geoLat: normalizedRecord.latitude,
      geoLng: normalizedRecord.longitude,
      departments: normalizedRecord.specialities,
      contactNumbers: {
        er: normalizedRecord.contact_number,
        email: normalizedRecord.email,
        ambulance: '108',
      },
      icuBedsTotal: normalizedRecord.icu_beds,
      icuBedsOccupied: Math.max(0, normalizedRecord.icu_beds - normalizedRecord.icu_available),
      wardBedsTotal: normalizedRecord.total_beds,
      wardBedsOccupied: Math.max(0, normalizedRecord.total_beds - normalizedRecord.available_beds),
      status: normalizedRecord.status === 'Approved' ? 'ACTIVE' : normalizedRecord.status.toUpperCase(),
      updatedAt: new Date(),
    };

    if (hospIdx !== -1) {
      this.data.hospital[hospIdx] = { ...this.data.hospital[hospIdx], ...hospData };
    } else {
      this.data.hospital.push({ ...hospData, createdAt: new Date() });
    }

    this.saveToDisk();
    return normalizedRecord;
  }

  get hospitalSchemaVariable() {
    const map = {};
    (this.data.hospitalSchemaRecords || []).forEach((r) => {
      map[r.hospital_id] = r;
      map[r.id] = r;
    });
    return map;
  }
}

const inMemoryDb = new InMemoryRepository();

inMemoryDb.normalizeEmail = normalizeEmail;
inMemoryDb.normalizePhone = normalizePhone;
inMemoryDb.normalizeIdentifier = normalizeIdentifier;

const db = new Proxy(inMemoryDb, {
  get(target, prop) {
    if (prop in target) {
      const val = target[prop];
      if (typeof val === 'function') {
        return val.bind(target);
      }
      return val;
    }
    // Model query proxy (e.g. db.user, db.hospitalSchema, etc.)
    return target._model(prop);
  },
});

db.normalizeEmail = normalizeEmail;
db.normalizePhone = normalizePhone;
db.normalizeIdentifier = normalizeIdentifier;

module.exports = db;
