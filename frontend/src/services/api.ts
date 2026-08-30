import { 
  User, 
  Patient, 
  Vital, 
  TriageAssessment, 
  Appointment, 
  Consultation, 
  Prescription, 
  Referral, 
  DiagnosticRequest, 
  Medicine, 
  FollowUp, 
  Notification, 
  AuditLog, 
  DashboardOverview 
} from '../types';

const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('swasthya_token');
  const demoRole = localStorage.getItem('swasthya_demo_role');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (demoRole) {
    headers['x-demo-role'] = demoRole;
  }

  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Server request failed');
  }

  return data as T;
}

export const api = {
  // Auth & User Profile
  register: (userData: { name: string; email: string; phone?: string; password: string; role: string; facilityId?: string }) =>
    request<{ token: string; user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  login: (credentials: { email: string; password?: string; role?: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  getCurrentUser: () => request<{ user: User }>('/auth/me'),

  updateProfile: (profileData: { name?: string; phone?: string; facilityId?: string }) =>
    request<{ user: User; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),

  getDemoAccounts: () => request<{ demoAccounts: any[] }>('/auth/demo-accounts'),

  // Facilities
  getFacilities: () => request<{ facilities: any[] }>('/facilities'),

  // Patients
  getPatients: (params?: { search?: string; village?: string; isPregnant?: boolean; facilityId?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.village) query.append('village', params.village);
    if (params?.isPregnant) query.append('isPregnant', 'true');
    if (params?.facilityId) query.append('facilityId', params.facilityId);
    return request<{ patients: Patient[] }>(`/patients?${query.toString()}`);
  },

  getPatientById: (id: string) => request<{ patient: Patient }>(`/patients/${id}`),

  createPatient: (patientData: any) =>
    request<{ patient: Patient; message: string }>('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    }),

  addVitals: (patientId: string, vitalsData: any) =>
    request<{ vital: Vital; message: string }>(`/patients/${patientId}/vitals`, {
      method: 'POST',
      body: JSON.stringify(vitalsData)
    }),

  syncOfflineBatch: (offlineQueue: any[]) =>
    request<{ syncedCount: number; results: any[]; message: string }>('/patients/sync-offline', {
      method: 'POST',
      body: JSON.stringify({ offlineQueue })
    }),

  // Triage
  evaluateTriage: (triageData: any) =>
    request<{ assessment: TriageAssessment; triageResult: any }>('/triage/evaluate', {
      method: 'POST',
      body: JSON.stringify(triageData)
    }),

  getTriageHistory: (patientId: string) =>
    request<{ assessments: TriageAssessment[] }>(`/triage/history/${patientId}`),

  // Appointments & Queue
  getAppointments: (params?: { facilityId?: string; doctorId?: string; patientId?: string; status?: string; date?: string }) => {
    const query = new URLSearchParams();
    if (params?.facilityId) query.append('facilityId', params.facilityId);
    if (params?.doctorId) query.append('doctorId', params.doctorId);
    if (params?.patientId) query.append('patientId', params.patientId);
    if (params?.status) query.append('status', params.status);
    if (params?.date) query.append('date', params.date);
    return request<{ appointments: Appointment[] }>(`/appointments?${query.toString()}`);
  },

  getLiveQueue: (facilityId?: string) => {
    const query = facilityId ? `?facilityId=${facilityId}` : '';
    return request<{
      today: string;
      totalWaiting: number;
      inConsultation: number;
      completedToday: number;
      queue: Appointment[];
    }>(`/appointments/queue/live${query}`);
  },

  bookAppointment: (data: any) =>
    request<{ appointment: Appointment; message: string }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateAppointmentStatus: (id: string, status: string, doctorId?: string) =>
    request<{ appointment: Appointment; message: string }>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, doctorId })
    }),

  // Teleconsultation
  completeTeleconsultation: (data: any) =>
    request<{
      consultation: Consultation;
      prescriptions: Prescription[];
      diagnostic: any;
      referral: any;
      message: string;
    }>('/teleconsult/complete', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Referrals
  getReferrals: (params?: { originFacilityId?: string; destinationFacilityId?: string; status?: string; priority?: string; patientId?: string }) => {
    const query = new URLSearchParams();
    if (params?.originFacilityId) query.append('originFacilityId', params.originFacilityId);
    if (params?.destinationFacilityId) query.append('destinationFacilityId', params.destinationFacilityId);
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.patientId) query.append('patientId', params.patientId);
    return request<{ referrals: Referral[] }>(`/referrals?${query.toString()}`);
  },

  createReferral: (data: any) =>
    request<{ referral: Referral; message: string }>('/referrals', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateReferralStage: (id: string, stage: string, notes?: string) =>
    request<{ referral: Referral; message: string }>(`/referrals/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage, notes })
    }),

  // Diagnostics
  getDiagnostics: (params?: { facilityId?: string; patientId?: string; status?: string; priority?: string }) => {
    const query = new URLSearchParams();
    if (params?.facilityId) query.append('facilityId', params.facilityId);
    if (params?.patientId) query.append('patientId', params.patientId);
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    return request<{ diagnostics: DiagnosticRequest[] }>(`/diagnostics?${query.toString()}`);
  },

  getTestCatalog: () => request<{ catalog: any[] }>('/diagnostics/catalog'),

  createDiagnosticRequest: (data: any) =>
    request<{ diagnostic: DiagnosticRequest; message: string }>('/diagnostics', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateDiagnosticStatus: (id: string, updateData: any) =>
    request<{ diagnostic: DiagnosticRequest; message: string }>(`/diagnostics/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    }),

  // Medicines
  getMedicines: (params?: { facilityId?: string; category?: string; search?: string; lowStockOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.facilityId) query.append('facilityId', params.facilityId);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.lowStockOnly) query.append('lowStockOnly', 'true');
    return request<{ medicines: Medicine[]; totalCount: number; lowStockCount: number }>(`/medicines?${query.toString()}`);
  },

  searchMedicineAcrossFacilities: (query: string) =>
    request<{ query: string; resultsCount: number; facilitiesWithStock: any[] }>(`/medicines/search?query=${encodeURIComponent(query)}`),

  updateMedicineStock: (id: string, data: { quantity?: number; reorderThreshold?: number; isAvailable?: boolean }) =>
    request<{ medicine: Medicine; message: string }>(`/medicines/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  // Follow-ups
  getFollowUps: (params?: { assignedWorkerId?: string; status?: string; category?: string; priority?: string; patientId?: string }) => {
    const query = new URLSearchParams();
    if (params?.assignedWorkerId) query.append('assignedWorkerId', params.assignedWorkerId);
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.patientId) query.append('patientId', params.patientId);
    return request<{
      followups: FollowUp[];
      pendingCount: number;
      overdueCount: number;
      completedCount: number;
    }>(`/followups?${query.toString()}`);
  },

  createFollowUp: (data: any) =>
    request<{ followUp: FollowUp; aiRiskAnalysis: any; message: string }>('/followups', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  completeFollowUp: (id: string, notes?: string) =>
    request<{ followUp: FollowUp; message: string }>(`/followups/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ notes })
    }),

  // Dashboard Overview
  getDashboardOverview: () => request<DashboardOverview>('/dashboard/overview'),

  // Notifications & Audit
  getNotifications: () => request<{ notifications: Notification[]; unreadCount: number }>('/notifications'),

  markNotificationRead: (id: string) => request<{ notification: Notification }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  getAuditLogs: (params?: { action?: string; entity?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.action) query.append('action', params.action);
    if (params?.entity) query.append('entity', params.entity);
    if (params?.limit) query.append('limit', String(params.limit));
    return request<{ logs: AuditLog[] }>(`/audit-logs?${query.toString()}`);
  }
};
