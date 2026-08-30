import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useOfflineSync } from '../contexts/OfflineSyncContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { api } from '../services/api';
import { Patient, FollowUp, TriageAssessment } from '../types';
import { 
  Users, 
  UserPlus, 
  Activity, 
  Stethoscope, 
  Bell, 
  Calendar, 
  Search, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Heart, 
  Phone, 
  ArrowRight,
  Sparkles,
  Mic,
  Video
} from 'lucide-react';
import { PatientRegisterModal } from '../components/asha/PatientRegisterModal';
import { VitalsModal } from '../components/asha/VitalsModal';
import { GuidedTriageModal } from '../components/asha/GuidedTriageModal';
import { useNavigate } from 'react-router-dom';

export const AshaDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isOnline, queueCount, syncNow, isSyncing, lastSyncMessage } = useOfflineSync();
  const { isListening, startListening } = useVoiceInput();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal triggers
  const [registerOpen, setRegisterOpen] = useState(false);
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [triageOpen, setTriageOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, fRes] = await Promise.all([
        api.getPatients(),
        api.getFollowUps()
      ]);
      setPatients(pRes.patients || []);
      setFollowups(fRes.followups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Real-time synchronization polling every 6 seconds
    const interval = setInterval(() => {
      loadData();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenVitals = (p: Patient) => {
    setSelectedPatient(p);
    setVitalsOpen(true);
  };

  const handleOpenTriage = (p: Patient) => {
    setSelectedPatient(p);
    setTriageOpen(true);
  };

  const handleCompleteFollowup = async (fId: string) => {
    try {
      await api.completeFollowUp(fId, 'Home visit completed by ASHA Sunita Gaikwad. Vitals observed.');
      setToastMessage('Follow-up task marked as completed!');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVoiceSearch = () => {
    startListening((text) => {
      setSearchQuery(text);
    });
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);
    const matchesVillage = selectedVillage === 'ALL' || p.village.includes(selectedVillage);
    return matchesSearch && matchesVillage;
  });

  const highRiskCount = patients.filter(p => p.pregnancyStatus || (p.vitals && p.vitals[0]?.systolicBp && p.vitals[0].systolicBp >= 140)).length;
  const overdueFollowups = followups.filter(f => f.status === 'OVERDUE' || (f.status === 'PENDING' && f.isPastDue));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gov-navy via-gov-blue to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-slate-700">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded">
              Frontline Healthcare Workstation
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {user?.facilityName || 'Kalyan Rural Cluster'} • ASHA Portal
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, {user?.name || 'Frontline Health Worker'} (ASHA Worker)
          </h1>

          <p className="text-xs text-slate-300">
            Assigned Facility: <strong className="text-white">{user?.facilityName || 'PHC Kalyan Rural'}</strong> • Registered Citizens: <strong className="text-white">{patients.length}</strong>
          </p>
        </div>

        {/* Quick Action Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setRegisterOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Citizen</span>
          </button>

          <button
            onClick={() => {
              if (patients.length > 0) {
                handleOpenTriage(patients[0]);
              } else {
                setRegisterOpen(true);
              }
            }}
            className="px-4 py-2.5 bg-gov-emerald hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Digital Triage</span>
          </button>
        </div>

      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold">Registered Citizens</div>
          <div className="text-2xl font-black text-slate-900 font-mono">{patients.length}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">Active in Cluster</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold">High-Risk Patients</div>
          <div className="text-2xl font-black text-amber-600 font-mono">{highRiskCount}</div>
          <div className="text-[10px] text-amber-800 font-semibold">ANC & NCD Priority</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold">Overdue Follow-ups</div>
          <div className="text-2xl font-black text-red-600 font-mono">{overdueFollowups.length}</div>
          <div className="text-[10px] text-red-700 font-semibold">Action Required</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold">Pending Referrals</div>
          <div className="text-2xl font-black text-gov-blue font-mono">2</div>
          <div className="text-[10px] text-blue-700 font-semibold">Thane District Hosp</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold">Home Visits Today</div>
          <div className="text-2xl font-black text-purple-600 font-mono">5</div>
          <div className="text-[10px] text-purple-700 font-semibold">3 Completed</div>
        </div>

        {/* Offline Sync Card */}
        <div className={`p-4 rounded-2xl border shadow-2xs space-y-1 ${
          queueCount > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'
        }`}>
          <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
            <span>Offline Queue</span>
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{queueCount}</div>
          {queueCount > 0 ? (
            <button
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="text-[10px] font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 px-2 py-0.5 rounded transition flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Records</span>
            </button>
          ) : (
            <div className="text-[10px] text-emerald-700 font-semibold">All Data Synced</div>
          )}
        </div>

      </div>

      {/* High Risk Follow-Up Overdue Banner */}
      {overdueFollowups.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>High-Priority Overdue Follow-ups Awaiting Frontline Action:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdueFollowups.map(f => (
              <div key={f.id} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{f.patient?.name}</div>
                  <div className="text-slate-600 text-[11px]">{f.description}</div>
                  <div className="text-[10px] text-red-700 font-bold mt-1">Due: {f.dueDate} • Priority: {f.priority}</div>
                </div>
                <button
                  onClick={() => handleCompleteFollowup(f.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow transition shrink-0"
                >
                  Mark Done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Directory Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        {/* Table Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-gov-navy" />
              <span>Village Patient Register & Longitudinal Records</span>
            </h3>
            <p className="text-xs text-slate-500">Search by citizen name, mobile, ABHA ID or filter by village hamlet</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input with Voice */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient..."
                className="pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy w-48 sm:w-64"
              />
              <button
                type="button"
                onClick={handleVoiceSearch}
                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-gov-navy"
                title="Voice Search"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Village Filter */}
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy cursor-pointer"
            >
              <option value="ALL">All Villages</option>
              <option value="Gandhre">Gandhre Village</option>
              <option value="Kalyan Rural">Kalyan Rural</option>
              <option value="Titwala">Titwala</option>
              <option value="Shahapur">Shahapur</option>
            </select>
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Citizen / Patient</th>
                <th className="p-3.5">Age / Gender</th>
                <th className="p-3.5">Village Hamlet</th>
                <th className="p-3.5">Latest Vitals</th>
                <th className="p-3.5">Health Condition</th>
                <th className="p-3.5 text-right">Frontline Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="font-semibold text-slate-700">No citizens found</div>
                    <p className="text-[11px] text-slate-400">Click "Register Citizen" to record a new patient into the registry.</p>
                  </td>
                </tr>
              ) : filteredPatients.map(p => {
                const latestVital = p.vitals && p.vitals.length > 0 ? p.vitals[0] : null;
                const isHighBp = (latestVital?.systolicBp || 0) >= 140;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Patient Name & ABHA ID */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.patientId}</div>
                    </td>

                    {/* Age / Gender */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{p.age} yrs • {p.gender}</div>
                      <div className="text-[10px] text-slate-500">Blood: {p.bloodGroup || 'O+'}</div>
                    </td>

                    {/* Village */}
                    <td className="p-3.5">
                      <div className="font-medium text-slate-700">{p.village}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{p.phone}</span>
                      </div>
                    </td>

                    {/* Latest Vitals */}
                    <td className="p-3.5">
                      {latestVital ? (
                        <div className="space-y-0.5">
                          <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isHighBp ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-800'
                          }`}>
                            BP: {latestVital.systolicBp}/{latestVital.diastolicBp}
                          </span>
                          <div className="text-[10px] text-slate-500 font-mono">
                            SpO2: {latestVital.spo2 || 98}% • HR: {latestVital.heartRate || 76}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No vitals recorded</span>
                      )}
                    </td>

                    {/* Health Condition */}
                    <td className="p-3.5">
                      {p.pregnancyStatus ? (
                        <span className="text-[10px] font-bold bg-pink-100 text-pink-900 border border-pink-300 px-2 py-0.5 rounded-full inline-block">
                          🤰 ANC High Risk ({p.gestationalWeeks || 28}w)
                        </span>
                      ) : p.chronicConditions ? (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded inline-block">
                          {p.chronicConditions}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                          Routine Health
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenVitals(p)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition"
                        title="Record Vitals"
                      >
                        + Vitals
                      </button>

                      <button
                        onClick={() => handleOpenTriage(p)}
                        className="px-2.5 py-1 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-lg text-[11px] transition"
                        title="Run Digital Triage"
                      >
                        Triage
                      </button>

                      <button
                        onClick={() => navigate(`/teleconsult?patientId=${p.id}`)}
                        className="px-2.5 py-1 bg-gov-emerald hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition"
                        title="Launch Teleconsultation"
                      >
                        <Video className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modals */}
      <PatientRegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={() => {
          setToastMessage('Patient registered successfully in public healthcare registry!');
          loadData();
        }}
      />

      <VitalsModal
        isOpen={vitalsOpen}
        onClose={() => setVitalsOpen(false)}
        patient={selectedPatient}
        onSuccess={() => {
          setToastMessage(`Vitals observation recorded for ${selectedPatient?.name}!`);
          loadData();
        }}
      />

      <GuidedTriageModal
        isOpen={triageOpen}
        onClose={() => setTriageOpen(false)}
        patient={selectedPatient}
        onSuccess={(assessment) => {
          setToastMessage(`Digital Triage completed! Risk level: ${assessment.riskLevel}`);
          loadData();
        }}
      />

    </div>
  );
};
