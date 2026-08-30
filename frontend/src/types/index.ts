export type UserRole = 
  | 'PATIENT' 
  | 'ASHA' 
  | 'DOCTOR' 
  | 'LAB' 
  | 'PHARMACY' 
  | 'ADMIN' 
  | 'DISTRICT_OFFICER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  facilityId?: string | null;
  facilityName?: string | null;
  facilityType?: string | null;
  abhaId?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'SUB_CENTRE' | 'PHC' | 'RURAL_HOSPITAL' | 'DISTRICT_HOSPITAL' | 'SPECIALTY_HOSPITAL';
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  bedCapacity: number;
  activeDoctors: number;
  activeServices: string[];
}

export interface Vital {
  id: string;
  patientId: string;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  heartRate?: number | null;
  spo2?: number | null;
  temperature?: number | null;
  bloodGlucose?: number | null;
  weight?: number | null;
  recordedBy: string;
  recordedRole: string;
  notes?: string | null;
  recordedAt: string;
}

export interface TriageAssessment {
  id: string;
  patientId: string;
  symptoms: string;
  symptomDuration?: string | null;
  ruleTriggered?: string | null;
  riskLevel: 'ROUTINE' | 'MODERATE' | 'HIGH' | 'EMERGENCY';
  clinicalReasoning: string;
  recommendedAction: string;
  assessedBy: string;
  assessedAt: string;
}

export interface Prescription {
  id: string;
  consultationId?: string | null;
  patientId: string;
  doctorId: string;
  doctor?: { id: string; name: string };
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string | null;
  createdAt: string;
}

export interface Consultation {
  id: string;
  appointmentId?: string | null;
  patientId: string;
  doctorId: string;
  doctor?: { id: string; name: string };
  facilityId: string;
  facility?: Facility;
  chiefComplaints: string;
  clinicalNotes: string;
  diagnosis: string;
  assessment?: string | null;
  followUpDate?: string | null;
  createdAt: string;
  prescriptions?: Prescription[];
}

export interface ReferralTimelineEvent {
  stage: string;
  timestamp: string;
  actor: string;
  notes: string;
}

export interface Referral {
  id: string;
  patientId: string;
  patient: Patient;
  referringDoctorId?: string | null;
  referringDoctor?: { id: string; name: string };
  originFacilityId: string;
  originFacility: Facility;
  destinationFacilityId: string;
  destinationFacility: Facility;
  reason: string;
  clinicalSummary: string;
  priority: 'ROUTINE' | 'HIGH' | 'EMERGENCY';
  status: 'CREATED' | 'SENT' | 'ACCEPTED' | 'SCHEDULED' | 'ARRIVED' | 'CONSULTED' | 'FOLLOWUP_REQUIRED' | 'CLOSED';
  trackingTimeline: string;
  parsedTimeline?: ReferralTimelineEvent[];
  createdDate: string;
  updatedDate: string;
}

export interface DiagnosticRequest {
  id: string;
  patientId: string;
  patient: Patient;
  doctorId?: string | null;
  doctor?: { id: string; name: string };
  facilityId: string;
  facility: Facility;
  testName: string;
  testCategory: string;
  priority: string;
  status: 'REQUESTED' | 'SCHEDULED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'REPORT_READY' | 'VERIFIED';
  sampleCollectedAt?: string | null;
  appointmentDate?: string | null;
  reportUrl?: string | null;
  reportFindings?: string | null;
  normalRange?: string | null;
  testValue?: string | null;
  isAbnormal: boolean;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  strength: string;
  dosageForm: string;
  facilityId: string;
  facility: Facility;
  quantity: number;
  reorderThreshold: number;
  batchNumber: string;
  expiryDate: string;
  isAvailable: boolean;
  stockStatus?: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  isLowStock?: boolean;
  lastRestockedAt: string;
}

export interface FollowUp {
  id: string;
  patientId: string;
  patient: Patient;
  assignedWorkerId?: string | null;
  assignedWorker?: { id: string; name: string; phone?: string };
  category: 'MATERNAL_ANC' | 'CHILD_IMMUNIZATION' | 'CHRONIC_DISEASE' | 'POST_REFERRAL' | 'SURGICAL_RECOVERY';
  description: string;
  dueDate: string;
  completedDate?: string | null;
  status: 'PENDING' | 'OVERDUE' | 'COMPLETED' | 'CANCELLED';
  priority: 'ROUTINE' | 'HIGH' | 'CRITICAL';
  aiRiskScore?: number | null;
  notes?: string | null;
  isPastDue?: boolean;
  effectiveStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patient: Patient;
  doctorId?: string | null;
  doctor?: { id: string; name: string; role?: string };
  facilityId: string;
  facility: Facility;
  tokenNumber: string;
  date: string;
  timeSlot: string;
  queuePosition: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'SKIPPED';
  mode: 'PHYSICAL' | 'TELECONSULTATION';
  urgency: 'ROUTINE' | 'MODERATE' | 'HIGH' | 'EMERGENCY';
  reason: string;
  estimatedWaitMins?: number;
  isNextInLine?: boolean;
  createdAt: string;
}

export interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  village: string;
  address: string;
  emergencyContact: string;
  pregnancyStatus: boolean;
  gestationalWeeks?: number | null;
  bloodGroup?: string | null;
  chronicConditions?: string | null;
  allergies?: string | null;
  registeredByAshaId?: string | null;
  registeredByAsha?: { id: string; name: string; phone?: string };
  facilityId?: string | null;
  facility?: Facility;
  createdAt: string;
  updatedAt: string;
  vitals?: Vital[];
  triageAssessments?: TriageAssessment[];
  healthRecords?: any[];
  appointments?: Appointment[];
  consultations?: Consultation[];
  prescriptions?: Prescription[];
  referrals?: Referral[];
  diagnosticRequests?: DiagnosticRequest[];
  followUps?: FollowUp[];
}

export interface Notification {
  id: string;
  userId?: string | null;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface DashboardOverview {
  kpis: {
    totalPatients: number;
    activeFacilities: number;
    teleconsultations: number;
    referralCompletionRate: string;
    averageWaitingTime: string;
    highRiskCases: number;
    pendingFollowups: number;
    medicineAlerts: number;
  };
  facilityScorecards: Array<{
    id: string;
    name: string;
    type: string;
    district: string;
    address: string;
    latitude: number;
    longitude: number;
    contactPhone: string;
    bedCapacity: number;
    activeDoctors: number;
    activeServices: string[];
    patientsToday: number;
    avgWaitMin: number;
    referralsCount: number;
    referralCompletionRate: number;
    medicineAlerts: number;
    diagnosticAvailability: string;
    overallQualityScore: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    registrations: number;
    teleconsults: number;
    referrals: number;
  }>;
  referralFunnel: Array<{
    stage: string;
    count: number;
  }>;
  diseaseDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}
