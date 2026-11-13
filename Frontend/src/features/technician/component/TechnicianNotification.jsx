import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useNotification } from '../hook/useNotification.jsx';
import { useTechnician } from '../hook/useTechnician.jsx';
import {
  markNotificationRead,
  markNotificationAccepted,
  dismissNotification,
  setNotifications,
} from '../state/technician.slice.jsx';

export default function TechnicianNotification() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleAcceptJob, handleGetTechnician, handleGetNotifications } = useTechnician();

  // ── 4-Layer Architecture: Direct Redux Selectors (Layer 3: State) ──
  const reduxTechnician = useSelector((state) => state.technician?.technician || state.technician?.tech);
  const reduxNotifications = useSelector((state) => state.technician?.notifications || []);
  const newJobOrderId = useSelector((state) => state.technician?.newJobOrderId);
  const reduxUser = useSelector((state) => state.auth?.User);

  const [filter, setFilter] = useState('all');
  const [visible, setVisible] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [acceptedMap, setAcceptedMap] = useState({});

  const techId = reduxTechnician?._id || reduxTechnician?.userId?._id || reduxUser?._id;
  useNotification({ technicianId: techId, userId: reduxUser?._id });

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Fetch technician profile and live notifications on mount
  useEffect(() => {
    if (!reduxTechnician) {
      handleGetTechnician().catch((err) => console.warn('Tech fetch note:', err));
    }
    if (handleGetNotifications) {
      handleGetNotifications().catch((err) => console.warn('Tech notifications fetch note:', err));
    }
  }, [reduxTechnician]);

  const handleMarkAsRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const handleDismiss = (id) => {
    dispatch(dismissNotification(id));
  };

  const handleMarkAllRead = () => {
    reduxNotifications.forEach((n) => dispatch(markNotificationRead(n.id)));
  };

  const handleAcceptAndDispatch = async (item) => {
    const oId = item.orderId || item.OrderId || item.id;
    try {
      setAcceptingId(item.id || oId);
      handleMarkAsRead(item.id);

      // Optimistic instant status transition
      setAcceptedMap((prev) => ({
        ...prev,
        [oId]: 'Accepted',
        [item.id]: 'Accepted',
      }));
      dispatch(markNotificationAccepted(oId));

      if (handleAcceptJob && techId && oId) {
        await handleAcceptJob({ OrderId: oId, technicianId: techId });
      }
    } catch (err) {
      console.warn('Accept job in notification:', err?.message || err);
    } finally {
      setAcceptingId(null);
      navigate(`/technician/tracking/${oId || 'LIVE_DEMO_ORDER'}`);
    }
  };

  // Helper function to resolve exact order status from enum:
  // ["Pending", "Assigned", "On-the-way", "Working", "Completed", "Cancelled", "Accepted"]
  const getResolvedStatus = (item) => {
    const key = item.orderId || item.OrderId || item.id;
    if (acceptedMap[key]) return acceptedMap[key];
    if (acceptedMap[item.id]) return acceptedMap[item.id];
    if (item.status) return item.status;
    if (item.isAccepted) return 'Accepted';
    return 'Pending';
  };

  const unreadCount = reduxNotifications.filter((n) => n.unread).length;
  const pendingCount = reduxNotifications.filter((n) => getResolvedStatus(n) === 'Pending').length;
  const activeCount = reduxNotifications.filter((n) =>
    ['Accepted', 'Assigned', 'On-the-way', 'Working'].includes(getResolvedStatus(n))
  ).length;

  const filtered = reduxNotifications.filter((n) => {
    const status = getResolvedStatus(n);
    if (filter === 'unread') return n.unread;
    if (filter === 'pending') return status === 'Pending';
    if (filter === 'active') return ['Accepted', 'Assigned', 'On-the-way', 'Working'].includes(status);
    if (filter === 'completed') return status === 'Completed';
    if (filter === 'urgent') return n.urgent && status === 'Pending';
    return true;
  });

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

      {/* ── Top Header Bar ───────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0A1628]/85 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => navigate('/technician/Technician-Dashboard')}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden xs:inline">Dashboard</span>
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <h1 className="font-black text-base sm:text-xl md:text-2xl text-white tracking-tight truncate">
                  Dispatch Alerts & Leads
                </h1>
                {pendingCount > 0 && (
                  <span className="px-2 sm:px-2.5 py-0.5 bg-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-[0_0_12px_rgba(255,107,53,0.5)] shrink-0 animate-pulse">
                    {pendingCount} New
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] sm:text-xs text-cyan-400 hover:text-cyan-300 font-bold px-1.5 sm:px-2 py-1 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={() => navigate('/technician/Technician-Profile')}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border-2 border-cyan-500/40 ring-2 ring-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all cursor-pointer shrink-0 active:scale-95"
                title="My Profile"
              >
                <img
                  src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=100&q=80"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: `All (${reduxNotifications.length})` },
              { id: 'pending', label: `Pending Leads (${pendingCount})` },
              { id: 'active', label: `Active & Accepted (${activeCount})` },
              { id: 'unread', label: `Unread (${unreadCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
                  filter === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-[0_0_20px_rgba(255,107,53,0.35)]'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Notifications Content ───────────────────────── */}
      <main
        className={`relative z-10 max-w-4xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 transition-all duration-700 ease-out transform ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="space-y-4">
          {filtered.map((item) => {
            const currentStatus = getResolvedStatus(item);
            const isAcceptedOrActive = ['Accepted', 'Assigned', 'On-the-way', 'Working'].includes(currentStatus);

            return (
              <div
                key={item.id}
                className={`bg-[#0A1628]/85 backdrop-blur-2xl border rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-200 ${
                  isAcceptedOrActive
                    ? 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/30'
                    : item.unread
                    ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Header Card */}
                <div className="p-4 sm:p-5 md:p-6 border-b border-white/10 flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                      {item.icon || '🔧'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-sm sm:text-base md:text-lg text-white break-words">
                          {item.title}
                        </h3>

                        {/* Modern Status Badges for all 7 Statuses */}
                        {(() => {
                          switch (currentStatus) {
                            case 'Accepted':
                              return (
                                <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-[11px] font-bold rounded-full flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  ✓ ACCEPTED
                                </span>
                              );
                            case 'Assigned':
                              return (
                                <span className="px-2.5 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[10px] sm:text-[11px] font-bold rounded-full flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                  👷 ASSIGNED
                                </span>
                              );
                            case 'On-the-way':
                              return (
                                <span className="px-2.5 py-0.5 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] sm:text-[11px] font-bold rounded-full flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,107,53,0.3)]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                  🚐 ON-THE-WAY
                                </span>
                              );
                            case 'Working':
                              return (
                                <span className="px-2.5 py-0.5 bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] sm:text-[11px] font-bold rounded-full flex items-center gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                  ⚡ WORKING
                                </span>
                              );
                            case 'Completed':
                              return (
                                <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-[11px] font-bold rounded-full flex items-center gap-1">
                                  ✓ COMPLETED
                                </span>
                              );
                            case 'Cancelled':
                              return (
                                <span className="px-2.5 py-0.5 bg-rose-500/15 border border-rose-500/40 text-rose-400 text-[10px] sm:text-[11px] font-bold rounded-full flex items-center gap-1">
                                  ✕ CANCELLED
                                </span>
                              );
                            case 'Pending':
                            default:
                              return item.urgent ? (
                                <span className="px-2 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[9px] sm:text-[10px] font-bold rounded-full tracking-wider uppercase animate-pulse">
                                  🚨 IMMEDIATE
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] sm:text-[10px] font-bold rounded-full tracking-wider uppercase">
                                  ⏳ PENDING
                                </span>
                              );
                          }
                        })()}

                        {item.category && (
                          <span className="text-[10px] sm:text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-white/50 flex items-center gap-1.5 mt-1 truncate">
                        <span>⏱️</span>
                        <span>Received {item.time || 'Recently'}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-cyan-300 font-medium hidden xs:inline">Direct Socket Dispatch</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.unread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                    )}
                    <button
                      onClick={() => handleDismiss(item.id)}
                      className="text-white/30 hover:text-white/70 p-1.5 transition-colors cursor-pointer"
                      title="Dismiss"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Service & Customer Details */}
                <div className="p-4 sm:p-5 md:p-6 bg-white/[0.02]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5">
                      <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1">
                        Customer
                      </p>
                      <p className="font-bold text-white text-xs sm:text-sm">{item.customer || 'Resident'}</p>
                      <p className="font-mono text-[11px] sm:text-xs text-white/60 mt-0.5">{item.phone || '+91 98260 12345'}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5">
                      <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1">
                        Estimated Payout
                      </p>
                      <p className="font-black text-emerald-400 text-base sm:text-lg">
                        {item.estimatedPrice || '₹500'}
                      </p>
                      <p className="text-[10px] text-emerald-400/80 font-medium mt-0.5">Instant credit on job completion</p>
                    </div>
                  </div>

                  {/* Service Details Box */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-4 mb-4">
                    <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1">
                      Reported Plumbing Problem
                    </p>
                    <p className="text-xs sm:text-sm text-cyan-300 font-semibold mb-2 leading-relaxed">
                      {item.serviceType || 'Emergency Inspection & Repair'}
                    </p>

                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 text-xs text-white/60 pt-2.5 border-t border-white/10">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span>📍</span>
                        <span className="truncate">{item.location || 'Local Residential Area'}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] sm:text-xs font-bold rounded-lg shrink-0 self-start xs:self-auto">
                        {item.distance || '2.0 km away'}
                      </span>
                    </div>
                  </div>

                  {/* ── Modern Dynamic Action Buttons Based On All 7 Statuses ── */}
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                    {(() => {
                      switch (currentStatus) {
                        case 'Accepted':
                          // 🚀 IF ORDER ACCEPTED: DO NOT SHOW ACCEPT & DISPATCH BUTTON AGAIN!
                          return (
                            <button
                              onClick={() => navigate(`/technician/tracking/${item.orderId || item.OrderId || item.id || 'LIVE_DEMO_ORDER'}`)}
                              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 text-center"
                            >
                              <span>✓</span>
                              <span>Order Accepted · Open GPS Tracking →</span>
                            </button>
                          );

                        case 'Assigned':
                          return (
                            <button
                              onClick={() => navigate(`/technician/tracking/${item.orderId || item.OrderId || item.id || 'LIVE_DEMO_ORDER'}`)}
                              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 text-center"
                            >
                              <span>👷</span>
                              <span>Job Assigned · Navigate to Client →</span>
                            </button>
                          );

                        case 'On-the-way':
                          return (
                            <button
                              onClick={() => navigate(`/technician/tracking/${item.orderId || item.OrderId || item.id || 'LIVE_DEMO_ORDER'}`)}
                              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl shadow-[0_0_20px_rgba(255,107,0,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 text-center"
                            >
                              <span>🚐</span>
                              <span>En Route (On-the-way) · Open Radar →</span>
                            </button>
                          );

                        case 'Working':
                          return (
                            <button
                              onClick={() => navigate(`/technician/tracking/${item.orderId || item.OrderId || item.id || 'LIVE_DEMO_ORDER'}`)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-black text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 text-center"
                            >
                              <span>🔧</span>
                              <span>Active Work In Progress · View Job →</span>
                            </button>
                          );

                        case 'Completed':
                          return (
                            <div className="flex-1 bg-white/5 border border-emerald-500/30 text-emerald-400 font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-center">
                              <span>🎉</span>
                              <span>Service Completed · Payout Processed</span>
                            </div>
                          );

                        case 'Cancelled':
                          return (
                            <div className="flex-1 bg-white/5 border border-rose-500/30 text-rose-400 font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-center">
                              <span>✕</span>
                              <span>Order Cancelled</span>
                            </div>
                          );

                        case 'Pending':
                        default:
                          return (
                            <button
                              onClick={() => handleAcceptAndDispatch(item)}
                              disabled={acceptingId === item.id || acceptingId === item.orderId}
                              className="flex-1 bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-5 rounded-xl shadow-[0_0_20px_rgba(255,107,53,0.35)] transition-all cursor-pointer text-center active:scale-95"
                            >
                              {acceptingId === item.id || acceptingId === item.orderId ? (
                                <span className="flex items-center justify-center gap-2">
                                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Accepting Job...
                                </span>
                              ) : (
                                'Accept & Dispatch →'
                              )}
                            </button>
                          );
                      }
                    })()}

                    {/* Secondary Actions: Call & Mark Read */}
                    {item.phone && currentStatus !== 'Cancelled' && (
                      <a
                        href={`tel:${item.phone}`}
                        className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-xl transition-all cursor-pointer text-center no-underline active:scale-95"
                      >
                        📞 Call Client
                      </a>
                    )}

                    {item.unread && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-xl transition-all cursor-pointer text-center active:scale-95"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="text-center py-12 sm:py-16 bg-[#0A1628]/80 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-2xl sm:text-3xl">
                🔔
              </div>
              <h3 className="font-black text-lg sm:text-xl text-white mb-1.5">
                No Notifications Found
              </h3>
              <p className="text-xs sm:text-sm text-white/50 max-w-sm mx-auto mb-5 leading-relaxed">
                You're all caught up! New emergency plumbing calls and scheduled customer requests will appear here in real time.
              </p>
              <button
                onClick={() => setFilter('all')}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}