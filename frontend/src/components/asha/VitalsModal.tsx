import React, { useState } from 'react';
import { X, Activity, Heart, Thermometer, Droplet, Weight, Save, AlertTriangle } from 'lucide-react';
import { useOfflineSync } from '../../contexts/OfflineSyncContext';
import { api } from '../../services/api';
import { Patient } from '../../types';

interface VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess: () => void;
}

export const VitalsModal: React.FC<VitalsModalProps> = ({ isOpen, onClose, patient, onSuccess }) => {
  const { isOnline, addOfflineRecord } = useOfflineSync();

  const [systolicBp, setSystolicBp] = useState('152');
  const [diastolicBp, setDiastolicBp] = useState('96');
  const [heartRate, setHeartRate] = useState('88');
  const [spo2, setSpo2] = useState('97');
  const [temperature, setTemperature] = useState('98.8');
  const [bloodGlucose, setBloodGlucose] = useState('118');
  const [weight, setWeight] = useState('62.0');
  const [notes, setNotes] = useState('Field visit observation: headache, mild blurred vision, pedal edema.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !patient) return null;

  const sysNum = Number(systolicBp) || 0;
  const diaNum = Number(diastolicBp) || 0;
  const isHypertensive = sysNum >= 140 || diaNum >= 90;
  const isEmergencyBp = sysNum >= 160 || diaNum >= 105;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      patientId: patient.id,
      systolicBp: sysNum || null,
      diastolicBp: diaNum || null,
      heartRate: Number(heartRate) || null,
      spo2: Number(spo2) || null,
      temperature: Number(temperature) || null,
      bloodGlucose: Number(bloodGlucose) || null,
      weight: Number(weight) || null,
      notes
    };

    try {
      if (isOnline) {
        await api.addVitals(patient.id, payload);
      } else {
        await addOfflineRecord('RECORD_VITALS', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record vitals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="bg-gov-navy text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gov-blue rounded-xl">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Record Vitals Observation</h2>
              <p className="text-xs text-slate-300">
                Patient: <span className="font-semibold text-amber-300">{patient.name}</span> ({patient.patientId})
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

        {/* BP Warning Badge */}
        {isHypertensive && (
          <div className={`p-3 text-xs flex items-center gap-2 ${
            isEmergencyBp ? 'bg-red-100 text-red-900 border-b border-red-300' : 'bg-amber-100 text-amber-900 border-b border-amber-300'
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>
              <strong>Warning:</strong> High Blood Pressure detected ({sysNum}/{diaNum} mmHg). 
              {patient.pregnancyStatus && ' Gestational hypertension risk in pregnancy!'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>Systolic BP (mmHg)</span>
              </label>
              <input
                type="number"
                required
                value={systolicBp}
                onChange={(e) => setSystolicBp(e.target.value)}
                className={`w-full px-3 py-2 text-xs border rounded-xl font-mono font-bold ${
                  sysNum >= 140 ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>Diastolic BP (mmHg)</span>
              </label>
              <input
                type="number"
                required
                value={diastolicBp}
                onChange={(e) => setDiastolicBp(e.target.value)}
                className={`w-full px-3 py-2 text-xs border rounded-xl font-mono font-bold ${
                  diaNum >= 90 ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span>SpO2 Level (%)</span>
              </label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                <span>Temperature (°F)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-purple-500" />
                <span>Blood Glucose (mg/dL)</span>
              </label>
              <input
                type="number"
                value={bloodGlucose}
                onChange={(e) => setBloodGlucose(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Weight className="w-3.5 h-3.5 text-emerald-500" />
                <span>Weight (kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Observations / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gov-navy hover:bg-gov-blue text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isOnline ? 'Save Vitals' : 'Save Offline'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
