const adminService = require('../services/admin.service');

class AdminController {
  async getHospitalDetails(req, res, next) {
    try {
      const details = await adminService.getHospitalDetails(req.user);
      res.json({ success: true, details });
    } catch (err) {
      next(err);
    }
  }

  async updateHospitalDetails(req, res, next) {
    try {
      const details = await adminService.updateHospitalDetails(req.user, req.body);
      res.json({ success: true, message: 'Hospital setup details updated successfully', details });
    } catch (err) {
      next(err);
    }
  }

  async getHospitalSchema(req, res, next) {
    try {
      const targetId = req.params.hospital_id || req.query.hospital_id || req.user?.hospitalId || req.user?.id;
      const schemaResult = await adminService.getHospitalSchema(req.user, targetId);
      res.json({ success: true, ...schemaResult });
    } catch (err) {
      next(err);
    }
  }

  async saveHospitalSchema(req, res, next) {
    try {
      const result = await adminService.saveHospitalSchema(req.user, req.body);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getDashboardSummary(req, res, next) {
    try {
      const summary = await adminService.getDashboardSummary(req.user);
      res.json({ success: true, summary });
    } catch (err) {
      next(err);
    }
  }

  async getBeds(req, res, next) {
    try {
      const hospitalId = req.user?.hospitalAdminProfile?.hospitalId || req.user?.hospitalId || req.user?.id;
      const beds = await adminService.getBeds(hospitalId);
      res.json({ success: true, beds });
    } catch (err) {
      next(err);
    }
  }

  async updateBed(req, res, next) {
    try {
      const updated = await adminService.updateBed(req.params.id, req.body);
      res.json({ success: true, message: 'Bed occupancy updated successfully', bed: updated });
    } catch (err) {
      next(err);
    }
  }

  async getPharmacy(req, res, next) {
    try {
      const pharmacy = await adminService.getPharmacy();
      res.json({ success: true, pharmacy });
    } catch (err) {
      next(err);
    }
  }

  async updatePharmacy(req, res, next) {
    try {
      const updated = await adminService.updatePharmacy(req.params.id, req.body);
      res.json({ success: true, message: 'Pharmacy stock updated successfully', item: updated });
    } catch (err) {
      next(err);
    }
  }

  async getStaff(req, res, next) {
    try {
      const hospitalId = req.user?.hospitalAdminProfile?.hospitalId || req.user?.hospitalId || 'hosp-apollo-greams';
      const staff = await adminService.getStaff(hospitalId);
      res.json({ success: true, staff });
    } catch (err) {
      next(err);
    }
  }

  async createStaff(req, res, next) {
    try {
      const staff = await adminService.createStaff(req.body, req.user);
      res.status(201).json({ success: true, message: 'Staff member registered successfully', staff });
    } catch (err) {
      next(err);
    }
  }

  async updateStaff(req, res, next) {
    try {
      const staff = await adminService.updateStaff(req.params.id, req.body);
      res.json({ success: true, message: 'Staff member updated successfully', staff });
    } catch (err) {
      next(err);
    }
  }

  async deleteStaff(req, res, next) {
    try {
      const staff = await adminService.deleteStaff(req.params.id);
      res.json({ success: true, message: 'Staff member removed successfully', staff });
    } catch (err) {
      next(err);
    }
  }

  async getDoctors(req, res, next) {
    try {
      const doctors = await adminService.getDoctors();
      res.json({ success: true, doctors });
    } catch (err) {
      next(err);
    }
  }

  async createDoctor(req, res, next) {
    try {
      const doctor = await adminService.createDoctor(req.body, req.user);
      const message = doctor.linked
        ? 'Existing doctor profile found and successfully linked to hospital'
        : 'Doctor profile created successfully and linked to hospital';
      res.status(201).json({ success: true, message, doctor });
    } catch (err) {
      next(err);
    }
  }

  async updateDoctor(req, res, next) {
    try {
      const doctor = await adminService.updateDoctor(req.params.id, req.body);
      res.json({ success: true, message: 'Doctor profile updated successfully', doctor });
    } catch (err) {
      next(err);
    }
  }

  async deleteDoctor(req, res, next) {
    try {
      const deleted = await adminService.deleteDoctor(req.params.id);
      res.json({ success: true, message: 'Doctor profile removed successfully', doctor: deleted });
    } catch (err) {
      next(err);
    }
  }

  async getPatients(req, res, next) {
    try {
      const patients = await adminService.getPatients();
      res.json({ success: true, patients });
    } catch (err) {
      next(err);
    }
  }

  async createPatient(req, res, next) {
    try {
      const patient = await adminService.createPatient(req.body);
      res.status(201).json({ success: true, message: 'Patient registered in hospital registry successfully', patient });
    } catch (err) {
      next(err);
    }
  }

  async getHospitalNetwork(req, res, next) {
    try {
      const network = await adminService.getHospitalNetwork();
      res.json({ success: true, network });
    } catch (err) {
      next(err);
    }
  }

  async createNetworkNode(req, res, next) {
    try {
      const node = await adminService.createNetworkNode(req.body);
      res.status(201).json({ success: true, message: 'Hospital network node connected successfully', node });
    } catch (err) {
      next(err);
    }
  }

  async getTriageQueue(req, res, next) {
    try {
      const hospitalId = req.user?.hospitalAdminProfile?.hospitalId || req.user?.hospitalId || 'hosp-apollo-greams';
      const queue = await adminService.getTriageQueue(hospitalId);
      res.json({ success: true, queue });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
