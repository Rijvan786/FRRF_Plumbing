import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../features/auth/hook/useAuth.jsx';

const NAV_LINKS = [
  ['Home', 'home'],
  ['Services', 'services'],
  ['About', 'about'],
  ['Contact', 'contact'],
  ['Get Job', 'job'],
];

export default function Navbar() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = useSelector((state) => state.auth?.User);
  const { handleLogout, handleGetME } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Fetch logged in user on mount if token exists
  useEffect(() => {
    if (!user && handleGetME) {
      handleGetME().catch(() => {});
    }
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if user has scrolled past top
      setIsScrolled(currentScrollY > 20);

      // Scroll direction check:
      // Hide on scroll down past 100px, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (id) => {
    setMenuOpen(false);
    if (id === 'job') {
      navigate('/technician/technician-register');
      return;
    }
    if (id === 'home') {
      if (window.location.pathname === '/customer' || window.location.pathname === '/customer/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/customer');
      }
      return;
    }

    // If on home page, scroll to element
    if (window.location.pathname === '/customer' || window.location.pathname === '/customer/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/customer#${id}`);
    }
  };

  const onLogout = async () => {
    setProfileMenuOpen(false);
    setMenuOpen(false);
    try {
      await handleLogout();
    } catch {
      // ignore
    }
    navigate('/customer');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
        !mounted
          ? 'opacity-0 -translate-y-4'
          : isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-full'
      } ${
        isScrolled
          ? ' backdrop-blur-md shadow-[0_4px_40px_rgba(0,0,0,0.5)] border-b border-white/10 py-1'
          : 'bg-transparent backdrop-blur-none border-b border-transparent py-2 sm:py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-[72px]">
        {/* Logo */}
        <Link
          to="/customer"
          onClick={(e) => {
            if (window.location.pathname === '/customer' || window.location.pathname === '/customer/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center bg-transparent border-0 cursor-pointer p-0 shrink-0"
        >
          <img
            src="/frrf-logo.png"
            alt="FRRF Plumbing Services"
            className="w-28 h-28 sm:w-30 sm:h-30 object-contain shrink-0"
            style={{ filter: 'brightness(1.15) contrast(1.05)' }}
          />
        </Link>

        {/* Desktop Nav — Dark pill container */}
        <nav className="hidden md:flex items-center">
          <div className="flex items-center gap-1 bg-[#091427] border border-white/10 rounded-lg px-2 py-1.5 backdrop-blur-sm">
            {NAV_LINKS.map(([label, id]) => (
              <button
                key={id}
                type="button"
                onClick={() => handleNavClick(id)}
                className="relative px-4 py-1.5 rounded-full text-white/80 font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-sm cursor-pointer border-0 bg-transparent transition-all duration-200 hover:text-cyan-400 group"
              >
                {label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1.5 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" />
            24/7 Live
          </div>

          {/* Profile Icon (when customer is logged in) OR Sign in button (when logged out) */}
          {user ? (
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((o) => !o)}
                className="flex items-center gap-2 bg-[#091427] hover:bg-[#0d1e3a] border border-white/15 hover:border-cyan-400/50 pl-1.5 pr-2.5 py-1 rounded-full cursor-pointer transition-all duration-200 group"
                aria-label="Customer profile menu"
              >
                {/* Cartoon avatar with glasses & purple rim matching uploaded screenshot */}
                <div className="w-8 h-8 rounded-full bg-[#E5D768] border-2 border-purple-500 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-slate-800" viewBox="0 0 36 36" fill="none">
                    <circle cx="12" cy="15" r="5" stroke="#1f2937" strokeWidth="2" fill="white" fillOpacity="0.4" />
                    <circle cx="24" cy="15" r="5" stroke="#1f2937" strokeWidth="2" fill="white" fillOpacity="0.4" />
                    <path d="M17 15h2" stroke="#1f2937" strokeWidth="2" />
                    <path d="M7 14l-2 1M29 14l2 1" stroke="#1f2937" strokeWidth="1.5" />
                    <circle cx="12" cy="15" r="1.5" fill="#111827" />
                    <circle cx="24" cy="15" r="1.5" fill="#111827" />
                    <path d="M14 24c1.5 1.5 6.5 1.5 8 0" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                <span className="hidden sm:inline font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs text-white/90 max-w-[85px] truncate">
                  {user.FullName ? user.FullName.split(' ')[0] : 'Customer'}
                </span>

                {/* Down Chevron */}
                <svg
                  className={`w-3.5 h-3.5 text-white/60 group-hover:text-cyan-400 transition-transform duration-200 ${
                    profileMenuOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-60 bg-[#070E1A]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50">
                  <div className="px-3 py-2 border-b border-white/10 mb-1.5">
                    <p className="text-xs font-bold text-white truncate">
                      {user.FullName || 'Customer'}
                    </p>
                    <p className="text-[11px] text-white/50 truncate">
                      {user.email || user.contact || ''}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {user.role === 'technician' ? 'Technician' : 'Customer'}
                    </span>
                  </div>

                  <Link
                    to={user.role === 'technician' ? '/technician/Technician-Profile' : '/customer/profile'}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/8 rounded-xl transition-colors"
                  >
                    <span>👤</span>
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/customer/booking"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/8 rounded-xl transition-colors"
                  >
                    <span>⚡</span>
                    <span>Book a Plumber</span>
                  </Link>

                  <div className="my-1.5 border-t border-white/8" />

                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/customer/login"
              className="hidden md:block bg-transparent border border-white/20 text-white/80 px-4 py-2 rounded-full font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-sm cursor-pointer transition-all duration-200 hover:border-white/50 hover:text-white"
            >
              Sign In
            </Link>
          )}

          {/* Book CTA */}
          <Link
            to="/customer/booking"
            className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm cursor-pointer shadow-[0_0_16px_rgba(255,107,53,0.38)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_22px_rgba(255,107,53,0.5)] whitespace-nowrap"
          >
            Book Now ⚡
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden bg-white/5 border border-white/15 text-white w-9 h-9 rounded-full text-base flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-white/10"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-[#070E1A]/95 backdrop-blur-2xl border-t border-white/8 px-4 pb-5 pt-2">
          {NAV_LINKS.map(([label, id]) => (
            <button
              key={id}
              type="button"
              onClick={() => handleNavClick(id)}
              className="block w-full text-left bg-transparent border-0 border-b border-white/5 text-white/75 font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[15px] cursor-pointer py-3 hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}

          {user ? (
            <div className="mt-4 pt-3 border-t border-white/10 space-y-2.5">
              <div className="flex items-center gap-3 px-1">
                <div className="w-9 h-9 rounded-full bg-[#E5D768] border-2 border-purple-500 overflow-hidden flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-slate-800" viewBox="0 0 36 36" fill="none">
                    <circle cx="12" cy="15" r="5" stroke="#1f2937" strokeWidth="2" fill="white" fillOpacity="0.4" />
                    <circle cx="24" cy="15" r="5" stroke="#1f2937" strokeWidth="2" fill="white" fillOpacity="0.4" />
                    <path d="M17 15h2" stroke="#1f2937" strokeWidth="2" />
                    <circle cx="12" cy="15" r="1.5" fill="#111827" />
                    <circle cx="24" cy="15" r="1.5" fill="#111827" />
                    <path d="M14 24c1.5 1.5 6.5 1.5 8 0" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.FullName || 'Customer'}</p>
                  <p className="text-xs text-white/50 truncate">{user.email || user.contact || ''}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={user.role === 'technician' ? '/technician/Technician-Profile' : '/customer/profile'}
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 bg-white/10 border border-white/15 text-white py-2 rounded-full font-semibold text-center text-xs"
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={()=>{
                    onLogout()
                  }}
                  className="flex-1 bg-rose-500/15 border border-rose-500/30 text-rose-300 py-2 rounded-full font-semibold text-center text-xs cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between gap-2.5 mt-4">
              <Link
                to="/customer/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 bg-white/5 border border-white/20 text-white py-2.5 rounded-full font-['Plus_Jakarta_Sans',sans-serif] font-bold text-center text-sm cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                to="/customer/booking"
                onClick={() => setMenuOpen(false)}
                className="flex-1 bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white py-2.5 rounded-full font-['Plus_Jakarta_Sans',sans-serif] font-bold text-center text-sm cursor-pointer"
              >
                Book Now ⚡
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
