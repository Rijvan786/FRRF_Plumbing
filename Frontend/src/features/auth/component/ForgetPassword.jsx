import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../hook/useAuth';
import Navbar from "../../../App/Navbar.jsx"


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
   FORGET PASSWORD COMPONENT (Three fields: email/user, pw, confirm)
══════════════════════════════════════════════════════════════ */
export default function ForgetPassword() {
  useGoogleFonts();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [showCf, setShowCf]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [cooldown, setCooldown]     = useState(0); // 1-minute cooldown in seconds
  const [success, setSuccess]       = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');
  const [visible, setVisible]       = useState(false);

  const authError = useSelector((state) => state.auth?.Error);
  const authLoading = useSelector((state) => state.auth?.Loading);
  const { handleForgetPassword } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── 1-minute countdown timer ── */
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setErrorMsg('');

    if (password !== confirmPw) {
      setErrorMsg('Passwords do not match. Please verify both fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await handleForgetPassword({
        email: identifier.trim(),
        NewPassword: password,
      });
      setSuccess(true);
      setCooldown(60); // 1 minute active timer
      setTimeout(() => {
        navigate('/customer/login');
      }, 2500);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to update password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const btnDisabled = loading ||   cooldown > 0;

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

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`relative z-10 w-full max-w-md transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-white/4 border border-white/10 rounded-3xl p-7 sm:p-9 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 rounded-full px-3.5 py-1.5 mb-4">
            <span className="text-orange-400 text-[11px] font-bold tracking-widest uppercase">
              🔒 Reset Credentials
            </span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl sm:text-[28px] text-white mb-2 tracking-tight">
            Set New Password
          </h1>
          <p className="text-white/45 text-sm mb-7 leading-relaxed">
            Enter your email and create a fresh secure password.
          </p>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 mb-5 text-rose-400 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Success Notification */}
          {success && (
            <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3.5 mb-6 text-left">
              <span className="text-emerald-400 text-xl shrink-0 mt-0.5">✓</span>
              <div>
                <div className="text-emerald-400 font-bold text-sm">
                  Password updated successfully!
                </div>
                <div className="text-emerald-400/70 text-xs mt-0.5">
                  Redirecting to Sign In in a moment...
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {(errorMsg || authError) && (
            <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 mb-5 text-rose-400 text-xs font-semibold text-left">
              ⚠️ {errorMsg || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Field 1: Email or Username */}
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-2">
                Email 
              </label>
              <input
                type="text"
                placeholder="you@example.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(0,180,216,0.12)] transition-all duration-200"
              />
            </div>

            {/* Field 2: New Password (with eye toggle) */}
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 8 characters"
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

            {/* Field 3: Confirm Password (with eye toggle) */}
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showCf ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(0,180,216,0.12)] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowCf((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-cyan-400 transition-colors"
                >
                  <EyeIcon open={showCf} />
                </button>
              </div>
            </div>

            {/* Submit button with 1-minute cooldown */}
            <button
              type="submit"
              disabled={btnDisabled}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] border-0 transition-all duration-300 mt-2
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
                  Updating password…
                </>
              ) : cooldown > 0 ? (
                `Wait ${cooldown}s before retrying`
              ) : (
                'Reset Password →'
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

          <p className="mt-6 text-center text-white/40 text-sm">
            Remembered your password?{' '}
            <Link
              to="/customer/login"
              className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes loadbar { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
