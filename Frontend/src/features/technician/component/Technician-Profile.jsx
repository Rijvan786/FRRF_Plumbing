import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hook/useAuth.jsx';
import { useTechnician } from '../hook/useTechnician.jsx';

/* ── Inline Crisp Icons (Zero-Dependency) ── */
const Wrench = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ShieldCheck = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const MapPin = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneCall = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const Calendar = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const User = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogOut = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* ── Tab Button helper matching CustomerProfile.jsx ── */
const TabButton = ({ icon, label, badge, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-left font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-[0_0_24px_rgba(255,107,53,0.35)]'
        : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {badge && (
      <span
        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
          isActive ? 'bg-black/30 text-white' : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
        }`}
      >
        {badge}
      </span>
    )}
  </button>
);

export default function TechnicianProfile() {
  const navigate = useNavigate();
  const { handleGetME, handleLogout } = useAuth();
  const { handleGetTechnician, handleToggleOnline, handleToggleAvailability } = useTechnician();

  // ── 4-Layer Architecture: Direct Redux Selectors (Layer 3: State) ──
  const reduxTechnician = useSelector((state) => state.technician?.technician || state.technician?.tech);
  const reduxProfile = useSelector((state) => state.technician?.profile);
  const reduxLoading = useSelector((state) => state.technician?.loading || false);
  const reduxError = useSelector((state) => state.technician?.error || null);
  const reduxIsOnline = useSelector((state) => state.technician?.isOnline ?? true);
  const reduxIsAvailable = useSelector((state) => state.technician?.isAvailable ?? true);
  const reduxUser = useSelector((state) => state.auth?.User);

  const [activeTab, setActiveTab] = useState('overview'); // overview | kyc | skills | earnings
  const [visible, setVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Fetch real data on mount
  useEffect(() => {
    handleGetTechnician().catch((err) => {
      console.warn('handleGetTechnician in Technician-Profile:', err?.message || err);
    });
    if (handleGetME) {
      handleGetME().catch((err) => {
        console.warn('handleGetME in Technician-Profile:', err?.message || err);
      });
    }
  }, []);

  // Resolve Real Data Fields with safe population fallbacks
  const userObj = reduxTechnician?.userId && typeof reduxTechnician.userId === 'object'
    ? reduxTechnician.userId
    : reduxUser || {};

  const fullName = userObj.FullName || reduxTechnician?.FullName || 'Technician Partner';
  const email = userObj.email || reduxTechnician?.email || 'technician@example.com';
  const contact = userObj.contact || reduxTechnician?.contact || '+91 98765 43210';
  const role = userObj.role || reduxTechnician?.role || 'Certified Master Plumber';
  const experienceYears = reduxTechnician?.experienceYears ?? 5;
  const isVerifiedTech = reduxTechnician?.isVerifiedTech ?? userObj.verified ?? true;
  const rating = reduxTechnician?.rating ?? 4.95;

  const address = reduxTechnician?.permanentAddress || {};
  const street = address.street || 'Master Technician HQ';
  const city = address.city || 'Operational Hub';
  const pinCode = address.pin_code || '450445';
  const fullAddress = [street, city, pinCode ? `PIN ${pinCode}` : ''].filter(Boolean).join(', ');

  const coordinates = reduxTechnician?.liveLocation?.coordinates || [76.22, 21.31];
  const skills = Array.isArray(reduxTechnician?.skills) && reduxTechnician.skills.length > 0
    ? reduxTechnician.skills
    : ['CPVC & PVC Piping', 'Concealed Wall Leakage Repair', 'Sanitary & Tap Fittings', 'Overhead Tank Installation', 'Drain Blockage & Snaking'];

  const weeklyEarnings = [
    { day: 'Mon', amount: 3800, height: '55%' },
    { day: 'Tue', amount: 5600, height: '78%' },
    { day: 'Wed', amount: 3100, height: '42%' },
    { day: 'Thu', amount: 6400, height: '88%' },
    { day: 'Fri', amount: 5100, height: '70%' },
    { day: 'Sat', amount: 4200, height: '60%' },
    { day: 'Sun', amount: 7500, height: '100%' },
  ];
  const totalWeekly = weeklyEarnings.reduce((acc, curr) => acc + curr.amount, 0);

  const onLogoutClick = async () => {
    try {
      setLoggingOut(true);
      if (handleLogout) await handleLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
      navigate('/customer');
    }
  };

  return (
    <div className="min-h-screen bg-[#070E1A] text-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-x-hidden">
      {/* Background Hero Image matching CustomerProfile.jsx */}
      <div
        className={`fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out pointer-events-none transform ${
          visible ? 'opacity-30 scale-100' : 'opacity-0 scale-105'
        }`}
        style={{ backgroundImage: `url('/images/hero-bg.png')` }}
      />

      {/* Deep Midnight Navy Gradient Overlays */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#070E1A]/95 via-[#0A1628]/92 to-[#070E1A]/98 pointer-events-none" />

      {/* Ambient Glowing Spheres */}
      <div className="fixed top-24 right-1/4 w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-24 left-10 w-[420px] h-[420px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ── Top Header Navigation Bar ─────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0A1628]/85 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/technician/Technician-Dashboard')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Dashboard</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <h1 className="font-black text-sm sm:text-base md:text-lg text-white tracking-tight">
                Technician Partner Profile
              </h1>
              {reduxLoading && (
                <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0 ml-1" />
              )}
            </div>
          </div>

          {/* Availability / Online Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  reduxIsOnline
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                    : 'bg-white/30'
                }`}
              />
              <span
                className={`text-xs font-bold ${
                  reduxIsOnline ? 'text-emerald-400' : 'text-white/40'
                }`}
              >
                {reduxIsOnline ? 'Duty Online' : 'Offline'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleToggleOnline(!reduxIsOnline)}
              className={`relative w-10 sm:w-11 h-5 sm:h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                reduxIsOnline ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]' : 'bg-white/15'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  reduxIsOnline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container (matching CustomerProfile.jsx Layout) ── */}
      <div
        className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 transition-all duration-700 ease-out transform ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* ── Top Identity & Telemetry Overview Bar ── */}
        <div className="mb-6 bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-orange-500 to-blue-500" />

          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=240&q=80"
                alt="Profile Avatar"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-500/40 ring-4 ring-cyan-500/10 shadow-[0_0_24px_rgba(6,182,212,0.3)]"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-[#0A1628] shadow-[0_0_10px_#10b981]">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white">{fullName}</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {isVerifiedTech ? 'CERTIFIED MASTER' : 'PARTNER PLUMBER'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  {experienceYears}+ Yrs Experience
                </span>
              </div>
              <p className="text-xs text-white/60 font-mono mt-1">
                {email} • {contact}
              </p>
              <p className="text-xs text-cyan-300 font-medium mt-0.5 flex items-center gap-1.5">
                <span>📍</span>
                <span>{city} • {street}</span>
                <span className="text-white/30">|</span>
                <span className="text-amber-400 font-bold">★ {rating} Rating</span>
              </p>
            </div>
          </div>

          {/* Quick KPI stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-white/8">
            <div className="bg-[#070E1A]/80 border border-white/8 rounded-2xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-white/40 font-semibold uppercase">Total Jobs</p>
              <p className="text-base sm:text-lg font-black text-cyan-400">1,248</p>
            </div>
            <div className="bg-[#070E1A]/80 border border-white/8 rounded-2xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-white/40 font-semibold uppercase">Success Rate</p>
              <p className="text-base sm:text-lg font-black text-emerald-400">99.2%</p>
            </div>
            <div className="bg-[#070E1A]/80 border border-white/8 rounded-2xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-white/40 font-semibold uppercase">Response ETA</p>
              <p className="text-base sm:text-lg font-black text-orange-400">18 mins</p>
            </div>
            <div className="bg-[#070E1A]/80 border border-white/8 rounded-2xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-white/40 font-semibold uppercase">Weekly Payout</p>
              <p className="text-base sm:text-lg font-black text-yellow-400">₹{totalWeekly.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* ── Main Layout: Sidebar & Content (matching CustomerProfile.jsx) ── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* ================= LEFT: SIDEBAR ================= */}
          <aside className="w-full lg:w-[300px] bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-3xl p-5 shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <nav className="flex flex-col gap-1.5">
              <TabButton
                icon={<User size={18} />}
                label="Profile Overview"
                badge="Active"
                isActive={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              />
              <TabButton
                icon={<MapPin size={18} />}
                label="Permanent Address & KYC"
                badge={isVerifiedTech ? 'Verified' : 'Pending'}
                isActive={activeTab === 'kyc'}
                onClick={() => setActiveTab('kyc')}
              />
              <TabButton
                icon={<Wrench size={18} />}
                label="Certified Skills"
                badge={`${skills.length} Badges`}
                isActive={activeTab === 'skills'}
                onClick={() => setActiveTab('skills')}
              />
              <TabButton
                icon={<Calendar size={18} />}
                label="Earnings & Payouts"
                isActive={activeTab === 'earnings'}
                onClick={() => setActiveTab('earnings')}
              />

              <div className="h-px bg-white/10 my-2" />

              {/* Verified Identity card */}
              <div className="bg-[#070E1A]/80 border border-white/8 rounded-xl p-3.5 mb-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                  <ShieldCheck size={14} />
                  <span>Verified Plumber ID</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed font-mono">
                  ID: #{reduxTechnician?._id ? reduxTechnician._id.slice(-8).toUpperCase() : 'TECH-0091'}
                </p>
                <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                  ✓ Certified Partner Protocol
                </p>
              </div>

              {/* Quick Jump Buttons */}
              <button
                type="button"
                onClick={() => navigate('/technician/Technician-Dashboard')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all font-semibold text-xs sm:text-sm w-full cursor-pointer"
              >
                <span>⚡ Open Live Dashboard →</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/technician/TechnicianNotification')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20 transition-all font-semibold text-xs sm:text-sm w-full cursor-pointer"
              >
                <span>🔔 Dispatch Notifications</span>
              </button>

              <button
                type="button"
                onClick={onLogoutClick}
                disabled={loggingOut}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all font-semibold text-xs sm:text-sm w-full cursor-pointer disabled:opacity-50"
              >
                <LogOut size={18} />
                <span>{loggingOut ? 'Signing out...' : 'Sign Out Account'}</span>
              </button>
            </nav>
          </aside>

          {/* ================= RIGHT: MAIN CONTENT ================= */}
          <main className="flex-1 w-full bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-3xl p-5 sm:p-7 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] min-h-[550px] flex flex-col">
            
            {/* ════ TAB 1: PROFILE OVERVIEW ════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">Technician Profile Overview</h2>
                    <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                      Real-time partner verification, contact channels and active dispatch status.
                    </p>
                  </div>
                  <button
                    onClick={() => handleGetTechnician()}
                    className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-400 cursor-pointer"
                  >
                    <svg className={`w-3.5 h-3.5 ${reduxLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#070E1A]/80 border border-white/10 rounded-2xl p-4 sm:p-5">
                    <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">Partner Full Name</p>
                    <p className="text-base font-bold text-white">{fullName}</p>
                    <p className="text-xs text-cyan-400 font-semibold mt-1">Role: {role}</p>
                  </div>

                  <div className="bg-[#070E1A]/80 border border-white/10 rounded-2xl p-4 sm:p-5">
                    <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">Verified Contact Channel</p>
                    <p className="text-base font-bold text-white font-mono">{contact}</p>
                    <p className="text-xs text-white/50 font-mono mt-1">{email}</p>
                  </div>

                  <div className="bg-[#070E1A]/80 border border-white/10 rounded-2xl p-4 sm:p-5">
                    <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">Experience & Rating</p>
                    <p className="text-base font-bold text-emerald-400">{experienceYears} Years Certified Experience</p>
                    <p className="text-xs text-amber-400 font-semibold mt-1">★ {rating} Rating (Top 1% Plumber)</p>
                  </div>

                  <div className="bg-[#070E1A]/80 border border-white/10 rounded-2xl p-4 sm:p-5">
                    <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">Current Operational Base</p>
                    <p className="text-base font-bold text-white">{city}</p>
                    <p className="text-xs text-white/50 truncate mt-1">{street} (PIN {pinCode})</p>
                  </div>
                </div>

                {/* Telemetry & GPS Card */}
                <div className="bg-gradient-to-br from-[#0c1e38] to-[#0A1628] border border-cyan-500/30 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      <h3 className="text-sm sm:text-base font-black text-white">Live GPS Dispatch Coordinates</h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      Active GeoJSON
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed mb-3">
                    Your real-time coordinates are automatically shared with customers when you accept a job to calculate precise ETA and distance.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono bg-black/30 border border-white/10 rounded-xl px-4 py-2.5">
                    <div>
                      <span className="text-white/40">Longitude: </span>
                      <span className="text-cyan-400 font-bold">{coordinates[0] || '0.0000'}</span>
                    </div>
                    <div>
                      <span className="text-white/40">Latitude: </span>
                      <span className="text-cyan-400 font-bold">{coordinates[1] || '0.0000'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════ TAB 2: PERMANENT ADDRESS & KYC ════ */}
            {activeTab === 'kyc' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="pb-4 border-b border-white/10">
                  <h2 className="text-xl sm:text-2xl font-black text-white">Permanent Address & Police KYC</h2>
                  <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                    Official address records filed during technician partner onboarding.
                  </p>
                </div>

                <div className="bg-[#070E1A]/80 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={20} className="text-cyan-400" />
                      <h3 className="text-base font-bold text-white">Registered Permanent Residence</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {isVerifiedTech ? 'KYC Verified' : 'Pending Verification'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-white/40 uppercase font-bold">Street Address</p>
                      <p className="text-sm font-semibold text-white mt-1">{street || 'Not provided'}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-white/40 uppercase font-bold">City / Operational Hub</p>
                      <p className="text-sm font-semibold text-white mt-1">{city || 'Not provided'}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-white/40 uppercase font-bold">Postal PIN Code</p>
                      <p className="text-sm font-semibold text-white mt-1">{pinCode || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 flex items-center gap-3">
                    <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-300">
                      Background and police verification cleared. Partner is eligible for residential emergency plumbing dispatches.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ════ TAB 3: CERTIFIED SKILLS ════ */}
            {activeTab === 'skills' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="pb-4 border-b border-white/10">
                  <h2 className="text-xl sm:text-2xl font-black text-white">Certified Plumbing Skills</h2>
                  <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                    Skill credentials determining priority assignment for specialized repair calls.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-[#070E1A]/80 border border-white/10 hover:border-cyan-500/40 rounded-2xl p-4 transition-all"
                    >
                      <span className="text-2xl p-2 bg-white/5 rounded-xl">🔧</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{skill}</p>
                        <p className="text-[11px] text-emerald-400 font-semibold">ISO 9001 Certified Master</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════ TAB 4: EARNINGS & PAYOUTS ════ */}
            {activeTab === 'earnings' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">Weekly Earnings & Direct Deposits</h2>
                    <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                      Live calculated payout for completed residential plumbing tasks.
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
                    <span className="text-xs text-emerald-400 font-black">7-Day Total: ₹{totalWeekly.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Bar Chart Bars */}
                <div className="bg-[#070E1A]/80 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-end gap-2 sm:gap-4 h-40 pt-4 px-2">
                    {weeklyEarnings.map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[10px] font-bold text-white/0 group-hover:text-cyan-300 transition-all truncate">
                          ₹{item.amount}
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-cyan-600 via-cyan-500 to-blue-400 rounded-xl transition-all duration-300 group-hover:scale-y-105 group-hover:shadow-[0_0_16px_rgba(6,182,212,0.5)] cursor-pointer"
                          style={{ height: item.height }}
                          title={`${item.day}: ₹${item.amount}`}
                        />
                        <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">
                          {item.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
