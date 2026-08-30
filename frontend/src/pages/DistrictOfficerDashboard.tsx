import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { DashboardOverview } from '../types';
import { 
  BarChart3, 
  Users, 
  Building2, 
  Video, 
  Layers, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { MaharashtraFacilityMap } from '../components/district/MaharashtraFacilityMap';

export const DistrictOfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const res = await api.getDashboardOverview();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  if (loading || !data) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading District Healthcare Analytics Suite...</div>;
  }

  const { kpis, facilityScorecards, monthlyTrends, referralFunnel, diseaseDistribution } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 text-slate-900">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-gov-navy via-gov-blue to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-slate-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded">
              State & District Health Intelligence Suite
            </span>
            <span className="text-xs text-slate-300 font-medium">Maharashtra State Innovation Society • Thane District</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, Dr. Sandeep Mane (District Health Officer)
          </h1>
          <p className="text-xs text-slate-300">
            Monitoring <strong className="text-white">{facilityScorecards.length} Public Health Facilities</strong> spanning PHCs, Rural Hospitals, and District Civil Hospital.
          </p>
        </div>
      </div>

      {/* Top 7 KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Total Patients</div>
          <div className="text-2xl font-black text-slate-900 font-mono">{kpis.totalPatients}</div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+18% MoM</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Active Facilities</div>
          <div className="text-2xl font-black text-gov-navy font-mono">{kpis.activeFacilities}</div>
          <div className="text-[10px] text-slate-500">100% Operational</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Teleconsultations</div>
          <div className="text-2xl font-black text-gov-emerald font-mono">{kpis.teleconsultations}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">Saved ~140 hrs travel</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Referral Success</div>
          <div className="text-2xl font-black text-indigo-600 font-mono">{kpis.referralCompletionRate}</div>
          <div className="text-[10px] text-indigo-700 font-semibold">Zero lost handovers</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Avg Wait Time</div>
          <div className="text-2xl font-black text-amber-600 font-mono">{kpis.averageWaitingTime}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">-45% vs baseline</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">High-Risk Cases</div>
          <div className="text-2xl font-black text-rose-600 font-mono">{kpis.highRiskCases}</div>
          <div className="text-[10px] text-rose-700 font-semibold">Tracked by ASHA</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Stockout Alerts</div>
          <div className="text-2xl font-black text-red-600 font-mono">{kpis.medicineAlerts}</div>
          <div className="text-[10px] text-red-700 font-semibold">Auto-indent queued</div>
        </div>

      </div>

      {/* Charts Grid: Registrations/Teleconsults & Referral Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Trend Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Patient Registrations & Teleconsultation Adoption</h3>
              <p className="text-xs text-slate-500">Rapid growth across rural Kalyan, Shahapur, and Bhiwandi sub-centres</p>
            </div>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#134074" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#134074" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorTele" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Area type="monotone" dataKey="registrations" name="New Patients" stroke="#134074" fillOpacity={1} fill="url(#colorReg)" />
                <Area type="monotone" dataKey="teleconsults" name="Teleconsultations" stroke="#059669" fillOpacity={1} fill="url(#colorTele)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disease / Condition Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Clinical Case Distribution</h3>
            <p className="text-xs text-slate-500">Maternal ANC, Chronic NCDs, and Pediatric care</p>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diseaseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {diseaseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Maharashtra GIS Facility Map */}
      <MaharashtraFacilityMap facilityScorecards={facilityScorecards} />

      {/* Facility Quality Scorecards & Accountability Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gov-navy" />
              <span>Public Healthcare Facility Accountability Scorecards</span>
            </h3>
            <p className="text-xs text-slate-500">Transparent monitoring of waiting times, referral completion %, and medicine availability</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Healthcare Facility</th>
                <th className="p-3.5">Type & Bed Capacity</th>
                <th className="p-3.5">Patients Today</th>
                <th className="p-3.5">Avg Wait Time</th>
                <th className="p-3.5">Referral Completion</th>
                <th className="p-3.5">Drug Alerts</th>
                <th className="p-3.5">Quality Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {facilityScorecards.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition">
                  
                  <td className="p-3.5 font-bold text-slate-900">
                    <div>{f.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{f.address}</div>
                  </td>

                  <td className="p-3.5">
                    <span className="text-[11px] font-semibold text-slate-700">{f.type}</span>
                    <div className="text-[10px] text-slate-500">{f.bedCapacity} Beds • {f.activeDoctors} Doctors</div>
                  </td>

                  <td className="p-3.5 font-bold text-slate-900">
                    {f.patientsToday} Citizens
                  </td>

                  <td className="p-3.5">
                    <span className="font-mono font-bold text-amber-700">{f.avgWaitMin} mins</span>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${f.referralCompletionRate}%` }} />
                      </div>
                      <span className="font-bold text-emerald-700 font-mono">{f.referralCompletionRate}%</span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    {f.medicineAlerts > 0 ? (
                      <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full border border-red-300">
                        ⚠️ {f.medicineAlerts} Alerts
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                        ✓ Adequate
                      </span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <span className="font-bold text-gov-teal">{f.overallQualityScore}</span>
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
