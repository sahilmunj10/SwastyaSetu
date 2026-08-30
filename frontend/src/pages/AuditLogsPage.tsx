import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuditLog } from '../types';
import { ShieldCheck, Lock, Clock, Filter, Search, User, FileText } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await api.getAuditLogs({ limit: 100 });
        setLogs(res.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const matchesQuery = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesQuery;
  });

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading Security & Compliance Audit Trail...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-gov-navy via-slate-900 to-gov-navy text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-slate-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded">
              Government Compliance & Security
            </span>
            <span className="text-xs text-slate-300 font-medium">ABDM / FHIR Security Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            System Security & Access Logs
          </h1>
          <p className="text-xs text-slate-300">
            Immutable log of all clinical assessments, vitals updates, prescription issues, and referral handovers.
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gov-teal" />
              <span>Immutable Transaction Log</span>
            </h3>
            <p className="text-xs text-slate-500">All user interactions timestamped with role and IP metadata</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy w-48 sm:w-60"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="TRIAGE_SCREENING">TRIAGE_SCREENING</option>
              <option value="CREATE_REFERRAL">CREATE_REFERRAL</option>
              <option value="RECORD_VITALS">RECORD_VITALS</option>
              <option value="VERIFY_REPORT">VERIFY_REPORT</option>
              <option value="COMPLETE_CONSULTATION">COMPLETE_CONSULTATION</option>
              <option value="OFFLINE_SYNC">OFFLINE_SYNC</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor / User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Action Code</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Transaction Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-gov-blue">
                    {log.action}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700">
                    {log.entity}
                  </td>
                  <td className="p-3.5 text-slate-600 leading-relaxed font-mono text-[11px]">
                    {log.details}
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
