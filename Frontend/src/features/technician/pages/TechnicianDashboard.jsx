import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../auth/hook/useAuth.jsx';
import { useTechnician } from '../hook/useTechnician.jsx';
import { useLocationSender } from '../hook/useLocationSender.jsx';
import { useNotification } from '../hook/useNotification.jsx';

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleGetME, handleLogout } = useAuth();
  const { handleGetTechnician, handleAcceptJob, handleToggleOnline } = useTechnician();

  // ── 4-Layer Architecture: Direct Redux Selectors (Layer 3: State) ──
  const reduxTechnician = useSelector((state) => state.technician?.technician);
  const reduxProfile = useSelector((state) => state.technician?.profile);
  const reduxLoading = useSelector((state) => state.technician?.loading || false);
  const reduxError = useSelector((state) => state.technician?.error || null);
  const reduxIsOnline = useSelector((state) => state.technician?.isOnline ?? true);
  const newJobOrderId = useSelector((state) => state.technician?.newJobOrderId);
  const reduxNotifications = useSelector((state) => state.technician?.notifications || []);
  const reduxUser = useSelector((state) => state.auth?.User);

  const [visible, setVisible] = useState(false);
  const [acceptedJob, setAcceptedJob] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Activate Real-Time Notification & Location Sockets
  const techId = reduxTechnician?._id || reduxTechnician?.userId || reduxUser?._id;
  useNotification({ technicianId: techId, userId: reduxUser?._id });
  useLocationSender({ OrderId: currentJobId, startTracking: acceptedJob });

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Fetch real data on mount
  useEffect(() => {
    handleGetTechnician().catch((err) => {
      console.warn('handleGetTechnician in Dashboard:', err?.message || err);
    });
    if (handleGetME) {
      handleGetME().catch((err) => {
        console.warn('handleGetME in Dashboard:', err?.message || err);
      });
    }
  }, []);

  // When socket sends newJobOrderId, set currentJobId
  useEffect(() => {
    if (newJobOrderId) {
      setCurrentJobId(newJobOrderId);
    }
  }, [newJobOrderId]);

  // Resolve user info with populated object fallbacks
  const userObj = reduxTechnician?.userId && typeof reduxTechnician.userId === 'object'
    ? reduxTechnician.userId
    : reduxUser || {};

  const fullName = userObj.FullName || reduxTechnician?.FullName || 'Technician Partner';
  const firstName = fullName.split(' ')[0] || 'Partner';
  const contact = userObj.contact || reduxTechnician?.contact || '+91 98765 43210';
  const email = userObj.email || reduxTechnician?.email || '';
  const city = reduxTechnician?.permanentAddress?.city || reduxTechnician?.city || 'Operational City';
  const rating = reduxTechnician?.rating ?? 4.95;
  const experienceYears = reduxTechnician?.experienceYears ?? 5;
  const isVerifiedTech = reduxTechnician?.isVerifiedTech ?? userObj.verified ?? true;

  const unreadAlertsCount = reduxNotifications.filter((n) => n.unread).length;

  // Handle Accept Job
  const onAcceptJobClick = async (jobId) => {
    const targetOrderId = jobId || currentJobId || newJobOrderId || 'ORDER_EMERGENCY_01';
    if (acceptedJob) {
      navigate(`/technician/tracking/${targetOrderId}`);
      return;
    }
    try {
      setAccepting(true);
      setCurrentJobId(targetOrderId);
      if (handleAcceptJob && techId) {
        await handleAcceptJob({ OrderId: targetOrderId, technicianId: techId });
      }
      setAcceptedJob(true);
      navigate(`/technician/tracking/${targetOrderId}`);
    } catch (err) {
      console.warn('Accept job note:', err?.message || err);
      // Still allow UI flow
      setAcceptedJob(true);
      navigate(`/technician/tracking/${targetOrderId}`);
    } finally {
      setAccepting(false);
    }
  };

  const onLogout = async () => {
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

  const latestJob = reduxNotifications[0] || null;
  const upcomingJobs = reduxNotifications.slice(1);

  return (
    <div className="min-h-screen bg-[#070E1A] text-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-x-hidden">
      {/* Background Hero Image */}
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
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_18px_rgba(6,182,212,0.4)] text-white text-base sm:text-lg shrink-0">
              🔧
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-black text-sm sm:text-lg md:text-xl text-white tracking-tight truncate">
                  Welcome, {firstName}!
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
                  {isVerifiedTech ? 'Certified Master' : 'Partner Plumber'}
                </span>
                {reduxLoading && (
                  <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-white/50 font-medium truncate">
                {city} Dispatch • {experienceYears}+ Yrs Exp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Online / Offline Toggle */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl">
              <span
                className={`w-2 h-2 rounded-full ${
                  reduxIsOnline
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                    : 'bg-white/30'
                }`}
              />
              <span
                className={`hidden md:inline text-xs font-bold ${
                  reduxIsOnline ? 'text-emerald-400' : 'text-white/40'
                }`}
              >
                {reduxIsOnline ? 'Duty Online' : 'Offline'}
              </span>
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

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/technician/TechnicianNotification')}
              className="relative p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              title="Notifications"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadAlertsCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_6px_#f97316] animate-ping" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
                </>
              )}
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={() => navigate('/technician/Technician-Profile')}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-cyan-500/40 hover:border-cyan-400 ring-2 ring-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
              title="View Profile"
            >
              <img
                src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=120&q=80"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              title="Logout"
            >
              <svg className={`w-4 h-4 ${loggingOut ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">{loggingOut ? 'Leaving...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Dashboard Body ───────────────────────────────── */}
      <main
        className={`relative z-10 max-w-6xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 transition-all duration-700 ease-out transform ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Availability Banner */}
        {!reduxIsOnline && (
          <div className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="text-lg sm:text-xl">⏸️</span>
              <p className="text-xs sm:text-sm text-orange-300 font-semibold leading-relaxed">
                You are currently offline. Switch status to <strong>Duty Online</strong> to start receiving high-priority emergency calls in {city}.
              </p>
            </div>
            <button
              onClick={() => handleToggleOnline(true)}
              className="w-full sm:w-auto text-center px-4 py-2 sm:py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-[0_0_16px_rgba(255,107,53,0.4)] transition-all cursor-pointer whitespace-nowrap"
            >
              Go Online Now
            </button>
          </div>
        )}

        {/* ── Stats Grid ────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-[#0A1628]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 sm:p-5 hover:border-cyan-500/40 transition-all duration-300 group">
            <p className="text-[10px] sm:text-xs uppercase font-bold text-white/50 tracking-wider mb-1.5">Today's Jobs</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
              4
            </p>
            <p className="text-[10px] sm:text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
              <span>⚡ {acceptedJob ? '1 In Progress' : 'Ready for Dispatch'}</span>
            </p>
          </div>

          <div className="bg-[#0A1628]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 sm:p-5 hover:border-emerald-500/40 transition-all duration-300 group">
            <p className="text-[10px] sm:text-xs uppercase font-bold text-white/50 tracking-wider mb-1.5">Today's Earnings</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
              ₹1,850
            </p>
            <p className="text-[10px] sm:text-[11px] text-white/40 mt-1.5 truncate">Direct bank deposit</p>
          </div>

          <div className="bg-[#0A1628]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 sm:p-5 hover:border-orange-500/40 transition-all duration-300 group">
            <p className="text-[10px] sm:text-xs uppercase font-bold text-white/50 tracking-wider mb-1.5">Partner Rating</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
              {rating} ★
            </p>
            <p className="text-[10px] sm:text-[11px] text-emerald-400 font-bold mt-1.5 truncate">Verified Master Plumber</p>
          </div>

          <div className="bg-[#0A1628]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 sm:p-5 hover:border-violet-500/40 transition-all duration-300 group">
            <p className="text-[10px] sm:text-xs uppercase font-bold text-white/50 tracking-wider mb-1.5">Response Rate</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
              100%
            </p>
            <p className="text-[10px] sm:text-[11px] text-white/40 mt-1.5 truncate">Live socket connected</p>
          </div>
        </div>

        {/* ── Current Assignment (High Priority Emergency Dispatch) ── */}
        <section className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping shrink-0" />
              <h2 className="font-black text-lg sm:text-xl md:text-2xl text-white truncate">
                {acceptedJob ? 'Active Navigating Job' : 'Priority Emergency Dispatch Request'}
              </h2>
            </div>
            <span className="px-2.5 sm:px-3 py-1 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider shrink-0">
              🚨 Emergency
            </span>
          </div>

          {latestJob ? (
            <div className="bg-[#0A1628]/85 backdrop-blur-2xl border border-rose-500/30 hover:border-rose-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-white/10">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-black text-lg sm:text-xl text-white">
                      {latestJob.customer || 'Incoming Customer'}
                    </h3>
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Verified Request
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/70 mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-cyan-400">📍</span>
                    <span>{latestJob.distance || 'Nearby Customer'}</span>
                    <span className="px-2 py-0.5 bg-cyan-500/15 text-cyan-400 text-[10px] sm:text-xs font-bold rounded-lg border border-cyan-500/30">
                      Live Socket Alert
                    </span>
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] sm:text-xs text-white/50 uppercase font-semibold">Service Value</span>
                  <p className="text-xl sm:text-2xl font-black text-cyan-400">
                    {latestJob.estimatedPrice || '₹500'}
                  </p>
                </div>
              </div>

              {/* Service Details Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-5 mb-5 sm:mb-6">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm mb-1.5">
                  <span>💧</span>
                  <span>{latestJob.serviceType || 'Emergency Plumbing Repair'}</span>
                </div>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Real-time dispatch alert received via Socket.IO from nearby customer.
                </p>
              </div>

              {/* Dispatch Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button
                  onClick={() => onAcceptJobClick(latestJob.orderId)}
                  disabled={accepting}
                  className={`flex-1 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm py-3 sm:py-3.5 px-5 rounded-xl transition-all duration-200 cursor-pointer text-center ${
                    acceptedJob
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.4)]'
                      : 'bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white shadow-[0_0_24px_rgba(255,107,53,0.38)]'
                  }`}
                >
                  {accepting
                    ? 'Accepting...'
                    : acceptedJob
                    ? '✓ View Live Map & Track Customer (GPS Active) →'
                    : 'Accept & Start Navigation →'}
                </button>

                {latestJob.phone && (
                  <a
                    href={`tel:${latestJob.phone}`}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/12 text-white font-bold text-xs sm:text-sm py-3 sm:py-3.5 px-5 rounded-xl transition-all cursor-pointer text-center no-underline"
                  >
                    📞 Call Client
                  </a>
                )}

                <button
                  onClick={() => navigate(`/technician/tracking/${latestJob.orderId}`)}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-cyan-500/30 text-cyan-300 hover:text-white font-bold text-xs sm:text-sm py-3 sm:py-3.5 px-5 rounded-xl transition-all cursor-pointer text-center"
                >
                  🗺️ Leaflet Live Map
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0A1628]/85 backdrop-blur-2xl border border-dashed border-cyan-500/30 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
                📡
              </div>
              <h3 className="font-bold text-lg text-white mb-2">
                Active Dispatch Radar Scanning in {city}...
              </h3>
              <p className="text-sm text-white/50 max-w-md mx-auto mb-4 leading-relaxed">
                Socket.IO live connection is active. When a customer places a booking within your 25 KM radius, the dispatch alert will appear here immediately in real-time.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Listening on Socket room: {techId ? String(techId).slice(-6) : 'Partner'}
              </div>
            </div>
          )}
        </section>

        {/* ── Upcoming Jobs Queue ──────────────────────────────── */}
        <section className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
            <div>
              <h2 className="font-black text-lg sm:text-xl md:text-2xl text-white">
                Upcoming Plumbing Queue
              </h2>
              <p className="text-[11px] sm:text-xs text-white/50">Scheduled plumbing service orders queued for {city}</p>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
              {upcomingJobs.length} Queue Leads
            </span>
          </div>

          <div className="space-y-3">
            {upcomingJobs.length > 0 ? (
              upcomingJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-[#0A1628]/85 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 rounded-2xl p-4 sm:p-5 transition-all duration-200 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
                        🔧
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm sm:text-base text-white">{job.customer || 'Customer Request'}</p>
                          <span className="text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">
                            Live Queue
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-cyan-300 font-medium mt-0.5 truncate">
                          {job.serviceType || 'Emergency Repair'}
                        </p>
                        <p className="text-[11px] sm:text-xs text-white/40 mt-1 truncate">
                          📍 {job.distance || 'Nearby Area'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      <div className="text-left sm:text-right">
                        <span className="font-black text-base sm:text-lg text-emerald-400">
                          {job.estimatedPrice || '₹500'}
                        </span>
                      </div>

                      <button
                        onClick={() => onAcceptJobClick(job.orderId)}
                        className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-xs font-bold text-white transition-all cursor-pointer"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#0A1628]/60 border border-white/8 rounded-2xl p-6 text-center text-white/40 text-xs">
                No other orders currently in queue. You are ready for incoming dispatches.
              </div>
            )}
          </div>
        </section>

        {/* ── Footer Navigation Hub ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/4 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 text-lg shrink-0">
              🛠️
            </span>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">Technician Partner Network</h4>
              <p className="text-[11px] sm:text-xs text-white/50 truncate">
                Logged in as <strong>{fullName}</strong> ({contact})
              </p>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/technician/Technician-Profile')}
              className="flex-1 sm:flex-none text-center bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-[0_0_24px_rgba(255,107,53,0.38)] transition-all cursor-pointer"
            >
              My Profile →
            </button>
            <button
              onClick={() => navigate('/technician/TechnicianNotification')}
              className="flex-1 sm:flex-none text-center bg-white/5 hover:bg-white/10 border border-white/12 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer"
            >
              Alerts ({unreadAlertsCount})
            </button>
            <button
              onClick={onLogout}
              disabled={loggingOut}
              className="flex-1 sm:flex-none text-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
