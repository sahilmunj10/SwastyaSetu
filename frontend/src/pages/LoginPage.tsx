import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { 
  HeartHandshake, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  UserPlus,
  LogIn
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, demoAccounts } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('DOCTOR');
  const [signupFacility, setSignupFacility] = useState('');

  const [showDemoFastLogin, setShowDemoFastLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleList: { role: UserRole; label: string; icon: string }[] = [
    { role: 'DOCTOR', label: 'Doctor / Medical Officer', icon: '👨‍⚕️' },
    { role: 'ASHA', label: 'ASHA / ANM Frontline Worker', icon: '🩺' },
    { role: 'PATIENT', label: 'Patient / Citizen', icon: '👤' },
    { role: 'LAB', label: 'Diagnostic Lab Staff', icon: '🔬' },
    { role: 'PHARMACY', label: 'Pharmacy / Drug Officer', icon: '💊' },
    { role: 'ADMIN', label: 'Facility Administrator', icon: '🏥' },
    { role: 'DISTRICT_OFFICER', label: 'District Health Officer (DHO)', icon: '📊' }
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email: loginEmail, password: loginPassword });
      const savedUser = JSON.parse(localStorage.getItem('swasthya_user') || '{}');
      const targetPaths: Record<string, string> = {
        PATIENT: '/patient',
        ASHA: '/asha',
        DOCTOR: '/doctor',
        LAB: '/diagnostics',
        PHARMACY: '/pharmacy',
        ADMIN: '/admin',
        DISTRICT_OFFICER: '/district'
      };
      navigate(targetPaths[savedUser.role] || '/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials or Sign Up.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
        role: signupRole,
        facilityId: signupFacility || undefined
      });

      const targetPaths: Record<UserRole, string> = {
        PATIENT: '/patient',
        ASHA: '/asha',
        DOCTOR: '/doctor',
        LAB: '/diagnostics',
        PHARMACY: '/pharmacy',
        ADMIN: '/admin',
        DISTRICT_OFFICER: '/district'
      };
      navigate(targetPaths[signupRole] || '/');
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccountSelect = async (demo: any) => {
    setLoading(true);
    setError(null);
    try {
      await login({ email: demo.email, role: demo.role });
      const targetPaths: Record<string, string> = {
        PATIENT: '/patient',
        ASHA: '/asha',
        DOCTOR: '/doctor',
        LAB: '/diagnostics',
        PHARMACY: '/pharmacy',
        ADMIN: '/admin',
        DISTRICT_OFFICER: '/district'
      };
      navigate(targetPaths[demo.role] || '/');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 text-slate-900">
        
        {/* Left Side: Branding & Quick Persona Drawer */}
        <div className="md:col-span-5 bg-gradient-to-b from-gov-navy via-gov-blue to-slate-950 text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gov-emerald rounded-2xl flex items-center justify-center shadow-lg">
                <HeartHandshake className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight">SWASTHYA SETU</h1>
                <p className="text-[11px] text-amber-300 font-semibold">Government of Maharashtra</p>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              Unified public healthcare care-access and continuity platform. Authenticate with your real account or test with demonstration personas.
            </p>
          </div>

          {/* Collapsible Demo Fast-Login Drawer */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Demonstration Testing:
              </span>
              <button
                type="button"
                onClick={() => setShowDemoFastLogin(!showDemoFastLogin)}
                className="text-[11px] text-slate-300 hover:text-white underline"
              >
                {showDemoFastLogin ? 'Hide Demo' : '1-Click Demo Logins'}
              </button>
            </div>

            {showDemoFastLogin ? (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {demoAccounts.map(demo => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleDemoAccountSelect(demo)}
                    className="w-full text-left p-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs flex items-center justify-between border border-white/10 transition"
                  >
                    <div>
                      <div className="font-bold text-white text-[11px]">{demo.name}</div>
                      <div className="text-[10px] text-amber-200">{demo.role} • {demo.facilityName}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300 space-y-1">
                <p>Use the form on the right to <strong>Sign Up</strong> with your real name and password, or click above to explore seeded test accounts.</p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 text-center border-t border-white/10 pt-3">
            ABDM & ABHA Compliant Health ID Infrastructure
          </div>

        </div>

        {/* Right Side: Auth Form (Sign In / Sign Up Tabs) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          
          {/* Tab Switcher: Log In vs Sign Up */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode('LOGIN');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'LOGIN'
                  ? 'bg-gov-navy text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('SIGNUP');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'SIGNUP'
                  ? 'bg-gov-navy text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account (Sign Up)</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode 1: Log In */}
          {authMode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">Sign In to Your Account</h2>
                <p className="text-xs text-slate-500">Enter your registered email or mobile number and password</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email or Mobile Number *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com or 9823412345"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gov-navy hover:bg-gov-blue text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Mode 2: Sign Up (Create Real Account) */}
          {authMode === 'SIGNUP' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">Create New Public Health Account</h2>
                <p className="text-xs text-slate-500">Register as a doctor, ASHA worker, patient, or administrator</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Dr. Vikram Sharma"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="e.g. 9820123456"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. vikram@health.gov.in"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Create Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Choose a password"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Healthcare Role Classification *</label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy font-semibold"
                >
                  {roleList.map(r => (
                    <option key={r.role} value={r.role}>
                      {r.icon} {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gov-emerald hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Creating Account...' : 'Sign Up & Launch Dashboard'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
