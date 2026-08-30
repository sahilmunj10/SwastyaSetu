import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOfflineSync } from '../../contexts/OfflineSyncContext';
import { UserRole } from '../../types';
import { Wifi, WifiOff, RefreshCw, Play, ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const DemoSwitcherBar: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { isOnline, toggleConnectivity, queueCount, syncNow, isSyncing } = useOfflineSync();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const roles: { role: UserRole; label: string; name: string; icon: string }[] = [
    { role: 'PATIENT', label: 'Patient', name: 'Meena', icon: '👤' },
    { role: 'ASHA', label: 'ASHA Worker', name: 'Sunita', icon: '🩺' },
    { role: 'DOCTOR', label: 'PHC Doctor', name: 'Dr. Rajesh', icon: '👨‍⚕️' },
    { role: 'LAB', label: 'Lab Staff', name: 'Prakash', icon: '🔬' },
    { role: 'PHARMACY', label: 'Pharmacy', name: 'Milind', icon: '💊' },
    { role: 'ADMIN', label: 'Facility Admin', name: 'Kavita', icon: '🏥' },
    { role: 'DISTRICT_OFFICER', label: 'District Officer', name: 'Dr. Mane', icon: '📊' }
  ];

  const handleRoleClick = async (role: UserRole) => {
    await switchRole(role);
    const pathMap: Record<UserRole, string> = {
      PATIENT: '/patient',
      ASHA: '/asha',
      DOCTOR: '/doctor',
      LAB: '/diagnostics',
      PHARMACY: '/pharmacy',
      ADMIN: '/admin',
      DISTRICT_OFFICER: '/district'
    };
    navigate(pathMap[role]);
  };

  if (isCollapsed) {
    return (
      <div className="bg-slate-900 text-white text-[11px] py-1 px-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 font-mono">Government Healthcare Care-Continuity Gateway</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/meena-journey')}
            className="text-amber-300 hover:underline font-semibold flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Meena's Demo Journey</span>
          </button>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <span>Show Role Switcher</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-950 via-gov-navy to-slate-950 text-white text-xs py-1.5 px-3 sm:px-6 shadow-md border-b border-slate-700/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        
        {/* Left: Master Demo Story Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/meena-journey')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all shadow-sm ${
              location.pathname === '/meena-journey'
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play "Meena's Healthcare Journey"</span>
          </button>
        </div>

        {/* Middle: Role Fast-Switch Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <span className="text-slate-400 font-medium mr-1 hidden lg:inline text-[11px]">Switch Persona:</span>
          {roles.map(r => {
            const isActive = user?.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => handleRoleClick(r.role)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isActive
                    ? 'bg-gov-emerald text-white shadow-inner font-bold ring-1 ring-emerald-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title={`Switch persona to ${r.label} (${r.name})`}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Offline / PWA Sync Simulator & Collapse Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleConnectivity}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
              isOnline
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                : 'bg-amber-950/90 text-amber-300 border-amber-700 animate-pulse'
            }`}
            title="Click to simulate Online / Offline field mode"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
          </button>

          {queueCount > 0 && (
            <button
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md text-[11px] shadow transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync ({queueCount})</span>
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Collapse bar"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
