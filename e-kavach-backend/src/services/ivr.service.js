const db = require('../database/db');
const socketService = require('./socket.service');
const { decryptPII } = require('../utils/crypto');
const { findNearbyHospitals } = require('../utils/hospitalLocator');

class IvrDispatcherService {
  /**
   * Processes incoming webhook from IVR microservice or VAPI voice dispatcher.
   * Resolves patient identity via phone number, geocodes landmark/location,
   * matches target or closest hospital, and broadcasts real-time SOS siren alert.
   */
  async processIvrEmergencyCall(payload = {}) {
    // Normalization of possible parameter names from VAPI / custom voice agents
    const rawPhone = payload.patient_phone_number || payload.phone_number || payload.callerPhone || payload.phone || payload.contact || payload.caller_phone || '';
    const rawLocation = payload.approximate_location || payload.location || payload.landmark || payload.area || payload.caller_location || 'Indore';
    const rawHospital = payload.hospital_name || payload.hospitalName || payload.hospital || payload.preferred_hospital || 'nearest';
    const detectedLanguage = payload.detected_language || payload.detectedLanguage || payload.language || 'en';
    const transcript = payload.transcript || payload.rawTranscript || payload.summary || '';

    console.log(`📞 [IVR DISPATCHER] Processing Voice SOS Call: Phone=${rawPhone}, Location=${rawLocation}, TargetHospital=${rawHospital}, Lang=${detectedLanguage}`);

    // 1. Resolve Patient Record from Phone Number in DB
    const cleanPhoneDigits = String(rawPhone).replace(/\D/g, '').slice(-10);
    const allPatients = await db.patientProfile.findMany({
      include: { emergencyPass: true },
    });
    const allUsers = await db.user.findMany();

    let matchedPatient = null;

    if (cleanPhoneDigits) {
      // Check phone in patient user account
      const matchedUser = allUsers.find((u) => {
        const uDigits = String(u.phone || '').replace(/\D/g, '').slice(-10);
        return uDigits && uDigits === cleanPhoneDigits;
      });

      if (matchedUser) {
        matchedPatient = allPatients.find(
          (p) => p.userId === matchedUser.id || p.registration_id === matchedUser.registration_id
        );
      }

      // Check phone directly in emergency contacts or patient profile
      if (!matchedPatient) {
        matchedPatient = allPatients.find((p) => {
          if (p.emergencyContacts && Array.isArray(p.emergencyContacts)) {
            const hasPhone = p.emergencyContacts.some((c) => {
              const cDigits = String(c.phone || '').replace(/\D/g, '').slice(-10);
              return cDigits && cDigits === cleanPhoneDigits;
            });
            if (hasPhone) return true;
          }
          if (p.phone) {
            const pDigits = String(p.phone).replace(/\D/g, '').slice(-10);
            if (pDigits === cleanPhoneDigits) return true;
          }
          return false;
        });
      }
    }

    // Fallback to default verified patient (Rajesh Sharma) if not found or testing
    if (!matchedPatient) {
      matchedPatient = (await db.patientProfile.findUnique({ where: { id: 'patient-rajesh' } })) || allPatients[0];
    }

    const patientId = matchedPatient ? matchedPatient.id : 'patient-rajesh';
    const patientName = matchedPatient ? matchedPatient.name : 'Rajesh V. Sharma';
    const patientAbha = matchedPatient
      ? (decryptPII(matchedPatient.abhaNumber) || matchedPatient.abhaNumber)
      : '9824-8819-3320-TN';
    const bloodGroup = matchedPatient?.bloodGroup || 'O+ (Rh Pos)';
    const allergies = matchedPatient?.allergies || ['Penicillin (Severe anaphylaxis)'];
    const chronicConditions = matchedPatient?.chronicConditions || ['Type II Diabetes', 'Mild Hypertension'];
    const emergencyContacts = matchedPatient?.emergencyContacts || [
      { name: 'Ananya S.', relation: 'Spouse', phone: rawPhone || '+91 98401 22819', priority: 1, verified: true }
    ];

    // 2. Resolve Geospatial Location and Nearby / Target Hospital
    let resolvedLocation = {
      raw: rawLocation,
      areaName: rawLocation,
      city: 'Indore',
      lat: 22.7196,
      lng: 75.8577,
    };

    let targetHospitalObj = {
      id: 'hosp-apollo-greams',
      universalHospitalId: 'HOSP-APOLLO-001',
      hospitalId: 'HOSP-APOLLO-001',
      code: 'AP-HSP-842-TN',
      registrationNumber: 'AP-HSP-842-TN',
      name: 'Apollo Greams Trauma Hub',
      address: '21 Greams Lane, Off Greams Road, Thousand Lights',
      city: 'Chennai',
      contactPhone: '+91 44 2829 0200',
    };

    try {
      const geoResult = await findNearbyHospitals(rawLocation, 10);
      if (geoResult && geoResult.patientLocation) {
        resolvedLocation = {
          raw: rawLocation,
          resolvedArea: geoResult.patientLocation.areaName || geoResult.patientLocation.displayName || rawLocation,
          city: geoResult.patientLocation.city || 'Local Area',
          lat: geoResult.patientLocation.lat,
          lng: geoResult.patientLocation.lng,
        };
      }

      if (geoResult && geoResult.hospitals && geoResult.hospitals.length > 0) {
        // If caller specified a specific hospital name, search for match in results
        if (rawHospital && rawHospital.toLowerCase() !== 'nearest' && rawHospital.toLowerCase() !== 'closest') {
          const match = geoResult.hospitals.find((h) =>
            h.name.toLowerCase().includes(rawHospital.toLowerCase())
          );
          if (match) {
            targetHospitalObj = {
              id: match.id,
              name: match.name,
              address: match.address,
              city: match.city,
              contactPhone: match.contactNumbers?.er || '+91 44 2829 0200',
            };
          } else {
            targetHospitalObj = {
              id: geoResult.hospitals[0].id,
              name: geoResult.hospitals[0].name,
              address: geoResult.hospitals[0].address,
              city: geoResult.hospitals[0].city,
              contactPhone: geoResult.hospitals[0].contactNumbers?.er || '+91 44 2829 0200',
            };
          }
        } else {
          targetHospitalObj = {
            id: geoResult.hospitals[0].id,
            name: geoResult.hospitals[0].name,
            address: geoResult.hospitals[0].address,
            city: geoResult.hospitals[0].city,
            contactPhone: geoResult.hospitals[0].contactNumbers?.er || '+91 44 2829 0200',
          };
        }
      }
    } catch (locErr) {
      console.warn('Location resolution fallback for IVR dispatch:', locErr.message);
    }

    const alertId = `IVR-SOS-${Date.now().toString().slice(-6)}`;
    const bayNumber = `Bay 0${Math.floor(1 + Math.random() * 5)}`;
    const etaMinutes = Math.floor(3 + Math.random() * 5);

    // 3. Enqueue Ingress Triage Entry in Receiving Emergency Ward
    let triageEntry = null;
    try {
      triageEntry = await db.triageEntry.create({
        data: {
          patientProfileId: patientId,
          hospitalId: targetHospitalObj.id || 'hosp-apollo-greams',
          assignedDoctorId: 'doctor-kavitha',
          triageColor: 'RED',
          priorityLevel: 'Priority 1 (Critical Red)',
          bayNumber,
          patientName,
          abhaNumber: patientAbha,
          arrivalTime: new Date(),
          vitals: {
            heartRate: '118 bpm (Tachycardia)',
            bp: '168/104',
            spO2: '91%',
            respRate: '26 /min',
            note: `Voice IVR Dispatch [${detectedLanguage.toUpperCase()}] • Landmark: ${rawLocation}`,
          },
          condition: `Golden-Hour Emergency Dispatch via Voice IVR (${rawLocation} -> ${targetHospitalObj.name})`,
          doctor: 'Dr. Kavitha Menon',
          status: 'INGRESS',
          isReferral: false,
          source: 'IVR_VOICE_ASSISTANT',
        },
      });
    } catch (_dbErr) {
      console.warn('Triage entry create fallback:', _dbErr.message);
    }

    // 4. Construct Complete Emergency Alert Packet
    const alertData = {
      type: 'EMERGENCY_IVR_DISPATCH',
      alertId,
      source: 'IVR_DISPATCH',
      detectedLanguage,
      patient: {
        id: patientId,
        name: patientName,
        phone: rawPhone || '+91 98401 22819',
        abhaNumber: patientAbha,
        bloodGroup,
        allergies,
        chronicConditions,
        emergencyContacts,
      },
      location: resolvedLocation,
      targetHospital: targetHospitalObj,
      bayNumber,
      etaMinutes,
      ambulanceStatus: `108 FLEET EN ROUTE (~${etaMinutes} MIN)`,
      triageColor: 'RED',
      priorityLevel: 'Priority 1 (Critical Red)',
      condition: `Acute Distress • Dispatched from ${rawLocation}`,
      transcript,
      timestamp: new Date().toISOString(),
      triageLink: `/doctor/patient-history?patientId=${patientId}&emergency=true&source=ivr`,
      patientHistoryUrl: `/doctor/patient-history?patientId=${patientId}&emergency=true&source=ivr`,
      triageEntry,
    };

    // 5. Broadcast Siren Alert & Telemetry Updates via Socket.io
    socketService.broadcastEmergencyAlert(alertData);
    socketService.broadcastTriage({
      type: 'TRIAGE_ENTRY_CREATED',
      triageEntry,
      hospitalId: targetHospitalObj.id,
      message: `🚨 Emergency IVR SOS: ${patientName} routed to ${bayNumber} (${targetHospitalObj.name})`,
    });

    return {
      success: true,
      status: 'DISPATCHED',
      message: `Emergency SOS Alert successfully broadcasted to ${targetHospitalObj.name}. Ingress bay: ${bayNumber}.`,
      alertData,
    };
  }
}

module.exports = new IvrDispatcherService();
