import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/hook/useAuth.jsx';
import { GetMe } from '../../auth/service/auth.api.jsx';
import { setUser } from '../../auth/state/auth.slice.jsx';
import Navbar from "../../../App/Navbar.jsx";
import { useOrder } from '../hook/useOrder.jsx';
import { useListenPlumber } from '../hook/useListenPlumber.jsx';

/* ── Inline Feather/Lucide Icon Components (Zero-Dependency & Pixel-Crisp) ── */
const Calendar = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MapPin = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
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

const Edit2 = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const Trash2 = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

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

const PhoneCall = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const FileText = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const Sparkles = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

/* ── Category Icon Mapper ── */
const mapCategoryIcon = (category = '') => {
  const cat = String(category || '').toLowerCase();
  if (cat.includes('leak')) return '💧';
  if (cat.includes('block')) return '🔧';
  if (cat.includes('install')) return '⚙️';
  if (cat.includes('maintain') || cat.includes('tank')) return '🛡️';
  if (cat.includes('inspect') || cat.includes('scan')) return '🔍';
  if (cat.includes('sanitary') || cat.includes('tap') || cat.includes('toilet') || cat.includes('valve')) return '🚰';
  if (cat.includes('sos') || cat.includes('emergency')) return '⚡';
  if (cat.includes('setup') || cat.includes('renov')) return '🏗️';
  return '🔧';
};

/* ── Order Status Styler & Normalizer ── */
const mapStatusDetails = (status = '') => {
  const s = String(status || '').toLowerCase();
  if (s === 'pending') {
    return {
      statusKey: 'pending',
      statusLabel: 'Pending • Dispatching Nearby Plumber',
      badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dotColor: 'bg-amber-400',
      isActive: true,
      progressPercent: '25%',
    };
  }
  if (s === 'assigned' || s === 'accepted') {
    return {
      statusKey: 'in-progress',
      statusLabel: 'Technician Assigned & Confirmed',
      badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      dotColor: 'bg-cyan-400',
      isActive: true,
      progressPercent: '50%',
    };
  }
  if (s === 'on-the-way') {
    return {
      statusKey: 'in-progress',
      statusLabel: 'Technician En Route 🚐',
      badgeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      dotColor: 'bg-orange-400',
      isActive: true,
      progressPercent: '70%',
    };
  }
  if (s === 'working') {
    return {
      statusKey: 'in-progress',
      statusLabel: 'Repair in Progress ⚙️',
      badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      dotColor: 'bg-blue-400',
      isActive: true,
      progressPercent: '85%',
    };
  }
  if (s === 'completed') {
    return {
      statusKey: 'completed',
      statusLabel: 'Completed & Verified ✓',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dotColor: 'bg-emerald-400',
      isActive: false,
      progressPercent: '100%',
    };
  }
  if (s === 'cancelled') {
    return {
      statusKey: 'cancelled',
      statusLabel: 'Booking Cancelled',
      badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      dotColor: 'bg-rose-400',
      isActive: false,
      progressPercent: '0%',
    };
  }
  return {
    statusKey: 'in-progress',
    statusLabel: status || 'In Progress',
    badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dotColor: 'bg-cyan-400',
    isActive: true,
    progressPercent: '40%',
  };
};

/* ── Transform Real Order Document from Backend into Visual Booking Card ── */
const formatRealOrder = (order) => {
  if (!order) return null;
  const statusInfo = mapStatusDetails(order.status || 'Pending');
  const serviceTitle = order.ServiceDetails?.serviceName || order.issuedDescription || 'Plumbing Service';
  const category = order.ServiceDetails?.category || 'General Repair';
  const icon = mapCategoryIcon(category);

  // Price calculation
  const rawPrice =
    order.total_Amount?.amount ??
    order.ServiceDetails?.price?.amount ??
    order.ServiceDetails?.visitCharge ??
    500;
  const formattedPrice = typeof rawPrice === 'number' ? rawPrice.toLocaleString('en-IN') : String(rawPrice);

  // Date & Time slots
  const dateObj = order.scheduleDate ? new Date(order.scheduleDate) : (order.createdAt ? new Date(order.createdAt) : new Date());
  const dateStr = !isNaN(dateObj)
    ? dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Scheduled';
  const timeStr = !isNaN(dateObj)
    ? dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : 'Standard Slot';

  // Address
  const fullAddress = [
    order.address?.street,
    order.address?.city,
    order.address?.pin_code ? `PIN ${order.address?.pin_code}` : ''
  ].filter(Boolean).join(', ') || 'Address on record';

  // Work Order ID
  const displayId = order._id ? `#FRRF-${order._id.slice(-6).toUpperCase()}` : '#FRRF-NEW';

  // Technician details
  const technician = order.technicianId && typeof order.technicianId === 'object' ? {
    name: order.technicianId.FullName || order.technicianId.name || 'Certified Master Plumber',
    badge: 'Master Plumber (License Verified)',
    rating: '4.9 ★',
    phone: order.technicianId.contact || order.technicianId.phone || '+91 98260 12345',
    eta: 'En Route (Live GPS)',
  } : {
    name: 'Auto-Dispatching Plumber',
    badge: 'Verifying nearest master technician',
    rating: '5.0 ★',
    phone: '+91 98260 12345',
    eta: 'Estimated arrival in 15-30 mins',
  };

  return {
    rawOrder: order,
    id: displayId,
    rawId: order._id,
    service: serviceTitle,
    category,
    icon,
    serviceImg: order.ServiceDetails?.serviceImg?.[0]?.url || order.issueImageUrl?.[0]?.url,
    issueImg: order.issueImageUrl?.[0]?.url,
    status: statusInfo.statusKey,
    statusLabel: statusInfo.statusLabel,
    badgeBg: statusInfo.badgeBg,
    dotColor: statusInfo.dotColor,
    isActive: statusInfo.isActive,
    progressPercent: statusInfo.progressPercent,
    date: dateStr,
    timeSlot: timeStr,
    price: formattedPrice,
    rawPriceNumber: typeof rawPrice === 'number' ? rawPrice : Number(rawPrice) || 0,
    address: fullAddress,
    addressObj: order.address,
    technician,
    telemetry: `Category: ${category} • Location GPS Locked`,
    warranty: order.status === 'Completed' ? 'Protected under 90-Day Guarantee' : '100% Workmanship & Damage Insured',
    issuedDescription: order.issuedDescription || '',
  };
};

/* ── Stitch Suggested Preventive Care ── */
const SUGGESTED_SERVICES = [
  {
    title: 'Water Tank Microbial Clean',
    desc: 'Deep chemical-free ultraviolet sterilisation for clean family water.',
    price: '₹499',
    tag: 'Recommended',
    actionText: 'Quick Book',
  },
  {
    title: 'Whole House Pipe Scan',
    desc: 'Digital acoustic scan to uncover micro wall leaks before damage.',
    price: '₹799',
    tag: 'Popular',
    actionText: 'Book Scan',
  },
  {
    title: 'Geyser & Valve Descaling',
    desc: 'Flush hard water scale buildup for 30% faster winter heating.',
    price: '₹349',
    tag: 'Seasonal',
    actionText: 'Book Care',
  },
];

export default function CustomerProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { OrderId: routeOrderId } = useParams();
  const { handleLogout, handleGetME } = useAuth();
  const { handleGetOrder } = useOrder();

  // 4-Layer Architecture: Direct Redux Selectors from state.order (Layer 3: State Management)
  const reduxServices = useSelector((state) => state.order?.services || []);
  const reduxOrders = useSelector((state) => state.order?.orders || state.order?.item || []);
  const reduxSelectedService = useSelector((state) => state.order?.selectedService || null);
  const reduxLoading = useSelector((state) => state.order?.loading || false);
  const reduxError = useSelector((state) => state.order?.error || null);
  const reduxUser = useSelector((state) => state.auth?.User);

  useListenPlumber({ userId: reduxUser?._id });

  // Direct calculation from Redux store without intermediate useState duplication
  const orderWithUser = useMemo(() => {
    return Array.isArray(reduxOrders)
      ? reduxOrders.find((o) => o?.userId && typeof o.userId === 'object')
      : null;
  }, [reduxOrders]);

  const userData = useMemo(() => {
    return {
      FullName: orderWithUser?.userId?.FullName || reduxUser?.FullName || 'Customer',
      email: orderWithUser?.userId?.email || reduxUser?.email || '',
      contact: orderWithUser?.userId?.contact || reduxUser?.contact || '',
      role: orderWithUser?.userId?.role || reduxUser?.role || 'customer',
      city: orderWithUser?.address?.city || reduxUser?.city || '',
    };
  }, [orderWithUser, reduxUser]);

  // Derived addresses directly from Redux orders
  const [customAddresses, setCustomAddresses] = useState([]);
  const addresses = useMemo(() => {
    const dynamicAddrs = [];
    const seen = new Set();
    if (Array.isArray(reduxOrders)) {
      reduxOrders.forEach((o, idx) => {
        if (o?.address && (o.address.street || o.address.city)) {
          const key = `${o.address.street}-${o.address.city}`;
          if (!seen.has(key)) {
            seen.add(key);
            dynamicAddrs.push({
              id: o.address._id || `addr-${idx}`,
              type: `${o.address.label || 'Home'} (${o.ServiceDetails?.serviceName || 'Service Location'})`,
              isDefault: dynamicAddrs.length === 0,
              name: o.userId?.FullName || userData.FullName,
              phone: o.userId?.contact || userData.contact,
              addressLine: o.address.street || '',
              cityState: `${o.address.city || ''}${o.address.pin_code ? ` - ${o.address.pin_code}` : ''}`,
              landmark: `Booked for ${o.ServiceDetails?.serviceName || 'Plumbing Service'}`,
            });
          }
        }
      });
    }
    if (dynamicAddrs.length === 0 && customAddresses.length === 0) {
      dynamicAddrs.push({
        id: 1,
        type: 'Home (Primary Residence)',
        isDefault: true,
        name: userData.FullName,
        phone: userData.contact || '+91 98765 43210',
        addressLine: 'Registered Address',
        cityState: userData.city || 'India',
        landmark: 'Verified Location',
      });
    }
    return [...dynamicAddrs, ...customAddresses];
  }, [reduxOrders, userData, customAddresses]);

  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookingFilter, setBookingFilter] = useState('all'); // all | active | completed
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Form State for editing profile settings
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyPhone: '+91 98260 12345',
    city: '',
    preferredTime: 'Morning (09:00 AM – 12:00 PM)',
  });
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    type: 'Home',
    addressLine: '',
    cityState: 'Burhanpur, Madhya Pradesh',
    landmark: '',
  });

  // Keep form in sync when userData changes
  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      name: userData.FullName,
      email: userData.email,
      phone: userData.contact,
      city: userData.city,
    }));
  }, [userData.FullName, userData.email, userData.contact, userData.city]);

  /* ── Fetch Real Data from GetMe API & Orders on Mount (Saved to Redux) ── */
  useEffect(() => {
    let isMounted = true;
    const loadProfileData = async () => {
      try {
        setIsLoadingApi(true);
        if (handleGetME) {
          const u = await handleGetME();
          if (isMounted && u) dispatch(setUser(u));
        }
      } catch (err) {
        console.log('GetMe API note:', err?.message);
      } finally {
        if (isMounted) setIsLoadingApi(false);
      }
    };

    loadProfileData();
    handleGetOrder().catch((err) => {
      console.warn('handleGetOrder fetch in CustomerProfile:', err?.message || err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Map real orders directly from Redux store to visual cards
  const bookingsList = useMemo(() => {
    return Array.isArray(reduxOrders)
      ? reduxOrders.map(formatRealOrder).filter(Boolean)
      : [];
  }, [reduxOrders]);

  const filteredBookings = bookingsList.filter((b) => {
    if (bookingFilter === 'active') return b.isActive;
    if (bookingFilter === 'completed') return b.status === 'completed';
    return true;
  });

  const activeOrders = bookingsList.filter((b) => b.isActive);
  const activeCount = activeOrders.length;
  const completedCount = bookingsList.filter((b) => b.status === 'completed').length;
  const totalSpent = bookingsList.reduce((acc, curr) => acc + (curr.rawPriceNumber || 0), 0);

  // Active showcase order: either route OrderId or first active order or first order
  const activeOrder =
    (routeOrderId ? bookingsList.find((b) => b.rawId === routeOrderId) : null) ||
    activeOrders[0] ||
    bookingsList[0] ||
    null;

  const onLogoutClick = async () => {
    try {
      if (handleLogout) await handleLogout();
    } catch {
      // ignore
    }
    navigate('/customer');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    dispatch(
      setUser({
        ...reduxUser,
        FullName: profileForm.name,
        contact: profileForm.phone,
        email: profileForm.email,
        role: userData.role,
      })
    );
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3500);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.addressLine.trim()) return;
    const item = {
      id: Date.now(),
      type: newAddr.type || 'Home',
      isDefault: false,
      name: profileForm.name,
      phone: profileForm.phone,
      addressLine: newAddr.addressLine,
      cityState: newAddr.cityState,
      landmark: newAddr.landmark || 'Not specified',
    };
    setCustomAddresses((prev) => [...prev, item]);
    setNewAddr({ type: 'Home', addressLine: '', cityState: 'Burhanpur, Madhya Pradesh', landmark: '' });
    setShowAddAddressModal(false);
  };

  const handleDeleteAddress = (id) => {
    setCustomAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#070E1A] text-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-x-hidden">
      {/* Background Hero Image matching Home.jsx with smooth entrance animation */}
      <div
        className={`fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out pointer-events-none transform ${
          visible ? 'opacity-35 scale-100' : 'opacity-0 scale-105'
        }`}
        style={{ backgroundImage: `url('/images/hero-bg.png')` }}
      />

      {/* Deep Midnight Navy Gradient Overlays matching Home.jsx */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#070E1A]/95 via-[#0A1628]/92 to-[#070E1A]/98 pointer-events-none" />

      {/* Ambient Glowing Spheres matching Home.jsx */}
      <div className="fixed top-24 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-24 left-10 w-[450px] h-[450px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Persistent Navbar (untouched) */}
     

      {/* ── Main Container (Comfortable spacing below fixed Navbar) ── */}
      <div
        className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-16 pt-28 sm:pt-32 md:pt-36 transition-all duration-700 ease-out transform ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        
        {/* ── Top Identity & Telemetry Overview Bar ── */}
        <div className="mb-6 bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Cartoon avatar with glasses & purple rim */}
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E5D768] border-3 border-purple-500 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.35)] overflow-hidden">
                <svg className="w-12 h-12 sm:w-13 sm:h-13 text-slate-800" viewBox="0 0 36 36" fill="none">
                  <circle cx="12" cy="15" r="5" stroke="#1f2937" strokeWidth="2" fill="white" fillOpacity="0.4" />
                  <circle cx="24" cy="15" r="5" stroke="#1f2937" strokeWidth="2" fill="white" fillOpacity="0.4" />
                  <path d="M17 15h2" stroke="#1f2937" strokeWidth="2" />
                  <path d="M7 14l-2 1M29 14l2 1" stroke="#1f2937" strokeWidth="1.5" />
                  <circle cx="12" cy="15" r="1.5" fill="#111827" />
                  <circle cx="24" cy="15" r="1.5" fill="#111827" />
                  <path d="M14 24c1.5 1.5 6.5 1.5 8 0" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#070E1A] shadow-[0_0_8px_#34d399]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{userData.FullName}</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  {userData.role} 
                </span>
              </div>
              <p className="text-xs text-white/60 font-mono mt-0.5">
                {userData.email} • {userData.contact}
              </p>
              <p className="text-xs text-cyan-300 font-medium mt-0.5">
                Priority Home Infrastructure • Verified Resident
              </p>
            </div>
          </div>

          {/* Quick KPI stats row from Stitch System */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-white/8">
            <div className="bg-[#070E1A]/80 border border-white/8 rounded-2xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-white/40 font-semibold uppercase">Active Dispatch</p>
              <p className="text-base sm:text-lg font-black text-orange-400">{activeCount}</p>
            </div>
            <div className="bg-[#070E1A]/80 border border-white/8 rounded-2xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-white/40 font-semibold uppercase">Completed Repairs</p>
              <p className="text-base sm:text-lg font-black text-cyan-400">{completedCount}</p>
            </div>
            <div className="bg-[#070E1A]/80 border border-white/8 rounded-2xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-white/40 font-semibold uppercase">Warranties Active</p>
              <p className="text-base sm:text-lg font-black text-emerald-400">{completedCount} Protected</p>
            </div>
            <div className="bg-[#070E1A]/80 border border-white/8 rounded-2xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-white/40 font-semibold uppercase">Total Order Value</p>
              <p className="text-base sm:text-lg font-black text-yellow-400">₹{totalSpent.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* ================= LEFT: SIDEBAR ================= */}
          <aside className="w-full lg:w-[300px] bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-3xl p-5 shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <nav className="flex flex-col gap-1.5">
              <TabButton
                icon={<Calendar size={18} />}
                label="My Bookings & Services"
                badge={activeCount > 0 ? `${activeCount} Live` : null}
                isActive={activeTab === 'bookings'}
                onClick={() => setActiveTab('bookings')}
              />
              <TabButton
                icon={<MapPin size={18} />}
                label="Saved Addresses"
                badge={`${addresses.length}`}
                isActive={activeTab === 'addresses'}
                onClick={() => setActiveTab('addresses')}
              />
              <TabButton
                icon={<User size={18} />}
                label="Profile Settings"
                isActive={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
              />

              <div className="h-px bg-white/10 my-2" />

              {/* Verified Identity card in sidebar */}
              <div className="bg-[#070E1A]/80 border border-white/8 rounded-xl p-3.5 mb-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                  <ShieldCheck size={14} />
                  <span>Work 1st Security Guard</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed font-mono">
                  ID: {userData.FullName.toUpperCase()}-FRRF-09
                </p>
                <p className="text-[11px] text-emerald-400 mt-1">
                  ✓ Verified Resident Protocol
                </p>
              </div>

              {/* Emergency Callout Card in sidebar */}
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 rounded-xl p-3.5 mb-2">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-xs mb-1">
                  <PhoneCall size={14} />
                  <span>24/7 Leakage SOS</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Severe CPVC burst or backflow? Master technician dispatched in 14 mins.
                </p>
                <a
                  href="tel:18001237733"
                  className="mt-2 inline-block text-xs font-bold text-orange-400 hover:text-orange-300 underline"
                >
                  Call Helpline: 1800-123-7733
                </a>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogoutClick}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all font-semibold text-sm w-full cursor-pointer"
              >
                <LogOut size={18} />
                <span>Sign Out Account</span>
              </button>
            </nav>
          </aside>

          {/* ================= RIGHT: MAIN CONTENT ================= */}
          <main className="flex-1 w-full bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-3xl p-5 sm:p-7 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] min-h-[600px] flex flex-col">
            
            {/* ══════════════════════════════════════════════════
                TAB 1: MY BOOKINGS & ADDED SERVICES (PRIMARY FOCUS)
               ══════════════════════════════════════════════════ */}
            {activeTab === 'bookings' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                      <span>My Bookings & Added Services</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        {bookingsList.length} Total Records
                      </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-white/50 mt-1">
                      Track active dispatches, view digital warranty cards, or rebook trusted plumbers for {userData.FullName}.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center bg-[#070E1A]/90 p-1 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setBookingFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        bookingFilter === 'all'
                          ? 'bg-cyan-500 text-[#070E1A] shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      All ({bookingsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingFilter('active')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        bookingFilter === 'active'
                          ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Active ({activeCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingFilter('completed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        bookingFilter === 'completed'
                          ? 'bg-emerald-500 text-[#070E1A] shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Completed ({completedCount})
                    </button>
                  </div>
                </div>

                {/* ── HIGH VISUAL FOCUS: ACTIVE SERVICE SHOWCASE (Real Data via 4-Layer Architecture) ── */}
                {bookingFilter !== 'completed' && activeOrder && activeOrder.isActive && (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1e38] via-[#0A1628] to-[#070E1A] border-2 border-cyan-500/40 p-5 sm:p-6 shadow-[0_10px_35px_rgba(6,182,212,0.18)]">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-400 via-orange-400 to-cyan-500" />

                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pl-2">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
                        </span>
                        <span className="font-bold text-xs uppercase tracking-wider text-cyan-400">
                          {activeOrder.statusLabel}
                        </span>
                      </div>
                      <span className="text-xs text-white/50 font-mono bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                        Work Order {activeOrder.id}
                      </span>
                    </div>

                    <div className="pl-2 flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          {activeOrder.serviceImg && (
                            <img
                              src={activeOrder.serviceImg}
                              alt={activeOrder.service}
                              className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                          )}
                          <div>
                            <h2 className="text-lg sm:text-xl font-black text-white mb-0.5">
                              {activeOrder.service}
                            </h2>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                              {activeOrder.category}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-white/60 flex flex-wrap items-center gap-2 mb-1">
                          <Calendar size={14} className="text-cyan-400" />
                          <span>Slot: {activeOrder.date} • {activeOrder.timeSlot}</span>
                          <span>•</span>
                          <MapPin size={14} className="text-orange-400" />
                          <span className="truncate max-w-xs">{activeOrder.address}</span>
                        </p>
                        {activeOrder.issuedDescription && (
                          <p className="text-xs text-white/70 italic mt-1 line-clamp-2">
                            "{activeOrder.issuedDescription}"
                          </p>
                        )}
                        <p className="text-xs font-mono text-cyan-300/80 mt-1">
                          Telemetry: {activeOrder.telemetry}
                        </p>

                        {/* Assigned Plumber Card */}
                        <div className="mt-4 flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl p-3 max-w-md">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
                            {activeOrder.technician.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white truncate">{activeOrder.technician.name}</p>
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                                {activeOrder.technician.rating}
                              </span>
                            </div>
                            <p className="text-[11px] text-cyan-300 font-medium truncate">
                              {activeOrder.technician.badge} • {activeOrder.technician.eta}
                            </p>
                          </div>
                          <a
                            href={`tel:${activeOrder.technician.phone}`}
                            className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 transition-colors"
                            title="Call Technician"
                          >
                            <PhoneCall size={16} />
                          </a>
                        </div>
                      </div>

                      {/* Right: Pricing & CTA */}
                      <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-white/10 pt-4 md:pt-0 shrink-0">
                        <div className="text-left md:text-right">
                          <p className="text-xs text-white/50 uppercase font-semibold">Total Amount</p>
                          <p className="text-2xl sm:text-3xl font-black text-white">₹{activeOrder.price}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/customer/customer_tracking/${activeOrder.rawId}`)
                            }
                            className="bg-cyan-500 hover:bg-cyan-400 text-[#070E1A] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all cursor-pointer hover:scale-105"
                          >
                            Track Live 🚐
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress steps mini bar */}
                    <div className="mt-5 pl-2 pt-4 border-t border-white/8">
                      <div className="flex items-center justify-between text-[11px] text-white/70 font-semibold mb-2">
                        <span className="text-cyan-400 font-bold">✓ Booking Confirmed</span>
                        <span className={activeOrder.status === 'pending' ? 'text-amber-400 font-bold animate-pulse' : 'text-cyan-400 font-bold'}>
                          {activeOrder.status === 'pending' ? '● Matching Plumber' : '✓ Plumber Assigned'}
                        </span>
                        <span className={activeOrder.status === 'on-the-way' ? 'text-orange-400 font-bold animate-pulse' : (['working', 'completed'].includes(activeOrder.status) ? 'text-cyan-400 font-bold' : 'text-white/30')}>
                          {activeOrder.status === 'on-the-way' ? '● En Route 🚐' : (['working', 'completed'].includes(activeOrder.status) ? '✓ Arrived' : '○ En Route')}
                        </span>
                        <span className={activeOrder.status === 'working' ? 'text-blue-400 font-bold animate-pulse' : (activeOrder.status === 'completed' ? 'text-cyan-400 font-bold' : 'text-white/30')}>
                          {activeOrder.status === 'working' ? '● Repairing ⚙️' : (activeOrder.status === 'completed' ? '✓ Repaired' : '○ Repair')}
                        </span>
                        <span className={activeOrder.status === 'completed' ? 'text-emerald-400 font-bold' : 'text-white/30'}>
                          {activeOrder.status === 'completed' ? '✓ Verified & Warranty' : '○ Warranty'}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 via-orange-400 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: activeOrder.progressPercent }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── BOOKING CARDS LIST ── */}
                <div className="space-y-4">
                  <h3 className="text-sm sm:text-base font-bold text-white/80 flex items-center justify-between">
                    <span>Service History & Records ({filteredBookings.length})</span>
                    <span className="text-xs font-normal text-white/40">FRRF Digital Guarantee Protected</span>
                  </h3>

                  {reduxLoading ? (
                    <div className="bg-[#070E1A]/85 border border-white/8 rounded-2xl p-8 text-center animate-pulse">
                      <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-cyan-300 font-bold">Loading your real bookings...</p>
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="bg-[#070E1A]/85 border border-white/8 rounded-2xl p-10 text-center">
                      <p className="text-4xl mb-3">💧</p>
                      <h4 className="font-bold text-white text-base">No bookings found</h4>
                      <p className="text-xs text-white/50 max-w-sm mx-auto mt-1 mb-4">
                        {bookingsList.length === 0
                          ? "You haven't placed any bookings yet. Book a certified plumber for 24/7 upfront service!"
                          : "No orders match the selected filter. Switch tabs to see all orders."}
                      </p>
                      <Link
                        to="/customer/booking"
                        className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#070E1A] font-bold text-xs px-5 py-2.5 rounded-full transition-all"
                      >
                        Book a Plumber Now ⚡
                      </Link>
                    </div>
                  ) : (
                    filteredBookings.map((b) => (
                      <div
                        key={b.rawId || b.id}
                        className={`bg-[#070E1A]/85 border rounded-2xl p-4 sm:p-5 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${
                          b.isActive
                            ? 'border-cyan-500/30 hover:border-cyan-500/60'
                            : 'border-white/8 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          {/* Service Details */}
                          <div className="flex items-start gap-3.5">
                            {b.serviceImg ? (
                              <img
                                src={b.serviceImg}
                                alt={b.service}
                                className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
                                {b.icon}
                              </div>
                            )}

                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="font-bold text-base sm:text-lg text-white">
                                  {b.service}
                                </h4>
                                <span className="text-[10px] text-white/40 font-mono bg-white/5 px-2 py-0.5 rounded">
                                  {b.id}
                                </span>
                              </div>

                              <p className="text-xs text-white/50 flex flex-wrap items-center gap-2">
                                <span className="text-white/70 font-medium">Date: {b.date}</span>
                                <span>•</span>
                                <span>Slot: {b.timeSlot}</span>
                                <span>•</span>
                                <span className="text-cyan-400/90 font-medium">{b.category}</span>
                              </p>

                              {b.address && (
                                <p className="text-[11px] text-white/40 mt-1 flex items-center gap-1 truncate max-w-md">
                                  <MapPin size={11} className="text-orange-400 shrink-0" />
                                  <span className="truncate">{b.address}</span>
                                </p>
                              )}

                              {b.issuedDescription && (
                                <p className="text-xs text-white/60 italic mt-1 line-clamp-1">
                                  Issue: {b.issuedDescription}
                                </p>
                              )}

                              {/* Badges: Status + Warranty */}
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${b.badgeBg}`}>
                                  <span className={`w-2 h-2 rounded-full ${b.dotColor} ${b.isActive ? 'animate-pulse' : ''}`} />
                                  {b.statusLabel}
                                </span>

                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 text-white/70 border border-white/10">
                                  <ShieldCheck size={12} className="text-cyan-400" />
                                  <span>{b.warranty}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Price & Action Area */}
                          <div className="w-full md:w-auto flex md:flex-col justify-between items-center md:items-end border-t md:border-t-0 border-white/8 pt-3 md:pt-0 shrink-0">
                            <div>
                              <p className="font-black text-xl sm:text-2xl text-white text-right">
                                ₹{b.price}
                              </p>
                              <p className="text-[10px] text-white/40 text-right">Total Price</p>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() =>
                                  alert(
                                    `Downloading verified tax invoice PDF for ${b.id} issued to ${userData.FullName || 'Customer'} with FRRF 90-Day Guarantee.`
                                  )
                                }
                                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/10 transition-colors cursor-pointer"
                              >
                                <FileText size={13} />
                                <span>Invoice PDF</span>
                              </button>

                              {b.isActive ? (
                                <button
                                  type="button"
                                  onClick={() => navigate(`/customer/customer_tracking/${b.rawId}`)}
                                  className="inline-flex items-center gap-1 text-xs text-[#070E1A] bg-cyan-400 hover:bg-cyan-300 font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
                                >
                                  <span>Track Live 🚐</span>
                                </button>
                              ) : (
                                <Link
                                  to="/customer/booking"
                                  className="inline-flex items-center gap-1 text-xs text-[#070E1A] bg-white hover:bg-cyan-400 font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                >
                                  <span>Book Again ⚡</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* ── SUGGESTED SERVICES FOR CUSTOMER RETENTION (Stitch Design) ── */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Sparkles size={16} className="text-cyan-400" />
                        <span>Recommended Preventive Plumbing for {userData.FullName}</span>
                      </h3>
                      <p className="text-xs text-white/50">
                        Keep your pipelines leak-free with regular maintenance routines.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {SUGGESTED_SERVICES.map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-[#070E1A]/85 border border-white/8 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {s.tag}
                            </span>
                            <span className="text-sm font-bold text-white">{s.price}</span>
                          </div>
                          <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors mb-1">
                            {s.title}
                          </h4>
                          <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                            {s.desc}
                          </p>
                        </div>
                        <Link
                          to="/customer/booking"
                          className="w-full text-center text-xs font-bold py-2 rounded-lg bg-white/5 group-hover:bg-cyan-500 text-white group-hover:text-[#070E1A] transition-all"
                        >
                          {s.actionText} →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB 2: SAVED ADDRESSES
               ══════════════════════════════════════════════════ */}
            {activeTab === 'addresses' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Saved Service Addresses
                    </h2>
                    <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                      Plumbers are dispatched directly to these pre-saved locations for {userData.FullName}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddAddressModal(true)}
                    className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-[#070E1A] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                  >
                    <span>+ Add New Address</span>
                  </button>
                </div>

                {/* Add Address Mini Form */}
                {showAddAddressModal && (
                  <form
                    onSubmit={handleAddAddress}
                    className="bg-[#070E1A]/95 border border-cyan-500/40 rounded-2xl p-5 space-y-4 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-cyan-400">Add New Service Location</h4>
                      <button
                        type="button"
                        onClick={() => setShowAddAddressModal(false)}
                        className="text-white/40 hover:text-white text-xs"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">Address Label</label>
                        <select
                          value={newAddr.type}
                          onChange={(e) => setNewAddr({ ...newAddr, type: e.target.value })}
                          className="w-full bg-[#0A1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="Home">Home (Flat / Villa)</option>
                          <option value="Office">Office / Commercial Space</option>
                          <option value="Parent's House">Parent's House</option>
                          <option value="Rental Property">Rental Property</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">City & Pincode</label>
                        <input
                          type="text"
                          value={newAddr.cityState}
                          onChange={(e) => setNewAddr({ ...newAddr, cityState: e.target.value })}
                          className="w-full bg-[#0A1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">
                        Street Address / Flat / Floor
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Flat 301, Silver Crest, AB Road"
                        value={newAddr.addressLine}
                        onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                        className="w-full bg-[#0A1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">Nearby Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g. Near Geeta Bhawan Square"
                        value={newAddr.landmark}
                        onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                        className="w-full bg-[#0A1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAddressModal(false)}
                        className="px-4 py-2 rounded-lg bg-white/5 text-xs text-white/70 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#070E1A] font-bold text-xs"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="bg-[#070E1A]/85 p-5 rounded-2xl border border-white/8 relative group hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            <MapPin size={12} />
                            {a.type}
                          </span>
                          {a.isDefault && (
                            <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                              Primary Location
                            </span>
                          )}
                        </div>

                        <p className="font-bold text-base text-white mb-1">
                          {a.name}
                        </p>
                        <p className="text-xs text-white/65 leading-relaxed pr-6 mb-2">
                          {a.addressLine}
                          <br />
                          {a.cityState}
                        </p>
                        <p className="text-[11px] text-white/45">
                          <span className="text-white/60 font-semibold">Landmark:</span> {a.landmark}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/8 pt-3.5 mt-4">
                        <Link
                          to="/customer/booking"
                          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline"
                        >
                          Book at this Location →
                        </Link>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              alert(`Editing address for ${a.type}`)
                            }
                            className="flex items-center gap-1 text-white/60 hover:text-cyan-400 text-xs transition-colors cursor-pointer"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          {!a.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(a.id)}
                              className="flex items-center gap-1 text-rose-400 hover:text-rose-300 text-xs transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB 3: PROFILE SETTINGS
               ══════════════════════════════════════════════════ */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-bold text-white">
                    Profile & Infrastructure Settings
                  </h2>
                  <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                    Original verified customer record for {userData.FullName} ({userData.role}).
                  </p>
                </div>

                {settingsSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <span>✓</span>
                    <span>Profile settings updated successfully! Synchronized with FRRF Plumbing cloud.</span>
                  </div>
                )}

                <form className="max-w-xl flex flex-col gap-5" onSubmit={handleSaveSettings}>
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-[#070E1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="w-full bg-[#070E1A]/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white/40 cursor-not-allowed font-mono"
                    />
                    <p className="text-[11px] text-white/40 mt-1.5 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-cyan-400" />
                      <span>Email is protected under Work 1st Security Guard & cannot be altered.</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                        Primary Contact Phone
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full bg-[#070E1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                        Emergency Plumbing Contact
                      </label>
                      <input
                        type="text"
                        value={profileForm.emergencyPhone}
                        onChange={(e) => setProfileForm({ ...profileForm, emergencyPhone: e.target.value })}
                        className="w-full bg-[#070E1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      Preferred Plumbing Time Window
                    </label>
                    <select
                      value={profileForm.preferredTime}
                      onChange={(e) => setProfileForm({ ...profileForm, preferredTime: e.target.value })}
                      className="w-full bg-[#070E1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                    >
                      <option>Morning (09:00 AM – 12:00 PM)</option>
                      <option>Afternoon (12:00 PM – 04:00 PM)</option>
                      <option>Evening (04:00 PM – 08:00 PM)</option>
                      <option>24/7 Any Emergency Slot</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-400 text-[#070E1A] font-bold text-sm px-7 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable Tab Button Component ── */
function TabButton({ icon, label, badge, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-xl text-left font-semibold text-sm transition-all duration-200 w-full cursor-pointer group ${
        isActive
          ? 'bg-cyan-500 text-[#070E1A] shadow-[0_0_15px_rgba(6,182,212,0.35)] font-bold'
          : 'text-white/70 hover:bg-white/6 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={isActive ? 'text-[#070E1A]' : 'text-cyan-400 group-hover:text-white transition-colors'}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge && (
        <span
          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
            isActive
              ? 'bg-[#0A1628] text-cyan-300'
              : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
