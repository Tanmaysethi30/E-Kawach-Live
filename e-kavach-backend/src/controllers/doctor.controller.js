const doctorService = require('../services/doctor.service');
const patientService = require('../services/patient.service');
const db = require('../database/db');

async function resolveDoctorId(req) {
  if (req.user?.doctorProfile?.id) {
    return req.user.doctorProfile.id;
  }
  if (req.user?.id) {
    const profile = await db.doctorProfile.findFirst({
      where: {
        OR: [{ userId: req.user.id }, { id: req.user.id }],
      },
    });
    if (profile) return profile.id;
    return req.user.id;
  }
  return null;
}

class DoctorController {
  async getMe(req, res, next) {
    try {
      const profile = await doctorService.getProfile(req.user.id);
      res.json({ success: true, profile });
    } catch (err) {
      next(err);
    }
  }

  async getTriageQueue(req, res, next) {
    try {
      const queue = await doctorService.getTriageQueue();
      res.json({ success: true, queue });
    } catch (err) {
      next(err);
    }
  }

  async scanPatient(req, res, next) {
    try {
      const result = await doctorService.scanPatient(req.body, req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async addPatient(req, res, next) {
    try {
      const result = await doctorService.addPatient(req.body, req.user);
      res.status(201).json({
        success: true,
        message: 'Patient registered and admitted to emergency queue',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getPatients(req, res, next) {
    try {
      const data = await doctorService.getPatients();
      res.json({ success: true, ...data });
    } catch (err) {
      next(err);
    }
  }

  async getNetwork(req, res, next) {
    try {
      const network = await doctorService.getNetworkNodes();
      res.json({ success: true, network });
    } catch (err) {
      next(err);
    }
  }

  async getCredentials(req, res, next) {
    try {
      const doctorId = await resolveDoctorId(req);
      const credentials = await doctorService.getCredentials(doctorId);
      res.json({ success: true, credentials });
    } catch (err) {
      next(err);
    }
  }

  async getAppointments(req, res, next) {
    try {
      const doctorId = await resolveDoctorId(req);
      const appointments = await doctorService.getAppointments(doctorId);
      res.json({ success: true, appointments });
    } catch (err) {
      next(err);
    }
  }

  async updateAppointmentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const appointment = await doctorService.updateAppointmentStatus(id, status);
      res.json({ success: true, message: `Appointment status updated to ${status}`, appointment });
    } catch (err) {
      next(err);
    }
  }

  async requestPatientAccess(req, res, next) {
    try {
      const { patientId } = req.body;
      const result = await doctorService.requestPatientAccess({ patientId, doctorUser: req.user });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async checkAccessStatus(req, res, next) {
    try {
      const { patientId } = req.params;
      const result = await doctorService.checkAccessStatus(patientId, req.user);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async issuePrescription(req, res, next) {
    try {
      const record = await doctorService.issuePrescription(req.body, req.user);
      res.status(201).json({ success: true, message: 'Prescription issued successfully', record });
    } catch (err) {
      next(err);
    }
  }

  async createReferral(req, res, next) {
    try {
      const result = await doctorService.createReferral(req.body, req.user);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getReferrals(req, res, next) {
    try {
      const doctorProfileId = (req.user && req.user.doctorProfile && req.user.doctorProfile.id) || req.user?.id || 'doctor-kavitha';
      const result = await doctorService.getReferrals(doctorProfileId);
      const allList = (result.outgoing || []).concat(result.incoming || []);
      res.json({ success: true, referrals: allList, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getPatientHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      const history = await doctorService.getPatientHistory(patientId, req.user, req.query);
      res.json({ success: true, ...history });
    } catch (err) {
      next(err);
    }
  }

  async emergencyBreakGlass(req, res, next) {
    try {
      const result = await doctorService.emergencyBreakGlass(req.body, req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async verifyRecord(req, res, next) {
    try {
      const { id } = req.params;
      const verifierName = req.user.doctorProfile?.name || req.user.name || 'Dr. Kavitha Menon';
      const record = await patientService.verifyRecord(id, {
        status: req.body.status || 'VERIFIED',
        verifierName,
        notes: req.body.notes,
      });
      res.json({ success: true, message: 'Document verification status updated', record });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DoctorController();
