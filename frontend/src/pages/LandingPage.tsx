import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  HeartHandshake, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  Video, 
  Stethoscope, 
  Layers, 
  Pill, 
  FlaskConical, 
  WifiOff, 
  MapPin, 
  Play,
  ShieldCheck, 
  Building2, 
  Users, 
  ChevronRight,
  UserCheck,
  PhoneCall,
  Lock
} from 'lucide-react';
import { HealthServiceModal, ServiceType } from '../components/landing/HealthServiceModal';

export const LandingPage: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeServiceModal, setActiveServiceModal] = useState<ServiceType | null>(null);

  const handleLaunchRole = async (role: any, path: string) => {
    if (!user) {
      navigate(`/login?role=${role}`);
      return;
    }
    await switchRole(role);
    navigate(path);
  };

  const patientJourneySteps = [
    { title: '1. Village Sub-Centre', subtitle: 'Frontline ASHA screening & vitals check', icon: '🏡', color: 'border-amber-200 bg-amber-50/50' },
    { title: '2. Digital Triage', subtitle: 'Rule-based algorithmic risk prioritization', icon: '🩺', color: 'border-purple-200 bg-purple-50/50' },
    { title: '3. PHC Teleconsultation', subtitle: 'Low-bandwidth video/audio session with doctor', icon: '📹', color: 'border-blue-200 bg-blue-50/50' },
    { title: '4. Diagnostic Lab', subtitle: 'Spot urine protein & CBC at public laboratory', icon: '🔬', color: 'border-teal-200 bg-teal-50/50' },
    { title: '5. District Hospital Referral', subtitle: 'Electronic handover to OB/GYN specialist', icon: '🏥', color: 'border-indigo-200 bg-indigo-50/50' },
    { title: '6. Frontline Follow-up', subtitle: 'ASHA home visit & continuous recovery monitoring', icon: '✅', color: 'border-emerald-200 bg-emerald-50/50' }
  ];

  const keyServices: Array<{
    id: ServiceType;
    title: string;
    desc: string;
    badge: string;
    actionLabel: string;
    icon: any;
    color: string;
    badgeColor: string;
    borderHover: string;
  }> = [
    {
      id: 'TELECONSULT',
      title: 'Assisted Teleconsultation',
      desc: 'Connects rural sub-centres to PHC medical officers with low-bandwidth 2G/3G audio fallback and in-call prescription builder.',
      badge: 'Low-Bandwidth VoIP',
      actionLabel: 'Launch Teleconsultation Room',
      icon: Video,
      color: 'text-blue-600 bg-blue-50',
      badgeColor: 'bg-blue-100 text-blue-800',
      borderHover: 'hover:border-blue-300 hover:shadow-blue-100'
    },
    {
      id: 'TRIAGE_CDS',
      title: 'Digital Guided Triage',
      desc: 'Rule-based clinical decision support (CDS) screening engine classifying presenting vitals into Routine, Moderate, High, and Emergency.',
      badge: 'Algorithmic CDS Engine',
      actionLabel: 'Test Live Triage Decision Support',
      icon: Stethoscope,
      color: 'text-purple-600 bg-purple-50',
      badgeColor: 'bg-purple-100 text-purple-800',
      borderHover: 'hover:border-purple-300 hover:shadow-purple-100'
    },
    {
      id: 'MEDICINE_FINDER',
      title: 'Public Medicine Availability Locator',
      desc: 'Real-time stock search across government primary health centres and hospitals, eliminating wasted travel for citizens.',
      badge: 'Live Government Stock',
      actionLabel: 'Search Available Medicine Live',
      icon: Pill,
      color: 'text-amber-600 bg-amber-50',
      badgeColor: 'bg-amber-100 text-amber-800',
      borderHover: 'hover:border-amber-300 hover:shadow-amber-100'
    },
    {
      id: 'REFERRAL_TRACKER',
      title: '8-Stage Referral Tracking',
      desc: 'End-to-end referral lifecycle (Created → Sent → Accepted → Scheduled → Arrived → Consulted → Closed) preventing drop-offs.',
      badge: 'Closed-Loop Inter-Tier',
      actionLabel: 'Track Referral Lifecycle',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      borderHover: 'hover:border-indigo-300 hover:shadow-indigo-100'
    },
    {
      id: 'EHR_TIMELINE',
      title: 'Longitudinal Health Record (EHR)',
      desc: 'Unified chronological EHR spanning village sub-centres, PHCs, diagnostic labs, and district hospitals under ABHA Health ID.',
      badge: 'ABDM Health ID Format',
      actionLabel: 'Inspect Patient EHR Record',
      icon: Activity,
      color: 'text-emerald-600 bg-emerald-50',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      borderHover: 'hover:border-emerald-300 hover:shadow-emerald-100'
    },
    {
      id: 'DIAGNOSTICS',
      title: 'Public Diagnostic Coordination',
      desc: 'Laboratory directory, electronic test ordering, specimen tracking, and verified electronic report sign-off under state health schemes.',
      badge: 'Free Pathology Directory',
      actionLabel: 'View Diagnostic Test Catalog',
      icon: FlaskConical,
      color: 'text-teal-600 bg-teal-50',
      badgeColor: 'bg-teal-100 text-teal-800',
      borderHover: 'hover:border-teal-300 hover:shadow-teal-100'
    },
    {
      id: 'OFFLINE_SYNC',
      title: 'Offline-First PWA Synchronization',
      desc: 'Frontline ASHA workers can register citizens and record vitals without connectivity; data queues in IndexedDB and flushes on return.',
      badge: 'IndexedDB Field Cache',
      actionLabel: 'Simulate Offline Sync Queue',
      icon: WifiOff,
      color: 'text-orange-600 bg-orange-50',
      badgeColor: 'bg-orange-100 text-orange-800',
      borderHover: 'hover:border-orange-300 hover:shadow-orange-100'
    },
    {
      id: 'GIS_ANALYTICS',
      title: 'District Health Officer GIS Analytics',
      desc: 'High-level KPI dashboards, facility wait times, referral completion funnel, and interactive Leaflet GIS facility mapping.',
      badge: 'State Health Governance',
      actionLabel: 'Explore Maharashtra GIS Map',
      icon: MapPin,
      color: 'text-rose-600 bg-rose-50',
      badgeColor: 'bg-rose-100 text-rose-800',
      borderHover: 'hover:border-rose-300 hover:shadow-rose-100'
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gov-navy via-gov-blue to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Government Emblem / Accreditation Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-300 shadow-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Smart India Hackathon 2026 • Government of Maharashtra</span>
          </div>

          {/* Hero Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Connecting Every Patient to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400">Right Care, at the Right Time</span>
            </h1>
            <p className="text-sm sm:text-lg text-slate-300 leading-relaxed font-normal max-w-3xl mx-auto">
              An intelligent care-continuity and tele-triage layer uniting citizens, frontline ASHA workers, primary health centres (PHCs), diagnostic labs, and district hospitals into <strong>one seamless healthcare journey</strong>.
            </p>
          </div>

          {/* Focused, Clean CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#services"
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-950/40 flex items-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore 8 Public Health Services</span>
            </a>

            <button
              onClick={() => navigate('/meena-journey')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs sm:text-sm border border-white/30 backdrop-blur-sm transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current text-amber-300" />
              <span>Meena's Continuum Demo</span>
            </button>

            <Link
              to="/login"
              className="px-6 py-3.5 bg-gov-blue/80 hover:bg-gov-blue text-white font-bold rounded-xl text-xs sm:text-sm border border-blue-400/30 backdrop-blur-sm transition flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Citizen & Staff Sign In</span>
            </Link>
          </div>

          {/* Live System Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/10 text-left">
            <div className="bg-white/5 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-amber-400">100%</div>
              <div className="text-xs text-slate-300 font-medium">Longitudinal EHR Continuity</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-emerald-400">&lt; 15 min</div>
              <div className="text-xs text-slate-300 font-medium">Dynamic Live Queue Average</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-blue-400">8-Stage</div>
              <div className="text-xs text-slate-300 font-medium">Closed-Loop Referral Tracking</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-purple-400">Offline PWA</div>
              <div className="text-xs text-slate-300 font-medium">IndexedDB Field Synchronization</div>
            </div>
          </div>

        </div>
      </section>

      {/* 8 Core Healthcare Services — ALL FULLY INTERACTIVE */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-gov-blue bg-blue-100 px-3 py-1 rounded-full">
            Interactive Healthcare Suite
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Strengthening Maharashtra Public Health Infrastructure
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Click on any public health service below to test the live implementation, real-time database queries, and algorithmic decision support.
          </p>
        </div>

        {/* 8 Interactive Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {keyServices.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                onClick={() => setActiveServiceModal(s.id)}
                className={`group bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 transform hover:-translate-y-1 ${s.borderHover}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveServiceModal(s.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${s.color} shadow-inner group-hover:scale-105 transition`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${s.badgeColor}`}>
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-gov-navy transition">
                    {s.title}
                  </h3>
                  
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-gov-blue group-hover:text-amber-600 transition">
                  <span>{s.actionLabel}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* One Patient -> One Healthcare Journey Visualizer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-8">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Continuum of Care Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              ONE PATIENT → ONE CONTINUOUS HEALTHCARE JOURNEY
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Citizens move across public healthcare tiers without lost physical paperwork, repeated tests, or fragmented records.
            </p>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patientJourneySteps.map((step, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border ${step.color} space-y-2 transition`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="text-xs font-mono font-bold text-slate-400">Tier 0{idx + 1}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/meena-journey')}
              className="inline-flex items-center gap-2 text-xs font-bold text-gov-navy hover:text-gov-blue underline underline-offset-4"
            >
              <span>Inspect how high-risk pregnant mother Meena experiences this complete journey</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Department Portals & Direct Access */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-gov-navy via-slate-900 to-gov-navy text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 border border-slate-700">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-gov-emerald text-white font-bold px-2 py-0.5 rounded">
                  AUTHENTICATED SECTORS
                </span>
                <h3 className="text-xl font-bold">Public Health Sector Workstations</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Access specialized clinical workstations, inventory management, and governance dashboards:
              </p>
            </div>

            <Link
              to="/login"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Portal Sign In</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {[
              { role: 'PATIENT', label: 'Patient Portal', sub: 'Citizen EHR & Token', path: '/patient', icon: '👤' },
              { role: 'ASHA', label: 'ASHA Workstation', sub: 'Frontline Field App', path: '/asha', icon: '🩺' },
              { role: 'DOCTOR', label: 'PHC Medical Officer', sub: 'Tele-OPD & Rx Suite', path: '/doctor', icon: '👨‍⚕️' },
              { role: 'LAB', label: 'Diagnostic Lab', sub: 'Specimen & Reports', path: '/diagnostics', icon: '🔬' },
              { role: 'PHARMACY', label: 'Pharmacy Store', sub: 'Drug Stock & Indents', path: '/pharmacy', icon: '💊' },
              { role: 'ADMIN', label: 'Facility Admin', sub: 'Queues & Operations', path: '/admin', icon: '🏥' },
              { role: 'DISTRICT_OFFICER', label: 'District DHO', sub: 'GIS & State KPIs', path: '/district', icon: '📊' }
            ].map(item => (
              <button
                key={item.role}
                onClick={() => handleLaunchRole(item.role, item.path)}
                className="bg-slate-800/90 hover:bg-gov-blue p-3.5 rounded-2xl border border-slate-700 text-center space-y-1.5 transition transform hover:scale-105 group shadow"
              >
                <div className="text-2xl">{item.icon}</div>
                <div className="font-bold text-xs text-white group-hover:text-amber-300">{item.label}</div>
                <div className="text-[10px] text-slate-400">{item.sub}</div>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Official Government Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500 space-y-3 border-t border-slate-200 pt-8">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-semibold">
          <button onClick={() => setActiveServiceModal('MEDICINE_FINDER')} className="hover:text-gov-navy">Find Medicines</button>
          <button onClick={() => setActiveServiceModal('TRIAGE_CDS')} className="hover:text-gov-navy">Triage Decision Support</button>
          <button onClick={() => setActiveServiceModal('TELECONSULT')} className="hover:text-gov-navy">Teleconsultation</button>
          <button onClick={() => setActiveServiceModal('GIS_ANALYTICS')} className="hover:text-gov-navy">District Facility Map</button>
          <Link to="/login" className="hover:text-gov-navy">Staff & Citizen Portal</Link>
        </div>
        <p className="font-semibold text-slate-700">
          SWASTHYA SETU — Unified Public Healthcare Access & Care Continuity Platform
        </p>
        <p className="max-w-2xl mx-auto text-[11px] text-slate-500">
          Government of Maharashtra • Department of Public Health & Family Welfare • Smart India Hackathon Problem Statement #26133.
        </p>
      </footer>

      {/* Interactive Health Service Modal */}
      <HealthServiceModal
        service={activeServiceModal}
        onClose={() => setActiveServiceModal(null)}
      />

    </div>
  );
};
