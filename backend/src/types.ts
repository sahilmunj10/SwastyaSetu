export type UserRole = 
  | 'PATIENT' 
  | 'ASHA' 
  | 'DOCTOR' 
  | 'LAB' 
  | 'PHARMACY' 
  | 'ADMIN' 
  | 'DISTRICT_OFFICER';

export type TriageRiskLevel = 'ROUTINE' | 'MODERATE' | 'HIGH' | 'EMERGENCY';

export type ReferralStatus = 
  | 'CREATED' 
  | 'SENT' 
  | 'ACCEPTED' 
  | 'SCHEDULED' 
  | 'ARRIVED' 
  | 'CONSULTED' 
  | 'FOLLOWUP_REQUIRED' 
  | 'CLOSED';

export type DiagnosticStatus = 
  | 'REQUESTED' 
  | 'SCHEDULED' 
  | 'SAMPLE_COLLECTED' 
  | 'PROCESSING' 
  | 'REPORT_READY' 
  | 'VERIFIED';

export type AppointmentStatus = 
  | 'WAITING' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'SKIPPED';

export type FollowUpStatus = 'PENDING' | 'OVERDUE' | 'COMPLETED' | 'CANCELLED';

export interface TriageInput {
  patientId: string;
  symptoms: string[];
  symptomDuration?: string;
  isPregnant?: boolean;
  gestationalWeeks?: number;
  systolicBp?: number;
  diastolicBp?: number;
  spo2?: number;
  heartRate?: number;
  temperature?: number;
  bloodGlucose?: number;
  notes?: string;
}

export interface TriageResult {
  riskLevel: TriageRiskLevel;
  ruleTriggered: string;
  clinicalReasoning: string;
  recommendedAction: string;
  urgencyLabel: string;
  disclaimer: string;
}
