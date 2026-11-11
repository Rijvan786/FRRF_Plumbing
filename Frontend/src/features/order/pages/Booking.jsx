import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useOrder } from '../hook/useOrder';
import { setSelectedService } from '../state/order.slice.jsx';
import Navbar from "../../../App/Navbar.jsx";

/* ─────────────────────────────────────────────────────────
   AUTH POPUP — shown after booking for unauthenticated users
   ───────────────────────────────────────────────────────── */
function AuthPopup({ onClose, navigate }) {
  const reduxOrders = useSelector((state) => state.order?.orders || state.order?.item || []);
  const reduxItem = useSelector((state) => state.order?.item || null);
  const orderId =
    reduxItem?._id ||
    (Array.isArray(reduxItem) ? reduxItem[0]?._id : null) ||
    (Array.isArray(reduxOrders) ? reduxOrders[0]?._id : reduxOrders?._id) ||
    '';
   
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(7,14,26,0.88)', backdropFilter: 'blur(12px)' }}
    >
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-[28px] p-[1.5px] animate-[fadeInUp_0.35s_ease]"
        style={{
          background: 'linear-gradient(135deg, #00F2FE 0%, #FF6B00 55%, #FF8A00 100%)',
          boxShadow: '0 20px 60px rgba(3,7,14,0.85), 0 0 40px rgba(255,107,0,0.18)',
        }}
      >
        <div
          className="relative rounded-[27px] p-6"
          style={{ background: 'rgba(12,21,39,0.97)' }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all text-lg font-bold"
          >
            ✕
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(255,107,0,0.3) 0%, rgba(255,107,0,0.05) 70%)',
                boxShadow: '0 0 32px rgba(255,107,0,0.4)',
                animation: 'pulse 2s infinite',
              }}
            >
              🔧
            </div>
          </div>

          {/* Title */}
          <h2
            className="text-center text-white font-black text-xl mb-1 tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Booking Confirmed! 🎉
          </h2>
          <p
            className="text-center font-bold text-sm mb-4"
            style={{ color: '#FF6B00', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Track your plumber in real-time!
          </p>

          {/* Live status pill */}
          <div
            className="flex items-center justify-center gap-2 mx-auto mb-5 px-4 py-2 rounded-full w-fit"
            style={{ background: 'rgba(0,242,254,0.08)', border: '1px solid rgba(0,242,254,0.25)' }}
          >
            <span
              className="w-2 h-2 rounded-full bg-emerald-400"
              style={{ animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite', boxShadow: '0 0 6px #34d399' }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: '#00F2FE', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Technician en route • ETA 18 mins
            </span>
          </div>

          {/* Body text */}
          <p
            className="text-center text-sm leading-relaxed mb-6 px-1"
            style={{ color: 'rgba(240,246,252,0.65)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            You are now tracking your plumber.{' '}
            <span style={{ color: 'rgba(240,246,252,0.9)' }}>
              Register to get live status updates, booking history, and exclusive deals on our website.
            </span>{' '}
            Join thousands of happy customers!
          </p>

          {/* CTA buttons */}
          <div className="space-y-3">
            <button
              onClick={() => { onClose(); navigate(`/customer/register?OrderId=${orderId}`); }}
              className="w-full py-4 rounded-full font-bold text-white text-sm transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(90deg, #FF6B00, #FF8A00)',
                boxShadow: '0 4px 24px rgba(255,107,0,0.45)',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(255,107,0,0.65)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(255,107,0,0.45)'}
            >
              Register Now — It's Free
            </button>

            <button
              onClick={() => { onClose(); navigate(`/customer/login?OrderId=${orderId}`); }}
              className="w-full py-3.5 rounded-full font-semibold text-sm transition-all"
              style={{
                background: 'rgba(0,242,254,0.06)',
                border: '1px solid rgba(0,242,254,0.5)',
                color: '#00F2FE',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,242,254,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,242,254,0.06)'}
            >
              Already have an account? Login
            </button>
          </div>

          {/* Footer trust text */}
          <p
            className="text-center text-xs mt-5"
            style={{ color: '#41536B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            ⭐ Join 50,000+ customers enjoying hassle-free plumbing
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}

/* ── Google Fonts (matching Home.jsx) ─────────────────────────── */
const useGoogleFonts = () => {
  useEffect(() => {
    if (document.getElementById('pp-gf')) return;
    const l = document.createElement('link');
    l.id = 'pp-gf';
    l.rel = 'stylesheet';
    l.href =
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap';
    document.head.appendChild(l);
  }, []);
};

/* ── Helper: Icon by Category ── */
const getCategoryIcon = (category = '') => {
  const c = String(category).toLowerCase();
  if (c.includes('leak')) return '💧';
  if (c.includes('block')) return '🔧';
  if (c.includes('install')) return '⚙️';
  if (c.includes('inspect')) return '🔍';
  if (c.includes('full') || c.includes('setup') || c.includes('renov')) return '🚽';
  if (c.includes('maint')) return '🛡️';
  if (c.includes('sos') || c.includes('emerg')) return '🚨';
  return '🛠️';
};

const ADDRESS_LABELS = ["Home", "office", "Shop", "apartment", 'Other'];

export default function Booking() {
  useGoogleFonts();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check if user is logged in from Redux auth state
  const user = useSelector((state) => state.auth?.User);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  // Order hook
  const { handleCreateOrder, handleGetallService, handleSetSelectedService } = useOrder();

  // 4-Layer Architecture: Direct Redux Selectors from state.order (Layer 3: State Management)
  const reduxServices = useSelector((state) => state.order?.services || []);
  const reduxOrders = useSelector((state) => state.order?.orders || state.order?.item || []);
  const reduxSelectedService = useSelector((state) => state.order?.selectedService || null);
  const reduxLoading = useSelector((state) => state.order?.loading || false);
  const reduxError = useSelector((state) => state.order?.error || null);

  // Initial matching keys passed from navigation (if any)
  const navServiceKey = (
    location.state?._id ||
    location.state?.serviceId ||
    location.state?.service ||
    location.state?.category ||
    ''
  ).toLowerCase();

  // Currently selected service _id
  const [selectedServiceId, setSelectedServiceId] = useState('');

  // Fetch real services from backend on mount and store in Redux
  useEffect(() => {
    handleGetallService();
  }, []);

  // Determine active service from real services in Redux
  const activeService =
    reduxSelectedService ||
    reduxServices.find((s) => s._id === selectedServiceId) ||
    reduxServices.find((s) => {
      if (!navServiceKey) return false;
      return (
        s._id?.toLowerCase() === navServiceKey ||
        (s.category && s.category.toLowerCase().includes(navServiceKey)) ||
        (s.serviceName && s.serviceName.toLowerCase().includes(navServiceKey))
      );
    }) ||
    reduxServices[0] ||
    null;

  // Auto-sync selectedService in local state and Redux slice
  useEffect(() => {
    if (activeService && activeService._id !== selectedServiceId) {
      setSelectedServiceId(activeService._id);
      handleSetSelectedService(activeService);
    }
  }, [activeService, selectedServiceId]);

  const [issueDescription, setIssueDescription] = useState('');
  const [issueImage, setIssueImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');

  // Address fields (6 subfields)
  const [address, setAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    pin_code: '',
    latitude: '',
    longitude: '',
  });

  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // 1 minute cooldown
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Direct derivation of created/latest order from Redux store without intermediate useState
  const createdOrder = Array.isArray(reduxOrders) ? reduxOrders[0] : (reduxOrders?._id ? reduxOrders : null);
  const [visible, setVisible] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── 1-minute countdown ticker ── */
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle image upload and preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIssueImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setIssueImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Auto-detect GPS Coordinates
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAddress((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      (err) => {
        alert('Could not retrieve location: ' + err.message);
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setErrorMessage('');

    if (!activeService?._id) {
      setErrorMessage('Please wait for real services to load from the database or select a service.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Real MongoDB _id from the selected service in Redux state
      const sId = activeService._id;
      formData.append('serviceId', sId);
      formData.append('issueDescription', issueDescription.trim());
      formData.append('label', address.label || 'Home');
      formData.append('street', address.street.trim());
      formData.append('city', address.city.trim());
      formData.append('pin_code', address.pin_code.trim());

      const lat = address.latitude ? String(address.latitude) : '19.0760';
      const lng = address.longitude ? String(address.longitude) : '72.8777';
      formData.append('latitude', lat);
      formData.append('longitude', lng);
      formData.append('scheduleDate', scheduledDate);

      // Append amount & currency from real active service
       
       console.log(activeService);
       const serviceAmount =
        typeof activeService.price === 'object' && activeService.price !== null
          ? activeService.price.amount
          : activeService.price.amount || 200;
      const serviceCurrency =
        typeof activeService.price === 'object' && activeService.price !== null
          ? activeService.price.currency || 'INR'
          : 'INR';
      formData.append('currency', serviceCurrency);
               
      if (issueImage) {      
        formData.append('Images', issueImage);
      }

      console.log('Dispatching order with real MongoDB serviceId from Redux:', sId, 'Title:', activeService.serviceName);
      const res = await handleCreateOrder(formData);

      setSuccess(true);
      setCooldown(60); // 1-minute active cooldown

      // Show auth popup if user is NOT logged in
    
        setTimeout(() => setShowAuthPopup(true), 800);
     
    } catch (err) {
      console.error('Booking submission error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit booking. Please try again.';
      if (Array.isArray(msg)) {
        setErrorMessage(msg.map((m) => m.msg || m.message || JSON.stringify(m)).join(', '));
      } else {
        setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    } finally {
      setLoading(false);
    }
  };

  const btnDisabled = loading || cooldown > 0 || !activeService;

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] bg-[#070E1A] flex flex-col items-center justify-center relative overflow-x-hidden px-3.5 sm:px-6 py-12 pt-24"
      style={{
        backgroundImage: "url('/images/hero-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Auth Popup — only for guest users after booking */}
      {showAuthPopup && (
        <AuthPopup
          onClose={() => setShowAuthPopup(false)}
          navigate={navigate}
        />
      )}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#070E1A]/92 backdrop-blur-sm" />

      {/* Top Navbar with Logo */}
      <Navbar />

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/6 rounded-full blur-3xl pointer-events-none" />

      {/* Booking Form Card */}
      <div
        className={`relative z-10 w-full max-w-2xl transition-all duration-700 my-auto ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-white/4 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-9 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Header */}
          <div className="mb-6 text-left">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/25 rounded-full px-3.5 py-1.5 mb-3">
              <span className="text-cyan-400 text-[11px] font-bold tracking-widest uppercase">
                ⚡ Rapid Technician Dispatch
              </span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight mb-2">
              Book a Plumbing Service
            </h1>
            <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
              Describe your plumbing issue and our verified CPVC specialist will arrive at your scheduled time.
            </p>
          </div>

          {/* Error Notification */}
          {errorMessage && (
            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 sm:p-5 mb-6 text-left">
              <span className="text-rose-400 text-xl shrink-0 mt-0.5">⚠️</span>
              <div>
                <div className="text-rose-400 font-bold text-sm">
                  Booking Submission Error
                </div>
                <div className="text-rose-300/80 text-xs mt-1 leading-relaxed">
                  {errorMessage}
                </div>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {success && (
            <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 sm:p-5 mb-6 text-left">
              <span className="text-emerald-400 text-2xl shrink-0 mt-0.5">✓</span>
              <div>
                <div className="text-emerald-400 font-bold text-base">
                  Booking Request Confirmed! {createdOrder?._id && `(#${createdOrder._id.slice(-6).toUpperCase()})`}
                </div>
                <div className="text-emerald-400/80 text-xs sm:text-sm mt-1 leading-relaxed">
                  Your appointment has been logged. Our dispatch team is assigning a certified master plumber near you. You will receive an SMS and WhatsApp update shortly.
                </div>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setIssueDescription('');
                      removeImage();
                    }}
                    className="text-xs bg-emerald-500 text-slate-900 font-bold px-3 py-1.5 rounded-lg border-0 cursor-pointer hover:bg-emerald-400"
                  >
                    Book Another Service
                  </button>
                  <Link
                    to="/customer"
                    className="text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg border border-white/20 no-underline"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 text-left">
            {/* 1. Real Services from Redux State */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em]">
                  Select Service
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ● {reduxServices.length} Live in Redux
                  </span>
                  {activeService?._id && (
                    <span className="text-[10px] sm:text-[11px] text-cyan-400 font-mono hidden sm:inline">
                      ID: {activeService._id.slice(0, 6)}...{activeService._id.slice(-4)}
                    </span>
                  )}
                </div>
              </div>

              {/* Loading State when Redux is fetching */}
              {reduxServices.length === 0 && reduxLoading && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center animate-pulse">
                  <div className="text-xs text-cyan-300 font-semibold flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    Fetching real services from database...
                  </div>
                </div>
              )}

              {/* Real Services Grid from Redux */}
              {reduxServices.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  {reduxServices.map((srv) => {
                    const isSelected = activeService?._id === srv._id;
                    const icon = getCategoryIcon(srv.category);
                    const amount =
                      typeof srv.price === 'object' && srv.price !== null
                        ? srv.price.amount
                        : srv.price;
                    const currency =
                      typeof srv.price === 'object' && srv.price !== null
                        ? srv.price.currency || 'INR'
                        : 'INR';
                    const symbol = currency === 'USD' ? '$' : '₹';

                    return (
                      <button
                        key={srv._id}
                        type="button"
                        onClick={() => {
                          setSelectedServiceId(srv._id);
                          handleSetSelectedService(srv);
                        }}
                        className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500/15 border-orange-500 text-orange-400 shadow-[0_0_14px_rgba(255,107,53,0.28)]'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/8 hover:text-white'
                        }`}
                      >
                        <span className="text-lg sm:text-xl shrink-0">{icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-bold text-white text-[11px] sm:text-xs">
                            {srv.serviceName || srv.category}
                          </div>
                          <div className="text-[10px] text-white/45 truncate mt-0.5">
                            {srv.category} • {symbol}{amount}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Real Service Details Preview Card from Redux */}
              {activeService && (
                <div className="mt-3 bg-gradient-to-r from-[#0C1B35]/90 via-[#0B1528]/90 to-[#0A1628]/90 border border-cyan-500/25 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        activeService.serviceImg?.[0]?.url ||
                        activeService.serviceImg?.[0] ||
                        '/images/leakage.png'
                      }
                      alt={activeService.serviceName}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0 bg-[#0B1528]"
                      onError={(e) => {
                        e.target.src = '/images/leakage.png';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs sm:text-sm text-white truncate">
                          {activeService.serviceName}
                        </h4>
                        <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/30">
                          {activeService.category}
                        </span>
                      </div>
                      <p className="text-white/45 text-[10px] sm:text-[11px] truncate mt-0.5">
                        ⚡ Est. {activeService.EstimatedTimeMinutes || 45} mins {activeService.visitCharge ? `• Visit Fee: ₹${activeService.visitCharge}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[9px] sm:text-[10px] text-white/40 uppercase font-bold tracking-wider">
                      Fixed Price
                    </div>
                    <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-sm sm:text-base text-orange-400 leading-tight">
                      {activeService.price?.currency === 'USD' ? '$' : '₹'}
                      {typeof activeService.price === 'object' && activeService.price !== null
                        ? activeService.price.amount
                        : activeService.price}
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400/80">
                      ID: {activeService._id.slice(-6).toUpperCase()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Issue Description */}
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-2">
                Issue Description <span className="text-orange-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe your issue (e.g. bathroom CPVC tap leaking, kitchen sink drainage blocked, overhead water tank valve repair...)"
                className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(0,180,216,0.12)] transition-all duration-200 resize-none"
              />
            </div>

            {/* 3. Issue Image Upload */}
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-2">
                Upload Photo of the Issue <span className="text-white/40 normal-case">(Optional - Helps Plumber)</span>
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  id="issueImageUpload"
                />
                <label
                  htmlFor="issueImageUpload"
                  className="w-full sm:flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/15 rounded-2xl bg-white/3 hover:bg-white/5 hover:border-cyan-500/40 cursor-pointer transition-all duration-200"
                >
                  <span className="text-2xl mb-1">📷</span>
                  <span className="text-xs font-bold text-white/70">
                    {issueImage ? 'Change Image' : 'Click to Upload or Drag & Drop'}
                  </span>
                  <span className="text-[10px] text-white/35 mt-0.5">PNG, JPG or WEBP up to 10MB</span>
                </label>

                {imagePreview && (
                  <div className="relative w-28 h-24 rounded-xl overflow-hidden border border-white/15 shrink-0 bg-black/40">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs border-0 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Scheduled Date & Time */}
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-2">
                Preferred Schedule Date & Time <span className="text-orange-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(0,180,216,0.12)] transition-all duration-200 [color-scheme:dark]"
              />
            </div>

            {/* 5. Address Details (6 fields: label, street, city, pin_code, latitude, longitude) */}
            <div className="pt-2 border-t border-white/8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-white/60 uppercase tracking-[0.08em]">
                  Service Location & Address <span className="text-orange-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <span>📍</span>
                  <span>{locating ? 'Locating GPS…' : 'Auto-detect GPS'}</span>
                </button>
              </div>

              {/* Label selector */}
              <div className="flex gap-2 mb-3">
                {ADDRESS_LABELS.map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setAddress((p) => ({ ...p, label: lbl }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      address.label === lbl
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              {/* Street & Landmark */}
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="House/Flat No., Building Name, Street / Landmark *"
                    value={address.street}
                    onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                  />
                </div>

                {/* City & PIN Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City / Region *"
                    value={address.city}
                    onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                  />
                  <input
                    type="text"
                    required
                    placeholder="PIN Code (e.g. 452001) *"
                    value={address.pin_code}
                    onChange={(e) => setAddress((p) => ({ ...p, pin_code: e.target.value }))}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                  />
                </div>

                {/* Coordinates (Auto-populated or manual) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Latitude (e.g. 19.0760)"
                      value={address.latitude}
                      onChange={(e) => setAddress((p) => ({ ...p, latitude: e.target.value }))}
                      className="w-full bg-white/5 border border-white/12 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm placeholder-white/25 font-mono focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Longitude (e.g. 72.8777)"
                      value={address.longitude}
                      onChange={(e) => setAddress((p) => ({ ...p, longitude: e.target.value }))}
                      className="w-full bg-white/5 border border-white/12 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm placeholder-white/25 font-mono focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button with 1-Minute Anti-spam Cooldown */}
            <button
              type="submit"
              disabled={btnDisabled}
              className={`w-full relative flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] border-0 transition-all duration-300 mt-4 ${
                btnDisabled
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_24px_rgba(255,107,53,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(255,107,53,0.5)] cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    />
                  </svg>
                  Submitting Booking…
                </>
              ) : cooldown > 0 ? (
                `Wait ${cooldown}s before submitting again`
              ) : (
                'Confirm & Dispatch Plumber ⚡'
              )}
            </button>

            {/* Smooth animated load bar */}
            {loading && (
              <div className="w-full h-0.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-cyan-400 rounded-full"
                  style={{ animation: 'loadbar 2s ease-in-out forwards' }}
                />
              </div>
            )}
          </form>

          {/* Guarantee Badges */}
          <div className="mt-7 pt-5 border-t border-white/6 grid grid-cols-3 gap-2 text-center">
            {[
              ['⚡ 18 Min', 'Fast Response'],
              ['🛡️ ₹50,000', 'Damage Insured'],
              ['✓ 30 Days', 'Service Warranty'],
            ].map(([val, lbl]) => (
              <div key={lbl}>
                <div className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs sm:text-sm text-cyan-400">
                  {val}
                </div>
                <div className="text-white/40 text-[10px] mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes loadbar { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
