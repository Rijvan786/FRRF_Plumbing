import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

/* ══════════════════════════════════════════════════════════════
   FORGET MAIL COMPONENT (Single Field: Email)
══════════════════════════════════════════════════════════════ */
export default function Forgetmail() {
  useGoogleFonts();

  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [cooldown, setCooldown] = useState(0); // 1-minute countdown
  const [sent, setSent]         = useState(false);
  const [visible, setVisible]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const authError = useSelector((state) => state.auth?.Error);
  const authLoading = useSelector((state) => state.auth?.Loading);
  const { handleForgetMail } = useAuth();

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
    if (loading || authLoading || cooldown > 0) return;
    setErrorMsg('');
    setSent(false);
    setLoading(true);
    try {
      await handleForgetMail({ email: email.trim() });
      setSent(true);
      setCooldown(60); // 1 minute active timer
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to send password reset link.');
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

      {/* Ambient glows */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/7 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`relative z-10 w-full max-w-md transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-white/4 border border-white/10 rounded-3xl p-7 sm:p-9 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/25 rounded-full px-3.5 py-1.5 mb-4">
            <span className="text-cyan-400 text-[11px] font-bold tracking-widest uppercase">
              🔑 Account Recovery
            </span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl sm:text-[28px] text-white mb-2 tracking-tight">
            Forgot Password?
          </h1>
          <p className="text-white/45 text-sm mb-7 leading-relaxed">
            Enter your registered email address and we'll send you an OTP/reset link to restore your account.
          </p>

          {/* Success state */}
          {sent && (
            <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3.5 mb-6 text-left">
              <span className="text-emerald-400 text-xl shrink-0 mt-0.5">✓</span>
              <div>
                <div className="text-emerald-400 font-bold text-sm">
                  Reset link sent!
                </div>
                <div className="text-emerald-400/70 text-xs mt-0.5">
                  Check your email inbox or spam folder.{' '}
                  <Link
                    to="/forget-password"
                    className="underline text-emerald-300 font-semibold"
                  >
                    Click here to set new password →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {(errorMsg || authError) && (
            <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3.5 mb-6 text-left text-rose-400 text-xs font-semibold">
              ⚠️ {errorMsg || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {/* Single Field: Email */}
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-[0.08em] mb-2">
                Registered Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 font-medium focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(0,180,216,0.12)] transition-all duration-200"
              />
            </div>

            {/* Submit Button with 1-min cooldown */}
            <button
              type="submit"
              disabled={btnDisabled}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] border-0 transition-all duration-300
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
                  Sending reset link…
                </>
              ) : cooldown > 0 ? (
                `Wait ${cooldown}s before resending`
              ) : (
                'Send Reset Link →'
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

          <div className="mt-7 pt-6 border-t border-white/6 flex items-center justify-between text-xs text-white/40">
            <Link
              to="/customer/login"
              className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors"
            >
              ← Back to Sign In
            </Link>
            <Link
              to="/forget-password"
              className="text-white/60 hover:text-white transition-colors"
            >
              Already have OTP/Reset? →
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes loadbar { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
