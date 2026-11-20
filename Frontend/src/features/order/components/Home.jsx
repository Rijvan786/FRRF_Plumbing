import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../../../App/Navbar.jsx"
import { useSelector, useDispatch } from 'react-redux';
import { useOrder } from '../hook/useOrder.jsx';
import { setSelectedService } from '../state/order.slice.jsx';


/* ── Google Fonts ───────────────────────────────────────────── */
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

/* ── Category Styling Helper (for icon and badge color from Redux category) ── */
const getCategoryStyle = (category = '') => {
  const cat = String(category || '').toLowerCase().trim();
  if (cat.includes('leak')) return { tagBg: 'bg-orange-500', icon: '💧' };
  if (cat.includes('block')) return { tagBg: 'bg-cyan-500', icon: '🔧' };
  if (cat.includes('install')) return { tagBg: 'bg-emerald-500', icon: '⚙️' };
  if (cat.includes('inspect')) return { tagBg: 'bg-blue-500', icon: '🔍' };
  if (cat.includes('full') || cat.includes('setup')) return { tagBg: 'bg-amber-500', icon: '🏗️' };
  if (cat.includes('maint')) return { tagBg: 'bg-violet-500', icon: '🛡️' };
  return { tagBg: 'bg-cyan-500', icon: '🛠️' };
};

const STATS = [
  { value: '10,000+', label: 'Jobs Completed', icon: '🛠️' },
  { value: '4.9★', label: 'Avg Rating', icon: '⭐' },
  { value: '18 min', label: 'Avg Arrival', icon: '⚡' },
  { value: '50,000+', label: 'Happy Customers', icon: '🏠' },
];

const STEPS = [
  { step: '01', title: 'Book a Service', desc: 'Select your plumbing issue, pick a time slot and see upfront fixed pricing instantly.', icon: '📱' },
  { step: '02', title: 'Technician Arrives', desc: 'Background-checked, licensed plumber reaches your door in 30–45 mins with full gear.', icon: '🚐' },
  { step: '03', title: 'Job Done & Pay', desc: 'Inspect the repair, receive a digital invoice with warranty, pay via card or UPI.', icon: '✅' },
];



const REVIEWS = [
  {
    name: 'Priya Sharma', location: 'Bangalore', service: 'Emergency Leakage', avatar: 'PS',
    review: '"Pipe burst at 11 PM on Sunday. FRRF had Rajesh at our door in 22 minutes! Fixed the line cleanly without touching the wall. Absolutely unbelievable service."',
  },
  {
    name: 'Vikram Malhotra', location: 'Mumbai', service: 'Blockage Removal', avatar: 'VM',
    review: '"Transparent pricing is real. Upfront ₹450 quote for unclogging both basins and they stuck to it. Flawless work — would hire again instantly!"',
  },
  {
    name: 'Anita & David Rao', location: 'Delhi', service: 'Geyser Installation', avatar: 'AD',
    review: '"Installed a 25L geyser and pressure booster pump. Super neat copper pipe work and zero leakage. Their 30-day warranty gives tremendous peace of mind."',
  },
];



/* ══════════════════════════════════════════════════════════════
   PASTE YOUR SOCIAL MEDIA LINKS HERE
   Replace the '#' or placeholder URLs with your actual profile links
══════════════════════════════════════════════════════════════ */
const   SOCIAL_LINKS = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/mrf_rizwan/?hl=en', // <── PASTE INSTAGRAM LINK HERE
    color: 'hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-500/10',
    icon: (
      <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=100077931035946', // <── PASTE FACEBOOK LINK HERE
    color: 'hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10',
    icon: (
      <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    url: 'https://wa.me/919876543210', // <── PASTE WHATSAPP LINK/PHONE HERE
    color: 'hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10',
    icon: (
      <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    ),
  },
  {
    name: 'X (Twitter)',
    url: 'https://x.com/manihar_ri22859', // <── PASTE X (TWITTER) LINK HERE
    color: 'hover:text-white hover:border-white/40 hover:bg-white/10',
    icon: (
      <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/', // <── PASTE YOUTUBE LINK HERE
    color: 'hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10',
    icon: (
      <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/mohammad-rijvan-54150530b/', // <── PASTE LINKEDIN LINK HERE
    color: 'hover:text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/10',
    icon: (
      <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
];

/* ══════════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════════ */
export default function Home() {
  useGoogleFonts();
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const { handleGetallService, handleSetSelectedService } = useOrder();
  const { services, loading: orderLoading } = useSelector((state) => state.order);
  const [initialLoading, setInitialLoading] = useState(!services || services.length === 0);

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        await handleGetallService();
      } catch (err) {
        console.warn('handleGetallService error:', err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };
    fetchServices();

    const t = setTimeout(() => setVisible(true), 80);
    return () => {
      isMounted = false;
      clearTimeout(t);
    };
  }, []);

  const isServicesLoading = (initialLoading || orderLoading) && (!services || services.length === 0);

  // Direct Redux services data
  const displayServices = useMemo(() => {
    if (!services || !Array.isArray(services)) {
      return [];
    }
    return services;
  }, [services]);

  useEffect(() => {
    const hash = window.location.hash?.replace('#', '').replace('$', '');
    if (hash) {
      const t = setTimeout(() => {
        const el = document.getElementById(hash) || 
                   document.getElementById(hash.toLowerCase()) || 
                   document.getElementById('services') ||
                   document.getElementById('Services');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 250);
      return () => clearTimeout(t);
    }
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id) || document.getElementById(id.toLowerCase());
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-['Inter',sans-serif]  bg-gradient-to-r from-[#070E1A]/97 via-[#0A1628]/88 to-[#0A1628]/55 overflow-x-hidden ">

      {/* ════════════════════════════════════════════════════
          NAVBAR (Shared component matching all pages)
      ════════════════════════════════════════════════════ */}
      <Navbar />

      {/* ════════════════════════════════════════════════════
          HERO      StitchMCP/download_file
StitchMCP/edit_screens
StitchMCP/generate_screen_from_text
      ════════════════════════════════════════════════════ */}
      <section
        id="home"
        className="relative min-h-screen flex items-center overflow-hidden pt-16 sm:pt-[68px]"
      >
        {/* BG with entrance animation */}
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out transform ${
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          style={{ backgroundImage: `url('/images/hero-bg.png')` }}
        />
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-[#070E1A]/97 via-[#0A1628]/88 to-[#0A1628]/55 transition-opacity duration-1000 ease-out ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Hero Content with smooth entrance animation */}
        <div
          className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 w-full transition-all duration-700 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >

          {/* Live pill */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6 sm:mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="text-emerald-400 font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs sm:text-sm tracking-wide">
              ⚡ Available Now — Technicians Near You · Avg. Response: 18 Mins
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[clamp(32px,7vw,70px)] text-white leading-[1.07] tracking-[-0.03em] mb-5 max-w-3xl">
            Your Trusted{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Plumbing Experts
            </span>
            {' '}— 24/7
          </h1>

          {/* Subtitle */}
          <p className="text-[clamp(15px,2.2vw,19px)] text-white/70 max-w-xl leading-relaxed mb-8 sm:mb-10">
            Fast, Reliable &amp; Affordable Plumbing Services at Your Doorstep.
            Certified master technicians for rapid residential &amp; commercial repair.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10">
            <Link
              onClick={() => navigate('/customer/booking')}
              className="flex items-center justify-center gap-2 bg-gradient-to-br from-orange-500 to-orange-700 border-0 text-white px-7 py-4 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base cursor-pointer shadow-[0_0_28px_rgba(255,107,53,0.42)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(255,107,53,0.52)]"
            >
              Book a Plumber Now →
            </Link>
            <Link
              onClick={() => scrollTo('services')}
              className="flex items-center justify-center gap-2 bg-white/7 border-[1.5px] border-white/28 text-white px-6 py-4 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base cursor-pointer backdrop-blur-md transition-all duration-250 hover:bg-white/14"
            >
              View Services
            </Link>
            <a
              href="tel:18007586237"
              className="flex items-center justify-center gap-2 bg-cyan-500/10 border border-cyan-500/32 text-cyan-400 px-5 py-4 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base no-underline transition-all duration-250 hover:bg-cyan-500/18"
            >
              📞 Call 24/7
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-2.5">
            {[
              ['⭐', '4.9 Rating (12,400+ Reviews)'],
              ['🛠️', '10,000+ Jobs Completed'],
              ['⚡', '60-Min Arrival Guarantee'],
              ['🛡️', '₹50,000 Damage Insured'],
            ].map(([icon, text], i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-2 backdrop-blur-sm"
              >
                <span className="text-sm">{icon}</span>
                <span className="text-white/80 font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-xs sm:text-sm whitespace-nowrap">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-[#0A1628] to-[#0F1F38]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={i}
                className={`py-8 sm:py-10 px-4 text-center ${i < STATS.length - 1 ? 'border-r border-white/8' : ''} ${i === 0 ? '' : 'border-t-0'}`}
              >
                <div className="text-3xl sm:text-4xl mb-2">{s.icon}</div>
                <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl sm:text-4xl text-orange-500 tracking-tight">
                  {s.value}
                </div>
                <div className="text-white/55 text-xs sm:text-sm font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SERVICES
      ════════════════════════════════════════════════════ */}
      <section id="services" className="py-20 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-[#070E1A]/97 via-[#0A1628]/88 to-[#0A1628]/55 ">
        <span id="Services" className="sr-only" aria-hidden="true" />
        <div
          className={`max-w-7xl mx-auto transition-all duration-700 ease-out $  {
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >

          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block bg-cyan-500/8 border border-cyan-500/22 rounded-full px-4 py-1.5 text-cyan-600 font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[11px] tracking-[0.1em] uppercase mb-4">
              CLEAR PRICING • ZERO HIDDEN CHARGES
            </span>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[clamp(26px,4vw,44px)] text-[#253c5f] tracking-tight leading-tight mb-4">
              Our Services —{' '}
              <span className="text-orange-500">Rapid Solutions</span>
              {' '}at Upfront Rates
            </h2>
            <p className="text-slate-500 text-[clamp(14px,2vw,17px)] max-w-lg mx-auto leading-relaxed">
              From emergency leaks to full renovations — certified expertise with a guaranteed quality seal.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {isServicesLoading ? (
              [1, 2, 3, 4, 5, 6].map((n) => <ServiceCardSkeleton key={n} />)
            ) : displayServices.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 text-sm">
                No services available at the moment.
              </div>
            ) : (
              displayServices.map((svc) => (
                <ServiceCard
                  key={svc._id}
                  svc={svc}
                  onBook={() => {
                    if (typeof handleSetSelectedService === 'function') {
                      handleSetSelectedService(svc);
                    } else {
                      dispatch(setSelectedService(svc));
                    }
                    navigate('/customer/booking', {
                      state: {
                        service: svc._id,
                        _id: svc._id,
                        serviceId: svc._id,
                        category: svc.category,
                        serviceName: svc.serviceName,
                      },
                    });
                  }}
                />
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/customer/allServices')}
              className="bg-[#0A1628] text-white border-0 px-9 py-3.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm cursor-pointer  shadow-[0_12px_32px_rgba(0,0,0,0.5)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(10,22,40,0.32)]"
            >
              View Full Pricing Guide →
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-[#0A1628] to-[#0F2A4A]">
        <div
          className={`max-w-5xl mx-auto transition-all duration-700 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-14">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[clamp(26px,4vw,44px)] text-white tracking-tight mb-3">
              How It Works
            </h2>
            <p className="text-white/55 text-[clamp(14px,2vw,17px)]">
              Fix your plumbing troubles in 3 frictionless steps — tracked live on your phone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 relative">
            {STEPS.map((step, idx) => (
              <div key={idx} className="text-center relative">
                {/* Arrow connector desktop only */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-5 text-cyan-500/35 text-3xl z-10">→</div>
                )}
                <div className="w-20 h-20 bg-cyan-500/10 border-2 border-cyan-500/28 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl shadow-[0_0_22px_rgba(0,180,216,0.14)]">
                  {step.icon}
                </div>
                <div className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[11px] text-cyan-400 tracking-[0.12em] uppercase mb-2">
                  STEP {step.step}
                </div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg sm:text-xl text-white mb-2.5">
                  {step.title}
                </h3>
                <p className="text-white/55 text-sm leading-relaxed max-w-[240px] mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              onClick={() => navigate('/customer/booking')}
              className="bg-gradient-to-br from-orange-500 to-orange-700 border-0 text-white px-9 py-4 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] cursor-pointer shadow-[0_0_24px_rgba(255,107,53,0.38)] transition-all duration-250  hover:-translate-y-0.5 hover:shadow-[0_6px_22px_rgba(255,107,50,0.5)]"
            >
              Book Your First Service ⚡
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════════════════ */}


      {/* ════════════════════════════════════════════════════
          TESTIMONIALS (Customer Stories)
      ════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-slate-100">
        <div
          className={`max-w-7xl mx-auto transition-all duration-700 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <span className="inline-block bg-orange-500/8 border border-orange-500/20 rounded-full px-4 py-1.5 text-orange-500 font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[11px] tracking-[0.1em] uppercase mb-4">
              CUSTOMER STORIES
            </span>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[clamp(26px,4vw,44px)] text-[#0A1628] tracking-tight leading-tight">
              Trusted by{' '}
              <span className="text-orange-500">50,000+</span>
              {' '}Happy Homeowners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_44px_rgba(10,22,40,0.1)]"
              >
                <div className="text-amber-400 text-base tracking-[3px] mb-4">★★★★★</div>
                <p className="text-slate-600 text-sm sm:text-[15px] leading-[1.72] mb-6 italic">{r.review}</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#0A1628] to-cyan-500 rounded-full flex items-center justify-center text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm shrink-0">
                    {r.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm text-[#0A1628]">{r.name}</div>
                    <div className="text-xs text-slate-400 truncate">{r.location} · {r.service}</div>
                  </div>
                  <div className="bg-emerald-500/8 border border-emerald-500/22 rounded-full px-2.5 py-1 text-[11px] text-emerald-600 font-bold whitespace-nowrap shrink-0">
                    ✓ Verified
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════ */}
      <section
        id="contact"
        className="relative py-20 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-orange-500 to-orange-700 overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/4 rounded-full" />
        <div
          className={`relative z-10 max-w-2xl mx-auto text-center transition-all duration-700 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[clamp(26px,4vw,48px)] text-white tracking-tight leading-tight mb-4">
            Got a Plumbing Emergency?
          </h2>
          <p className="text-white/85 text-[clamp(14px,2vw,18px)] leading-relaxed mb-10">
            Our certified technicians are on standby 24/7. Book now and get a plumber at your door in under 60 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              onClick={() => navigate('/customer/booking')}
              className="flex items-center justify-center gap-2 bg-white text-orange-500 border-0 px-8 py-4 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-[15px] cursor-pointer shadow-[0_4px_22px_rgba(0,0,0,0.14)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
            >
              Book Now — Free Quote ⚡
            </Link>
            <a
              href="tel:18007586237"
              className="flex items-center justify-center gap-2 bg-white/13 border-2 border-white/48 text-white px-6 py-4 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] no-underline transition-all duration-250 hover:bg-white/20"
            >
              📞 Call 24/7 Helpline
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════ */}
      <footer className="bg-[#070E1A] pt-16 sm:pt-20 pb-8 px-4 sm:px-6 border-t border-cyan-500/12">
        <div
          className={`max-w-7xl mx-auto transition-all duration-700 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12 sm:mb-14">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
      
                <img
                  src="/frrf-logo.png"
                  alt="FRRF Plumbing Services"
                  className="w-28 h-28 sm:w-30 sm:h-30 object-contain  shrink-0"
                />
              
              <p className="text-white/45 text-sm leading-[1.75] max-w-[270px] mb-5">
                India's fastest growing on-demand plumbing network — connecting verified technicians with homeowners 24/7/365.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    title={item.name}
                    className={`w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white/60 transition-all duration-200 cursor-pointer shadow-sm ${item.color} active:scale-95`}
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-white text-sm mb-5">Services</h4>
              <ul className="space-y-2.5">
                {['Leakage Repair', 'Blockage Removal', 'Installation', 'Maintenance', 'Full Renovation'].map(item => (
                  <li key={item}>
                    <Link
                      onClick={() => scrollTo('services')}
                      className="bg-transparent border-0 text-white/45 text-sm cursor-pointer p-0 text-left transition-colors duration-200 hover:text-cyan-400"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-white text-sm mb-5">Company</h4>
              <ul className="space-y-2.5">
                {['About Us', 'Join as Plumber', 'Careers', 'Blog', 'Contact'].map(item => (
                  <li key={item}>
                    <Link
                      onClick={() => item ==='Join as Plumber'? navigate('/technician/technician-register') :
                        item ==='Careers'?navigate('/technician/technician-register') : item ==='About Us'? navigate(`/customer/about`):null}
                      className="bg-transparent border-0 text-white/45 text-sm cursor-pointer p-0 transition-colors duration-200 hover:text-cyan-400"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-white text-sm mb-5">Contact Us</h4>
              <div className="space-y-4">
                {[
                  ['📞', '24/7 Helpline', '1800-FRRF-Plumbing'],
                  ['📧', 'Email Support', 'help@frrfplumbing.in'],
                  ['📍', 'Coverage', 'Burhanpur · Khargone · Jalgoan'],
                ].map(([icon, label, val], i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <span className="text-sm mt-0.5 shrink-0">{icon}</span>
                    <div>
                      <div className="text-white/35 text-[10px] uppercase tracking-[0.06em] mb-0.5">{label}</div>
                      <div className="text-white/72 text-sm font-medium">{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <p className="text-white/30 text-xs">
              © 2025 FRRF Plumbing Services. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {['Terms of Service', 'Privacy Policy', 'Safety Guarantee'].map(item => (
                <Link
                  key={item}
                  className="bg-transparent border-0 text-white/30 text-xs cursor-pointer transition-colors duration-200 hover:text-cyan-400"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SERVICE CARD — Rendered strictly using Redux Service Details
══════════════════════════════════════════════════════════════ */
function ServiceCard({ svc, onBook }) {
  const [hovered, setHovered] = useState(false);

  const style = getCategoryStyle(svc?.category);
  const imgUrl =
    svc?.serviceImg?.[0]?.url ||
    (typeof svc?.serviceImg?.[0] === 'string' ? svc.serviceImg[0] : null) ||
    '/images/leakage.png';

  const priceAmount =
    typeof svc?.price === 'object'
      ? svc.price?.amount
      : Number(svc?.price) || 0;
  const currencySymbol =
    typeof svc?.price === 'object' && svc.price?.currency === 'USD' ? '$' : '₹';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 cursor-default
        ${hovered
          ? 'border border-cyan-400/38 rounded-2xl hover:shadow-[0_20px_50px_rgba(0,180,216,0.22)] backdrop-blur-2xl transition-all duration-300 -translate-y-1.5'
          : 'border border-slate-100 shadow-sm'
        }`}
    >
      {/* Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-gradient-to-br from-[#0A1628] to-[#0F2A4A]">
        <img
          src={imgUrl}
          alt={svc?.serviceName || 'Plumbing Service'}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-[1.07]' : 'scale-100'}`}
          onError={e => {
            e.target.onerror = null;
            e.target.src = '/images/leakage.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070E1A]/60 via-transparent to-transparent" />

        {/* Category Tag from Redux Category */}
        {svc?.category && (
          <div className={`absolute top-3 left-3 ${style.tagBg} rounded-full px-3 py-1 text-[11px] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-white tracking-wide shadow-md flex items-center gap-1`}>
            <span>{style.icon}</span>
            <span>{svc.category}</span>
          </div>
        )}

        {/* Category Icon */}
        <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-lg border border-white/18">
          {style.icon}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px] text-[#0A1628] mb-1.5">
            {svc?.serviceName}
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            Category: <span className="text-slate-600 font-semibold">{svc?.category}</span>
          </p>

          {/* Details strictly from Redux Service Object */}
          <ul className="space-y-1.5 mb-5">
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <span className="text-emerald-500 font-bold shrink-0 mt-px">✓</span>
              Estimated Duration: ~{svc?.EstimatedTimeMinutes || 45} mins
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <span className="text-emerald-500 font-bold shrink-0 mt-px">✓</span>
              Inspection &amp; Visit Charge: ₹{svc?.visitCharge || 0}
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <span className="text-emerald-500 font-bold shrink-0 mt-px">✓</span>
              {svc?.isActive ? 'Active & Verified for Rapid Dispatch' : 'Standard Service Request'}
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2 flex-wrap">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.05em] mb-0.5">Price</div>
            <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[17px] text-orange-500">
              {priceAmount > 0 ? `Starting ${currencySymbol}${priceAmount}` : 'As Per Work'}
            </div>
          </div>
          <Link
            onClick={onBook}
            className={`border-0 text-white px-4 py-2.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs cursor-pointer transition-all duration-250 whitespace-nowrap
              ${hovered
                ? 'bg-gradient-to-br from-orange-500 to-orange-700 shadow-[0_4px_14px_rgba(255,107,53,0.32)]'
                : 'bg-[#0A1628]'
              }`}
          >
            Book Now →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SERVICE CARD SKELETON LOADER — Matching Exact Card Proportions
══════════════════════════════════════════════════════════════ */
function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col border border-slate-100 shadow-sm animate-pulse cursor-default">
      {/* Top Banner Skeleton */}
      <div className="relative h-48 sm:h-52 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
        {/* Shimmer line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />

        {/* Tag Skeleton */}
        <div className="absolute top-3 left-3 w-20 h-5 bg-slate-300/80 rounded-full" />

        {/* Icon Circle Skeleton */}
        <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/40 backdrop-blur-sm rounded-full" />
      </div>

      {/* Body Skeleton */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Title Placeholder */}
          <div className="h-5 bg-slate-200 rounded-md w-3/4 mb-2.5" />

          {/* Subtitle Placeholder */}
          <div className="h-3.5 bg-slate-100 rounded-md w-full mb-1.5" />
          <div className="h-3.5 bg-slate-100 rounded-md w-2/3 mb-5" />

          {/* Features Bullets Placeholders */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-200/80 shrink-0" />
              <div className="h-3 w-4/5 bg-slate-100 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-200/80 shrink-0" />
              <div className="h-3 w-3/4 bg-slate-100 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-200/80 shrink-0" />
              <div className="h-3 w-2/3 bg-slate-100 rounded" />
            </div>
          </div>
        </div>

        {/* Footer: Price & CTA Button Placeholders */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <div className="h-2.5 w-10 bg-slate-200 rounded mb-1.5" />
            <div className="h-5 w-24 bg-orange-200/90 rounded-md" />
          </div>
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
