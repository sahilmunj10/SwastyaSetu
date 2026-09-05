import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  X, 
  Search, 
  Stethoscope, 
  Video, 
  Pill, 
  Layers, 
  Activity, 
  FlaskConical, 
  WifiOff, 
  MapPin, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Clock, 
  Phone,
  ShieldAlert,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export type ServiceType = 
  | 'TELECONSULT' 
  | 'TRIAGE_CDS' 
  | 'EHR_TIMELINE' 
  | 'REFERRAL_TRACKER' 
  | 'MEDICINE_FINDER' 
  | 'DIAGNOSTICS' 
  | 'OFFLINE_SYNC' 
  | 'GIS_ANALYTICS';

interface HealthServiceModalProps {
  service: ServiceType | null;
  onClose: () => void;
}

export const HealthServiceModal: React.FC<HealthServiceModalProps> = ({ service, onClose }) => {
  const navigate = useNavigate();

  // State for Live Medicine Search
  const [medQuery, setMedQuery] = useState('Labetalol');
  const [medResults, setMedResults] = useState<any[]>([]);
  const [medLoading, setMedLoading] = useState(false);

  // State for Live Triage Evaluation
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Severe Headache', 'Swollen Feet / Edema']);
  const [sysBp, setSysBp] = useState<number>(152);
  const [diaBp, setDiaBp] = useState<number>(96);
  const [isPregnant, setIsPregnant] = useState<boolean>(true);
  const [triageOutput, setTriageOutput] = useState<any>(null);
  const [triageLoading, setTriageLoading] = useState<boolean>(false);

  // Load initial medicine search when modal opens to MEDICINE_FINDER
  useEffect(() => {
    if (service === 'MEDICINE_FINDER') {
      handleSearchMedicine('Labetalol');
    }
  }, [service]);

  const handleSearchMedicine = async (q: string) => {
    if (!q.trim()) return;
    setMedLoading(true);
    try {
      const res = await api.searchMedicineAcrossFacilities(q);
      setMedResults(res.facilitiesWithStock || []);
    } catch (err) {
      console.error(err);
    } finally {
      setMedLoading(false);
    }
  };

  const handleRunTriage = async () => {
    setTriageLoading(true);
    try {
      const res = await api.evaluateTriage({
        patientId: 'MH-THN-00101',
        symptoms: selectedSymptoms,
        symptomDuration: '3 days',
        isPregnant,
        gestationalWeeks: isPregnant ? 28 : undefined,
        systolicBp: sysBp,
        diastolicBp: diaBp,
        spo2: 98,
        heartRate: 84
      });
      setTriageOutput(res.triageResult);
    } catch (err) {
      console.error(err);
    } finally {
      setTriageLoading(false);
    }
  };

  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-gov-navy to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gov-blue/60 flex items-center justify-center border border-white/10">
              {service === 'TELECONSULT' && <Video className="w-4 h-4 text-amber-400" />}
              {service === 'TRIAGE_CDS' && <Stethoscope className="w-4 h-4 text-purple-400" />}
              {service === 'EHR_TIMELINE' && <Activity className="w-4 h-4 text-emerald-400" />}
              {service === 'REFERRAL_TRACKER' && <Layers className="w-4 h-4 text-blue-400" />}
              {service === 'MEDICINE_FINDER' && <Pill className="w-4 h-4 text-amber-400" />}
              {service === 'DIAGNOSTICS' && <FlaskConical className="w-4 h-4 text-teal-400" />}
              {service === 'OFFLINE_SYNC' && <WifiOff className="w-4 h-4 text-orange-400" />}
              {service === 'GIS_ANALYTICS' && <MapPin className="w-4 h-4 text-rose-400" />}
            </div>
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Public Health Service</div>
              <h2 className="text-base font-black text-white">
                {service === 'TELECONSULT' && 'Assisted Teleconsultation Suite'}
                {service === 'TRIAGE_CDS' && 'Digital Guided Triage Screening Engine'}
                {service === 'EHR_TIMELINE' && 'Longitudinal Health Record (EHR)'}
                {service === 'REFERRAL_TRACKER' && '8-Stage Inter-Facility Referral Tracking'}
                {service === 'MEDICINE_FINDER' && 'Public Medicine Availability Locator'}
                {service === 'DIAGNOSTICS' && 'Public Diagnostic & Pathology Coordination'}
                {service === 'OFFLINE_SYNC' && 'Offline-First Frontline PWA Synchronization'}
                {service === 'GIS_ANALYTICS' && 'District Health Officer GIS Analytics'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs">
          
          {/* 1. TELECONSULTATION SERVICE */}
          {service === 'TELECONSULT' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-2">
                <div className="font-bold text-gov-navy text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Connecting Rural Sub-Centres to Specialist Doctors</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Swasthya Setu’s Assisted Teleconsultation is designed for rural primary health centres and village sub-centres. Frontline ASHA/ANM workers present citizens directly to Medical Officers with specialized low-bandwidth 2G/3G audio fallback and live electronic prescription authoring.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Low-Bandwidth Fallback</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Auto-downgrades from HD video to clear VoIP audio when network drops below 150 kbps.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>In-Call EHR & Prescriptions</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Doctors inspect past vitals, issue verified prescriptions, and order tests directly during the call.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">Active PHC Telemedicine Queue</span>
                  <span className="text-[11px] bg-emerald-900/80 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-700">ONLINE</span>
                </div>
                <div className="text-xs text-slate-300">
                  Ready to test an assisted consultation session with Dr. Rajesh Kulkarni (PHC Kalyan)?
                </div>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/teleconsult');
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Launch Teleconsultation Suite</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 2. DIGITAL GUIDED TRIAGE SERVICE */}
          {service === 'TRIAGE_CDS' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl space-y-1.5">
                <div className="font-bold text-purple-950 text-sm flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-purple-700" />
                  <span>Rule-Based Clinical Decision Support (CDS)</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Screen presenting symptoms and physiological vitals against algorithmic protocols to prioritize urgent care without delay.
                </p>
                <div className="text-[10px] text-purple-900 font-semibold italic">
                  * Clinical decision support screening aid only. Final clinical diagnosis is made by a qualified Medical Officer.
                </div>
              </div>

              {/* Interactive Triage Simulator */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-xs">Test Presenting Conditions:</div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    'Severe Headache',
                    'Swollen Feet / Edema',
                    'Blurred Vision',
                    'Severe Chest Pain',
                    'Shortness of Breath',
                    'High Fever (>102°F)',
                    'Mild Fatigue'
                  ].map(sym => {
                    const isChecked = selectedSymptoms.includes(sym);
                    return (
                      <label 
                        key={sym} 
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                          isChecked ? 'bg-purple-100 border-purple-300 font-bold text-purple-950' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSymptoms([...selectedSymptoms, sym]);
                            } else {
                              setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
                            }
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>{sym}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={sysBp}
                      onChange={(e) => setSysBp(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={diaBp}
                      onChange={(e) => setDiaBp(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-1.5 cursor-pointer pb-2 text-[11px] font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isPregnant}
                        onChange={(e) => setIsPregnant(e.target.checked)}
                        className="rounded text-gov-emerald"
                      />
                      <span>Pregnant (28w)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunTriage}
                  disabled={triageLoading}
                  className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{triageLoading ? 'Evaluating Rules...' : 'Run Algorithmic Triage Assessment'}</span>
                </button>
              </div>

              {/* Triage Output */}
              {triageOutput && (
                <div className="p-4 bg-white rounded-2xl border-2 border-purple-400 space-y-2 text-xs animate-scaleUp">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Triage Classification:</span>
                    <span className={`px-2.5 py-1 rounded-full font-black text-[11px] ${
                      triageOutput.riskLevel === 'EMERGENCY' ? 'bg-red-100 text-red-800 border border-red-300' :
                      triageOutput.riskLevel === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {triageOutput.riskLevel} PRIORITY
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-mono text-[10px] text-purple-900 font-bold uppercase">{triageOutput.ruleTriggered}</div>
                    <p className="text-slate-700 text-xs leading-relaxed">{triageOutput.clinicalReasoning}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Protocol Recommendation:</strong> {triageOutput.recommendedAction}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. MEDICINE AVAILABILITY LOCATOR */}
          {service === 'MEDICINE_FINDER' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1.5">
                <div className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-amber-700" />
                  <span>Real-time Inter-Facility Medicine Inventory Search</span>
                </div>
                <p className="text-slate-700 text-xs">
                  Search essential drug availability across government primary health centres, sub-district hospitals, and district civil hospitals.
                </p>
              </div>

              {/* Search Form */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={medQuery}
                    onChange={(e) => setMedQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchMedicine(medQuery)}
                    placeholder="Search medicine e.g. Labetalol, Paracetamol, Metformin, Amoxicillin..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-gov-navy"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchMedicine(medQuery)}
                  disabled={medLoading}
                  className="px-4 py-2.5 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-xl text-xs transition shrink-0"
                >
                  {medLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Quick Pills */}
              <div className="flex flex-wrap gap-1.5 items-center text-[11px]">
                <span className="text-slate-500 font-medium mr-1">Quick search:</span>
                {['Labetalol 100 mg', 'Metformin 500 mg', 'Paracetamol 500 mg', 'Amlodipine 5 mg', 'ORS'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMedQuery(m);
                      handleSearchMedicine(m);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-950 rounded-lg border border-slate-200 transition font-medium"
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Results List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {medResults.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    {medLoading ? 'Fetching live public health inventory...' : 'No facilities found with this drug.'}
                  </div>
                ) : (
                  medResults.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition">
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-slate-900">{item.facilityName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{item.facilityAddress}</span>
                          <span>•</span>
                          <span className="font-bold text-gov-blue">{item.estimatedDistance}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          item.stockStatus === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                          item.stockStatus === 'LOW_STOCK' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.stockStatus === 'AVAILABLE' ? `${item.quantity} units available` : item.stockStatus}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Free Govt. Supply</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. 8-STAGE REFERRAL TRACKING */}
          {service === 'REFERRAL_TRACKER' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl space-y-1.5">
                <div className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-700" />
                  <span>Closed-Loop Inter-Tier Referral Architecture</span>
                </div>
                <p className="text-slate-700 text-xs">
                  Zero lost medical paperwork: Referrals travel electronically from Primary Health Centres to District Civil Hospitals with specialist acceptance and follow-up loops.
                </p>
              </div>

              {/* Sample Token Tracker */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Referral Token:</span>
                    <strong className="font-mono text-amber-400">#REF-MH-2026-0892</strong>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold text-[10px]">
                    STAGE 3 OF 8 • ACCEPTED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <div>Origin: <strong className="text-white block">PHC Kalyan Rural</strong></div>
                  <div>Destination: <strong className="text-white block">Thane Civil Hospital OB/GYN</strong></div>
                </div>

                {/* 8-Stage Progress Stepper */}
                <div className="space-y-1.5 pt-1 text-[11px]">
                  {[
                    { stage: '1. Created', desc: 'Medical Officer initiated electronic referral with lab report attachment.', done: true },
                    { stage: '2. Sent', desc: 'Securely transmitted across state health interoperability gateway.', done: true },
                    { stage: '3. Accepted', desc: 'Dr. Ananya Joshi (OB/GYN Specialist) reviewed & accepted priority slot.', done: true, active: true },
                    { stage: '4. Scheduled', desc: 'Direct appointment confirmed without physical queue standing.', done: false },
                    { stage: '5. Arrived', desc: 'Biometric/ABHA verification upon hospital check-in.', done: false },
                    { stage: '6. Consulted', desc: 'Specialist inpatient care & diagnostic ultrasound conducted.', done: false },
                    { stage: '7. Discharge', desc: 'Discharge summary & instructions auto-routed to village ASHA.', done: false },
                    { stage: '8. Closed Loop', desc: 'ASHA home visit confirms recovery; referral closed.', done: false }
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 py-1 border-b border-white/5 last:border-0">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 ${
                        s.active ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300' :
                        s.done ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {s.done ? '✓' : idx + 1}
                      </span>
                      <div>
                        <span className={`font-bold ${s.active ? 'text-amber-300' : s.done ? 'text-white' : 'text-slate-400'}`}>{s.stage}</span>
                        <span className="text-[10px] text-slate-400 block">{s.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. ONE CONTINUOUS EHR */}
          {service === 'EHR_TIMELINE' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1.5">
                <div className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <span>Longitudinal Health Record (ABHA Compliant)</span>
                </div>
                <p className="text-slate-700 text-xs">
                  Eliminates lost physical papers. Encounters, vital observations, laboratory tests, and prescriptions are unified into a chronological continuum.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-800">Meena Ramesh Patil (#MH-THN-00101)</div>
                  <span className="text-gov-blue font-mono font-bold text-[11px]">ABHA: 91-4432-8819-2041</span>
                </div>

                <div className="space-y-2 border-l-2 border-gov-emerald pl-3 ml-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-700">Today • Urgent ANC Home Visit</span>
                    <div className="font-bold text-slate-900">Vitals: BP 152/96 mmHg (Stage 2 Hypertension)</div>
                    <p className="text-slate-500 text-[11px]">Recorded by ASHA Sunita Gaikwad. Triage flagged HIGH RISK.</p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-blue-700">2 Hours Ago • PHC Clinical Lab</span>
                    <div className="font-bold text-slate-900">Diagnostic: Urine Albumin Spot Protein (+2)</div>
                    <p className="text-slate-500 text-[11px]">Digitally verified by Prakash Shinde (Senior Lab Tech).</p>
                  </div>

                  <div className="space-y-0.5 pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-purple-700">1 Hour Ago • Telemedicine Consultation</span>
                    <div className="font-bold text-slate-900">Prescription: Tab Labetalol 100 mg BD</div>
                    <p className="text-slate-500 text-[11px]">Prescribed by Dr. Rajesh Kulkarni (Medical Officer).</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigate('/meena-journey');
                }}
                className="w-full py-2.5 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <span>Explore Full 15-Stage Interactive Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 6. PUBLIC DIAGNOSTIC COORDINATION */}
          {service === 'DIAGNOSTICS' && (
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl space-y-1.5">
                <div className="font-bold text-teal-950 text-sm flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-teal-700" />
                  <span>Public Diagnostic Laboratory Network</span>
                </div>
                <p className="text-slate-700 text-xs">
                  Coordinated diagnostic ordering between primary sub-centres and clinical laboratories with zero out-of-pocket costs for citizens under state public health programs.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-800 text-xs">Available Tests at PHC & Sub-District Labs:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { test: 'Complete Blood Count (CBC)', cat: 'Pathology', time: '2 hours', cost: 'FREE (Govt)' },
                    { test: 'Urine Routine & Protein', cat: 'Pathology', time: '30 mins', cost: 'FREE (Govt)' },
                    { test: 'HbA1c Glycated Hemoglobin', cat: 'Biochemistry', time: '3 hours', cost: 'FREE (Govt)' },
                    { test: 'Obstetric Ultrasound Doppler', cat: 'Radiology', time: 'Same day', cost: 'FREE (Govt)' },
                    { test: 'Fasting Blood Glucose', cat: 'Biochemistry', time: '15 mins', cost: 'FREE (Govt)' },
                    { test: 'Sputum Microscopy', cat: 'Microbiology', time: '4 hours', cost: 'FREE (Govt)' }
                  ].map((t, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="font-bold text-slate-900 text-[11px]">{t.test}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{t.cat} • {t.time}</span>
                        <span className="font-bold text-emerald-600">{t.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. OFFLINE PWA SYNC */}
          {service === 'OFFLINE_SYNC' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl space-y-1.5">
                <div className="font-bold text-orange-950 text-sm flex items-center gap-1.5">
                  <WifiOff className="w-4 h-4 text-orange-700" />
                  <span>Offline-First Frontline Resilience</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  Frontline ASHA workers routinely visit tribal hamlets and deep rural villages without internet connectivity. Swasthya Setu leverages an IndexedDB client store (`idb-keyval`) and service worker caching to capture data offline and flush automatically when reconnecting.
                </p>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Frontline Device Cache:</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-mono font-bold text-[10px]">
                    READY TO SYNC
                  </span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>1. Citizen Registration:</span>
                    <strong className="text-white">Encrypted in browser IndexedDB</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>2. Physiological Vitals:</span>
                    <strong className="text-white">Timestamped with offline tag</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>3. Network Restoration:</span>
                    <strong className="text-emerald-400">Atomic batch upload to SQLite</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. DISTRICT GIS ANALYTICS */}
          {service === 'GIS_ANALYTICS' && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-1.5">
                <div className="font-bold text-rose-950 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-700" />
                  <span>District Health Officer (DHO) Real-Time Monitoring</span>
                </div>
                <p className="text-slate-700 text-xs">
                  Live geospatial visualization of public healthcare facilities across Thane district with bed occupancy, doctor availability, and referral throughput.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="font-bold text-slate-800 text-xs">Monitored Facilities in Thane District:</div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <div>
                      <strong className="block text-slate-900">PHC Kalyan Rural</strong>
                      <span className="text-slate-500 text-[10px]">Kalyan-Murbad Road • 15 Beds</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Quality Grade A</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <div>
                      <strong className="block text-slate-900">Thane District Civil Hospital</strong>
                      <span className="text-slate-500 text-[10px]">Court Naka • 350 Beds • High-Risk OB/GYN</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Referral Hub</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <div>
                      <strong className="block text-slate-900">Sub-District Rural Hospital Dombivli</strong>
                      <span className="text-slate-500 text-[10px]">Manpada Road • 50 Beds</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">24x7 Casualty</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigate('/district/map');
                }}
                className="w-full py-2.5 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <span>Open Full Interactive Maharashtra GIS Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Modal Bottom Close */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
