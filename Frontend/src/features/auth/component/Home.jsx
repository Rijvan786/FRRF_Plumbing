import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../../../App/Navbar.jsx"


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

/* ── Data ───────────────────────────────────────────────────── */
const SERVICES = [
  {
    id: 'leakage',
    title: 'Leakage Repair',
    subtitle: 'Tap, Pipe Joints, Flush Tank & Concealed Drips',
    price: 'Starting ₹200',
    tag: 'Most Booked',
    tagBg: 'bg-orange-500',
    icon: '💧',
    image: '/images/leakage.png',
    features: ['Tap Leakage Repair — ₹200', 'Pipe Fixing — ₹500–₹5,000', 'Flush Tank/Commode — ₹1,000'],
  },
  {
    id: 'blockage',
    title: 'Blockage Removal',
    subtitle: 'Kitchen Sink, Wash Basin, Clogged Toilet & Sewer',
    price: 'Starting ₹500',
    tag: '24/7 Service',
    tagBg: 'bg-cyan-500',
    icon: '🔧',
    image: '/images/blockage.png',
    features: ['Kitchen Sink Blockage — ₹500', 'Wash Basin Blockage — ₹500', 'Toilet/Commode — ₹2,000'],
  },
  {
    id: 'installation',
    title: 'Installation',
    subtitle: 'Tank, Tap/Mixer, Geyser, Water Motor & Wash Basin',
    price: 'Starting ₹200',
    tag: 'ISO Certified',
    tagBg: 'bg-emerald-500',
    icon: '⚙️',
    image: '/images/installation.png',
    features: ['Main Tank Fitting — ₹1,000', 'Tap/Mixer — ₹1,000', 'Geyser Install — ₹200', 'Water Pump — ₹300–₹500'],
  },
  {
    id: 'maintenance',
    title: 'Maintenance & Inspection',
    subtitle: 'Annual Audit, Tank Cleaning, Jet Spray & Pipe Scan',
    price: 'Starting ₹500',
    tag: 'Preventive',
    tagBg: 'bg-violet-500',
    icon: '🛡️',
    image: '/images/maintenance.png',
    features: ['Water Tank Cleaning — ₹500', 'Health Faucet Repair — ₹200', 'General Inspection — ₹2,000+'],
  },
  {
    id: 'fullsetup',
    title: 'Full Setup / Renovation',
    subtitle: 'New Home, Complete Bathroom & Kitchen Plumbing',
    price: 'As per Work',
    tag: 'Premium',
    tagBg: 'bg-amber-500',
    icon: '🏗️',
    image: '/images/fullsetup.png',
    features: ['New Home Plumbing', 'Complete Bathroom Renovation', 'Full Kitchen Setup', 'Old Pipeline Replacement'],
  },
  {
    id: 'inception',
    title: 'General Inspection',
    subtitle: 'Complete Plumbing Health Check & Diagnosis',
    price: 'Min ₹2,000',
    tag: 'Recommended',
    tagBg: 'bg-blue-500',
    icon: '🔍',
    image: '/images/inspection.png',
    features: ['Full Pipe Network Check', 'Pressure Testing', 'Digital Health Report'],
  },
];

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

const WHY = [
  { icon: '🏅', title: 'Certified Plumbers', desc: '100% background-checked, licensed master technicians with 5+ years experience.' },
  { icon: '⚡', title: 'Fastest Response', desc: 'Average 18-minute arrival for critical leaks and emergency bursts — any hour.' },
  { icon: '💰', title: 'Transparent Pricing', desc: 'Upfront itemised estimates before work starts. Zero hidden fees, zero surprises.' },
  { icon: '🔄', title: '30-Day Warranty', desc: "Free rework guarantee for 30 days if anything isn't running perfectly after service." },
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

const NAV_LINKS = [
  ['Home', 'home'],
  ['Services', 'services'],
  ['About', 'about'],
  ['Contact', 'contact'],
  ['Get Job','job']
];

/* ══════════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════════ */
export default function   Home() {
  useGoogleFonts();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

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
            {SERVICES.map(svc => (
              <ServiceCard key={svc.id} svc={svc} onBook={() => navigate('/customer/booking', { state: { service: svc.id } })} />
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/customer/allServices')}
              className="bg-[#0A1628] text-white border-0 px-9 py-3.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm cursor-pointer shadow-[0_4px_18px_rgba(10,22,40,0.22)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(10,22,40,0.32)]"
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
      <section id="about" className="py-20 sm:py-24 px-4 sm:px-6 bg-white">
        <div
          className={`max-w-7xl mx-auto transition-all duration-700 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[clamp(26px,4vw,44px)] text-[#0A1628] tracking-tight leading-tight mb-3">
              Why Homeowners Choose{' '}
              <span className="text-cyan-500">FRRF Plumbing Services</span>
            </h2>
            <p className="text-slate-500 text-[clamp(14px,2vw,17px)] max-w-md mx-auto leading-relaxed">
              We don't just fix pipes — we build lasting trust with every service call.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {WHY.map((w, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 transition-all duration-300 shadow-sm hover:-translate-y-1.5 hover:shadow-[0_14px_36px_rgba(0,180,216,0.11),0_0_0_1px_rgba(0,180,216,0.18)] cursor-default"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/10 to-blue-600/8 border border-cyan-500/18 rounded-2xl flex items-center justify-center text-2xl mb-5">
                  {w.icon}
                </div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px] text-[#0A1628] mb-2">
                  {w.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              <div className="flex gap-2.5">
                {['📘', '📸', '💬', '🐦'].map((icon, i) => (
                  <button
                    key={i}
                    className="w-9 h-9 bg-white/5 border border-white/8 rounded-lg flex items-center justify-center text-base cursor-pointer transition-all duration-200 hover:bg-cyan-500/14 hover:border-cyan-500/28"
                  >
                    {icon}
                  </button>
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
                      onClick={() => item === 'Join as Plumber' ? navigate('/technician/technician-register') : null}
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
                  ['📞', '24/7 Helpline', '1800-FRRF-PLUMB'],
                  ['📧', 'Email Support', 'help@frrfplumbing.in'],
                  ['📍', 'Coverage', 'Mumbai · Delhi · Bangalore'],
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
   SERVICE CARD — Tailwind-powered
══════════════════════════════════════════════════════════════ */
function ServiceCard({ svc, onBook }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 cursor-default
        ${hovered
          ? 'border border-cyan-400/38 -translate-y-1.5 shadow-[0_22px_50px_rgba(10,22,40,0.12),0_0_0_1px_rgba(0,180,216,0.18)]'
          : 'border border-slate-100 shadow-sm'
        }`}
    >
      {/* Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-gradient-to-br from-[#0A1628] to-[#0F2A4A]">
        <img
          src={svc.image}
          alt={svc.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-[1.07]' : 'scale-100'}`}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070E1A]/60 via-transparent to-transparent" />

        {/* Tag */}
        <div className={`absolute top-3 left-3 ${svc.tagBg} rounded-full px-3 py-1 text-[11px] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-white tracking-wide`}>
          {svc.tag}
        </div>
        {/* Icon */}
        <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-lg border border-white/18">
          {svc.icon}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px] text-[#0A1628] mb-1.5">
          {svc.title}
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed mb-4">{svc.subtitle}</p>

        <ul className="space-y-1.5 mb-5 flex-1">
          {svc.features.slice(0, 3).map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <span className="text-emerald-500 font-bold shrink-0 mt-px">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2 flex-wrap">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.05em] mb-0.5">Price</div>
            <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[17px] text-orange-500">
              {svc.price}
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
