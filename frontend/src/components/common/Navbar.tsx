import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageCode } from '../../i18n';
import { 
  HeartHandshake, 
  ShieldAlert, 
  Languages, 
  Mic, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  Stethoscope,
  Activity,
  Calendar,
  Layers,
  FlaskConical,
  Pill,
  BarChart3,
  FileText,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { EmergencyModal } from './EmergencyModal';

interface NavbarProps {
  onOpenVoice?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVoice }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const getNavLinks = (): Array<{ label: string; path: string; icon?: any }> => {
    if (!user) {
      return [
        { label: 'Home', path: '/', icon: HeartHandshake },
        { label: "Meena's Demo Journey", path: '/meena-journey', icon: Activity },
        { label: 'Explore Services', path: '/#services', icon: Layers },
        { label: 'Login', path: '/login', icon: UserIcon }
      ];
    }

    switch (user.role) {
      case 'PATIENT':
        return [
          { label: t('navDashboard'), path: '/patient', icon: Activity },
          { label: t('navAppointments'), path: '/patient/appointments', icon: Calendar },
          { label: t('navReferrals'), path: '/patient/referrals', icon: Layers },
          { label: t('navMedicines'), path: '/patient/medicines', icon: Pill },
          { label: "Meena's Story", path: '/meena-journey', icon: HeartHandshake }
        ];
      case 'ASHA':
        return [
          { label: t('navDashboard'), path: '/asha', icon: Activity },
          { label: t('navPatients'), path: '/asha/patients', icon: Stethoscope },
          { label: t('navAppointments'), path: '/asha/appointments', icon: Calendar },
          { label: t('navFollowUps'), path: '/asha/followups', icon: Bell },
          { label: "Meena's Story", path: '/meena-journey', icon: HeartHandshake }
        ];
      case 'DOCTOR':
        return [
          { label: t('navDashboard'), path: '/doctor', icon: Activity },
          { label: 'OPD Queue', path: '/doctor/queue', icon: Calendar },
          { label: t('navTeleconsultation'), path: '/teleconsult', icon: Stethoscope },
          { label: t('navReferrals'), path: '/doctor/referrals', icon: Layers },
          { label: "Meena's Story", path: '/meena-journey', icon: HeartHandshake }
        ];
      case 'LAB':
        return [
          { label: t('navDashboard'), path: '/diagnostics', icon: FlaskConical },
          { label: 'Test Catalog', path: '/diagnostics/catalog', icon: FileText },
          { label: "Meena's Story", path: '/meena-journey', icon: HeartHandshake }
        ];
      case 'PHARMACY':
        return [
          { label: t('navDashboard'), path: '/pharmacy', icon: Pill },
          { label: 'Stock Search', path: '/pharmacy/search', icon: Activity },
          { label: "Meena's Story", path: '/meena-journey', icon: HeartHandshake }
        ];
      case 'ADMIN':
        return [
          { label: t('navDashboard'), path: '/admin', icon: Activity },
          { label: 'Facility Queues', path: '/admin/queues', icon: Calendar },
          { label: 'Audit Logs', path: '/audit-logs', icon: FileText }
        ];
      case 'DISTRICT_OFFICER':
      default:
        return [
          { label: t('navDashboard'), path: '/district', icon: BarChart3 },
          { label: 'GIS Facility Map', path: '/district/map', icon: Layers },
          { label: 'Quality Scorecards', path: '/district/quality', icon: Activity },
          { label: 'Audit Logs', path: '/audit-logs', icon: FileText }
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header className="bg-gov-navy text-white shadow-lg border-b border-gov-blue/50 sticky top-8 z-40">
        
        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            
            {/* Logo & Government Header */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-gov-emerald via-teal-500 to-amber-400 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition">
                <HeartHandshake className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-white font-sans">
                    SWASTHYA <span className="text-amber-400">SETU</span>
                  </span>
                  <span className="text-[10px] bg-gov-blue px-2 py-0.5 rounded text-slate-300 font-semibold hidden md:inline">
                    Govt. of Maharashtra
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 hidden sm:block font-medium">
                  {t('tagline')}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={idx}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gov-blue text-white shadow-sm ring-1 ring-white/20'
                        : 'text-slate-200 hover:bg-gov-blue/60 hover:text-white'
                    }`}
                  >
                    {item.icon && <item.icon className="w-3.5 h-3.5 opacity-80" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Action Tools: Voice, Language, Emergency, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Voice Mic Button */}
              <button
                onClick={onOpenVoice}
                className="p-2 sm:px-3 sm:py-1.5 bg-gov-blue hover:bg-blue-800 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-gov-lightBlue/30 shadow-sm"
                title="Voice Assistant (Marathi / Hindi / English)"
              >
                <Mic className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="hidden md:inline">Voice Aid</span>
              </button>

              {/* Language Selector */}
              <div className="relative flex items-center bg-gov-blue/80 border border-slate-700 rounded-lg p-0.5 text-xs">
                <Languages className="w-3.5 h-3.5 text-slate-300 ml-1.5 mr-1" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  aria-label="Select Language"
                  className="bg-transparent text-white text-xs font-medium py-1 pr-2 rounded focus:outline-none cursor-pointer"
                >
                  <option value="en" className="bg-gov-navy text-white">English</option>
                  <option value="mr" className="bg-gov-navy text-white">मराठी (MR)</option>
                  <option value="hi" className="bg-gov-navy text-white">हिंदी (HI)</option>
                </select>
              </div>

              {/* Emergency Button */}
              <button
                onClick={() => setEmergencyOpen(true)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-red-900/30 animate-soft-pulse border border-red-400/40"
              >
                <ShieldAlert className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">108 Help</span>
              </button>

              {/* User Profile Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 border-l border-slate-700 hover:bg-gov-blue/60 p-1.5 rounded-xl transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-400 text-slate-950 font-bold flex items-center justify-center text-xs shadow">
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-left hidden xl:block">
                      <div className="text-xs font-bold text-slate-100 line-clamp-1 max-w-[120px]">{user.name}</div>
                      <div className="text-[10px] text-amber-300 font-semibold">{user.role}</div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 text-slate-900 z-50 animate-scaleUp">
                      <div className="px-4 py-2.5 border-b border-slate-100 space-y-0.5">
                        <div className="font-bold text-xs text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                        <div className="text-[10px] font-mono font-bold text-gov-blue pt-0.5">
                          ABHA: {user.abhaId || '91-4432-8819-2041'}
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition"
                      >
                        <UserCheck className="w-4 h-4 text-gov-teal" />
                        <span>My Government Health Profile</span>
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold transition border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition shadow"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white lg:hidden rounded-lg hover:bg-gov-blue"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gov-darkNavy border-t border-gov-blue px-4 py-3 space-y-1 animate-fadeIn">
            {navLinks.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-gov-blue hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-amber-300 hover:bg-gov-blue"
              >
                My Profile ({user.name})
              </Link>
            )}
          </div>
        )}

      </header>

      {/* Emergency Modal Component */}
      <EmergencyModal isOpen={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
    </>
  );
};
