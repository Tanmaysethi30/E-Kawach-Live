export interface IVREmergencyPayload {
  callerPhone: string;
  location: string;
  hospitalName?: string;
  detectedLanguage?: string;
  triagePriority?: string;
  condition?: string;
  rawTranscript?: string;
}

export interface EmergencyAlertData {
  type: string;
  alertId: string;
  source: 'IVR_DISPATCH' | 'WEB_SOS' | 'BREAK_GLASS' | 'REFERRAL';
  patient: {
    id: string;
    name: string;
    phone: string;
    abhaNumber: string;
    bloodGroup: string;
    allergies: string[];
    chronicConditions: string[];
    emergencyContacts: Array<{
      name: string;
      relation: string;
      phone: string;
      priority: number;
    }>;
  };
  location: {
    raw: string;
    resolvedArea?: string;
    city?: string;
    lat?: number;
    lng?: number;
  };
  targetHospital: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    contactPhone?: string;
  };
  bayNumber: string;
  etaMinutes: number;
  ambulanceStatus: string;
  triageColor: 'RED' | 'YELLOW' | 'GREEN';
  priorityLevel: string;
  condition: string;
  timestamp: string;
  triageLink: string;
  patientHistoryUrl: string;
}
