import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  Building2, 
  Users, 
  Calendar, 
  Pill, 
  FlaskConical, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const FacilityAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [apptsRes, medsRes, diagRes] = await Promise.all([
          api.getAppointments(),
          api.getMedicines(),
          api.getDiagnostics()
        ]);
        setAppointments(apptsRes.appointments || []);
        setMedicines(medsRes.medicines || []);
        setDiagnostics(diagRes.diagnostics || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading Facility Operations Console...</div>;
  }

  const waitingCount = appointments.filter(a => a.status === 'WAITING').length;
  const inProgressCount = appointments.filter(a => a.status === 'IN_PROGRESS').length;
  const lowStockCount = medicines.filter(m => m.isLowStock).length;
  const pendingDiagCount = diagnostics.filter(d => d.status !== 'VERIFIED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-gov-navy via-gov-blue to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-slate-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded">
              Facility Administration & Operations
            </span>
            <span className="text-xs text-slate-300 font-medium">PHC Kalyan Rural Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, Kavita Chavan (Facility Superintendent)
          </h1>
          <p className="text-xs text-slate-300">
            Active Doctors: <strong className="text-white">4 On Duty</strong> • Bed Capacity: <strong className="text-white">15 (8 Occupied)</strong> • Operational OPD Suites: <strong className="text-white">3</strong>
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold">Live Waiting Queue</div>
          <div className="text-2xl font-black text-gov-navy font-mono">{waitingCount}</div>
          <div className="text-[10px] text-slate-500">{inProgressCount} in Consultation</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold">Active Doctor Rosters</div>
          <div className="text-2xl font-black text-emerald-600 font-mono">4 / 4</div>
          <div className="text-[10px] text-emerald-700 font-semibold">100% Shift Coverage</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold">Pending Diagnostics</div>
          <div className="text-2xl font-black text-blue-600 font-mono">{pendingDiagCount}</div>
          <div className="text-[10px] text-blue-700 font-semibold">Lab Operating Normal</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold">Medicine Indents</div>
          <div className="text-2xl font-black text-amber-600 font-mono">{lowStockCount}</div>
          <div className="text-[10px] text-amber-800 font-semibold">Low Stock Warnings</div>
        </div>

      </div>

      {/* Roster & Queue Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gov-navy" />
            <span>Facility Active OPD Queue & Appointment Allocations</span>
          </h3>
          <span className="text-xs font-mono font-bold text-slate-500">Today's Schedule</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Token / Patient</th>
                <th className="p-3.5">Doctor Assigned</th>
                <th className="p-3.5">Consultation Mode</th>
                <th className="p-3.5">Urgency</th>
                <th className="p-3.5">Queue Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {appointments.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-slate-900">{a.tokenNumber}</span> • {a.patient?.name}
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">
                    {a.doctor?.name || 'Dr. Rajesh Kulkarni'}
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-gov-blue">{a.mode}</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      a.urgency === 'HIGH' ? 'badge-high' : 'badge-routine'
                    }`}>
                      {a.urgency}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-800">{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
