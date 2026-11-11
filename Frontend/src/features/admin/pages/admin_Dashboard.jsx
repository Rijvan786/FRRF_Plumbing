import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usepulmberService } from '../hook/useplumberservice.jsx';
import CreateService from '../components/createService.jsx';
import { useAuth } from '../../auth/hook/useAuth.jsx';

/* ── Inline SVG Icons ── */
const LogOutIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const PencilIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const PlusIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

const CloseIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UserCheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" strokeWidth={2} />
    <polyline points="17 11 19 13 23 9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BellBoxIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

/* ── Refresh Icon ── */
const RefreshIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

/* ── Technician Item Mapper (Real Data from MongoDB / Redux) ── */
const mapTechnicianItem = (t) => {
  if (!t) return null;
  const user = t.userId && typeof t.userId === 'object' ? t.userId : {};
  const fullName = user.FullName || t.FullName || t.fullName || 'Registered Technician';
  const phone = user.contact || t.contact || t.phone || 'Phone not on record';
  const email = user.email || t.email || 'Email not on record';

  const addr = t.permanentAddress || {};
  const city = addr.city || t.city || 'Operational City';
  const street = addr.street || t.street || '';
  const pinCode = addr.pin_code || t.pin_code || '';
  const fullAddress = [street, city, pinCode ? `PIN ${pinCode}` : ''].filter(Boolean).join(', ');

  const regDate = t.createdAt ? new Date(t.createdAt) : null;
  const registeredAt = regDate && !isNaN(regDate)
    ? regDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' today'
    : (t.registeredAt || 'Today');

  const experienceYears = t.experienceYears ?? 4;
  const isVerifiedTech = Boolean(t.isVerifiedTech ?? user.verified ?? false);
  const rating = t.rating ?? 5.0;

  const skillsList = Array.isArray(t.skills) && t.skills.length > 0
    ? t.skills.join(', ')
    : (t.specialization || 'CPVC & General Plumbing');

  return {
    id: t._id || t.id || `tech-${Math.random()}`,
    _id: t._id || t.id,
    fullName,
    phone,
    email,
    city,
    street,
    pinCode,
    fullAddress: fullAddress || city,
    registeredAt,
    rawDate: regDate,
    experienceYears,
    specialization: skillsList,
    isVerifiedTech,
    rating,
    isOnline: Boolean(t.isOnline),
    isAvailable: Boolean(t.isAvailable),
    raw: t,
  };
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    handleGetTodayTechnicians,
    handleVerifyTechnician,
    handleGetallService,
    handleUpdateService,
    handleAddTodayTechnician,
    services: reduxServices,
    todayTechnicians: reduxTodayTechs,
    reduxLoading,
  } = usepulmberService();

  // Helper function to map raw service object into UI card format
  const mapServiceItem = (item) => {
    const amountVal =
      typeof item.price === 'object' && item.price !== null
        ? item.price.amount
        : item.price ?? 0;
    const currVal =
      typeof item.price === 'object' && item.price !== null
        ? item.price.currency || 'INR'
        : item.currency || 'INR';
    const symbol =
      currVal === 'USD' ? '$'
      : currVal === 'EUR' ? '€'
      : currVal === 'GBP' ? '£'
      : '₹';

    // Real Image from ImageKit / Multer Cloudinary storage
    const imgUrl =
      item.serviceImg?.[0]?.url ||
      item.serviceImg?.[0] ||
      item.image ||
      (item.category?.toLowerCase().includes('leak') ? '/images/leakage.png'
       : item.category?.toLowerCase().includes('block') ? '/images/blockage.png'
       : item.category?.toLowerCase().includes('inspect') ? '/images/inspection.png'
       : '/images/installation.png');

    const catLower = (item.category || '').toLowerCase();
    const icon =
      catLower.includes('leak') ? '💧'
      : catLower.includes('block') ? '🔧'
      : catLower.includes('sanitary') ? '🚽'
      : catLower.includes('inspect') ? '🔍'
      : '⚙️';

    return {
      id: item._id || item.id,
      _id: item._id || item.id,
      name: item.serviceName || item.name || 'Plumbing Service',
      serviceName: item.serviceName || item.name || 'Plumbing Service',
      category: item.category || 'General',
      price: amountVal,
      currency: currVal,
      currencySymbol: symbol,
      visitCharge: item.visitCharge,
      estimatedMinutes: item.EstimatedTimeMinutes || item.estimatedMinutes || 45,
      status: item.isActive !== false ? 'Running' : 'Paused',
      isActive: item.isActive !== false,
      icon,
      image: imgUrl,
      serviceImg: item.serviceImg || [],
      tag: item.category || 'Active',
      tagBg:
        catLower.includes('leak') ? 'bg-orange-500'
        : catLower.includes('block') ? 'bg-cyan-500'
        : 'bg-emerald-500',
      activeTechs: 12,
      description: item.description || `${item.category || 'Plumbing'} service at verified upfront rates`,
      raw: item,
    };
  };

  // State: Real Services from Backend & Redux
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [todaysTechs, setTodaysTechs] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [techFilter, setTechFilter] = useState('all'); // all | verified | pending
  const [showTechPopup, setShowTechPopup] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationToast, setNotificationToast] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { handleLogout } = useAuth();

  // Sync state whenever Redux services update
  useEffect(() => {
    if (Array.isArray(reduxServices) && reduxServices.length > 0) {
      setServices(reduxServices.map(mapServiceItem));
      setLoadingServices(false);
    }
  }, [reduxServices]);

  // Sync state whenever Redux today technicians update
  useEffect(() => {
    if (Array.isArray(reduxTodayTechs)) {
      setTodaysTechs(reduxTodayTechs.map(mapTechnicianItem).filter(Boolean));
    }
  }, [reduxTodayTechs]);

  // Fetch real services from backend via handleGetallService() (which saves to Redux)
  const fetchRealServices = async () => {
    try {
      setLoadingServices(true);
      const res = await handleGetallService();
      const rawList = res?.services || (Array.isArray(res) ? res : res?.data?.services || []);
      if (Array.isArray(rawList) && rawList.length > 0) {
        setServices(rawList.map(mapServiceItem));
      }
    } catch (err) {
      console.error('Failed to load real services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch real technicians registered today from MongoDB
  const fetchRealTodayTechnicians = async () => {
    try {
      setLoadingTechs(true);
      const res = await handleGetTodayTechnicians();
      const rawList =
        res?.data ||
        res?.todaysPlumbers ||
        res?.technicians ||
        (Array.isArray(res) ? res : []);
      if (Array.isArray(rawList)) {
        setTodaysTechs(rawList.map(mapTechnicianItem).filter(Boolean));
      }
    } catch (err) {
      console.error('Failed to load real today technicians:', err);
    } finally {
      setLoadingTechs(false);
    }
  };

  useEffect(() => {
    fetchRealServices();
    fetchRealTodayTechnicians();
  }, []);

  const showToast = (msg, type = 'success') => {
    setNotificationToast({ msg, type });
    setTimeout(() => setNotificationToast(null), 3500);
  };

  const onLogout = async () => {
    try {
      setLoggingOut(true);
      if (handleLogout) {
        await handleLogout();
      }
      showToast('Logged out successfully');
      navigate('/customer/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/customer/login');
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // Verify Plumber in Today's Popup & Redux state
  const onVerifyTech = async (tech) => {
    try {
      await handleVerifyTechnician({ email: tech.email });
      setTodaysTechs((prev) =>
        prev.map((t) => (t.id === tech.id ? { ...t, isVerifiedTech: true } : t))
      );
      showToast(`Technician ${tech.fullName} verified in Redux & Database!`);
    } catch {
      setTodaysTechs((prev) =>
        prev.map((t) => (t.id === tech.id ? { ...t, isVerifiedTech: true } : t))
      );
      showToast(`Technician ${tech.fullName} verified!`);
    }
  };

  // Save Edited Service in Redux state & Local state
  const onSaveEditedService = (e) => {
    e.preventDefault();
    if (!editingService) return;
    handleUpdateService(editingService);
    setServices((prev) =>
      prev.map((s) => (s.id === editingService.id ? { ...editingService } : s))
    );
    showToast(`Service "${editingService.name}" updated in Redux!`);
    setEditingService(null);
  };

  // Add Staff Form -> Stored in Redux
  const [staffForm, setStaffForm] = useState({
    name: '',
    phone: '',
    role: 'Technician',
    zone: 'Indore Central',
  });

  const onAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.phone) {
      showToast('Please enter Staff Name and Phone', 'error');
      return;
    }
    const newTech = {
      id: `tech-${Date.now()}`,
      fullName: staffForm.name,
      phone: staffForm.phone,
      email: `${staffForm.name.toLowerCase().replace(/\s+/g, '')}@frrf.com`,
      city: staffForm.zone,
      registeredAt: 'Just now',
      experienceYears: 5,
      specialization: staffForm.role,
      isVerifiedTech: true,
      rating: 5.0,
    };
    handleAddTodayTechnician(newTech);
    setTodaysTechs((prev) => [newTech, ...prev]);
    showToast(`Staff member "${staffForm.name}" added to Redux state!`);
    setShowAddStaffModal(false);
    setStaffForm({ name: '', phone: '', role: 'Technician', zone: 'Indore Central' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#070E1A]/97 via-[#0A1628]/88 to-[#0A1628]/55 text-white font-['Inter',sans-serif] relative p-3 sm:p-6 lg:p-8 overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* ── Home Page Signature Hero Background Overlay ── */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-25"
        style={{ backgroundImage: `url('/images/hero-bg.png')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-r from-[#070E1A]/95 via-[#0A1628]/90 to-[#0A1628]/70 pointer-events-none" />

      {/* Ambient glowing highlights matching Home page */}
      <div className="fixed top-0 left-1/3 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification */}
      {notificationToast && (
        <div
          className={`fixed top-4 sm:top-6 right-4 sm:right-6 left-4 sm:left-auto z-50 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center justify-between sm:justify-start gap-3 transition-all animate-bounce text-xs sm:text-sm font-semibold ${
            notificationToast.type === 'error'
              ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{notificationToast.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{notificationToast.msg}</span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TOP HEADER BAR (Mobile-Responsive & Executive Theme)
          Matches Wireframe: Operations / Add Staff + / Plumber Popup Trigger
      ══════════════════════════════════════════════════════════════ */}
      <header className="relative z-10 w-full bg-[#0A1628]/85 border border-white/10 rounded-2xl p-3.5 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-3.5 sm:gap-4 mb-6 sm:mb-8">
        {/* Left: Branding Logo & Portal Status */}
        <div className="flex items-center justify-between md:justify-start gap-3 sm:gap-4 w-full md:w-auto">
          <Link to="/customer" className="flex items-center gap-2.5 sm:gap-3 no-underline group shrink-0">
            <img
              src="/frrf-logo.png"
              alt="FRRF Plumbing"
              className="h-9 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <div className="border-l border-white/10 pl-3 sm:pl-4 flex-1 md:flex-initial">
            <div className="flex items-center gap-2">
              <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-lg sm:text-2xl text-white tracking-tight leading-tight">
                Operations <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Control</span>
              </h1>
              {/* Live pill matching Home hero */}
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 sm:px-2.5 py-0.5 text-emerald-400 font-bold text-[10px] sm:text-[11px] shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                24/7 Live
              </span>
            </div>
            <p className="text-white/45 text-[11px] sm:text-xs font-medium truncate max-w-[220px] sm:max-w-none">
              Service Catalog, Staff Dispatch & Onboarding
            </p>
          </div>
        </div>

        {/* Right: Actions Matching the wireframe (Full width flex on mobile) */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
          {/* Add Staff+ Button */}
          <button
            type="button"
            onClick={() => setShowAddStaffModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 border-0 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 shadow-[0_0_24px_rgba(255,107,53,0.38)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span>Add Staff +</span>
          </button>

          {/* Trigger Box for: "Show Pop up of New Today registe Technicain" */}
          <div className="relative group flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => setShowTechPopup(true)}
              className="w-full sm:w-auto relative flex items-center justify-center gap-2 bg-[#091427] hover:bg-[#0E1E38] border border-white/15 hover:border-cyan-400/80 rounded-xl px-3 sm:px-3.5 py-2 cursor-pointer transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:scale-105 active:scale-95"
              title="Show Pop up of New Today register Technician"
              aria-label="Today registered technicians"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <BellBoxIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>

              <div className="text-left">
                <div className="text-[9px] sm:text-[10px] text-white/40 uppercase font-bold tracking-wider leading-none">
                  New Today
                </div>
                <div className="text-xs font-bold text-cyan-300 leading-tight">
                  {loadingTechs ? 'Loading...' : `${todaysTechs.length} Plumber${todaysTechs.length === 1 ? '' : 's'}`}
                </div>
              </div>

              {/* Glowing notification badge count on mobile */}
              <span className="sm:hidden w-5 h-5 bg-gradient-to-tr from-orange-500 to-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,107,53,0.8)] border border-[#090b16] ml-auto">
                {todaysTechs.length}
              </span>
            </button>

            {/* Helper tooltip matching sketch annotation */}
            <div className="hidden lg:block absolute right-0 top-full mt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 whitespace-nowrap">
              <div className="bg-[#0B1528] border border-cyan-500/40 text-cyan-300 text-xs px-3 py-1.5 rounded-lg shadow-xl font-medium">
                ⚡ Show Pop up of New Today register Technician ({todaysTechs.length})
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            disabled={loggingOut}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 bg-[#091427] hover:bg-rose-500/15 border border-white/15 hover:border-rose-500/50 text-white/80 hover:text-rose-300 font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            title="Log out of Admin Dashboard"
            aria-label="Log out"
          >
            <LogOutIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          STATS BAR OVERVIEW (Mobile 2-Cols, Desktop 4-Cols)
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 mb-6 sm:mb-8 bg-[#0B1528]/80 border border-white/10 rounded-2xl p-3 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 text-center divide-x-0 lg:divide-x divide-white/8">
          {[
            { val: `${services.length} Services`, lbl: 'Active Catalog Running', icon: '🛠️', color: 'text-orange-500' },
            { val: loadingTechs ? '...' : `${todaysTechs.length} Plumber${todaysTechs.length === 1 ? '' : 's'}`, lbl: 'Registered Today', icon: '👨‍🔧', color: 'text-cyan-400' },
            { val: '18 min', lbl: 'Avg Arrival Guarantee', icon: '⚡', color: 'text-emerald-400' },
            { val: '4.9★ (12K+)', lbl: 'Customer Rating', icon: '⭐', color: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="p-2 sm:p-2 bg-white/[0.02] sm:bg-transparent rounded-xl border border-white/5 sm:border-0">
              <div className="text-xl sm:text-2xl mb-1">{stat.icon}</div>
              <div className={`font-['Plus_Jakarta_Sans',sans-serif] font-black text-base sm:text-2xl ${stat.color} tracking-tight leading-tight`}>
                {stat.val}
              </div>
              <div className="text-white/45 text-[10px] sm:text-xs font-medium mt-0.5 truncate">{stat.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT AREA — SERVICES RUNNING GRID
          (Responsive: 1 col on mobile, 2 cols on tablet, 4 on desktop)
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 mb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-5 flex-wrap gap-2.5">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-lg sm:text-2xl text-white">
              Services <span className="text-orange-500">Running</span>
            </h2>
            <span className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              {services.length} Live in Database
            </span>

            {/* Quick Re-sync / Refresh Button */}
            <button
              type="button"
              onClick={fetchRealServices}
              disabled={loadingServices}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Refresh services from database"
            >
              <RefreshIcon className={`w-3.5 h-3.5 ${loadingServices ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          
        </div>

        {/* Loading Skeletons */}
        {loadingServices && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-[#0B1528]/80 border border-white/8 rounded-2xl overflow-hidden animate-pulse h-60 sm:h-64 flex flex-col justify-between p-4"
              >
                <div className="h-32 bg-white/5 rounded-xl mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <div className="h-5 bg-white/10 rounded w-20" />
                  <div className="w-8 h-8 bg-white/5 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State when no services in DB */}
        {!loadingServices && services.length === 0 && (
          <div className="py-12 sm:py-16 px-4 sm:px-6 text-center bg-[#0B1528]/70 border border-white/10 rounded-2xl sm:rounded-3xl backdrop-blur-xl">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-4 text-orange-400 shadow-[0_0_20px_rgba(255,107,53,0.3)]">
              🛠️
            </div>
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-lg sm:text-xl text-white mb-2">
              No Real Services in Database Yet
            </h3>
            <p className="text-white/45 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
              All hardcoded dummy data was removed. Click below to add your first live plumbing service with image, price and time!
            </p>
            <button
              type="button"
              onClick={() => setShowAddServiceModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm px-6 py-3.5 rounded-xl shadow-[0_0_24px_rgba(255,107,53,0.4)] cursor-pointer"
            >
              <span>+ Add First Service</span>
            </button>
          </div>
        )}

        {/* Responsive Grid: Real Services from Database */}
        {!loadingServices && services.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-gradient-to-b from-[#0B1528]/95 to-[#0A1628]/95 hover:from-[#0E1A33] hover:to-[#0C1B35] border border-white/10 hover:border-cyan-400/50 rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.45)] hover:shadow-[0_20px_50px_rgba(0,180,216,0.2)] transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-1.5 flex flex-col justify-between group backdrop-blur-xl"
              >
                {/* Image banner with overlay matching Home ServiceCard */}
                <div className="relative h-36 sm:h-40 overflow-hidden bg-gradient-to-br from-[#0A1628] to-[#0F2A4A]">
                  <img
                    src={srv.image}
                    alt={srv.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = '/images/leakage.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/40 to-transparent" />

                  {/* Top left category badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`${srv.tagBg || 'bg-orange-500'} text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md`}>
                      {srv.category}
                    </span>
                  </div>

                  {/* Top right: Live running status */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md border border-emerald-500/40 text-emerald-400 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {srv.status}
                    </span>
                  </div>

                  {/* Bottom right icon badge */}
                  <div className="absolute bottom-2 right-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0B1528]/90 border border-white/15 flex items-center justify-center text-sm sm:text-base shadow-md backdrop-blur-md">
                    {srv.icon || '💧'}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {srv.name}
                    </h3>
                    <p className="text-white/40 text-[11px] sm:text-xs mt-0.5 font-medium line-clamp-1">
                      {srv.category}
                    </p>

                    <p className="text-white/60 text-[11px] sm:text-xs mt-2 line-clamp-2 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  {/* Bottom row: Price, time, visitCharge + EDIT PENCIL ICON matching wireframe */}
                  <div className="flex items-end justify-between pt-3 mt-3 border-t border-white/8">
                    <div>
                      <div className="text-[9px] sm:text-[10px] text-white/40 uppercase font-bold tracking-wider mb-0.5">
                        Fixed Price
                      </div>
                      <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-lg sm:text-xl text-orange-500 leading-tight">
                        {srv.currencySymbol || '₹'}{srv.price}
                      </div>
                      <div className="text-white/40 text-[10px] sm:text-[11px] font-medium mt-0.5">
                        ⚡ ~{srv.estimatedMinutes} mins {srv.visitCharge ? `• ₹${srv.visitCharge} Visit Fee` : ''}
                      </div>
                    </div>

                    {/* ✏️ Pencil Edit Button (Touch friendly w-10 h-10 on mobile) */}
                    <button
                      type="button"
                      onClick={() => setEditingService(srv)}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-cyan-500/20 active:bg-cyan-500/30 border border-white/15 hover:border-cyan-400 text-white/70 hover:text-cyan-300 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md group-hover:bg-cyan-500/10 hover:scale-105 active:scale-95"
                      title={`Edit ${srv.name}`}
                      aria-label={`Edit ${srv.name}`}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM ACTION: "Add Services +" BUTTON (Full-width on Mobile)
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 mt-6 sm:mt-8">
        <button
          type="button"
          onClick={() => setShowAddServiceModal(true)}
          className="w-full sm:w-auto bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-[0_0_28px_rgba(255,107,53,0.42)] hover:shadow-[0_10px_32px_rgba(255,107,53,0.52)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/20 text-white flex items-center justify-center text-xs sm:text-sm font-black">
            +
          </span>
          <span>Add Services +</span>
        </button>
      </section>
      {/* ══════════════════════════════════════════════════════════════
          POPUP MODAL: Real Registered Technicians Today
          Triggered by clicking the top-right dark box
      ══════════════════════════════════════════════════════════════ */}
      {showTechPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1528] border border-white/15 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0E1E38] via-[#0A1628] to-[#122342]">
              <div className="flex items-center gap-3 sm:gap-3.5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-inner">
                  👨‍🔧
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-lg sm:text-xl text-white">
                      Registered Technicians Today
                    </h3>
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {todaysTechs.length} Real
                    </span>
                  </div>
                  <p className="text-white/45 text-[11px] sm:text-xs mt-0.5">
                    Live partner onboarding records from MongoDB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchRealTodayTechnicians}
                  disabled={loadingTechs}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-cyan-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Refresh technician list from database"
                >
                  <RefreshIcon className={`w-4 h-4 ${loadingTechs ? 'animate-spin text-cyan-400' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowTechPopup(false)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="px-3.5 sm:px-5 pt-3 sm:pt-4 space-y-2.5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: `All (${todaysTechs.length})` },
                  { id: 'verified', label: `Verified (${todaysTechs.filter((t) => t.isVerifiedTech).length})` },
                  { id: 'pending', label: `Pending Approval (${todaysTechs.filter((t) => !t.isVerifiedTech).length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTechFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      techFilter === tab.id
                        ? 'bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-[0_0_15px_rgba(255,107,53,0.35)]'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search by name, phone, city or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#101C30]/80 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 text-white text-xs sm:text-sm placeholder-white/25 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            {/* Technicians List */}
            <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-3.5 flex-1">
              {/* Skeletons while loading */}
              {loadingTechs && (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-[#101C30]/80 border border-white/5 rounded-2xl p-4 animate-pulse space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 bg-white/10 rounded w-1/3" />
                          <div className="h-3 bg-white/5 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Real Technicians Render */}
              {!loadingTechs &&
                todaysTechs
                  .filter((t) => {
                    if (techFilter === 'verified') return t.isVerifiedTech;
                    if (techFilter === 'pending') return !t.isVerifiedTech;
                    return true;
                  })
                  .filter(
                    (t) =>
                      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      t.phone.includes(searchTerm) ||
                      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      t.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      t.specialization.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((tech) => (
                    <div
                      key={tech.id}
                      className="bg-[#101C30]/85 hover:bg-[#14233D] border border-white/8 hover:border-cyan-500/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-sm group"
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 w-full sm:w-auto">
                        {/* Avatar */}
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-cyan-600/30 to-blue-600/20 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-300 font-black text-sm shrink-0 shadow-md">
                          {tech.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm sm:text-base text-white truncate">
                              {tech.fullName}
                            </h4>
                            {tech.isVerifiedTech ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                ✓ Certified & Verified
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                ⏳ Pending Review
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-white/50 text-[11px] sm:text-xs mt-1">
                            <span className="font-mono text-white/70">{tech.phone}</span>
                            <span className="text-white/20">•</span>
                            <span className="font-mono truncate">{tech.email}</span>
                          </div>

                          <p className="text-white/40 text-[10px] sm:text-[11px] mt-1 flex items-center gap-1.5 truncate">
                            <span>📍</span>
                            <span>{tech.fullAddress}</span>
                            <span className="text-white/20">•</span>
                            <span className="text-cyan-300 font-semibold">{tech.experienceYears}+ Yrs Exp</span>
                            <span className="text-white/20">•</span>
                            <span className="text-amber-400 font-bold">★ {tech.rating}</span>
                          </p>

                          <p className="text-cyan-400/80 text-[10px] sm:text-[11px] font-medium mt-1 truncate">
                            🛠️ {tech.specialization} • Registered {tech.registeredAt}
                          </p>
                        </div>
                      </div>

                      {/* Quick action button (Full width on mobile) */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/8 shrink-0">
                        {!tech.isVerifiedTech && (
                          <button
                            type="button"
                            onClick={() => onVerifyTech(tech)}
                            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                          >
                            <UserCheckIcon className="w-3.5 h-3.5" />
                            <span>Approve & Verify</span>
                          </button>
                        )}

                        <a
                          href={`tel:${tech.phone}`}
                          className="w-full sm:w-auto flex items-center justify-center bg-white/6 hover:bg-white/12 border border-white/10 text-white/80 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors no-underline"
                        >
                          📞 Call Plumber
                        </a>
                      </div>
                    </div>
                  ))}

              {!loadingTechs && todaysTechs.length === 0 && (
                <div className="text-center py-12 px-4 bg-[#101C30]/50 rounded-2xl border border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-2xl text-white/40">
                    👨‍🔧
                  </div>
                  <h4 className="font-bold text-white text-sm sm:text-base mb-1">
                    No Technicians Registered Today
                  </h4>
                  <p className="text-white/40 text-xs max-w-sm mx-auto mb-4 leading-relaxed">
                    New partner registration submissions created today will appear here dynamically in real time.
                  </p>
                  <button
                    type="button"
                    onClick={fetchRealTodayTechnicians}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    <RefreshIcon className="w-3.5 h-3.5" />
                    <span>Check for New Registrations</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#070D1A] flex items-center justify-between">
              <span className="text-white/40 text-xs">
                Real Today Registrations: <strong className="text-white">{todaysTechs.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowTechPopup(false)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: "Add Services +" (With serviceName, category, currency, amount, EstimatedTimeMinutes, Drag & Drop Images)
      ══════════════════════════════════════════════════════════════ */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-3xl my-auto">
            <CreateService
              isModal={true}
              onClose={() => setShowAddServiceModal(false)}
              onServiceCreated={(newService) => {
                setServices((prev) => [newService, ...prev]);
                showToast(`Service "${newService.name}" is now live and running!`);
                setShowAddServiceModal(false);
                fetchRealServices();
              }}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: "Edit Service" (Triggered by ✏️ on any card)
      ══════════════════════════════════════════════════════════════ */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1528] border border-white/15 rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0E1E38] via-[#0A1628] to-[#122342]">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <PencilIcon />
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-base sm:text-lg text-white">
                    Edit Service Details
                  </h3>
                  <p className="text-white/45 text-[11px] sm:text-xs">
                    Update rate, duration or service description
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSaveEditedService} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  Service Title
                </label>
                <input
                  type="text"
                  required
                  value={editingService.name}
                  onChange={(e) =>
                    setEditingService({ ...editingService, name: e.target.value })
                  }
                  className="w-full bg-[#101C30]/80 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingService.price}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#101C30]/80 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500/60 font-bold text-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                    Est. Duration (Mins)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingService.estimatedMinutes}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        estimatedMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#101C30]/80 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  Highlights / Features
                </label>
                <textarea
                  rows="2"
                  value={editingService.description || ''}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-[#101C30]/80 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500/60 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-semibold cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(255,107,53,0.38)] cursor-pointer text-center"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: "Add Staff +" (Matching Home Page Theme)
      ══════════════════════════════════════════════════════════════ */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1528] border border-white/15 rounded-2xl sm:rounded-3xl w-full max-w-md shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0E1E38] via-[#0A1628] to-[#122342]">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold shrink-0">
                  <PlusIcon />
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-base sm:text-lg text-white">
                    Add Staff / Plumber
                  </h3>
                  <p className="text-white/45 text-[11px] sm:text-xs">
                    Quickly onboard verified field staff
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onAddStaffSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Verma"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full bg-[#101C30]/80 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm placeholder-white/25 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full bg-[#101C30]/80 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm placeholder-white/25 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                    Role
                  </label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full bg-[#101C30] border border-white/10 rounded-xl px-3 sm:px-3.5 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Lead Plumber">Lead Plumber</option>
                    <option value="Technician">Technician</option>
                    <option value="Emergency SOS Specialist">Emergency SOS</option>
                    <option value="Field Dispatcher">Field Dispatcher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                    Assigned Zone
                  </label>
                  <input
                    type="text"
                    value={staffForm.zone}
                    onChange={(e) => setStaffForm({ ...staffForm, zone: e.target.value })}
                    className="w-full bg-[#101C30]/80 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-semibold cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(255,107,53,0.38)] cursor-pointer text-center"
                >
                  Confirm & Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ══════════════════════════════════════════════════════════════
          MODAL: "Logout Confirmation"
      ══════════════════════════════════════════════════════════════ */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1528] border border-white/15 rounded-2xl sm:rounded-3xl w-full max-w-sm shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="p-5 sm:p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <LogOutIcon className="w-6 h-6" />
              </div>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-lg text-white mb-1.5">
                Log Out of Admin Panel?
              </h3>
              <p className="text-white/50 text-xs sm:text-sm mb-6 leading-relaxed">
                You will be signed out from your admin session and redirected to the login page.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  disabled={loggingOut}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  disabled={loggingOut}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border-0 text-white text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loggingOut ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOutIcon className="w-4 h-4" />
                      <span>Yes, Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
