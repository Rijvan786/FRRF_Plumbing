  import { useState, useEffect } from 'react';
  import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
  import { useSelector } from 'react-redux';
  import { useAuth } from '../hook/useAuth';
import Navbar from "../../../App/Navbar.jsx"
  import { useToast } from '../component/ToastPopup';
import { useOrder } from '../../order/hook/useOrder.jsx';

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

  /* ══════════════════════════════════════════════════════════════
    LOGIN COMPONENT (Customer / User)
  ══════════════════════════════════════════════════════════════ */
  export default function Login() {
    useGoogleFonts();
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword]     = useState('');
    const [showPw, setShowPw]         = useState(false);
    const [remember, setRemember]     = useState(false);
    const [loading, setLoading]       = useState(false);
    const [cooldown, setCooldown]     = useState(0); // 1-minute active timer
    const [visible, setVisible]       = useState(false);
    const [errorMsg, setErrorMsg]     = useState('');
    
    const authError = useSelector((state) => state.auth?.Error);
    const authLoading = useSelector((state) => state.auth?.Loading);
     const reduxItem = useSelector((state) => state.order?.item || [])
   const [searchParams] = useSearchParams();

    // 🚀 3. 'get' मेथड का इस्तेमाल करके orderId निकालें
    const OrderId = searchParams.get('OrderId') 

    const { handleLogin } = useAuth();

    const { showToast } = useToast();
    
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

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (loading ||  cooldown > 0) return;
      setErrorMsg('');
      setLoading(true);
      try {
        let res
    if(OrderId){
        
        res= await handleLogin({
          FullName: identifier.trim(),
          email: identifier.trim(),
          contact: identifier.trim(),
          password,
          OrderId:OrderId 
        })
          const loggedName = res?.user?.FullName || identifier.trim();
         showToast({
          type: 'success',
          message: `Login successful! Logged in as ${loggedName}`,
          duration: 4500,
        });
        navigate("/customer/profile")
    } 
    
    else{
         
        res= await handleLogin({
          FullName: identifier.trim(),
          email: identifier.trim(),
          contact: identifier.trim(),
          password,
        
        })

        
        const loggedName = res?.user?.FullName || identifier.trim();

        // Show user-friendly toast popup matching design in user image
        showToast({
          type: 'success',
          message: `Login successful! Logged in as ${loggedName}`,
          duration: 4500,
        });

       
        if(res?.user.role=="customer"){
          setCooldown(60); // 1 minute cooldown
        
            navigate('/customer#services');
          
        
        }
        else if(res?.user.role=="admin"){
          navigate("/admin/Admin-Dashboard")
        }
        else if(res?.user.role=="technician"){
          navigate("/technician/Technician-Dashboard")
        }
    }
      
      
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
        setErrorMsg(msg);
        console.log(err);
        showToast({
          type: 'error',
          message: msg,
          duration: 4500,
        });
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
        {/* Dark overlay & blur */}
        <div className="absolute inset-0 bg-[#070E1A]/90 backdrop-blur-sm" />

        {/* Top Navbar with Logo on the top left */}
        <Navbar />

        {/* Ambient glowing highlights */}
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-cyan-500/7 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/7 rounded-full blur-3xl pointer-events-none" />

        <div
          className={`relative z-10 w-full max-w-md transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="bg-white/4 border border-white/10 rounded-3xl p-7 sm:p-9 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl sm:text-[28px] text-white mb-1.5 tracking-tight">
              Welcome back 👋
            </h1>
            <p className="text-white/40 text-sm mb-7">
              Sign in to book or manage your plumbing services.
            </p>

            {/* Error Message */}
            {(errorMsg || authError) && (
              <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 mb-5 text-rose-400 text-xs font-semibold">
                ⚠️ {errorMsg || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Field 1: Username / Email */}
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-2">
                  Username or Email
                </label>
                <input
                  type="text"
                  placeholder="username or you@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(0,180,216,0.12)] transition-all duration-200"
                />
              </div>

              {/* Field 2: Password (with eye toggle) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-[0.08em]">
                    Password
                  </label>
                  <Link
                    to="/customer/forget-mail"
                    className="text-xs text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(0,180,216,0.12)] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-cyan-400 transition-colors"
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <input
                  id="rem"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border border-white/20 bg-white/5 accent-orange-500 cursor-pointer"
                />
                <label htmlFor="rem" className="text-white/50 text-xs cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit button with 1 minute cooldown */}
              <button
                type="submit"
                disabled={btnDisabled}
                className={`w-full relative flex items-center justify-center gap-2.5 py-3 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm border-0 transition-all duration-200
                  ${
                    btnDisabled
                      ? 'bg-white/8 text-white/25 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_24px_rgba(255,107,53,0.38)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(255,107,53,0.5)] cursor-pointer'
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
                    Signing in…
                  </>
                ) : cooldown > 0 ? (
                  `Try again in ${cooldown}s`
                ) : (
                  'Sign In →'
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

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-white/10" />
              <span className="absolute bg-[#070E1A] px-3 text-[11px] font-bold uppercase tracking-widest text-white/40">
                or
              </span>
            </div>

            {/* Google Login Button */}
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

            {/* Resend mail link */}
            <p className="mt-4 text-center text-white/35 text-xs">
              Didn't receive verification email?{' '}
              <Link
                to="/customer/resend-mail"
                className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
              >
                Resend it
              </Link>
            </p>

            <p className="mt-5 text-center text-white/40 text-sm">
              New here?{' '}
              <Link
                to="/customer/register"
                className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
        <style>{`@keyframes loadbar { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    );
  }
