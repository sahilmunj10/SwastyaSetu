import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { Appointment, Patient, TriageAssessment } from '../types';
import { 
  Stethoscope, 
  Calendar, 
  Video, 
  Clock, 
  Activity, 
  Layers, 
  FlaskConical, 
  Pill, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  User, 
  ArrowRight,
  Plus,
  Play
} from 'lucide-react';
import { LongitudinalTimeline } from '../components/doctor/LongitudinalTimeline';
import { VitalsTrendCharts } from '../components/doctor/VitalsTrendCharts';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [queueData, setQueueData] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'CHARTS' | 'LABS' | 'REFERRAL'>('TIMELINE');

  // Referral creator form state
  const [destinationFacility, setDestinationFacility] = useState('Thane District Civil Hospital');
  const [referralReason, setReferralReason] = useState('High Risk Gestational Hypertension with Proteinuria at 28 Weeks');
  const [referralSummary, setReferralSummary] = useState('Patient requires urgent specialist OB/GYN fetal Doppler biophysical profile and inpatient monitoring.');
  const [referralPriority, setReferralPriority] = useState('HIGH');
  const [submittingRef, setSubmittingRef] = useState(false);
  const [refSuccessMsg, setRefSuccessMsg] = useState<string | null>(null);

  const loadQueue = async () => {
    try {
      const qRes = await api.getLiveQueue();
      setQueueData(qRes);

      const requestedPatientId = searchParams.get('patientId');
      if (requestedPatientId) {
        const patRes = await api.getPatientById(requestedPatientId);
        setSelectedPatient(patRes.patient);
      } else if (qRes.queue && qRes.queue.length > 0) {
        setSelectedAppointment(qRes.queue[0]);
        const patRes = await api.getPatientById(qRes.queue[0].patientId);
        setSelectedPatient(patRes.patient);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    // Real-time live queue background polling every 5 seconds
    const interval = setInterval(() => {
      loadQueue();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectQueueItem = async (appt: Appointment) => {
    setSelectedAppointment(appt);
    try {
      const patRes = await api.getPatientById(appt.patientId);
      setSelectedPatient(patRes.patient);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (apptId: string, status: string) => {
    try {
      await api.updateAppointmentStatus(apptId, status);
      loadQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSubmittingRef(true);
    try {
      const facilities = (await api.getFacilities()).facilities;
      const thaneFac = facilities.find((f: any) => f.name.includes('Thane')) || facilities[0];
      const kalyanFac = facilities.find((f: any) => f.name.includes('Kalyan')) || facilities[0];

      await api.createReferral({
        patientId: selectedPatient.id,
        originFacilityId: kalyanFac.id,
        destinationFacilityId: thaneFac.id,
        reason: referralReason,
        clinicalSummary: referralSummary,
        priority: referralPriority
      });

      setRefSuccessMsg('Referral dispatched to Thane District Hospital OB/GYN Gateway!');
      const updated = await api.getPatientById(selectedPatient.id);
      setSelectedPatient(updated.patient);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRef(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading Clinical OPD Workstation...</div>;
  }

  const queueItems = queueData?.queue || [];
  const latestVital = selectedPatient?.vitals && selectedPatient.vitals.length > 0
    ? selectedPatient.vitals[selectedPatient.vitals.length - 1]
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-gov-navy via-gov-blue to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-slate-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded">
              Medical Officer Workstation
            </span>
            <span className="text-xs text-slate-300 font-medium">PHC Kalyan Rural • Telemedicine Suite 01</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, Dr. Rajesh Kulkarni (Medical Officer)
          </h1>
          <p className="text-xs text-slate-300">
            Waiting Queue: <strong className="text-white">{queueData?.totalWaiting || 0} Citizens</strong> • In Consultation: <strong className="text-white">{queueData?.inConsultation || 0}</strong> • Completed Today: <strong className="text-white">{queueData?.completedToday || 0}</strong>
          </p>
        </div>

        {/* Start Teleconsultation Action */}
        {selectedPatient && (
          <button
            onClick={() => navigate(`/teleconsult?patientId=${selectedPatient.id}`)}
            className="px-5 py-3 bg-gov-emerald hover:bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-xl transition flex items-center gap-2"
          >
            <Video className="w-4 h-4 text-amber-300" />
            <span>Launch Teleconsult with {selectedPatient.name.split(' ')[0]}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left Queue (4 cols) / Right Patient Longitudinal Record (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 4 Cols: Live OPD & Teleconsultation Queue */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gov-navy" />
                <h3 className="font-bold text-base text-slate-900">Today's Patient Queue</h3>
              </div>
              <span className="text-xs font-mono font-bold text-gov-blue bg-gov-ice px-2 py-0.5 rounded">
                {queueItems.length} Total
              </span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
              {queueItems.map((item: Appointment) => {
                const isSelected = selectedPatient?.id === item.patientId;
                const isUrgent = item.urgency === 'HIGH' || item.urgency === 'EMERGENCY';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectQueueItem(item)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-gov-ice border-gov-blue ring-2 ring-gov-blue/30 shadow-sm'
                        : 'bg-slate-50/80 hover:bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                        {item.tokenNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.urgency === 'EMERGENCY'
                          ? 'badge-emergency'
                          : item.urgency === 'HIGH'
                          ? 'badge-high'
                          : 'badge-routine'
                      }`}>
                        {item.urgency}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{item.patient?.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.reason}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                      <span className="text-slate-500 font-medium">
                        {item.mode === 'TELECONSULTATION' ? '📹 Teleconsult' : '🏥 Physical Visit'}
                      </span>
                      <span className="font-semibold text-gov-navy">
                        {item.status} ({item.estimatedWaitMins || 10}m)
                      </span>
                    </div>

                    {/* Queue Actions */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {item.status === 'WAITING' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(item.id, 'IN_PROGRESS');
                          }}
                          className="flex-1 py-1 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-lg text-[10px] transition"
                        >
                          Call Patient
                        </button>
                      )}
                      {item.status === 'IN_PROGRESS' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(item.id, 'COMPLETED');
                          }}
                          className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/teleconsult?patientId=${item.patientId}`);
                        }}
                        className="p-1 px-2 bg-gov-emerald text-white font-bold rounded-lg text-[10px]"
                        title="Start Video"
                      >
                        <Video className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right 8 Cols: Selected Patient Longitudinal Electronic Record */}
        <div className="lg:col-span-8 space-y-6">
          
          {selectedPatient ? (
            <>
              {/* Patient Header Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-gov-ice rounded-2xl flex items-center justify-center text-xl font-bold text-gov-navy border border-blue-200">
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900">{selectedPatient.name}</h2>
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {selectedPatient.patientId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {selectedPatient.age} yrs • {selectedPatient.gender} • Village: <strong className="text-slate-800">{selectedPatient.village}</strong> • Blood: {selectedPatient.bloodGroup || 'O+'}
                      </p>
                    </div>
                  </div>

                  {selectedPatient.pregnancyStatus && (
                    <div className="bg-pink-50 border border-pink-200 p-2.5 rounded-xl text-right">
                      <div className="text-xs font-bold text-pink-900">🤰 ANC High-Risk (28 Weeks)</div>
                      <div className="text-[10px] text-pink-700">Pre-Eclampsia Screening Flag</div>
                    </div>
                  )}
                </div>

                {/* Latest Vitals Bar */}
                {latestVital && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold block">Blood Pressure</span>
                      <strong className="text-sm font-mono text-amber-700 font-bold">{latestVital.systolicBp}/{latestVital.diastolicBp} mmHg</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold block">Heart Rate</span>
                      <strong className="text-sm font-mono text-slate-800 font-bold">{latestVital.heartRate || 88} bpm</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold block">SpO2 Oxygen</span>
                      <strong className="text-sm font-mono text-slate-800 font-bold">{latestVital.spo2 || 97}%</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold block">Blood Glucose</span>
                      <strong className="text-sm font-mono text-slate-800 font-bold">{latestVital.bloodGlucose || 118} mg/dL</strong>
                    </div>
                  </div>
                )}

              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex border-b border-slate-200 space-x-2 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('TIMELINE')}
                  className={`py-2 px-4 border-b-2 transition ${
                    activeTab === 'TIMELINE' ? 'border-gov-navy text-gov-navy' : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Longitudinal Timeline
                </button>
                <button
                  onClick={() => setActiveTab('CHARTS')}
                  className={`py-2 px-4 border-b-2 transition ${
                    activeTab === 'CHARTS' ? 'border-gov-navy text-gov-navy' : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Vitals Progression (Charts)
                </button>
                <button
                  onClick={() => setActiveTab('LABS')}
                  className={`py-2 px-4 border-b-2 transition ${
                    activeTab === 'LABS' ? 'border-gov-navy text-gov-navy' : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Diagnostic Reports ({selectedPatient.diagnosticRequests?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('REFERRAL')}
                  className={`py-2 px-4 border-b-2 transition ${
                    activeTab === 'REFERRAL' ? 'border-gov-navy text-gov-navy' : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Referral
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'TIMELINE' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <LongitudinalTimeline patient={selectedPatient} />
                </div>
              )}

              {activeTab === 'CHARTS' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <VitalsTrendCharts vitals={selectedPatient.vitals || []} />
                </div>
              )}

              {activeTab === 'LABS' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-slate-900">Verified Pathology & Imaging Records</h3>
                  <div className="space-y-3">
                    {(selectedPatient.diagnosticRequests || []).map(d => (
                      <div key={d.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-gov-navy">{d.testName}</span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                            {d.status}
                          </span>
                        </div>
                        <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed font-mono">
                          {d.reportFindings || 'Pending lab processing'}
                        </p>
                        <div className="text-[10px] text-slate-500">
                          Verified by: <strong>{d.verifiedBy || 'Senior Lab Technician'}</strong> • Date: {new Date(d.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'REFERRAL' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Inter-Facility Electronic Referral Protocol</h3>
                      <p className="text-xs text-slate-500">Fast-track high-risk patient transfer to District Hospital Thane</p>
                    </div>
                  </div>

                  {refSuccessMsg && (
                    <div className="p-3.5 bg-emerald-50 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{refSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateReferral} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Destination Public Facility *</label>
                      <select
                        value={destinationFacility}
                        onChange={(e) => setDestinationFacility(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                      >
                        <option value="Thane District Civil Hospital">Thane District Civil Hospital (OB/GYN Specialist High-Risk Care)</option>
                        <option value="Sub-District Rural Hospital Dombivli">Sub-District Rural Hospital Dombivli</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Reason for Referral *</label>
                        <input
                          type="text"
                          required
                          value={referralReason}
                          onChange={(e) => setReferralReason(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Priority Classification</label>
                        <select
                          value={referralPriority}
                          onChange={(e) => setReferralPriority(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-amber-900"
                        >
                          <option value="HIGH">HIGH PRIORITY (Within 24 Hours)</option>
                          <option value="EMERGENCY">CRITICAL EMERGENCY (Immediate STAT)</option>
                          <option value="ROUTINE">ROUTINE (Within 7 Days)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Clinical Handover Summary</label>
                      <textarea
                        rows={3}
                        value={referralSummary}
                        onChange={(e) => setReferralSummary(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingRef}
                      className="px-6 py-3 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2"
                    >
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>{submittingRef ? 'Transmitting Electronic Referral...' : 'Dispatch Referral & Book Specialist Slot'}</span>
                    </button>
                  </form>
                </div>
              )}

            </>
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
              Please select a patient from the queue on the left.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
