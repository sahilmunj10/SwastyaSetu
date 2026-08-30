import React, { useState, useEffect } from 'react';
import { 
  X, 
  Stethoscope, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Video, 
  Calendar, 
  Layers, 
  Sparkles, 
  Mic, 
  ArrowRight 
} from 'lucide-react';
import { Patient, TriageAssessment } from '../../types';
import { api } from '../../services/api';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useNavigate } from 'react-router-dom';

interface GuidedTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess: (assessment: TriageAssessment) => void;
}

export const GuidedTriageModal: React.FC<GuidedTriageModalProps> = ({ isOpen, onClose, patient, onSuccess }) => {
  const navigate = useNavigate();
  const { isListening, startListening } = useVoiceInput();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    'Severe Headache',
    'Swollen Feet / Pedal Edema',
    'Blurred Vision',
    'High Blood Pressure in 3rd Trimester'
  ]);
  const [symptomDuration, setSymptomDuration] = useState('3 days');
  const [systolicBp, setSystolicBp] = useState('152');
  const [diastolicBp, setDiastolicBp] = useState('96');
  const [spo2, setSpo2] = useState('97');
  const [heartRate, setHeartRate] = useState('88');
  const [temperature, setTemperature] = useState('98.8');
  
  const [loading, setLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<any>(null);
  const [createdAssessment, setCreatedAssessment] = useState<TriageAssessment | null>(null);

  const symptomCatalog = [
    { cat: 'Maternal High-Risk', items: ['Severe Headache', 'Blurred Vision', 'Swollen Feet / Pedal Edema', 'High Blood Pressure in 3rd Trimester', 'Vaginal Bleeding', 'Reduced Fetal Movements'] },
    { cat: 'Cardiorespiratory', items: ['Severe Chest Pain', 'Severe Breathing Difficulty', 'Persistent Cough > 2 Weeks', 'Palpitations'] },
    { cat: 'Critical Red Flags', items: ['Unconsciousness / Fainting', 'Convulsions / Seizure', 'Severe Acute Bleeding', 'Pediatric Danger Lethargy'] },
    { cat: 'General & NCD', items: ['High Persistent Fever', 'Severe Vomiting / Diarrhea', 'Uncontrolled High Blood Sugar', 'Generalized Weakness'] }
  ];

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleEvaluate = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const res = await api.evaluateTriage({
        patientId: patient.id,
        symptoms: selectedSymptoms,
        symptomDuration,
        isPregnant: patient.pregnancyStatus,
        gestationalWeeks: patient.gestationalWeeks || undefined,
        systolicBp: Number(systolicBp) || undefined,
        diastolicBp: Number(diastolicBp) || undefined,
        spo2: Number(spo2) || undefined,
        heartRate: Number(heartRate) || undefined,
        temperature: Number(temperature) || undefined
      });
      setTriageResult(res.triageResult);
      setCreatedAssessment(res.assessment);
      onSuccess(res.assessment);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && patient) {
      handleEvaluate();
    }
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-scaleUp text-slate-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gov-navy via-gov-blue to-gov-navy text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl shadow">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Guided Digital Triage & Risk Assessment</h2>
                <span className="text-[10px] bg-amber-400/30 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/40">
                  Clinical Decision Support
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Patient: <span className="text-amber-300 font-bold">{patient.name}</span> ({patient.age}y, {patient.gender}) • Village: {patient.village}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-gov-blue transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Strip */}
        <div className="bg-blue-50/80 border-b border-blue-200 px-5 py-2 text-[11px] text-blue-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Clinical Safety Protocol:</strong> AI/Algorithmic screening aid designed to assist ASHA frontline triage. Final clinical diagnosis and treatment must be performed by a registered medical practitioner.
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Vitals Quick Entry Row */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-700">Patient Recorded Vitals for Triage Algorithm:</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Systolic BP</label>
                <input
                  type="number"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold text-amber-900"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Diastolic BP</label>
                <input
                  type="number"
                  value={diastolicBp}
                  onChange={(e) => setDiastolicBp(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold text-amber-900"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">SpO2 %</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Heart Rate</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Duration</label>
                <input
                  type="text"
                  value={symptomDuration}
                  onChange={(e) => setSymptomDuration(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Symptom Checklist Catalog */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Select Presenting Symptoms & Observations:</span>
              <span className="text-[11px] text-gov-blue font-normal">{selectedSymptoms.length} symptoms selected</span>
            </div>

            <div className="space-y-3">
              {symptomCatalog.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{cat.cat}</div>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((sym, sIdx) => {
                      const isSelected = selectedSymptoms.includes(sym);
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => toggleSymptom(sym)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-gov-navy text-white shadow-sm ring-2 ring-amber-400'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {sym}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Re-evaluate Button */}
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full py-2.5 bg-gov-blue hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow transition"
          >
            {loading ? 'Evaluating Protocol...' : 'Recalculate Triage Risk Score'}
          </button>

          {/* Triage Calculation Outcome Box */}
          {triageResult && (
            <div className={`p-5 rounded-2xl border-2 space-y-3 transition-all ${
              triageResult.riskLevel === 'EMERGENCY'
                ? 'bg-red-50/90 border-red-500 text-red-950'
                : triageResult.riskLevel === 'HIGH'
                ? 'bg-amber-50/90 border-amber-500 text-amber-950'
                : triageResult.riskLevel === 'MODERATE'
                ? 'bg-blue-50/90 border-blue-400 text-blue-950'
                : 'bg-emerald-50/90 border-emerald-400 text-emerald-950'
            }`}>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {triageResult.riskLevel === 'EMERGENCY' ? (
                    <ShieldAlert className="w-7 h-7 text-red-600 animate-pulse" />
                  ) : triageResult.riskLevel === 'HIGH' ? (
                    <AlertTriangle className="w-7 h-7 text-amber-600 animate-bounce" />
                  ) : (
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  )}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-600">Screening Result</div>
                    <div className="text-lg font-black">{triageResult.urgencyLabel}</div>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-white border shadow-2xs">
                  Rule: {triageResult.ruleTriggered}
                </span>
              </div>

              {/* Rationale */}
              <div className="space-y-1 text-xs">
                <div className="font-bold">Algorithmic Clinical Rationale:</div>
                <p className="leading-relaxed bg-white/70 p-3 rounded-xl border border-black/5">
                  {triageResult.clinicalReasoning}
                </p>
              </div>

              {/* Action Plan */}
              <div className="space-y-1 text-xs">
                <div className="font-bold">Recommended Immediate Public Health Protocol:</div>
                <p className="font-semibold text-gov-navy bg-white/90 p-3 rounded-xl border border-black/5">
                  {triageResult.recommendedAction}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/teleconsult?patientId=${patient.id}`);
                  }}
                  className="py-2.5 px-4 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>Launch Teleconsultation with Doctor</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate(`/doctor?patientId=${patient.id}`);
                  }}
                  className="py-2.5 px-4 bg-gov-emerald hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Initiate District Hospital Referral</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
