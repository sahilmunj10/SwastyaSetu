import React, { useState } from 'react';
import { Patient, Appointment } from '../../types';
import { api } from '../../services/api';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  FileText, 
  Layers, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TeleconsultRoomProps {
  patient: Patient;
  appointment?: Appointment | null;
  onComplete?: () => void;
}

export const TeleconsultRoom: React.FC<TeleconsultRoomProps> = ({ patient, appointment, onComplete }) => {
  const navigate = useNavigate();

  // Teleconsultation state
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [connectionSignal, setConnectionSignal] = useState<'EXCELLENT' | 'FAIR' | 'LOW'>('EXCELLENT');
  const [activeTab, setActiveTab] = useState<'NOTES' | 'PRESCRIPTION' | 'ORDERS' | 'CHAT'>('NOTES');

  // Clinical Form state
  const [chiefComplaints, setChiefComplaints] = useState('Severe persistent headache, pedal edema (swelling in feet), and blurred vision in 3rd trimester pregnancy.');
  const [clinicalNotes, setClinicalNotes] = useState('24y primigravida at 28 weeks gestation. BP 152/96 mmHg. Clear signs of gestational hypertension / impending pre-eclampsia. Requires urgent urine albumin spot test and specialized OB/GYN fetal Doppler assessment.');
  const [diagnosis, setDiagnosis] = useState('Gestational Hypertension with High Risk of Pre-Eclampsia');
  const [followUpDate, setFollowUpDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: 'Labetalol 100 mg', dosage: '100mg', frequency: '1-0-1 (Twice Daily)', durationDays: 7, instructions: 'After food. Monitor BP daily.' },
    { medicineName: 'Calcium + Vitamin D3', dosage: '500mg', frequency: '0-1-0 (Afternoon)', durationDays: 30, instructions: 'With water' }
  ]);

  // Diagnostic order
  const [orderDiagnostic, setOrderDiagnostic] = useState(true);
  const [diagnosticTestName, setDiagnosticTestName] = useState('Urine Routine & Spot Protein (Albumin)');

  // Referral order
  const [orderReferral, setOrderReferral] = useState(true);
  const [referralDestination, setReferralDestination] = useState('Thane District Civil Hospital');

  // In-call chat
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ASHA Sunita', text: 'Namaste Doctor, I am with patient Meena at Gandhre village sub-centre.' },
    { sender: 'Dr. Rajesh', text: 'Namaste Sunita. Please confirm her current blood pressure reading.' },
    { sender: 'ASHA Sunita', text: 'Checked just now: 152/96 mmHg. She also reports severe headache since yesterday.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  const addPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { medicineName: '', dosage: '500mg', frequency: '1-0-1', durationDays: 5, instructions: 'After meals' }]);
  };

  const removePrescriptionRow = (idx: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { sender: 'Dr. Rajesh', text: chatInput }]);
    setChatInput('');
  };

  const handleCompleteSession = async () => {
    setSaving(true);
    try {
      // Find Thane facility ID if ordering referral
      const facilities = (await api.getFacilities()).facilities;
      const thaneFac = facilities.find((f: any) => f.name.includes('Thane')) || facilities[0];
      const kalyanFac = facilities.find((f: any) => f.name.includes('Kalyan')) || facilities[0];

      await api.completeTeleconsultation({
        appointmentId: appointment?.id,
        patientId: patient.id,
        facilityId: kalyanFac.id,
        chiefComplaints,
        clinicalNotes,
        diagnosis,
        assessment: 'High-risk gestational hypertension managed with oral antihypertensive. Urgent district referral created.',
        followUpDate,
        prescriptions,
        diagnosticOrder: orderDiagnostic ? {
          testName: diagnosticTestName,
          testCategory: 'Pathology',
          priority: 'HIGH',
          facilityId: kalyanFac.id
        } : undefined,
        referralOrder: orderReferral ? {
          destinationFacilityId: thaneFac.id,
          reason: 'Gestational Hypertension at 28 Weeks Gestation with Impending Pre-Eclampsia',
          clinicalSummary: clinicalNotes,
          priority: 'HIGH'
        } : undefined
      });

      setCompleted(true);
      if (onComplete) onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 overflow-hidden">
      
      {/* Top Session Header */}
      <div className="bg-slate-950/80 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base">Teleconsultation Session</h3>
              <span className="text-[10px] bg-red-500/20 text-red-400 font-mono font-bold px-2 py-0.5 rounded border border-red-500/30">
                LIVE SECURE CHANNEL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Patient: <strong className="text-white">{patient.name}</strong> ({patient.patientId}) • Village: {patient.village}
            </p>
          </div>
        </div>

        {/* Low-Bandwidth Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              lowBandwidthMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Enable to reduce video bandwidth for rural 2G/3G connections"
          >
            {lowBandwidthMode ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
            <span>{lowBandwidthMode ? 'Low-Bandwidth Mode (Audio + Chat)' : 'HD Video Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Video / Right Clinical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        
        {/* Left 7 Columns: Video Feeds */}
        <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between bg-slate-950 border-r border-slate-800 space-y-4">
          
          {/* Main Video Window */}
          <div className="relative flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[360px] shadow-inner">
            
            {lowBandwidthMode ? (
              // Low Bandwidth Mode Screen
              <div className="text-center p-6 space-y-3">
                <div className="w-20 h-20 mx-auto bg-gov-blue/40 border-2 border-amber-400/50 rounded-full flex items-center justify-center text-3xl shadow-lg">
                  👩‍🌾
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">{patient.name} (Remote Patient)</h4>
                  <p className="text-xs text-amber-300 font-medium mt-0.5">
                    Low-Bandwidth Audio Mode Active (Sub-Centre Kalyan)
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-slate-400 font-mono">Audio Stream: 18 kbps • Latency: 42ms</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setLowBandwidthMode(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-600 transition"
                  >
                    Switch back to Video
                  </button>
                </div>
              </div>
            ) : videoEnabled ? (
              // Simulated Video Feed
              <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-gov-navy">
                <div className="text-center space-y-2">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto bg-pink-900/40 border-2 border-pink-400/60 rounded-full flex items-center justify-center text-5xl shadow-xl animate-soft-pulse">
                    👩‍🌾
                  </div>
                  <div className="font-bold text-sm text-slate-200">{patient.name} (Sub-Centre Kalyan)</div>
                  <div className="text-[11px] text-emerald-400 flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live WebRTC Encrypted Stream (720p 30fps)</span>
                  </div>
                </div>

                {/* Patient Vitals Overlay */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm p-2.5 rounded-xl border border-slate-700/80 text-[11px] space-y-1">
                  <div className="text-slate-400 font-semibold uppercase text-[9px]">Live Vitals Stream</div>
                  <div className="font-mono font-bold text-amber-300">BP: 152/96 mmHg</div>
                  <div className="font-mono text-slate-200">SpO2: 97% • HR: 88 bpm</div>
                </div>
              </div>
            ) : (
              // Video Muted Screen
              <div className="text-center space-y-2 text-slate-500">
                <VideoOff className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-xs">Camera Feed Disabled</p>
              </div>
            )}

            {/* Doctor Self-Preview Picture-in-Picture */}
            <div className="absolute bottom-3 right-3 w-32 h-24 sm:w-40 sm:h-28 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shadow-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl">👨‍⚕️</div>
                <div className="text-[10px] font-bold text-slate-300">Dr. Rajesh (You)</div>
                <div className="text-[9px] text-emerald-400">PHC Medical Officer</div>
              </div>
            </div>

          </div>

          {/* Video Control Action Bar */}
          <div className="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-3 rounded-xl transition ${
                  audioEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'
                }`}
                title={audioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-3 rounded-xl transition ${
                  videoEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'
                }`}
                title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>

            <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1 font-mono">
              <span>Duration: 08:24</span>
            </div>

            <button
              onClick={handleCompleteSession}
              disabled={saving || completed}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              <span>{saving ? 'Saving...' : completed ? 'Session Completed' : 'End & Sign Consultation'}</span>
            </button>
          </div>

        </div>

        {/* Right 5 Columns: In-Consultation Clinical Workspace */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900 border-t lg:border-t-0 border-slate-800 text-slate-100">
          
          {/* Workspace Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 text-xs">
            <button
              onClick={() => setActiveTab('NOTES')}
              className={`flex-1 py-2 font-bold rounded-lg transition ${
                activeTab === 'NOTES' ? 'bg-gov-navy text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Clinical Notes
            </button>
            <button
              onClick={() => setActiveTab('PRESCRIPTION')}
              className={`flex-1 py-2 font-bold rounded-lg transition ${
                activeTab === 'PRESCRIPTION' ? 'bg-gov-navy text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rx ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`flex-1 py-2 font-bold rounded-lg transition ${
                activeTab === 'ORDERS' ? 'bg-gov-navy text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lab & Referral
            </button>
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`flex-1 py-2 font-bold rounded-lg transition ${
                activeTab === 'CHAT' ? 'bg-gov-navy text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Chat
            </button>
          </div>

          {/* Workspace Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[460px]">
            
            {activeTab === 'NOTES' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Chief Complaints</label>
                  <textarea
                    rows={2}
                    value={chiefComplaints}
                    onChange={(e) => setChiefComplaints(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-gov-blue text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Diagnosis *</label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-amber-300 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Clinical Assessment & Telemedicine Notes</label>
                  <textarea
                    rows={4}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-gov-blue text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Follow-up Due Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>
            )}

            {activeTab === 'PRESCRIPTION' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Medication Prescription (Rx)</span>
                  <button
                    onClick={addPrescriptionRow}
                    className="px-2 py-1 bg-gov-emerald hover:bg-emerald-700 text-white font-bold rounded-md flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Drug</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {prescriptions.map((rx, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={rx.medicineName}
                          onChange={(e) => {
                            const updated = [...prescriptions];
                            updated[idx].medicineName = e.target.value;
                            setPrescriptions(updated);
                          }}
                          placeholder="Medicine Name (e.g. Labetalol 100 mg)"
                          className="flex-1 bg-transparent border-b border-slate-700 font-bold text-amber-300 text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => removePrescriptionRow(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <label className="text-slate-400">Dosage</label>
                          <input
                            type="text"
                            value={rx.dosage}
                            onChange={(e) => {
                              const updated = [...prescriptions];
                              updated[idx].dosage = e.target.value;
                              setPrescriptions(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400">Frequency</label>
                          <input
                            type="text"
                            value={rx.frequency}
                            onChange={(e) => {
                              const updated = [...prescriptions];
                              updated[idx].frequency = e.target.value;
                              setPrescriptions(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={rx.instructions}
                          onChange={(e) => {
                            const updated = [...prescriptions];
                            updated[idx].instructions = e.target.value;
                            setPrescriptions(updated);
                          }}
                          placeholder="Special Instructions"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ORDERS' && (
              <div className="space-y-4 text-xs">
                {/* Lab Diagnostic Order */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="diagCheck"
                      checked={orderDiagnostic}
                      onChange={(e) => setOrderDiagnostic(e.target.checked)}
                      className="w-4 h-4 text-gov-blue rounded"
                    />
                    <label htmlFor="diagCheck" className="font-bold text-slate-200 cursor-pointer">
                      Order Diagnostic Lab Panel
                    </label>
                  </div>

                  {orderDiagnostic && (
                    <div className="pt-1">
                      <select
                        value={diagnosticTestName}
                        onChange={(e) => setDiagnosticTestName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      >
                        <option value="Urine Routine & Spot Protein (Albumin)">Urine Routine & Spot Protein (Albumin)</option>
                        <option value="Complete Blood Count (CBC) with Platelet Count">Complete Blood Count (CBC) with Platelet Count</option>
                        <option value="Glycated Hemoglobin (HbA1c)">Glycated Hemoglobin (HbA1c)</option>
                        <option value="Obstetric Sonography / Pelvic Ultrasound (USG)">Obstetric Sonography / Pelvic Ultrasound (USG)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Referral Order */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="refCheck"
                      checked={orderReferral}
                      onChange={(e) => setOrderReferral(e.target.checked)}
                      className="w-4 h-4 text-gov-blue rounded"
                    />
                    <label htmlFor="refCheck" className="font-bold text-slate-200 cursor-pointer">
                      Initiate Inter-Facility Referral
                    </label>
                  </div>

                  {orderReferral && (
                    <div className="pt-1 space-y-2">
                      <select
                        value={referralDestination}
                        onChange={(e) => setReferralDestination(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      >
                        <option value="Thane District Civil Hospital">Thane District Civil Hospital (OB/GYN High-Risk Clinic)</option>
                        <option value="Sub-District Rural Hospital Dombivli">Sub-District Rural Hospital Dombivli</option>
                      </select>
                      <p className="text-[11px] text-amber-300">
                        *Will generate digital referral token #REF-MH-2026 and alert receiving hospital specialist.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'CHAT' && (
              <div className="flex flex-col h-full space-y-3">
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px]">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <div className="font-bold text-gov-lightBlue text-[11px]">{msg.sender}</div>
                      <div className="text-slate-200 mt-0.5">{msg.text}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type in-call clinical message..."
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                  <button type="submit" className="p-2 bg-gov-blue hover:bg-blue-800 text-white rounded-lg">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Success Banner */}
          {completed && (
            <div className="p-3 bg-emerald-950 border-t border-emerald-700 text-xs text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Consultation saved and electronic prescription issued!</span>
              </div>
              <button
                onClick={() => navigate('/doctor')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px]"
              >
                Back to Queue
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
