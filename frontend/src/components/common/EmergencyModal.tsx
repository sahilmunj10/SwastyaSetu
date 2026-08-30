import React, { useState } from 'react';
import { AlertTriangle, Phone, MapPin, ShieldAlert, CheckCircle, X, Ambulance } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [escalated, setEscalated] = useState(false);

  if (!isOpen) return null;

  const handleEscalate = () => {
    setEscalated(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-4 border-red-500 overflow-hidden text-slate-900">
        
        {/* Modal Header */}
        <div className="bg-red-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-700/80 rounded-xl animate-pulse">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-wide">Emergency Health Escalation</h2>
              <p className="text-xs text-red-100 font-medium">Government Public Healthcare Fast-Response Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-red-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">

          {escalated ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-emerald-900">Emergency Alert Dispatched!</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Simulated emergency alert sent to <strong>PHC Kalyan Casualty Unit</strong> and assigned Frontline ASHA worker <strong>Sunita Gaikwad</strong>. Ambulance coordinates logged.
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-xs font-mono text-emerald-900">
                Incident ID: #EMG-MH-2026-9812 | Priority: STAT EMERGENCY
              </div>
            </div>
          ) : (
            <>
              {/* Critical Helpline Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="tel:108"
                  className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 border-2 border-red-300 rounded-xl transition group"
                >
                  <div className="p-2.5 bg-red-600 text-white rounded-lg group-hover:scale-105 transition">
                    <Ambulance className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase">Maharashtra Ambulance</div>
                    <div className="text-xl font-black text-red-700">Dial 108</div>
                  </div>
                </a>

                <a
                  href="tel:102"
                  className="flex items-center gap-3 p-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-xl transition group"
                >
                  <div className="p-2.5 bg-amber-600 text-white rounded-lg group-hover:scale-105 transition">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase">Maternal / Infant 102</div>
                    <div className="text-xl font-black text-amber-700">Dial 102</div>
                  </div>
                </a>
              </div>

              {/* Nearest Public Facility Information */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gov-navy uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>Nearest Public Healthcare Facility</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Primary Health Centre (PHC) Kalyan Rural</h4>
                  <p className="text-xs text-slate-600">Kalyan-Murbad Road, Gandhre Village (1.2 km away • ~5 mins)</p>
                  <p className="text-xs font-semibold text-gov-teal mt-1">24x7 Emergency Casualty & High-Risk ANC Stabilization Bed Active</p>
                </div>
              </div>

              {/* First Aid Instructions */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Immediate First-Aid Instructions:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  <li>Keep patient seated or lying on left side (for pregnant mothers).</li>
                  <li>Loosen tight clothing and ensure continuous airway ventilation.</li>
                  <li>Do not administer oral liquids if patient is drowsy or convulsing.</li>
                </ul>
              </div>
            </>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {!escalated ? (
              <button
                onClick={handleEscalate}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Simulate Automated Public Health Escalation</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition"
              >
                Close Window
              </button>
            )}
          </div>

          <p className="text-[11px] text-center text-slate-500 italic">
            *Prototype Demo Notification System. For real medical emergencies, directly dial 108 / 112.
          </p>

        </div>

      </div>
    </div>
  );
};
