import React from 'react';
import { Patient } from '../../types';
import { 
  Calendar, 
  Activity, 
  FlaskConical, 
  Stethoscope, 
  Layers, 
  Pill, 
  CheckCircle, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

interface LongitudinalTimelineProps {
  patient: Patient;
}

export const LongitudinalTimeline: React.FC<LongitudinalTimelineProps> = ({ patient }) => {
  // Combine all chronological public healthcare events
  const events: Array<{
    date: string;
    type: 'ENCOUNTER' | 'VITAL' | 'DIAGNOSTIC' | 'REFERRAL' | 'TRIAGE' | 'PRESCRIPTION';
    title: string;
    facility?: string;
    details: string;
    badge?: string;
    badgeColor?: string;
    icon: any;
    color: string;
  }> = [];

  // Vitals
  (patient.vitals || []).forEach(v => {
    events.push({
      date: v.recordedAt,
      type: 'VITAL',
      title: `Vitals Observation Recorded by ${v.recordedRole}`,
      details: `BP: ${v.systolicBp || '-'}/${v.diastolicBp || '-'} mmHg • HR: ${v.heartRate || '-'} bpm • SpO2: ${v.spo2 || '-'}% • Glucose: ${v.bloodGlucose || '-'} mg/dL. ${v.notes || ''}`,
      badge: (v.systolicBp || 0) >= 140 ? 'Abnormal BP' : 'Normal',
      badgeColor: (v.systolicBp || 0) >= 140 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: Activity,
      color: 'text-blue-600 bg-blue-100'
    });
  });

  // Triage
  (patient.triageAssessments || []).forEach(t => {
    events.push({
      date: t.assessedAt,
      type: 'TRIAGE',
      title: `Digital Guided Triage Screening (${t.riskLevel})`,
      details: `${t.clinicalReasoning} Recommended: ${t.recommendedAction}`,
      badge: t.riskLevel,
      badgeColor: t.riskLevel === 'EMERGENCY' ? 'badge-emergency' : t.riskLevel === 'HIGH' ? 'badge-high' : 'badge-routine',
      icon: Stethoscope,
      color: 'text-purple-600 bg-purple-100'
    });
  });

  // Consultations
  (patient.consultations || []).forEach(c => {
    events.push({
      date: c.createdAt,
      type: 'ENCOUNTER',
      title: `Clinical Consultation: ${c.diagnosis}`,
      facility: c.facility?.name,
      details: `Clinical Assessment: ${c.clinicalNotes}. Chief Complaints: ${c.chiefComplaints}`,
      badge: 'Consultation Complete',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: Stethoscope,
      color: 'text-gov-emerald bg-emerald-100'
    });
  });

  // Diagnostics
  (patient.diagnosticRequests || []).forEach(d => {
    events.push({
      date: d.createdAt,
      type: 'DIAGNOSTIC',
      title: `Diagnostic Lab: ${d.testName}`,
      facility: d.facility?.name,
      details: d.reportFindings ? `Findings: ${d.reportFindings} (Status: ${d.status})` : `Status: ${d.status} • Scheduled for ${d.appointmentDate || 'Today'}`,
      badge: d.isAbnormal ? 'Abnormal Result' : d.status,
      badgeColor: d.isAbnormal ? 'bg-red-100 text-red-900 border-red-300' : 'bg-blue-100 text-blue-900 border-blue-300',
      icon: FlaskConical,
      color: 'text-amber-600 bg-amber-100'
    });
  });

  // Referrals
  (patient.referrals || []).forEach(r => {
    events.push({
      date: r.createdDate,
      type: 'REFERRAL',
      title: `Inter-Facility Referral to ${r.destinationFacility?.name || 'District Hospital'}`,
      details: `Reason: ${r.reason}. Priority: ${r.priority}. Current Stage: ${r.status}`,
      badge: `Stage: ${r.status}`,
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-100'
    });
  });

  // Sort chronological descending
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (events.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
        <p className="text-xs">No historical healthcare encounters recorded yet for this patient.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:inset-0 before:left-3 sm:before:left-4 before:w-0.5 before:bg-slate-200">
      {events.map((ev, idx) => {
        const Icon = ev.icon;
        const formattedDate = new Date(ev.date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <div key={idx} className="relative group">
            {/* Dot / Icon */}
            <div className={`absolute -left-6 sm:-left-8 top-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${ev.color}`}>
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            {/* Card Content */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{ev.title}</h4>
                  {ev.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${ev.badgeColor}`}>
                      {ev.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{formattedDate}</span>
                </div>
              </div>

              {ev.facility && (
                <div className="text-[11px] font-semibold text-gov-teal">
                  📍 {ev.facility}
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                {ev.details}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
