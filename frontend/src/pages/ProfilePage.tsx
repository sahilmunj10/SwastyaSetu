import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Mail, 
  QrCode, 
  Edit3, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Activity,
  HeartHandshake
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) {
    return <div className="p-12 text-center text-xs text-slate-500">Please sign in to view your profile.</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await updateProfile({ name, phone });
      setSuccessMsg('Profile updated successfully in central public health database!');
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'DOCTOR': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'ASHA': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'PATIENT': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'LAB': return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'PHARMACY': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'DISTRICT_OFFICER': return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      default: return 'bg-slate-100 text-slate-900 border-slate-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-900">
      
      {/* Toast */}
      {successMsg && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-gov-navy via-gov-blue to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-emerald-400 rounded-2xl flex items-center justify-center text-3xl font-black text-slate-950 shadow-md">
            {user.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{user.name}</h1>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getRoleBadgeColor()}`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {user.email} • Assigned Facility: <strong className="text-white">{user.facilityName || 'PHC Kalyan Rural'}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Profile Details / Edit Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Personal & Facility Information</h3>
            <p className="text-xs text-slate-500">Authenticated user details stored in database</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Contact Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-navy text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address (Immutable)</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-xl shadow transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">User Role Classification:</span>
                <span className="font-bold text-slate-900">{user.role}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Registered Email:</span>
                <span className="font-bold text-slate-900">{user.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Mobile Phone Number:</span>
                <span className="font-bold text-slate-900">{user.phone || 'Not provided'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Primary Assigned Facility:</span>
                <span className="font-bold text-gov-navy">{user.facilityName || 'PHC Kalyan Rural'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Account Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  🟢 Verified Active (Gov. Public Health DB)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Digital ABHA Card Preview */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-gov-navy via-gov-blue to-teal-900 text-white rounded-3xl p-6 shadow-xl border border-teal-500/30 space-y-4 relative overflow-hidden">
            {/* Hologram aesthetic */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-amber-300" />
                <span className="font-bold text-xs tracking-wider">AYUSHMAN BHARAT / ABDM</span>
              </div>
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded font-mono font-bold">
                GOVT OF INDIA
              </span>
            </div>

            <div className="space-y-1 pt-2">
              <div className="text-[10px] text-teal-200 uppercase font-semibold">ABHA Digital Health Number</div>
              <div className="text-lg sm:text-xl font-black font-mono tracking-widest text-amber-300">
                {user.abhaId || '91-4432-8819-2041'}
              </div>
            </div>

            <div className="flex items-end justify-between pt-4 border-t border-white/20">
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-white text-sm">{user.name}</div>
                <div className="text-[10px] text-teal-100">{user.role} • {user.facilityName || 'Maharashtra'}</div>
              </div>
              <div className="p-2 bg-white rounded-xl shadow-md text-slate-950">
                <QrCode className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gov-teal" />
              <span>Role Permissions & Access Control:</span>
            </div>
            <ul className="text-slate-600 text-[11px] space-y-1 list-disc list-inside">
              <li>Full access to role-specific dashboard and longitudinal records.</li>
              <li>Real-time telemetry and inter-facility electronic transfers.</li>
              <li>Transactions logged to immutable audit trail.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
