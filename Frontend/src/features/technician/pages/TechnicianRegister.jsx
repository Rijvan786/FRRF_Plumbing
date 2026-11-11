import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../../../App/Navbar.jsx"
import { useTechnician } from '../hook/useTechnician.jsx';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInput = PhoneInputPkg.default ?? PhoneInputPkg;

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

/* ── Eye Toggle Icon ─────────────────────────────────────────── */
const EyeIcon = ({ open }) =>
  open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

/* ═══════════════════════════════════════════════════════
   SHARED POPUP STYLES (injected once)
═══════════════════════════════════════════════════════ */
const POPUP_STYLES = `
  @keyframes slideUp {
    from { opacity:0; transform:translateY(80px) scale(0.93); }
    to   { opacity:1; transform:translateY(0)    scale(1);    }
  }
  @keyframes centerPop {
    from { opacity:0; transform:scale(0.88) translateY(16px); }
    to   { opacity:1; transform:scale(1)    translateY(0);    }
  }
  @keyframes popIn {
    from { opacity:0; transform:scale(0.4); }
    to   { opacity:1; transform:scale(1);   }
  }
  @keyframes drawCheck {
    to { stroke-dashoffset:0; }
  }
  @keyframes shakeIn {
    0%   { opacity:0; transform:translateY(80px) scale(0.93); }
    70%  { transform:translateY(-6px) scale(1.015); }
    100% { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes auraGlow {
    0%,100% { opacity:0.5; transform:scale(1); }
    50%     { opacity:1;   transform:scale(1.08); }
  }
  /* Mobile: slide up from bottom  |  sm+: pop from center */
  .popup-card-success { animation: slideUp 0.42s cubic-bezier(0.16,1,0.3,1) both; }
  .popup-card-error   { animation: shakeIn 0.42s cubic-bezier(0.16,1,0.3,1) both; }
  @media (min-width:640px) {
    .popup-card-success { animation: centerPop 0.38s cubic-bezier(0.16,1,0.3,1) both; }
    .popup-card-error   { animation: centerPop 0.38s cubic-bezier(0.16,1,0.3,1) both; }
  }
`;

/* ── Shared close button ── */
const CloseBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all text-base sm:text-lg leading-none"
    aria-label="Close"
  >✕</button>
);

/* ═══════════════════════════════════════════════════════
   SUCCESS POPUP — fully responsive
   Mobile  : bottom-sheet slide-up, full-width card
   Tablet+ : centered modal, max-w-md
   Desktop : centered modal, max-w-lg, larger padding
═══════════════════════════════════════════════════════ */
function SuccessPopup({ name, onClose, navigate }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 px-3 pb-3 sm:px-6 sm:pb-0 md:px-8"
      style={{ background: 'rgba(7,14,26,0.87)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <style>{POPUP_STYLES}</style>

      {/* Ambient glows — hidden on tiny screens for perf */}
      <div className="hidden sm:block absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-500/8  rounded-full blur-3xl pointer-events-none" />

      {/* Gradient border wrapper */}
      <div
        className="popup-card-success relative w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-2xl sm:rounded-3xl p-[1.5px]"
        style={{
          background: 'linear-gradient(135deg,#34d399 0%,#10b981 45%,#f97316 100%)',
          boxShadow: '0 28px 72px rgba(3,7,14,0.92), 0 0 56px rgba(16,185,129,0.22)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Inner card */}
        <div
          className="relative rounded-2xl sm:rounded-3xl
                     p-5 sm:p-7 lg:p-8"
          style={{ background: 'rgba(10,18,34,0.99)' }}
        >
          <CloseBtn onClick={onClose} />

          {/* Hero aura + checkmark */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle,rgba(16,185,129,0.28) 0%,rgba(16,185,129,0.04) 70%)',
                boxShadow: '0 0 44px rgba(16,185,129,0.45), 0 0 90px rgba(16,185,129,0.12)',
                animation: 'popIn 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both, auraGlow 2.4s ease-in-out 0.8s infinite',
              }}
            >
              <svg
                className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12"
                viewBox="0 0 48 48" fill="none"
              >
                <circle cx="24" cy="24" r="22" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.4"/>
                <path
                  d="M13 25l8 8 14-16"
                  stroke="#10b981" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray:36, strokeDashoffset:36, animation:'drawCheck 0.55s ease 0.5s both' }}
                />
              </svg>
            </div>
          </div>

          {/* Copy */}
          <h2 className="text-center font-black text-xl sm:text-2xl lg:text-3xl text-white mb-1 tracking-tight"
              style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>
            Welcome aboard! 🎉
          </h2>
          <p className="text-center text-xs sm:text-sm font-bold mb-4 sm:mb-5 uppercase tracking-widest"
             style={{ color:'#10b981', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
            Registration Successful
          </p>

          {/* Body message */}
          <div className="rounded-xl sm:rounded-2xl px-4 py-3 sm:py-3.5 mb-4 sm:mb-5 text-center text-sm sm:text-base leading-relaxed"
               style={{ background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)' }}>
            <span style={{ color:'rgba(240,246,252,0.85)', fontFamily:'Inter,sans-serif' }}>
              {name
                ? <><span style={{ color:'#10b981', fontWeight:700 }}>{name}</span>, you're </>
                : "You're "}
              now a verified technician partner on{' '}
              <span style={{ color:'#FF6B00', fontWeight:700 }}>FRRF Plumbing</span>!
              Start accepting jobs and earning right away.
            </span>
          </div>

          {/* Perks — 3 col on all sizes */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {[['⚡','Instant Jobs'],['💰','Fast Payout'],['🛡️','Insured Work']].map(([ic,lb]) => (
              <div key={lb}
                   className="rounded-xl sm:rounded-2xl py-2.5 sm:py-3 text-center"
                   style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)' }}>
                <div className="text-base sm:text-xl mb-0.5">{ic}</div>
                <div className="text-[10px] sm:text-xs font-bold"
                     style={{ color:'rgba(240,246,252,0.5)', fontFamily:'Plus Jakarta Sans,sans-serif' }}>{lb}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => { onClose(); navigate('/technician/Technician-Dashboard'); }}
            className="w-full py-3.5 sm:py-4 rounded-full font-bold text-white text-sm sm:text-base
                       transition-all active:scale-[0.98] hover:-translate-y-0.5"
            style={{
              background:'linear-gradient(90deg,#10b981,#059669)',
              boxShadow:'0 4px 24px rgba(16,185,129,0.4)',
              fontFamily:'Plus Jakarta Sans,sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 8px 32px rgba(16,185,129,0.6)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='0 4px 24px rgba(16,185,129,0.4)'}
          >
            Go to Dashboard →
          </button>

          <p className="text-center text-xs mt-3 sm:mt-4"
             style={{ color:'#41536B', fontFamily:'Inter,sans-serif' }}>
            Check your email for onboarding instructions
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ERROR POPUP — fully responsive
═══════════════════════════════════════════════════════ */
function ErrorPopup({ message, onClose, onRetry }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 px-3 pb-3 sm:px-6 sm:pb-0 md:px-8"
      style={{ background:'rgba(7,14,26,0.87)', backdropFilter:'blur(16px)' }}
      onClick={onClose}
    >
      <style>{POPUP_STYLES}</style>

      <div className="hidden sm:block absolute top-1/3 right-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Gradient border wrapper */}
      <div
        className="popup-card-error relative w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-2xl sm:rounded-3xl p-[1.5px]"
        style={{
          background:'linear-gradient(135deg,#f43f5e 0%,#e11d48 50%,#f97316 100%)',
          boxShadow:'0 28px 72px rgba(3,7,14,0.92), 0 0 48px rgba(244,63,94,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8"
          style={{ background:'rgba(10,18,34,0.99)' }}
        >
          <CloseBtn onClick={onClose} />

          {/* Warning icon */}
          <div className="flex justify-center mb-4 sm:mb-5">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center"
              style={{
                background:'radial-gradient(circle,rgba(244,63,94,0.22) 0%,rgba(244,63,94,0.03) 70%)',
                boxShadow:'0 0 40px rgba(244,63,94,0.38)',
                animation:'popIn 0.45s cubic-bezier(0.16,1,0.3,1) 0.1s both',
                fontSize:'clamp(1.75rem,5vw,2.5rem)',
              }}
            >⚠️</div>
          </div>

          {/* Copy */}
          <h2 className="text-center font-black text-xl sm:text-2xl lg:text-3xl text-white mb-1 tracking-tight"
              style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>
            Registration Failed
          </h2>
          <p className="text-center text-[10px] sm:text-xs font-bold mb-4 uppercase tracking-widest"
             style={{ color:'#f43f5e', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
            Please check your details
          </p>

          {/* Error message */}
          <div className="rounded-xl sm:rounded-2xl px-4 py-3 sm:py-3.5 mb-4 sm:mb-5"
               style={{ background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.26)' }}>
            <div className="flex items-start gap-2.5">
              <span className="text-rose-400 mt-0.5 shrink-0">⛔</span>
              <p className="text-sm sm:text-base leading-relaxed"
                 style={{ color:'rgba(240,246,252,0.82)', fontFamily:'Inter,sans-serif' }}>
                {message}
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-xl sm:rounded-2xl px-4 py-3 sm:py-3.5 mb-4 sm:mb-6"
               style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2"
               style={{ color:'rgba(240,246,252,0.32)', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
              Quick Checklist
            </p>
            {[
              'Email must be valid and not already registered',
              'Password: 8+ chars, 1 number, 1 special symbol',
              'All required fields (*) must be filled',
              'Accept the Partner Policy checkbox',
            ].map(tip => (
              <div key={tip} className="flex items-start gap-2 mt-1.5">
                <span className="text-rose-400 text-xs shrink-0 mt-0.5">•</span>
                <span className="text-xs sm:text-sm"
                      style={{ color:'rgba(240,246,252,0.52)', fontFamily:'Inter,sans-serif' }}>
                  {tip}
                </span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 sm:gap-3">
            <button
              onClick={() => { onClose(); onRetry?.(); }}
              className="flex-1 py-3.5 sm:py-4 rounded-full font-bold text-white text-sm sm:text-base
                         transition-all active:scale-[0.98] hover:-translate-y-0.5"
              style={{
                background:'linear-gradient(90deg,#f43f5e,#e11d48)',
                boxShadow:'0 4px 20px rgba(244,63,94,0.38)',
                fontFamily:'Plus Jakarta Sans,sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='0 8px 28px rgba(244,63,94,0.55)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(244,63,94,0.38)'}
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="py-3.5 sm:py-4 px-4 sm:px-6 rounded-full font-semibold text-sm sm:text-base
                         transition-all hover:bg-white/8"
              style={{
                background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.13)',
                color:'rgba(240,246,252,0.62)',
                fontFamily:'Plus Jakarta Sans,sans-serif',
              }}
            >
              Dismiss
            </button>
          </div>

          <p className="text-center text-xs mt-3 sm:mt-4"
             style={{ color:'#41536B', fontFamily:'Inter,sans-serif' }}>
            Need help?{' '}
            <span className="cursor-pointer hover:underline" style={{ color:'#00F2FE' }}>
              Contact support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const TECHNICIAN_ROLES = [
  'Senior Master Plumber',
  'CPVC & PVC Pipeline Specialist',
  'Bathroom & Sanitary Expert',
  'Drainage & Blockage Technician',
  'Water Tank & Motor Installer',
  'General Maintenance Plumber',
];

export default function TechnicianRegister() {
  useGoogleFonts();
  const { handleTechRegister } = useTechnician();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    contact: '',
    password: '',
    role: 'Senior Master Plumber',
    experienceYears: '',
    street: '',
    city: '',
    pin_code: '',
    latitude: '',
    longitude: '',
  });

  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [cooldown, setCooldown]       = useState(0);
  const [locating, setLocating]       = useState(false);
  const [agree, setAgree]             = useState(false);
  const [visible, setVisible]         = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup,   setShowErrorPopup]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── 1-minute countdown timer ticker ── */
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const formData = form;
  const handlePhoneChange = (value) => {
    setForm((f) => ({ ...f, contact: value, phone: value }));
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
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      (err) => {
        alert('Could not retrieve GPS coordinates: ' + err.message);
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setErrorMsg('');
    setShowErrorPopup(false);

    if (form.password.length < 8 || !/(?=.*\d)/.test(form.password) || !/(?=.*[@$!%*?&#])/.test(form.password)) {
      setErrorMsg('Password must be at least 8 characters and include at least one number and one special character (@$!%*?&#).');
      setShowErrorPopup(true);
      return;
    }

    if (!agree) {
      setErrorMsg('Please agree to the technician partner policy to proceed.');
      setShowErrorPopup(true);
      return;
    }

    try {
      setLoading(true);
      await handleTechRegister({
        FullName: form.fullName.trim(),
        email: form.email.trim(),
        contact: (form.contact ? (form.contact.startsWith('+') ? form.contact : `+${form.contact}`) : '').trim(),
        password: form.password,
        role: "technician",
        experienceYears: Number(form.experienceYears) || 0,
        street: form.street.trim(),
        city: form.city.trim(),
        pin_code: form.pin_code.trim(),
        longitude: Number(form.longitude) || 0,
        latitude: Number(form.latitude) || 0,
      });

      setCooldown(60);
      setShowSuccessPopup(true); // ✅ show success popup
    } catch (err) {
      console.error('Technician registration error:', err);
      const apiMsg = err?.response?.data?.message;
      if (Array.isArray(apiMsg)) {
        setErrorMsg(apiMsg.map((m) => m.msg || m.message).join(', '));
      } else if (typeof apiMsg === 'string') {
        setErrorMsg(apiMsg);
      } else {
        setErrorMsg(err?.message || 'Registration failed. Please verify your details.');
      }
      setShowErrorPopup(true); // ❌ show error popup
    } finally {
      setLoading(false);
    }
  };

  const btnDisabled = loading || cooldown > 0;

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] bg-[#070E1A] flex flex-col items-center justify-center relative overflow-x-hidden px-3.5 sm:px-6 py-8 sm:py-12 pt-20 sm:pt-24"
      style={{
        backgroundImage: "url('/images/hero-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* ── SUCCESS POPUP ── */}
      {showSuccessPopup && (
        <SuccessPopup
          name={form.fullName}
          onClose={() => setShowSuccessPopup(false)}
          navigate={navigate}
        />
      )}

      {/* ── ERROR POPUP ── */}
      {showErrorPopup && errorMsg && (
        <ErrorPopup
          message={errorMsg}
          onClose={() => setShowErrorPopup(false)}
          onRetry={() => setShowErrorPopup(false)}
        />
      )}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#070E1A]/92 backdrop-blur-sm pointer-events-none" />

      {/* Top Navbar */}
      <Navbar />

      {/* Ambient glows */}
      <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Form Card */}
      <div
        className={`relative z-10 w-full max-w-2xl transition-all duration-700 my-auto ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-white/4 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-9 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Header */}
          <div className="mb-5 sm:mb-6 text-left">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 rounded-full px-3 sm:px-3.5 py-1 sm:py-1.5 mb-2.5 sm:mb-3">
              <span className="text-orange-400 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">
                🛠️ Technician Partner Onboarding
              </span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-xl sm:text-2xl md:text-3xl text-white tracking-tight leading-tight mb-1.5 sm:mb-2">
              Join as Verified Technician
            </h1>
            <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
              Earn regular high-value residential & commercial plumbing jobs in your local city area.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 mb-4 sm:mb-5 text-rose-400 text-xs font-semibold leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-left">
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-1.5">
                Full Name <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar Verma"
                value={form.fullName}
                onChange={set('fullName')}
                className="w-full bg-white/5 border border-white/12 rounded-xl px-3.5 sm:px-4 py-2.5 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
              />
            </div>

            {/* 2. Email & Contact (2-col grid on sm+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-1.5">
                  Email Address <span className="text-orange-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@example.com"
                  value={form.email}
                  onChange={set('email')}
                  className="w-full bg-white/5 border border-white/12 rounded-xl px-3.5 sm:px-4 py-2.5 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-1.5">
                  Contact Number (WhatsApp) <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <PhoneInput
                    country={"in"}
                    value={formData.phone || form.contact}
                    onChange={handlePhoneChange}
                    inputProps={{ name: "phone", id: "phone", required: true, placeholder: "98765 43210" }}
                    containerClass="!w-full"
                    inputClass="!w-full !bg-white/5 !border !border-white/12 !rounded-xl !pl-14 !pr-4 !py-3 !text-sm !text-white !placeholder-white/25 hover:!border-white/20 focus:!border-cyan-500/60 focus:!ring-1 focus:!ring-cyan-500/30 !transition-all !duration-200"
                    buttonClass="!bg-white/5 !border !border-white/12 !border-r-0 !rounded-l-xl hover:!bg-white/10"
                    dropdownClass="!bg-[#0c1a2e] !border !border-white/15 !text-white !rounded-xl !mt-1 !shadow-2xl max-w-[280px] sm:max-w-none"
                    searchClass="!bg-[#070e1a] !border !border-white/10 !text-white !rounded-lg !px-3 !py-2 !text-sm"
                    enableSearch
                  />
                </div>
              </div>
            </div>

            {/* 3. Password (with eye toggle) */}
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-1.5">
                Account Password <span className="text-orange-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Min 8 chars (e.g. Pass@123)"
                  value={form.password}
                  onChange={set('password')}
                  className="w-full bg-white/5 border border-white/12 rounded-xl px-3.5 sm:px-4 py-2.5 pr-12 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
              <p className="text-[11px] text-white/40 mt-1">
                Must be at least 8 characters with at least one number and one special symbol (@$!%*?&#).
              </p>
            </div>

            {/* 4. Role & Experience (2-col grid on sm+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-1.5">
                  Primary Role / Speciality <span className="text-orange-400">*</span>
                </label>
                <select
                  required
                  value={form.role}
                  onChange={set('role')}
                  className="w-full bg-[#0E1A2D] border border-white/12 rounded-xl px-3.5 sm:px-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:border-cyan-500/60 transition-all cursor-pointer"
                >
                  {TECHNICIAN_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-[#0A1628] text-white">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-1.5">
                  Experience in Years <span className="text-orange-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  placeholder="e.g. 5"
                  value={form.experienceYears}
                  onChange={set('experienceYears')}
                  className="w-full bg-white/5 border border-white/12 rounded-xl px-3.5 sm:px-4 py-2.5 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            {/* 5. Address Details (street, city, pin_code, latitude, longitude) */}
            <div className="pt-2 border-t border-white/8">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-white/70 uppercase tracking-[0.08em]">
                  Workshop / Operational Area
                </span>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-3 py-1.5 rounded-full cursor-pointer transition-all hover:bg-cyan-500/20 self-start xs:self-auto"
                >
                  <span>📍</span>
                  <span>{locating ? 'Locating…' : 'Detect GPS Location'}</span>
                </button>
              </div>

              {/* Street & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/50 mb-1">
                    Street Address / Workshop <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shop 12, Plumbing Hub"
                    value={form.street}
                    onChange={set('street')}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/50 mb-1">
                    Operating City <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhopal, Indore"
                    value={form.city}
                    onChange={set('city')}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                  />
                </div>
              </div>

              {/* PIN Code, Latitude & Longitude (3-col grid on xs+) */}
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/50 mb-1">
                    PIN Code <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 462011"
                    value={form.pin_code}
                    onChange={set('pin_code')}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/50 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 23.2599"
                    value={form.latitude}
                    onChange={set('latitude')}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/50 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 77.4126"
                    value={form.longitude}
                    onChange={set('longitude')}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="tech-terms"
                type="checkbox"
                required
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border border-white/20 bg-white/5 accent-orange-500 cursor-pointer shrink-0"
              />
              <label htmlFor="tech-terms" className="text-white/50 text-[11px] sm:text-xs leading-relaxed cursor-pointer">
                I agree to the technician code of conduct, background check verification, and payout terms under the{' '}
                <span className="text-cyan-400 font-semibold">FRRF Plumbing Service Partner Policy</span>.
              </label>
            </div>

            {/* Submit Button with 1-Minute Cooldown */}
            <button
              type="submit"
              disabled={btnDisabled}
              className={`w-full relative flex items-center justify-center gap-2.5 py-3 sm:py-3.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm sm:text-[15px] border-0 transition-all duration-300 mt-2 ${
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
                  Registering Technician…
                </>
              ) : cooldown > 0 ? (
                `Wait ${cooldown}s before retrying`
              ) : (
                'Submit Technician Application 🛠️'
              )}
            </button>

            {/* Loading Bar */}
            {loading && (
              <div className="w-full h-0.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-cyan-400 rounded-full"
                  style={{ animation: 'loadbar 2s ease-in-out forwards' }}
                />
              </div>
            )}
          </form>

          {/* Footer links */}
          <div className="mt-5 pt-4 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40 text-center sm:text-left">
            <span>
              Already a registered partner?{' '}
              <Link to="/customer/login" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
                Sign In
              </Link>
            </span>
            <Link to="/customer/register" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">
              Looking for Customer Booking? →
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes loadbar { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
