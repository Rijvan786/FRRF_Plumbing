import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../auth/hook/useAuth.jsx';
import { useTechnician } from '../hook/useTechnician.jsx';
import { useLocationSender } from '../hook/useLocationSender.jsx';
import { useNotification } from '../hook/useNotification.jsx';
import { markNotificationAccepted, markNotificationRead, dismissNotification } from '../state/technician.slice.jsx';

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleGetME, handleLogout } = useAuth();
  const { handleGetTechnician, handleAcceptJob, handleToggleOnline, handleGetNotifications, handleGetPaymentDetail } = useTechnician();

  // ── 4-Layer Architecture: Direct Redux Selectors (Layer 3: State) ──
  const reduxTechnician = useSelector((state) => state.technician?.technician || state.technician?.tech);
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
  const [acceptedMap, setAcceptedMap] = useState({});
  const [filterTab, setFilterTab] = useState('all');

  // Dynamic payment status map fetched using handleGetPaymentDetail()
  const [paymentStatusMap, setPaymentStatusMap] = useState({});

  useEffect(() => {
    if (Array.isArray(reduxNotifications) && reduxNotifications.length > 0 && handleGetPaymentDetail) {
      reduxNotifications.forEach(async (job) => {
        const oId = job.orderId || job.OrderId || job.id;
        if (oId && !String(oId).startsWith('ORDER_EMERGENCY')) {
          try {
            const data = await handleGetPaymentDetail(oId);
            const status = data?.payment?.status || (data?.status ? data.status : 'pending');
            setPaymentStatusMap((prev) => ({
              ...prev,
              [oId]: status,
            }));
          } catch (err) {
            setPaymentStatusMap((prev) => ({
              ...prev,
              [oId]: 'pending',
            }));
          }
        }
      });
    }
  }, [reduxNotifications]);

  const isJobPaymentPending = (job) => {
    if (!job) return false;
    const oId = job.orderId || job.OrderId || job.id;
    const payStatus = paymentStatusMap[oId];
    if (payStatus === 'paid') return false;
    if (payStatus === 'pending') return true;
    const status = getResolvedStatus(job);
    return status === 'Pending' || job?.paymentStatus === 'pending';
  };

  // Activate Real-Time Notification & Location Sockets
  const techId = reduxTechnician?._id || reduxTechnician?.userId?._id || reduxTechnician?.userId || reduxUser?._id;
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
    if (handleGetNotifications) {
      handleGetNotifications().catch((err) => {
        console.warn('handleGetNotifications in Dashboard:', err?.message || err);
      });
    }
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

  // Helper to resolve exact order status from enum:
  // ["Pending", "Assigned", "On-the-way", "Working", "Completed", "Cancelled", "Accepted"]
  const getResolvedStatus = (item) => {
    if (!item) return 'Pending';
    const key = item.orderId || item.OrderId || item.id;
    if (acceptedMap[key]) return acceptedMap[key];
    if (acceptedMap[item.id]) return acceptedMap[item.id];
    if (item.status) return item.status;
    if (item.isAccepted) return 'Accepted';
    return 'Pending';
  };

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

  // Real Status Counts for Section Tabs
  const allCount = reduxNotifications.length;
  const pendingCount = reduxNotifications.filter((n) => getResolvedStatus(n) === 'Pending').length;
  const activeCount = reduxNotifications.filter((n) =>
    ['Accepted', 'Assigned', 'On-the-way', 'Working'].includes(getResolvedStatus(n))
  ).length;
  const completedCount = reduxNotifications.filter((n) => getResolvedStatus(n) === 'Completed').length;
  const unreadCount = reduxNotifications.filter((n) => n.unread).length;

  const completedJobs = reduxNotifications.filter((n) => getResolvedStatus(n) === 'Completed');

  // Real total earnings calculation from active and completed jobs
  const realEarnings = reduxNotifications
    .filter((n) => ['Accepted', 'Assigned', 'On-the-way', 'Working', 'Completed'].includes(getResolvedStatus(n)))
    .reduce((sum, n) => {
      const val = Number(n.amount) || Number(String(n.estimatedPrice || '').replace(/[^0-9]/g, '')) || 0;
      return sum + val;
    }, 0);

  // Section Tabs Definition matching user's requested specification:
  // All (1), Pending Leads (0), Active & Accepted (1), Completed (0), Unread (1)
  const tabs = [
    { id: 'all', label: `All (${allCount})` },
    { id: 'pending', label: `Pending Leads (${pendingCount})` },
    { id: 'active', label: `Active & Accepted (${activeCount})` },
    { id: 'completed', label: `Completed (${completedCount})` },
    { id: 'unread', label: `Unread (${unreadCount})` },
  ];

  // Filtered jobs queue based on selected section tab
  const filteredJobs = reduxNotifications.filter((item) => {

    const status = getResolvedStatus(item);
    if (filterTab === 'pending') return status === 'Pending';
    if (filterTab === 'active') return ['Accepted', 'Assigned', 'On-the-way', 'Working'].includes(status);
    if (filterTab === 'completed') return status === 'Completed';
    if (filterTab === 'unread') return item.unread;
    return true; // 'all'
  });

  // 🚀 Priority / Hero Card Order: ONLY show accepted and pending jobs!
  const activeJob = reduxNotifications.find((n) =>
    ['Accepted', 'Assigned', 'On-the-way', 'Working'].includes(getResolvedStatus(n))
  );
  const pendingJob = reduxNotifications.find((n) => getResolvedStatus(n) === 'Pending');
  const heroJob = activeJob || pendingJob || null;
  const heroStatus = heroJob ? getResolvedStatus(heroJob) : 'Pending';
  const isHeroActive = heroJob ? ['Accepted', 'Assigned', 'On-the-way', 'Working'].includes(heroStatus) : false;

  // Handle Accept Job
  const onAcceptJobClick = async (jobId) => {
    const targetOrderId = jobId || heroJob?.orderId || currentJobId || newJobOrderId || 'ORDER_EMERGENCY_01';
    const status = heroJob ? getResolvedStatus(heroJob) : 'Pending';

    if (['Accepted', 'Assigned', 'On-the-way', 'Working'].includes(status) || acceptedJob) {
      navigate(`/technician/tracking/${targetOrderId}`);
      return;
    }
    try {
      setAccepting(true);
      setCurrentJobId(targetOrderId);

      if (handleAcceptJob && techId) {
        await handleAcceptJob({ OrderId: targetOrderId, technicianId: techId });
      }

      setAcceptedMap((prev) => ({
        ...prev,
        [targetOrderId]: 'Accepted',
      }));
      dispatch(markNotificationAccepted(targetOrderId));
      setAcceptedJob(true);
      navigate(`/technician/tracking/${targetOrderId}`);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || '';
      const isAlreadyAccepted =
        Boolean(err?.alreadyAccepted) ||
        Boolean(err?.response?.data?.alreadyAccepted) ||
        errMsg.toLowerCase().includes('already') ||
        errMsg.toLowerCase().includes('taken');

      if (isAlreadyAccepted) {
        // 🚀 Remove from notifications so this technician does not see it anymore!
        dispatch(dismissNotification(targetOrderId));
        alert('⚠️ This job was already accepted by another technician!');
      } else {
        console.warn('Accept job note:', errMsg);
        setAcceptedJob(true);
        navigate(`/technician/tracking/${targetOrderId}`);
      }
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
              className="relative p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Notifications"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {pendingCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_6px_#f97316] animate-ping" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
                </>
              )}
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={() => navigate('/technician/Technician-Profile')}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-cyan-500/40 hover:border-cyan-400 ring-2 ring-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all cursor-pointer active:scale-95"
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
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 active:scale-95"
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
              className="w-full sm:w-auto text-center px-4 py-2 sm:py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-[0_0_16px_rgba(255,107,53,0.4)] transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              Go Online Now
            </button>
          </div>
        )}

        {/* ── Real Data Stats Grid ────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-[#0A1628]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 sm:p-5 hover:border-cyan-500/40 transition-all duration-300 group">
            <p className="text-[10px] sm:text-xs uppercase font-bold text-white/50 tracking-wider mb-1.5">Today's Jobs</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
              {activeCount + completedCount > 0 ? activeCount + completedCount : (allCount > 0 ? allCount : 0)}
            </p>
            <p className="text-[10px] sm:text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
              <span>⚡ {activeCount > 0 ? `${activeCount} Active In Progress` : (completedCount > 0 ? `${completedCount} Completed` : 'Ready for Dispatch')}</span>
            </p>
          </div>

          <div className="bg-[#0A1628]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 sm:p-5 hover:border-emerald-500/40 transition-all duration-300 group">
            <p className="text-[10px] sm:text-xs uppercase font-bold text-white/50 tracking-wider mb-1.5">Today's Earnings</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
              ₹{realEarnings > 0 ? realEarnings.toLocaleString('en-IN') : '0'}
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

          <div className="bg-[#0A1628]/85 backdrop-blur-xl rounded-2xl p-3.5 sm:p-5  border border-white/10 hover:border-violet-500/40 transition-all duration-300 group">
            <p className="text-[10px] sm:text-xs uppercase font-bold text-white/50 tracking-wider mb-1.5">Pending Leads</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
              {pendingCount}
            </p>
            <p className="text-[10px] sm:text-[11px] text-cyan-300 font-bold mt-1.5 truncate">
              {pendingCount > 0 ? 'Action Required' : 'Live socket scanning'}
            </p>
          </div>
        </div>

        {/* ── Priority Assignment Card (Real Data Hero Card) ── */}
        <section className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isHeroActive
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                } animate-ping shrink-0`}
              />
              <h2 className="font-bl    ack text-lg sm:text-xl md:text-2xl text-white truncate">
                {isHeroActive ? 'Active Navigating Job' : 'No Active Jobs'}
              </h2>
            </div>
            <span
              className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider shrink-0 ${
                isHeroActive
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
              }`}
            >
              {isHeroActive ? '⚡ In Progress' : 'Scanning For New Job'}
            </span>
          </div>

          {heroJob ? (
            <div
              className={`bg-[#0A1628]/85 backdrop-blur-2xl border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all ${
                isHeroActive
                  ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'border-rose-500/30 hover:border-rose-500/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-white/10">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-black text-lg sm:text-xl text-white">
                      {heroJob.customer || 'Incoming Customer'}
                    </h3>

                    {/* Status Badge */}
                    {(() => {
                      switch (heroStatus) {
                        case 'Accepted':
                          return (
                            <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              ✓ ACCEPTED
                            </span>
                          );
                        case 'Assigned':
                          return (
                            <span className="px-2.5 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-1">
                              👷 ASSIGNED
                            </span>
                          );
                        case 'On-the-way':
                          return (
                            <span className="px-2.5 py-0.5 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-1">
                              🚐 ON-THE-WAY
                            </span>
                          );
                        case 'Working':
                          return (
                            <span className="px-2.5 py-0.5 bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-1">
                              ⚡ WORKING
                            </span>
                          );
                        case 'Pending':
                        default:
                          return (
                            <span className="px-2.5 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] sm:text-xs font-bold rounded-full animate-pulse">
                              ⏳ PENDING DISPATCH
                            </span>
                          );
                      }
                    })()}
                  </div>
                  <p className="text-xs sm:text-sm text-white/70 mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-cyan-400">📍</span>
                    <span>{heroJob.location || heroJob.distance || 'Customer Location'}</span>
                    <span className="px-2 py-0.5 bg-cyan-500/15 text-cyan-400 text-[10px] sm:text-xs font-bold rounded-lg border border-cyan-500/30">
                      Live Socket Alert
                    </span>
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] sm:text-xs text-white/50 uppercase font-semibold">Service Fee</span>
                  <p className="text-xl sm:text-2xl font-black text-cyan-400">
                    {heroJob.estimatedPrice || (heroJob.amount ? `₹${heroJob.amount}` : '₹500')}
                  </p>
                </div>
              </div>

              {/* Problem Description */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-5 mb-5 sm:mb-6">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm mb-1.5">
                  <span>💧</span>
                  <span>{heroJob.serviceType || 'Emergency Plumbing Repair'}</span>
                </div>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Real-time dispatch alert received via Socket.IO from nearby customer.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                {heroJob && isJobPaymentPending(heroJob) && (
                  <button
                    onClick={() => navigate(`/customer/payment/${heroJob.orderId || heroJob.OrderId || heroJob.id}`)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm py-3 sm:py-3.5 px-5 rounded-xl shadow-[0_0_24px_rgba(16,185,129,0.4)] transition-all cursor-pointer text-center active:scale-95 animate-pulse"
                  >
                    <span>💳</span>
                    <span>Please payment this</span>
                  </button>
                )}

                <button
                  onClick={() => onAcceptJobClick(heroJob.orderId || heroJob.OrderId || heroJob.id)}
                  disabled={accepting}
                  className={`flex-1 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm py-3 sm:py-3.5 px-5 rounded-xl transition-all duration-200 cursor-pointer text-center active:scale-95 ${
                    isHeroActive
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.4)]'
                      : 'bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white shadow-[0_0_24px_rgba(255,107,53,0.38)]'
                  }`}
                >
                  {accepting
                    ? 'Accepting Job...'
                    : isHeroActive
                    ? '✓ View Live Map & Track Customer (GPS Active) →'
                    : 'Accept & Start Navigation →'}
                </button>

                {heroJob.phone && (
                  <a
                    href={`tel:${heroJob.phone}`}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/12 text-white font-bold text-xs sm:text-sm py-3 sm:py-3.5 px-5 rounded-xl transition-all cursor-pointer text-center no-underline active:scale-95"
                  >
                    📞 Call Client
                  </a>
                )}

                <button
                  onClick={() => navigate(`/technician/tracking/${heroJob.orderId || heroJob.OrderId || heroJob.id}`)}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-cyan-500/30 text-cyan-300 hover:text-white font-bold text-xs sm:text-sm py-3 sm:py-3.5 px-5 rounded-xl transition-all cursor-pointer text-center active:scale-95"
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

        {/* ── Section Tabs: All (1), Pending Leads (0), Active & Accepted (1), Completed (0), Unread (1) ── */}
        <section className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-black text-lg sm:text-xl md:text-2xl text-white">
                Plumbing Service Queue & Orders
              </h2>
              <p className="text-[11px] sm:text-xs text-white/50">
                Live dispatch leads, pending jobs, and active assignments for {city}
              </p>
            </div>

            {/* Pill Section Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
                    filterTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-[0_0_20px_rgba(255,107,53,0.35)]'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Filtered Orders */}
          <div className="space-y-3">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const jobStatus = getResolvedStatus(job);
                const isJobActive = ['Accepted', 'Assigned', 'On-the-way', 'Working'].includes(jobStatus);
                const orderId = job.orderId || job.OrderId || job.id;

                return (
                  <div
                    key={job.id || orderId}
                    className={`bg-[#0A1628]/85 backdrop-blur-xl border rounded-2xl p-4 sm:p-5 transition-all duration-200 group ${
                      jobStatus === 'Completed'
                        ? 'border-emerald-500/30 bg-emerald-950/10'
                        : isJobActive
                        ? 'border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.08)]'
                        : job.unread
                        ? 'border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.1)]'
                        : 'border-white/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform ${
                            jobStatus === 'Completed'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : isJobActive
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                              : 'bg-white/5 border-white/10 text-white/70'
                          }`}
                        >
                          {jobStatus === 'Completed' ? '✓' : isJobActive ? '⚡' : '🔧'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm sm:text-base text-white">
                              {job.customer || 'Customer Request'}
                            </p>

                            {/* Real Data Status Badge for Job Card */}
                            {(() => {
                              switch (jobStatus) {
                                case 'Accepted':
                                  return (
                                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      ✓ ACCEPTED
                                    </span>
                                  );
                                case 'Assigned':
                                  return (
                                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                                      👷 ASSIGNED
                                    </span>
                                  );
                                case 'On-the-way':
                                  return (
                                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40">
                                      🚐 ON-THE-WAY
                                    </span>
                                  );
                                case 'Working':
                                  return (
                                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40">
                                      ⚡ WORKING
                                    </span>
                                  );
                                case 'Completed':
                                  return (
                                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                                      <span>✓</span> COMPLETED
                                    </span>
                                  );
                                case 'Cancelled':
                                  return (
                                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                      ✕ CANCELLED
                                    </span>
                                  );
                                case 'Pending':
                                default:
                                  return (
                                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                      ⏳ PENDING
                                    </span>
                                  );
                              }
                            })()}

                            {job.unread && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-cyan-300 font-medium mt-0.5 truncate">
                            {job.serviceType || 'Emergency Plumbing Repair'}
                          </p>
                          <p className="text-[11px] sm:text-xs text-white/50 mt-1 truncate flex items-center gap-1.5">
                            <span>📍</span>
                            <span>{job.location || job.distance || 'Nearby Area'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        <div className="text-left sm:text-right">
                          <span className="font-black text-base sm:text-lg text-emerald-400">
                            {job.estimatedPrice || (job.amount ? `₹${job.amount}` : '')}
                          </span>
                        </div>

                        {/* Action button dynamically adapts based on real status */}
                        {isJobPaymentPending(job) && (
                          <button
                            onClick={() => navigate(`/customer/payment/${orderId}`)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-xs font-black text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.35)] transition-all cursor-pointer active:scale-95 animate-pulse flex items-center gap-1.5"
                          >
                            <span>💳</span>
                            <span>Please payment this</span>
                          </button>
                        )}

                        {jobStatus === 'Pending' ? (
                          <button
                            onClick={() => onAcceptJobClick(orderId)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-xs font-bold text-white shadow-[0_0_16px_rgba(255,107,53,0.35)] transition-all cursor-pointer active:scale-95"
                          >
                            Accept Job
                          </button>
                        ) : isJobActive ? (
                          <button
                            onClick={() => navigate(`/technician/tracking/${orderId}`)}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                          >
                            <span>Live GPS Map</span>
                            <span>→</span>
                          </button>
                        ) : jobStatus === 'Completed' ? (
                          paymentStatusMap[orderId] === 'paid' ? (
                            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                              <span>✓</span> Paid
                            </span>
                          ) : (
                            <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 animate-pulse">
                              <span>⏳</span> Payment Pending
                            </span>
                          )
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-semibold">
                            {jobStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-[#0A1628]/60 border border-white/10 rounded-2xl p-8 text-center text-white/50 text-xs">
                No orders found under <strong>{tabs.find((t) => t.id === filterTab)?.label || filterTab}</strong>. You are ready for incoming dispatches.
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
              className="flex-1 sm:flex-none text-center bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-[0_0_24px_rgba(255,107,53,0.38)] transition-all cursor-pointer active:scale-95"
            >
              My Profile →
            </button>
            <button
              onClick={() => navigate('/technician/TechnicianNotification')}
              className="flex-1 sm:flex-none text-center bg-white/5 hover:bg-white/10 border border-white/12 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              Alerts ({pendingCount})
            </button>
            <button
              onClick={onLogout}
              disabled={loggingOut}
              className="flex-1 sm:flex-none text-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
