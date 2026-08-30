import React from 'react';
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
  Bell, 
  WifiOff, 
  ShieldCheck, 
  Users, 
  MapPin, 
  Play,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLaunchRole = async (role: any, path: string) => {
    await switchRole(role);
    navigate(path);
  };

  const patientJourneySteps = [
    { title: '1. Village Sub-Centre', subtitle: 'Frontline ASHA screening & vitals check', icon: '🏡', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { title: '2. Digital Triage', subtitle: 'Rule-based algorithmic risk stratification', icon: '🩺', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { title: '3. PHC Teleconsultation', subtitle: 'Low-bandwidth video/audio session with doctor', icon: '📹', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { title: '4. Diagnostic Lab', subtitle: 'Spot urine protein & CBC at public lab', icon: '🔬', color: 'bg-teal-100 text-teal-800 border-teal-300' },
    { title: '5. District Hospital Referral', subtitle: 'Seamless electronic handover to OB/GYN specialist', icon: '🏥', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    { title: '6. Frontline Follow-up', subtitle: 'ASHA home visit & continuous monitoring', icon: '✅', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
  ];

  const keyBenefits = [
    { title: 'Assisted Teleconsultation', desc: 'Connects rural sub-centres to medical officers with specialized low-bandwidth 2G/3G audio fallback.', icon: Video, color: 'text-blue-600 bg-blue-50' },
    { title: 'Digital Guided Triage', desc: 'Rule-based clinical decision support classifying patients into Routine, Moderate, High, and Emergency.', icon: Stethoscope, color: 'text-purple-600 bg-purple-50' },
    { title: 'One Continuous EHR Record', desc: 'Unified longitudinal health history spanning sub-centres, PHCs, labs, and district hospitals.', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
    { title: '8-Stage Referral Tracking', desc: 'Real-time referral lifecycle tracking preventing drop-offs and lost medical documentation.', icon: Layers, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Public Medicine Locator', desc: 'Inter-facility stock search showing medicine availability in nearby PHCs, eliminating wasted travel.', icon: Pill, color: 'text-amber-600 bg-amber-50' },
    { title: 'Diagnostic Coordination', desc: 'Public lab test directory, booking, status tracking, and verified electronic report access.', icon: FlaskConical, color: 'text-teal-600 bg-teal-50' },
    { title: 'Offline-First PWA Sync', desc: 'Frontline ASHA workers can register patients and record vitals without internet, syncing when online.', icon: WifiOff, color: 'text-orange-600 bg-orange-50' },
    { title: 'Government GIS Analytics', desc: 'District health officer dashboards tracking facility load, waiting times, and referral completion.', icon: MapPin, color: 'text-rose-600 bg-rose-50' }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gov-navy via-gov-blue to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Government Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-300 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Smart India Hackathon 2026 • Government of Maharashtra</span>
          </div>

          {/* Hero Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Accessible Public Healthcare for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400">Every Village</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
              Connect patients, frontline ASHA workers, PHC doctors, diagnostic labs, and district hospitals through <strong>one continuous healthcare journey</strong>.
            </p>
          </div>

          {/* Master CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/meena-journey')}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-950/40 flex items-center gap-2.5 transition transform hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Experience Meena's Healthcare Journey (Master Demo)</span>
            </button>

            <Link
              to="/login"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm border border-white/30 backdrop-blur-sm transition flex items-center gap-2"
            >
              <span>Login to Role Dashboards</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/10 text-left">
            <div className="bg-white/5 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-amber-400">100%</div>
              <div className="text-xs text-slate-300 font-medium">Longitudinal Care Continuity</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-emerald-400">&lt; 25 min</div>
              <div className="text-xs text-slate-300 font-medium">Average Public Facility Wait Time</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-blue-400">8-Stage</div>
              <div className="text-xs text-slate-300 font-medium">Referral Lifecycle Tracking</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-black text-purple-400">Offline PWA</div>
              <div className="text-xs text-slate-300 font-medium">Zero-Connectivity Field Support</div>
            </div>
          </div>

        </div>
      </section>

      {/* One Patient -> One Healthcare Journey Visualizer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-8">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-gov-blue bg-blue-100 px-3 py-1 rounded-full">
              Core Architectural Principle
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              ONE PATIENT → ONE CONTINUOUS HEALTHCARE JOURNEY
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Patients move across public healthcare tiers without fragmentation of medical records or delayed referrals.
            </p>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patientJourneySteps.map((step, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 hover:bg-white hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="text-xs font-mono font-bold text-slate-400">Step 0{idx + 1}</span>
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
              <span>Watch how pregnant mother Meena experiences this exact continuum in our interactive simulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* 8 Core Pillars & Capabilities */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-gov-emerald bg-emerald-100 px-3 py-1 rounded-full">
            Key Platform Pillars
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Strengthening Maharashtra Public Health Infrastructure
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Designed to empower ASHA workers, primary doctors, and district health officers with digital tools tailored for rural realities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {keyBenefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${b.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{b.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role Workstation Direct Launcher for Hackathon Judges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-gov-navy via-slate-900 to-gov-navy text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 border border-slate-700">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded">
                  JUDGING DEMO
                </span>
                <h3 className="text-xl font-bold">Explore All 7 Role Portals Instantly</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Click any persona below to launch the role-specific dashboard with pre-seeded demo state:
              </p>
            </div>

            <button
              onClick={() => navigate('/meena-journey')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Guided Journey Mode</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {[
              { role: 'PATIENT', label: 'Patient Portal', sub: 'Meena Patil', path: '/patient', icon: '👤' },
              { role: 'ASHA', label: 'ASHA Worker', sub: 'Sunita Gaikwad', path: '/asha', icon: '🩺' },
              { role: 'DOCTOR', label: 'PHC Doctor', sub: 'Dr. Rajesh Kulkarni', path: '/doctor', icon: '👨‍⚕️' },
              { role: 'LAB', label: 'Diagnostic Lab', sub: 'Prakash Shinde', path: '/diagnostics', icon: '🔬' },
              { role: 'PHARMACY', label: 'Pharmacy Store', sub: 'Milind Deshmukh', path: '/pharmacy', icon: '💊' },
              { role: 'ADMIN', label: 'Facility Admin', sub: 'Kavita Chavan', path: '/admin', icon: '🏥' },
              { role: 'DISTRICT_OFFICER', label: 'District DHO', sub: 'Dr. Sandeep Mane', path: '/district', icon: '📊' }
            ].map(item => (
              <button
                key={item.role}
                onClick={() => handleLaunchRole(item.role, item.path)}
                className="bg-slate-800/90 hover:bg-gov-blue p-3.5 rounded-xl border border-slate-700 text-center space-y-1.5 transition transform hover:scale-105 group"
              >
                <div className="text-2xl">{item.icon}</div>
                <div className="font-bold text-xs text-white group-hover:text-amber-300">{item.label}</div>
                <div className="text-[10px] text-slate-400">{item.sub}</div>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Official Government Disclaimer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500 space-y-2 border-t border-slate-200 pt-8">
        <p className="font-semibold text-slate-700">
          SWASTHYA SETU — Unified Public Healthcare Access and Care Continuity Platform
        </p>
        <p className="max-w-2xl mx-auto text-[11px] text-slate-500">
          Developed for Smart India Hackathon Problem Statement #26133 (Government of Maharashtra, Department of Skills, Employment, Entrepreneurship & Innovation). Designed to strengthen existing public health infrastructure.
        </p>
      </footer>

    </div>
  );
};
