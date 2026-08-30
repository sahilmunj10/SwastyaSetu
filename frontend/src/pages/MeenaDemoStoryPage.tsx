import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Stethoscope, 
  Activity, 
  Video, 
  FlaskConical, 
  Layers, 
  Bell, 
  MapPin, 
  BarChart3, 
  ShieldCheck,
  User,
  Play,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const MeenaDemoStoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: 'ASHA Registers Pregnant Mother Meena',
      actor: 'Sunita Gaikwad (ASHA Frontline Worker)',
      role: 'ASHA',
      badge: 'Step 1 of 15 • Registration',
      description: 'ASHA Sunita visits Gandhre village in rural Kalyan and registers 24-year-old Meena Patil (28 weeks pregnant) with demographic info and ABDM Health ID.',
      outcome: 'Meena Patil registered in public healthcare registry (#MH-THN-00101).',
      preview: {
        name: 'Meena Ramesh Patil',
        age: '24 years',
        village: 'Gandhre Village, Kalyan',
        pregnancy: 'Active ANC (28 Weeks Gestation)'
      }
    },
    {
      step: 2,
      title: 'ASHA Records Field Vitals',
      actor: 'Sunita Gaikwad (ASHA Worker)',
      role: 'ASHA',
      badge: 'Step 2 of 15 • Vitals Check',
      description: 'ASHA records Meena’s physiological vitals during home visit. Blood pressure is significantly elevated at 152/96 mmHg with pedal edema and headache.',
      outcome: 'Vitals observation logged to digital longitudinal EHR.',
      preview: {
        bp: '152/96 mmHg (Stage 2 Elevated)',
        pulse: '88 bpm',
        spo2: '97%',
        symptoms: 'Severe headache, swollen feet, blurred vision'
      }
    },
    {
      step: 3,
      title: 'Digital Guided Triage Flags High Priority',
      actor: 'Swasthya Setu Algorithmic Triage Engine',
      role: 'ASHA',
      badge: 'Step 3 of 15 • AI Screening Aid',
      description: 'The rule-based triage screening engine analyzes symptoms + vitals. It calculates HIGH RISK for Gestational Hypertension / Pre-eclampsia.',
      outcome: 'Clear clinical decision support reasoning generated with urgent protocol guidance.',
      preview: {
        riskLevel: '⚠️ HIGH RISK (Maternal Urgent Assessment)',
        rule: 'MATERNAL_GESTATIONAL_HYPERTENSION_PREECLAMPSIA',
        recommended: 'Book urgent specialist teleconsultation & spot urine protein test.'
      }
    },
    {
      step: 4,
      title: 'ASHA Books Priority Teleconsultation',
      actor: 'Sunita Gaikwad (ASHA Worker)',
      role: 'ASHA',
      badge: 'Step 4 of 15 • Scheduling',
      description: 'ASHA schedules an emergency teleconsultation with Dr. Rajesh Kulkarni at PHC Kalyan Rural Telemedicine Suite.',
      outcome: 'Generated Queue Token #A-024. Waiting position: 2.',
      preview: {
        token: 'A-024',
        mode: 'Teleconsultation (Sub-centre to PHC)',
        doctor: 'Dr. Rajesh Kulkarni (Medical Officer)'
      }
    },
    {
      step: 5,
      title: 'Doctor Reviews Longitudinal EHR in Real-Time',
      actor: 'Dr. Rajesh Kulkarni (Medical Officer, PHC Kalyan)',
      role: 'DOCTOR',
      badge: 'Step 5 of 15 • Doctor Review',
      description: 'Dr. Rajesh joins the teleconsultation room, inspects Meena’s past visits, vitals charts over time, and triage rationale.',
      outcome: 'No lost paperwork; complete clinical continuity achieved.',
      preview: {
        observation: 'Confirmed clinical presentation of high-risk gestational hypertension.',
        history: 'Past ANC visits showed normal BP (120/80), confirming acute rise.'
      }
    },
    {
      step: 6,
      title: 'Doctor Recommends Diagnostic Lab Tests',
      actor: 'Dr. Rajesh Kulkarni (PHC Kalyan)',
      role: 'DOCTOR',
      badge: 'Step 6 of 15 • Diagnostic Order',
      description: 'Doctor orders spot Urine Albumin/Protein and Complete Blood Count (CBC) to screen for proteinuria and pre-eclampsia.',
      outcome: 'Electronic diagnostic order automatically transmitted to PHC Kalyan Lab.',
      preview: {
        ordered: 'Urine Routine & Spot Protein (Albumin) + CBC Panel',
        cost: 'Free under Maharashtra Public Health Scheme'
      }
    },
    {
      step: 7,
      title: 'System Finds Nearest Government Diagnostic Facility',
      actor: 'Swasthya Setu Diagnostic Locator',
      role: 'PATIENT',
      badge: 'Step 7 of 15 • Lab Coordination',
      description: 'Platform coordinates sample collection at PHC Kalyan Pathology Lab (1.2 km away), avoiding private lab fees.',
      outcome: 'Sample collected and queue token assigned to technician.',
      preview: {
        facility: 'PHC Kalyan Clinical Laboratory',
        slot: 'Immediate STAT Sample Collection'
      }
    },
    {
      step: 8,
      title: 'Lab Staff Processes & Verifies Test Report',
      actor: 'Prakash Shinde (Senior Lab Technician)',
      role: 'LAB',
      badge: 'Step 8 of 15 • Lab Verification',
      description: 'Technician conducts urinalysis. Result shows Urine Albumin +2 (Significant Proteinuria). Technicians digitally signs report.',
      outcome: 'Verified electronic diagnostic report instantly linked to Meena’s EHR.',
      preview: {
        findings: 'Urine Albumin: +2 (Proteinuria Positive)',
        sign: 'Digitally verified by Prakash Shinde (Lab Tech)'
      }
    },
    {
      step: 9,
      title: 'Doctor Evaluates Lab Results',
      actor: 'Dr. Rajesh Kulkarni (Medical Officer)',
      role: 'DOCTOR',
      badge: 'Step 9 of 15 • Clinical Decision',
      description: 'Doctor reviews verified proteinuria +2 result. Prescribes Tab Labetalol 100mg to stabilize BP immediately.',
      outcome: 'Electronic prescription generated and sent to PHC pharmacy & patient SMS.',
      preview: {
        rx: 'Tab Labetalol 100 mg BD (Twice Daily) + Calcium D3',
        status: 'Prescription active & stock available at PHC Kalyan'
      }
    },
    {
      step: 10,
      title: 'Doctor Creates Electronic Referral to District Hospital',
      actor: 'Dr. Rajesh Kulkarni (PHC Kalyan)',
      role: 'DOCTOR',
      badge: 'Step 10 of 15 • Referral Escalation',
      description: 'Given gestational age (28w) and proteinuria, doctor escalates Meena to Thane District Civil Hospital High-Risk OB/GYN Unit.',
      outcome: 'Digital referral token #REF-MH-2026-0892 created with full lab history attached.',
      preview: {
        destination: 'Thane District Civil Hospital (OB/GYN High-Risk Unit)',
        priority: 'HIGH PRIORITY'
      }
    },
    {
      step: 11,
      title: 'Patient & ASHA Track Real-Time Referral Acceptance',
      actor: 'Meena Patil & ASHA Sunita',
      role: 'PATIENT',
      badge: 'Step 11 of 15 • Referral Tracking',
      description: 'Specialist Dr. Ananya Joshi at Thane District Hospital accepts referral. Appointment scheduled for next morning at 09:30 AM.',
      outcome: 'Patient and ASHA receive SMS notification with confirmed token.',
      preview: {
        stage: 'ACCEPTED BY SPECIALIST',
        specialist: 'Dr. Ananya Joshi (MD, OB/GYN Specialist Thane Civil)'
      }
    },
    {
      step: 12,
      title: 'ASHA Receives Automated Follow-Up Reminder',
      actor: 'Swasthya Setu Follow-Up Engine',
      role: 'ASHA',
      badge: 'Step 12 of 15 • Predictive Follow-up',
      description: 'AI follow-up engine flags Meena as High Drop-off Risk (0.85). Tasks ASHA Sunita with mandatory home check.',
      outcome: 'ASHA dashboard displays critical follow-up task on mobile app.',
      preview: {
        task: 'Post-Referral Home Check: Verify BP on Labetalol & ensure hospital attendance.',
        aiRiskScore: '0.85 (High Drop-off Probability)'
      }
    },
    {
      step: 13,
      title: 'ASHA Completes Home Visit & BP Recheck',
      actor: 'Sunita Gaikwad (ASHA Worker)',
      role: 'ASHA',
      badge: 'Step 13 of 15 • Frontline Visit',
      description: 'ASHA visits Meena’s home. BP has stabilized to 132/86 mmHg on Labetalol. Accompanies Meena to District Hospital next day.',
      outcome: 'Follow-up marked COMPLETED with field notes.',
      preview: {
        recheckBp: '132/86 mmHg (Stabilized)',
        compliance: 'Taking medication as prescribed'
      }
    },
    {
      step: 14,
      title: 'District Health Officer Dashboard Reflects Completed Journey',
      actor: 'Dr. Sandeep Mane (District Health Officer, Thane)',
      role: 'DISTRICT_OFFICER',
      badge: 'Step 14 of 15 • Governance & Quality',
      description: 'District monitoring dashboard automatically records: 1 Referral Completed, 1 High-Risk Mother Protected, 0 Unnecessary Delays.',
      outcome: 'Live KPI metrics updated in real-time.',
      preview: {
        kpiUpdate: 'Thane Referral Completion: 88% • Quality Grade: A (94/100)',
        travelSaved: 'Eliminated 3 unnecessary exploratory bus trips'
      }
    },
    {
      step: 15,
      title: 'Continuum of Care Summary & SIH Value Delivered',
      actor: 'SWASTHYA SETU Platform Impact',
      role: 'DISTRICT_OFFICER',
      badge: 'Step 15 of 15 • Value Proposition',
      description: 'Through Swasthya Setu, Meena received timely triage, telemedicine consultation, diagnostic testing, and specialist district hospital care without losing a single medical document.',
      outcome: 'ONE PATIENT → ONE CONTINUOUS HEALTHCARE JOURNEY ACHIEVED.',
      preview: {
        continuity: '100% Unified Digital EHR Across Tiers',
        healthOutcome: 'Pre-eclampsia detected early, healthy pregnancy preserved.'
      }
    }
  ];

  const current = steps[currentStep - 1];

  const handleGoToRole = async () => {
    await switchRole(current.role as any);
    const pathMap: Record<string, string> = {
      PATIENT: '/patient',
      ASHA: '/asha',
      DOCTOR: '/doctor',
      LAB: '/diagnostics',
      PHARMACY: '/pharmacy',
      ADMIN: '/admin',
      DISTRICT_OFFICER: '/district'
    };
    navigate(pathMap[current.role]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-900">
      
      {/* Top Demo Story Badge Header */}
      <div className="bg-gradient-to-r from-gov-navy via-slate-900 to-gov-navy text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full shadow">
              SIH PROBLEM STATEMENT 26133
            </span>
            <span className="text-xs text-amber-200 font-semibold">
              Master Interactive Prototype Walkthrough
            </span>
          </div>

          <button
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-black">
            Meena's Healthcare Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            "Connecting a pregnant rural mother from a village sub-centre to primary triage, teleconsultation, public diagnostics, and district hospital care."
          </p>
        </div>

        {/* 15-Step Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Stage {currentStep} of 15</span>
            <span className="font-bold text-amber-300">{Math.round((currentStep / 15) * 100)}% Journey Completed</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${(currentStep / 15) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6 animate-scaleUp">
        
        {/* Step Indicator and Actor Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gov-ice text-gov-navy border border-blue-200">
              {current.badge}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Actor: <strong className="text-slate-800">{current.actor}</strong>
            </span>
          </div>

          <button
            onClick={handleGoToRole}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-gov-ice text-gov-navy font-bold text-xs rounded-xl border border-slate-300 transition flex items-center gap-1.5"
          >
            <span>Open in {current.role} Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Title & Narrative */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {current.title}
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {current.description}
          </p>
        </div>

        {/* Structured Data Preview Box */}
        <div className="bg-gov-ice/60 rounded-2xl p-5 border border-blue-200 space-y-2 text-xs">
          <div className="font-bold text-gov-navy flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Digital Healthcare Artifact / Observation:</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-2 font-mono text-xs text-slate-800">
            {Object.entries(current.preview).map(([key, val]) => (
              <div key={key} className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">{key}:</span>
                <span className="font-semibold text-slate-900">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expected System Outcome */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="block text-emerald-950 font-bold">Public Health Impact Outcome:</strong>
            <span>{current.outcome}</span>
          </div>
        </div>

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition disabled:opacity-40 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-1">
            {steps.map(s => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step)}
                className={`w-3 h-3 rounded-full transition ${
                  s.step === currentStep
                    ? 'bg-gov-navy scale-125 ring-2 ring-gov-blue'
                    : s.step < currentStep
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
                title={`Jump to Step ${s.step}`}
              />
            ))}
          </div>

          {currentStep < 15 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(15, prev + 1))}
              className="px-5 py-2.5 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center gap-2"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/district')}
              className="px-5 py-2.5 bg-gov-emerald hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center gap-2"
            >
              <span>View District DHO Impact Dashboard</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
