import React from 'react';
import { Vital } from '../../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { Activity, Droplet, Weight } from 'lucide-react';

interface VitalsTrendChartsProps {
  vitals: Vital[];
}

export const VitalsTrendCharts: React.FC<VitalsTrendChartsProps> = ({ vitals }) => {
  if (!vitals || vitals.length === 0) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
        No longitudinal vitals available for plotting.
      </div>
    );
  }

  // Format data chronological ascending for charting
  const chartData = [...vitals]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map(v => {
      const d = new Date(v.recordedAt);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      return {
        date: label,
        fullDate: d.toLocaleDateString(),
        systolic: v.systolicBp || null,
        diastolic: v.diastolicBp || null,
        glucose: v.bloodGlucose || null,
        spo2: v.spo2 || null,
        heartRate: v.heartRate || null,
        weight: v.weight || null
      };
    });

  return (
    <div className="space-y-6">
      
      {/* Chart 1: Blood Pressure Trend */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Activity className="w-4 h-4 text-red-500" />
            <span>Blood Pressure Progression (Systolic / Diastolic mmHg)</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Stage 1 Hypertensive threshold: 140/90</span>
        </div>

        <div className="h-56 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis domain={[60, 180]} stroke="#64748b" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '140 Max', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '90 Max', fill: '#f59e0b', fontSize: 10 }} />
              <Line type="monotone" dataKey="systolic" name="Systolic BP" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#ea580c" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Blood Glucose & Weight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Glucose */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Droplet className="w-4 h-4 text-purple-600" />
            <span>Blood Glucose (mg/dL)</span>
          </div>
          <div className="h-44 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis domain={[70, 220]} stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '10px' }} />
                <Line type="monotone" dataKey="glucose" name="Glucose" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weight Progression */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Weight className="w-4 h-4 text-emerald-600" />
            <span>Weight Tracking (kg)</span>
          </div>
          <div className="h-44 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis domain={[50, 90]} stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '10px' }} />
                <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
