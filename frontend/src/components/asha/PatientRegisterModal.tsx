import React, { useState } from 'react';
import { X, UserPlus, Mic, Heart, AlertCircle, Save } from 'lucide-react';
import { useOfflineSync } from '../../contexts/OfflineSyncContext';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';

interface PatientRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PatientRegisterModal: React.FC<PatientRegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isOnline, addOfflineRecord } = useOfflineSync();
  const { language, t } = useLanguage();
  const { isListening, startListening } = useVoiceInput();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Female',
    phone: '',
    village: 'Gandhre Village, Kalyan',
    address: '',
    emergencyContact: '',
    pregnancyStatus: false,
    gestationalWeeks: '',
    bloodGroup: 'O+',
    chronicConditions: '',
    systolicBp: '',
    diastolicBp: '',
    spo2: '98',
    temperature: '98.4',
    bloodGlucose: '',
    weight: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.phone || !formData.village) {
      setError('Please fill in all mandatory demographic fields.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: formData.name,
      age: Number(formData.age),
      gender: formData.gender,
      phone: formData.phone,
      village: formData.village,
      address: formData.address || `${formData.village}, Thane District`,
      emergencyContact: formData.emergencyContact || `${formData.phone} (Family)`,
      pregnancyStatus: formData.pregnancyStatus,
      gestationalWeeks: formData.pregnancyStatus && formData.gestationalWeeks ? Number(formData.gestationalWeeks) : null,
      bloodGroup: formData.bloodGroup,
      chronicConditions: formData.chronicConditions || null,
      initialVitals: formData.systolicBp ? {
        systolicBp: Number(formData.systolicBp),
        diastolicBp: Number(formData.diastolicBp),
        spo2: Number(formData.spo2),
        temperature: Number(formData.temperature),
        bloodGlucose: formData.bloodGlucose ? Number(formData.bloodGlucose) : null,
        weight: formData.weight ? Number(formData.weight) : null
      } : undefined
    };

    try {
      if (isOnline) {
        await api.createPatient(payload);
      } else {
        // Enqueue into offline PWA IndexedDB
        await addOfflineRecord('REGISTER_PATIENT', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceFill = () => {
    startListening((spokenText) => {
      // Simulate speech-to-field extraction
      if (spokenText.includes('मीना') || spokenText.includes('Meena')) {
        setFormData(prev => ({
          ...prev,
          name: 'Meena Ramesh Patil',
          age: '24',
          gender: 'Female',
          pregnancyStatus: true,
          gestationalWeeks: '28',
          phone: '9823412345',
          village: 'Gandhre Village, Kalyan'
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          name: spokenText.slice(0, 30),
          address: spokenText
        }));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-scaleUp">
        
        {/* Header */}
        <div className="bg-gov-navy text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gov-blue rounded-xl">
              <UserPlus className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Citizen / Patient Registration</h2>
              <p className="text-xs text-slate-300">Frontline ASHA Registration & ABDM Health ID Generator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-gov-blue transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline notice if offline */}
        {!isOnline && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Offline Mode Active:</strong> Patient record will be saved securely to local cache and synchronized once internet connectivity resumes.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Voice Assist autofill bar */}
          <div className="flex items-center justify-between p-3 bg-gov-ice rounded-xl border border-blue-100">
            <div className="text-xs text-gov-navy font-semibold">
              Voice-First Demographic Autofill (मराठी / Hindi / English)
            </div>
            <button
              type="button"
              onClick={handleVoiceFill}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-gov-navy hover:bg-gov-blue text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Meena Ramesh Patil"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
              <input
                type="number"
                required
                min="0"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 24"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9823412345"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Village / Pada *</label>
              <input
                type="text"
                required
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="e.g. Gandhre Village, Kalyan"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy"
              >
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

          </div>

          {/* Maternal Pregnancy Section */}
          <div className="p-3.5 bg-pink-50/70 border border-pink-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pregnancyCheck"
                checked={formData.pregnancyStatus}
                onChange={(e) => setFormData({ ...formData, pregnancyStatus: e.target.checked })}
                className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
              />
              <label htmlFor="pregnancyCheck" className="text-xs font-bold text-pink-900 cursor-pointer">
                Patient is Currently Pregnant (Maternal ANC Beneficiary)
              </label>
            </div>

            {formData.pregnancyStatus && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-pink-800 mb-1">Gestational Age (Weeks)</label>
                  <input
                    type="number"
                    min="1"
                    max="42"
                    value={formData.gestationalWeeks}
                    onChange={(e) => setFormData({ ...formData, gestationalWeeks: e.target.value })}
                    placeholder="e.g. 28 weeks"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-pink-800 mb-1">High-Risk Factors (if any)</label>
                  <input
                    type="text"
                    value={formData.chronicConditions}
                    onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                    placeholder="e.g. Gestational Hypertension, Anemia"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Baseline Initial Vitals (Optional) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Initial Baseline Vitals (Optional)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Systolic BP</label>
                <input
                  type="number"
                  value={formData.systolicBp}
                  onChange={(e) => setFormData({ ...formData, systolicBp: e.target.value })}
                  placeholder="150"
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Diastolic BP</label>
                <input
                  type="number"
                  value={formData.diastolicBp}
                  onChange={(e) => setFormData({ ...formData, diastolicBp: e.target.value })}
                  placeholder="95"
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">SpO2 %</label>
                <input
                  type="number"
                  value={formData.spo2}
                  onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                  placeholder="98"
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="62"
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gov-navy hover:bg-gov-blue text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Registering...' : isOnline ? 'Register Patient' : 'Save to Offline Cache'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
