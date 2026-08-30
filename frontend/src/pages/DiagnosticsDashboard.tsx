import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { DiagnosticRequest } from '../types';
import { 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertTriangle, 
  Search, 
  Filter, 
  Upload, 
  ShieldCheck,
  Plus
} from 'lucide-react';

export const DiagnosticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DiagnosticRequest[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiag, setSelectedDiag] = useState<DiagnosticRequest | null>(null);
  const [findingsInput, setFindingsInput] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [diagRes, catRes] = await Promise.all([
        api.getDiagnostics(),
        api.getTestCatalog()
      ]);
      setRequests(diagRes.diagnostics || []);
      setCatalog(catRes.catalog || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenVerify = (diag: DiagnosticRequest) => {
    setSelectedDiag(diag);
    setFindingsInput(diag.reportFindings || 'Urine Albumin: +2 (Significant Proteinuria). Normal Specific Gravity. Positive for pre-eclampsia screening.');
    setIsAbnormal(diag.isAbnormal !== undefined ? diag.isAbnormal : true);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedDiag) return;
    setUpdating(true);
    try {
      await api.updateDiagnosticStatus(selectedDiag.id, {
        status,
        reportFindings: findingsInput,
        isAbnormal
      });
      setSuccessMsg(`Test report #${selectedDiag.id.slice(0, 8)} updated to ${status}!`);
      setSelectedDiag(null);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading Diagnostic Laboratory Workstation...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900">
      
      {/* Toast Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-gov-navy via-gov-blue to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-slate-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded">
              Diagnostic Pathology & Imaging Lab
            </span>
            <span className="text-xs text-slate-300 font-medium">PHC Kalyan Clinical Lab Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, Prakash Shinde (Senior Lab Technician)
          </h1>
          <p className="text-xs text-slate-300">
            Pending Orders: <strong className="text-white">{requests.filter(r => r.status !== 'VERIFIED').length}</strong> • Verified Reports Today: <strong className="text-white">{requests.filter(r => r.status === 'VERIFIED').length}</strong>
          </p>
        </div>
      </div>

      {/* Test Requests Table & Lifecycle Pipeline */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-gov-teal" />
              <span>Public Laboratory Test Pipeline</span>
            </h3>
            <p className="text-xs text-slate-500">Requested → Scheduled → Sample Collected → Processing → Report Ready → Verified</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Patient / Citizen</th>
                <th className="p-3.5">Diagnostic Test</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {requests.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition">
                  
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{d.patient?.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{d.patient?.patientId}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-gov-navy">{d.testName}</div>
                    <div className="text-[10px] text-slate-500">{d.facility?.name}</div>
                  </td>

                  <td className="p-3.5">
                    <span className="text-[11px] font-semibold text-slate-700">{d.testCategory}</span>
                  </td>

                  <td className="p-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.priority === 'HIGH' ? 'badge-high' : 'badge-routine'
                    }`}>
                      {d.priority}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      d.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : d.status === 'REPORT_READY'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {d.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenVerify(d)}
                      className="px-3 py-1.5 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-lg text-[11px] transition"
                    >
                      {d.status === 'VERIFIED' ? 'View Findings' : 'Verify & Sign'}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Verify & Sign Report Modal */}
      {selectedDiag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp text-slate-900 space-y-4">
            
            <div className="bg-gov-navy text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gov-blue rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Diagnostic Report Verification</h3>
                  <p className="text-xs text-slate-300">Patient: {selectedDiag.patient?.name} ({selectedDiag.patient?.patientId})</p>
                </div>
              </div>
              <button onClick={() => setSelectedDiag(null)} className="text-slate-300 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Test Name</label>
                <div className="font-bold text-sm text-gov-navy">{selectedDiag.testName}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Laboratory Findings & Quantitative Values *</label>
                <textarea
                  rows={4}
                  value={findingsInput}
                  onChange={(e) => setFindingsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-gov-navy"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="abnormalCheck"
                  checked={isAbnormal}
                  onChange={(e) => setIsAbnormal(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <label htmlFor="abnormalCheck" className="font-bold text-slate-800 cursor-pointer">
                  Flag as Abnormal / Out-of-Range Clinical Finding
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedDiag(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('VERIFIED')}
                  disabled={updating}
                  className="px-5 py-2.5 bg-gov-emerald hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
                >
                  {updating ? 'Verifying...' : 'Digitally Sign & Mark Verified'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Public Diagnostic Test Catalog */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gov-navy" />
          <h3 className="font-bold text-base text-slate-900">Government Free Diagnostic Scheme Catalog</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {catalog.map((cat, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gov-navy text-sm">{cat.testName}</span>
              </div>
              <div className="text-slate-500 font-medium">Sample: {cat.sampleType} • Turnaround: {cat.turnaroundTime}</div>
              <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block">
                {cat.standardCost}
              </div>
              <div className="text-[10px] text-slate-600 pt-1">
                Available at: {cat.availableFacilities.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
