import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { Patient, Appointment, Referral, DiagnosticRequest } from '../types';
import { 
  Heart, 
  Activity, 
  Droplet, 
  Calendar, 
  Video, 
  Layers, 
  FlaskConical, 
  Pill, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight,
  PhoneCall,
  FileText,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { ReferralTrackerStepper } from '../components/patient/ReferralTrackerStepper';
import { EmergencyModal } from '../components/common/EmergencyModal';
import { useNavigate } from 'react-router-dom';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticRequest[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [medicineQuery, setMedicineQuery] = useState('');
  const [medicineResults, setMedicineResults] = useState<any[]>([]);
  const [searchingMed, setSearchingMed] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPatientData = async () => {
    try {
      const patientsRes = await api.getPatients();
      const allPatients = patientsRes.patients || [];

      // Attempt to match logged in user's profile
      let targetPatient = null;
      if (user) {
        targetPatient = allPatients.find(p => 
          (user.phone && p.phone === user.phone) ||
          (user.name && p.name.trim().toLowerCase() === user.name.trim().toLowerCase())
        );
      }

      // If not matched, fallback to first patient in demo dataset
      if (!targetPatient && allPatients.length > 0) {
        targetPatient = allPatients.find(p => p.patientId === 'MH-THN-00101') || allPatients[0];
      }
      
      if (targetPatient) {
        const detailRes = await api.getPatientById(targetPatient.id);
        const pData = detailRes.patient;
        setPatient(pData);
        
        if (pData.appointments && pData.appointments.length > 0) {
          setAppointment(pData.appointments[0]);
        } else {
          setAppointment(null);
        }

        if (pData.referrals && pData.referrals.length > 0) {
          setReferral(pData.referrals[0]);
        } else {
          setReferral(null);
        }

        if (pData.diagnosticRequests) {
          setDiagnostics(pData.diagnosticRequests);
        } else {
          setDiagnostics([]);
        }

        if (pData.prescriptions) {
          setPrescriptions(pData.prescriptions);
        } else {
          setPrescriptions([]);
        }
      }
    } catch (err) {
      console.error('Error loading patient longitudinal profile:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadPatientData();
      setLoading(false);
    };

    init();

    const interval = setInterval(() => {
      loadPatientData();
    }, 6000);

    return () => clearInterval(interval);
  }, [user]);

  const handleSearchMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineQuery.trim()) return;
    setSearchingMed(true);
    try {
      const res = await api.searchMedicineAcrossFacilities(medicineQuery);
      setMedicineResults(res.facilitiesWithStock || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingMed(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 p-6 text-slate-500 text-xs">
        <div className="w-10 h-10 border-4 border-gov-navy border-t-transparent rounded-full animate-spin" />
        <p className="font-semibold">Loading patient longitudinal health profile...</p>
      </div>
    );
  }

  const latestVital = patient?.vitals && patient.vitals.length > 0
    ? patient.vitals[patient.vitals.length - 1]
    : null;

  const activePrescription = prescriptions.length > 0 ? prescriptions[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-gov-navy via-gov-blue to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-slate-700">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded">
              ABHA: {user?.abhaId || patient?.patientId || '91-4432-8819-2041'}
            </span>
            {patient?.pregnancyStatus && (
              <span className="text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 px-2.5 py-0.5 rounded-full">
                🤰 ANC High-Risk ({patient.gestationalWeeks || 28} Weeks)
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, {user?.name || patient?.name || 'Citizen'}
          </h1>
          
          <p className="text-xs text-slate-300">
            Village: <strong className="text-white">{patient?.village || 'Kalyan Rural'}</strong> • Primary Facility: <strong className="text-white">{user?.facilityName || patient?.facility?.name || 'PHC Kalyan Rural'}</strong> • Health ID: <strong className="text-white">{patient?.patientId || user?.abhaId || 'Active'}</strong>
          </p>
        </div>

        {/* Emergency Fast Escalation Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEmergencyOpen(true)}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-2xl shadow-xl shadow-red-950/40 flex items-center gap-2 transition animate-soft-pulse border border-red-400"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Emergency Help (108)</span>
          </button>
        </div>

      </div>

      {/* Health Vitals Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Blood Pressure */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Blood Pressure</span>
            <Heart className="w-4 h-4 text-red-500" />
          </div>
          {latestVital?.systolicBp && latestVital?.diastolicBp ? (
            <>
              <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
                {latestVital.systolicBp}/{latestVital.diastolicBp} <span className="text-xs text-slate-400 font-normal">mmHg</span>
              </div>
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${
                latestVital.systolicBp >= 140
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}>
                {latestVital.systolicBp >= 140 ? 'Elevated • Monitored' : 'Normal Range'}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-bold text-slate-400 font-mono py-1">
                Not Recorded
              </div>
              <div className="text-[10px] text-slate-400">
                Visit ASHA / PHC
              </div>
            </>
          )}
        </div>

        {/* Blood Glucose */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Blood Glucose</span>
            <Droplet className="w-4 h-4 text-purple-600" />
          </div>
          {latestVital?.bloodGlucose ? (
            <>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {latestVital.bloodGlucose} <span className="text-xs text-slate-400 font-normal">mg/dL</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                Fasting Level
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-bold text-slate-400 font-mono py-1">
                Not Recorded
              </div>
              <div className="text-[10px] text-slate-400">
                Routine Screening
              </div>
            </>
          )}
        </div>

        {/* SpO2 Level */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">SpO2 Oxygen</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          {latestVital?.spo2 ? (
            <>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {latestVital.spo2}%
              </div>
              <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                Optimal
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-bold text-slate-400 font-mono py-1">
                Not Recorded
              </div>
              <div className="text-[10px] text-slate-400">
                Pulse Oximetry
              </div>
            </>
          )}
        </div>

        {/* Current Medications */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Active Prescription</span>
            <Pill className="w-4 h-4 text-emerald-600" />
          </div>
          {activePrescription ? (
            <>
              <div className="text-xs font-bold text-slate-900 truncate">
                {activePrescription.medicineName} {activePrescription.dosage}
              </div>
              <div className="text-[10px] text-slate-500">
                {activePrescription.frequency} • {activePrescription.durationDays} Days
              </div>
            </>
          ) : (
            <>
              <div className="text-xs font-semibold text-slate-400 py-0.5">
                No active prescription
              </div>
              <div className="text-[10px] text-slate-400">
                Consult doctor for meds
              </div>
            </>
          )}
        </div>

      </div>

      {/* Main Grid: Upcoming Appointment & Referral Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Upcoming Appointment Card */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gov-navy" />
                <h3 className="font-bold text-base text-slate-900">Upcoming Consultation</h3>
              </div>
              {appointment && (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  appointment.urgency === 'HIGH' || appointment.urgency === 'EMERGENCY'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  {appointment.urgency}
                </span>
              )}
            </div>

            {appointment ? (
              <>
                <div className="bg-gov-ice p-4 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-500 font-semibold">Doctor Assigned</div>
                      <div className="font-bold text-sm text-gov-navy">{appointment.doctor?.name || 'Dr. Rajesh Kulkarni'}</div>
                      <div className="text-xs text-slate-600">{appointment.facility?.name || 'PHC Kalyan Rural Telemedicine Suite'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-semibold">Token Number</div>
                      <div className="text-xl font-black text-gov-navy font-mono">{appointment.tokenNumber}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200/60 text-xs">
                    <div>
                      <span className="text-slate-500">Queue Position:</span> <strong className="text-slate-900">{appointment.queuePosition || 1} in Line</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Status:</span> <strong className="text-amber-700">{appointment.status}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(patient?.id ? `/teleconsult?patientId=${patient.id}` : '/teleconsult')}
                  className="w-full py-3 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>Join Teleconsultation Session</span>
                </button>
              </>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2 text-xs">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-bold text-slate-700">No Consultations Scheduled</div>
                <p className="text-[11px] text-slate-500">
                  You do not have any pending appointments today. Visit your village ASHA worker to schedule an OPD or telemedicine appointment.
                </p>
              </div>
            )}
          </div>

          {/* Diagnostic Reports Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-gov-teal" />
                <h3 className="font-bold text-base text-slate-900">Verified Diagnostic Reports</h3>
              </div>
              <span className="text-[11px] text-slate-500">Public Health Lab</span>
            </div>

            {diagnostics.length > 0 ? (
              <div className="space-y-2.5">
                {diagnostics.map((d, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900">{d.testName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        d.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {d.reportFindings || 'Sample processing at clinical laboratory.'}
                    </p>
                    <div className="text-[10px] text-gov-blue font-semibold">
                      Verified by: {d.verifiedBy || 'Senior Lab Technician'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500 space-y-1">
                <FlaskConical className="w-6 h-6 text-slate-400 mx-auto" />
                <div>No diagnostic lab reports on file.</div>
              </div>
            )}
          </div>

        </div>

        {/* Right 7 Cols: Referral Stepper */}
        <div className="lg:col-span-7 space-y-6">
          {referral ? (
            <ReferralTrackerStepper referral={referral} />
          ) : (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2 text-xs">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-800">No Active Referral Handover</div>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                All primary consultations are handled locally at your registered PHC. If specialist escalation is needed, real-time tracking will appear here.
              </p>
            </div>
          )}

          {/* Find Medicine Across Facilities Tool */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">Find Medicine in Public Facilities</h3>
                  <p className="text-xs text-slate-500">Check real stock at nearby PHCs & Rural Hospitals before traveling</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSearchMedicine} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={medicineQuery}
                  onChange={(e) => setMedicineQuery(e.target.value)}
                  placeholder="Search drug (e.g. Labetalol, Paracetamol, Metformin, IFA)..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy focus:bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={searchingMed}
                className="px-4 py-2 bg-gov-navy hover:bg-gov-blue text-white text-xs font-bold rounded-xl shadow transition"
              >
                {searchingMed ? 'Searching...' : 'Check Stock'}
              </button>
            </form>

            {/* Medicine Results */}
            {medicineResults.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-700">Availability Across Government Network:</div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {medicineResults.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{item.facilityName}</div>
                        <div className="text-[11px] text-slate-500">{item.estimatedDistance} • {item.facilityType}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.stockStatus === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.stockStatus === 'LOW_STOCK'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.stockStatus === 'AVAILABLE' ? `🟢 ${item.quantity} in Stock` : item.stockStatus === 'LOW_STOCK' ? `🟡 Low Stock (${item.quantity})` : '🔴 Out of Stock'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Emergency Modal Component */}
      <EmergencyModal isOpen={emergencyOpen} onClose={() => setEmergencyOpen(false)} />

    </div>
  );
};
