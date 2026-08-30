import React from 'react';
import { Referral, ReferralTimelineEvent } from '../../types';
import { CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

interface ReferralTrackerStepperProps {
  referral: Referral;
}

export const ReferralTrackerStepper: React.FC<ReferralTrackerStepperProps> = ({ referral }) => {
  const stages = [
    { key: 'CREATED', label: '1. Referral Created', desc: 'Medical Officer created electronic transfer record' },
    { key: 'SENT', label: '2. Sent to Hub', desc: 'Securely dispatched to District Hospital queue' },
    { key: 'ACCEPTED', label: '3. Accepted', desc: 'Specialist OB/GYN accepted referral case' },
    { key: 'SCHEDULED', label: '4. Scheduled', desc: 'Hospital appointment slot allocated' },
    { key: 'ARRIVED', label: '5. Patient Arrived', desc: 'Checked in at District Hospital reception' },
    { key: 'CONSULTED', label: '6. Consulted', desc: 'Specialist evaluation & Doppler scan performed' },
    { key: 'CLOSED', label: '7. Closed & Safe', desc: 'Care loop closed with ASHA follow-up' }
  ];

  const currentStatus = referral.status;
  const stageKeys = stages.map(s => s.key);
  let currentIndex = stageKeys.indexOf(currentStatus);
  if (currentIndex === -1) {
    if (currentStatus === 'FOLLOWUP_REQUIRED') currentIndex = 5;
    else currentIndex = 1;
  }

  const timelineEvents: ReferralTimelineEvent[] = referral.parsedTimeline || [];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-gov-blue bg-gov-ice px-2 py-0.5 rounded border border-blue-200">
              #REF-MH-2026-0892
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              referral.priority === 'EMERGENCY' ? 'badge-emergency' : 'badge-high'
            }`}>
              Priority: {referral.priority}
            </span>
          </div>
          <h3 className="font-bold text-base text-slate-900 mt-1">
            {referral.reason}
          </h3>
        </div>

        {/* Origin -> Destination Route Badge */}
        <div className="flex items-center gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="font-semibold text-slate-700">
            {referral.originFacility?.name?.split(' ')[0] || 'PHC Kalyan'}
          </div>
          <ArrowRight className="w-4 h-4 text-gov-teal" />
          <div className="font-bold text-gov-navy">
            {referral.destinationFacility?.name || 'Thane District Civil Hospital'}
          </div>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="relative">
        <div className="hidden md:flex items-center justify-between relative z-10">
          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={stage.key} className="flex-1 flex flex-col items-center text-center px-1">
                {/* Node circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition shadow-sm ${
                    isCompleted
                      ? 'bg-gov-emerald text-white ring-4 ring-emerald-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>

                {/* Label */}
                <div className="mt-2 space-y-0.5">
                  <div className={`text-[11px] font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                    {stage.label}
                  </div>
                  <div className="text-[9px] text-slate-500 max-w-[100px] leading-tight">
                    {stage.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Line */}
        <div className="hidden md:block absolute top-4.5 left-8 right-8 h-1 bg-slate-200 -z-0">
          <div
            className="h-1 bg-gov-emerald transition-all duration-500"
            style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>

        {/* Mobile Vertical Stepper */}
        <div className="md:hidden space-y-3 pl-4 border-l-2 border-slate-200">
          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentIndex;
            return (
              <div key={stage.key} className="relative space-y-0.5">
                <div
                  className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full ${
                    isCompleted ? 'bg-gov-emerald ring-2 ring-emerald-200' : 'bg-slate-300'
                  }`}
                />
                <div className={`text-xs font-bold ${isCompleted ? 'text-gov-navy' : 'text-slate-400'}`}>
                  {stage.label}
                </div>
                <div className="text-[11px] text-slate-500">{stage.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified Interoperability Health Summary */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
        <div className="font-bold text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-gov-teal" />
          <span>Clinical Handover & Interoperability Summary (FHIR Compatible)</span>
        </div>
        <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
          {referral.clinicalSummary || 'High risk pregnancy with gestational hypertension. Digital lab results attached for spot urine albumin and CBC.'}
        </p>
      </div>

      {/* Live Event Log */}
      {timelineEvents.length > 0 && (
        <div className="space-y-2 text-xs">
          <div className="font-bold text-slate-700">Audit & Handshake History:</div>
          <div className="space-y-1.5">
            {timelineEvents.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-gov-ice/50 rounded-lg border border-blue-100 flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-gov-blue shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-gov-navy">{item.actor}</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{item.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
