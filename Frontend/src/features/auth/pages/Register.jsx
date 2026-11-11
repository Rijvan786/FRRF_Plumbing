import { useState, useEffect } from 'react';
import { Link, Navigate, replace, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../hook/useAuth';
import Navbar from "../../../App/Navbar.jsx"
import { useToast } from '../component/ToastPopup';
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

/* ── Eye Icon Toggle ─────────────────────────────────────────── */
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

/* ── Input Field Component ────────────────────────────────────── */
function Field({ label, type = 'text', placeholder, value, onChange, required, children }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(0,180,216,0.12)] transition-all duration-200"
        />
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CUSTOMER REGISTER COMPONENT
══════════════════════════════════════════════════════════════ */
export default function   Register() {
  useGoogleFonts();
  const navigate = useNavigate();
  const reduxItem = useSelector((state) => state.order?.item || []);
  

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [cooldown, setCooldown]   = useState(0); // 1 minute cooldown in seconds
  const [agree, setAgree]         = useState(false);
  const [visible, setVisible]     = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const authError = useSelector((state) => state.auth?.Error);
  const { handleRegister } = useAuth();
  const [searchParams] = useSearchParams();

    // 🚀 3. 'get' मेथड का इस्तेमाल करके orderId निकालें
    const OrderId = searchParams.get('OrderId') 
  const { showToast } = useToast();

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

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const formData = form;
  const handlePhoneChange = (value) => {
    setForm((f) => ({ ...f, phone: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setErrorMsg('');

    if (form.password !== form.confirm) {
      const msg = 'Passwords do not match. Please check both fields.';
      setErrorMsg(msg);
      showToast({ type: 'error', message: msg });
      return;
    }
    if (form.password.length <8) {
      const msg = 'Password should be at least 8 characters.';
      setErrorMsg(msg);
      showToast({ type: 'error', message: msg });
      return;
    }
    if (!agree) {
      const msg = 'Please agree to the Terms of Service and Privacy Policy.';
      setErrorMsg(msg);
      showToast({ type: 'error', message: msg });
      return;
    }

    setLoading(true);
    try {
      if(OrderId){
           await handleRegister({
        FullName: form.name.trim(),
        email: form.email.trim(),
        contact: "+" +form.phone.trim(),
        role: 'customer',
        password: form.password,
        OrderId:OrderId,
        
      });

      showToast({
        type: 'success',
        message: `Account created for ${form.name.trim()}! Please check email.`,
        actionText: 'Sign In',
        onAction: () => navigate('/customer/login'),
        duration: 5000,
      });
    
      setTimeout(() => {
        navigate(`/customer/login?OrderId=${OrderId}`)
      }, 1200);
      }
      else{
         await handleRegister({
        FullName: form.name.trim(),
        email: form.email.trim(),
        contact: "+" +form.phone.trim(),
        role: 'customer',
        password: form.password,
       
      });
        showToast({
        type: 'success',
        message: `Account created for ${form.name.trim()}! Please check email.`,
        actionText: 'Sign In',
        onAction: () => navigate('/customer/login'),
        duration: 5000,
      });

      setCooldown(60); // 1 minute cooldown
      setTimeout(() => {
        navigate('/customer/login');
      }, 1200);
      }


    
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      setErrorMsg(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const btnDisabled = loading || cooldown > 0;

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] bg-[#070E1A] flex flex-col items-center justify-center relative overflow-hidden px-4 py-12 pt-24"
      style={{
        backgroundImage: "url('/images/hero-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#070E1A]/90 backdrop-blur-sm" />

      {/* Top Navbar with Logo on the top left */}
      <Navbar />

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/6 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-lg transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-white/4 border border-white/10 rounded-3xl p-7 sm:p-9 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Customer only badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 rounded-full px-3.5 py-1.5 mb-5">
            <span className="text-orange-400 text-[11px] font-bold tracking-widest uppercase">
              🏠 Customer Registration
            </span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl sm:text-3xl text-white mb-1.5 tracking-tight">
            Create your account
          </h1>
          <p className="text-white/45 text-sm mb-6 leading-relaxed">
            Book certified CPVC plumbers at your doorstep — 24/7 upfront rates.
          </p>

          {/* Error Message */}
          {(errorMsg || authError) && (
            <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 mb-5 text-rose-400 text-xs font-semibold">
              ⚠️ {errorMsg || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <Field
              label="Full Name"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={set('name')}
              required
            />

            {/* Email */}
            <Field
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              required
            />

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-2">
                Phone Number
                
              </label>
              <div className="relative">
                <PhoneInput
                  country={"in"}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputProps={{ name: "phone", id: "phone", required: true, placeholder: "98765 43210" }}
                  containerClass="!w-full"
                  inputClass="!w-full !bg-white/5 !border !border-white/12 !rounded-xl !pl-14 !pr-4 !py-3 !text-sm !text-white !placeholder-white/25 hover:!border-white/20 focus:!border-cyan-500/60 focus:!ring-1 focus:!ring-cyan-500/30 !transition-all !duration-200"
                  buttonClass="!bg-white/5 !border !border-white/12 !border-r-0 !rounded-l-xl hover:!bg-white/10"
                  dropdownClass="!bg-[#0c1a2e] !border !border-white/15 !text-white !rounded-xl !mt-1 !shadow-2xl"
                  searchClass="!bg-[#070e1a] !border !border-white/10 !text-white !rounded-lg !px-3 !py-2 !text-sm"
                  enableSearch
                />
              </div>
            </div>

            {/* Password */}
            <Field
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 characters"
              value={form.password}
              onChange={set('password')}
              required
            >
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-cyan-400 transition-colors"
              >
                <EyeIcon open={showPw} />
              </button>
            </Field>

            {/* Confirm Password */}
            <Field
              label="Confirm Password"
              type={showCf ? 'text' : 'password'}
              placeholder="Repeat password"
              value={form.confirm}
              onChange={set('confirm')}
              required
            >
              <button
                type="button"
                onClick={() => setShowCf((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-cyan-400 transition-colors"
              >
                <EyeIcon open={showCf} />
              </button>
            </Field>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
                className="mt-0.5 w-4 h-4 rounded border border-white/20 bg-white/5 accent-orange-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-white/50 text-xs leading-relaxed cursor-pointer">
                I agree to the <span className="text-cyan-400 font-semibold">Terms of Service</span> and{' '}
                <span className="text-cyan-400 font-semibold">Privacy Policy</span> of FRRF Plumbing Services.
              </label>
            </div>

            {/* Submit button with 1 minute cooldown */}
            <button
              type="submit"
              disabled={btnDisabled}
              className={`w-full relative flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] border-0 transition-all duration-300 mt-2
                ${
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
                  Creating account…
                </>
              ) : cooldown > 0 ? (
                `Wait ${cooldown}s before retrying`
              ) : (
                'Create Customer Account →'
              )}
            </button>

            {/* Loading bar */}
            {loading && (
              <div className="w-full h-0.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-cyan-400 rounded-full"
                  style={{ animation: 'loadbar 2s ease-in-out forwards' }}
                />
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-white/10" />
            <span className="absolute bg-[#0b1626] px-3 text-[11px] font-bold uppercase tracking-widest text-white/40">
              or
            </span>
          </div>

          {/* Google Registration Button */}
          <a
            href="https://frpf-plumbing.onrender.com/api/auth/google"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm bg-white/6 hover:bg-white/10 border border-white/15 text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 shadow-md no-underline"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </a>

          <p className="mt-6 text-center text-white/40 text-sm">
            Already have an account?{' '}
            <Link to="/customer/login" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
              Sign In
            </Link>
          </p>

          {/* Trust stats strip */}
          <div className="mt-7 pt-6 border-t border-white/6 grid grid-cols-3 gap-4 text-center">
            {[
              ['50K+', 'Happy Customers'],
              ['4.9★', 'Avg Rating'],
              ['24/7', 'Support'],
            ].map(([val, lbl]) => (
              <div key={lbl}>
                <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-lg text-orange-500">
                  {val}
                </div>
                <div className="text-white/35 text-[11px] font-medium mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes loadbar { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
