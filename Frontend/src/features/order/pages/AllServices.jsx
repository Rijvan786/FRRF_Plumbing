import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../../../App/Navbar.jsx';
import { useOrder } from '../hook/useOrder.jsx';
import { setSelectedService } from '../state/order.slice.jsx';

/* ── Category Color Mapping (Dynamic styling per category) ── */
const getCategoryStyle = (category = '') => {
  const cat = String(category).toLowerCase().trim();
  if (cat.includes('leak')) {
    return {
      badge: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
      pill: 'bg-orange-500',
      icon: '💧',
      accent: 'text-orange-400',
    };
  }
  if (cat.includes('block')) {
    return {
      badge: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
      pill: 'bg-cyan-500',
      icon: '🔧',
      accent: 'text-cyan-400',
    };
  }
  if (cat.includes('install')) {
    return {
      badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      pill: 'bg-emerald-500',
      icon: '⚙️',
      accent: 'text-emerald-400',
    };
  }
  if (cat.includes('inspect')) {
    return {
      badge: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
      pill: 'bg-blue-500',
      icon: '🔍',
      accent: 'text-blue-400',
    };
  }
  if (cat.includes('full') || cat.includes('setup')) {
    return {
      badge: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      pill: 'bg-amber-500',
      icon: '🏗️',
      accent: 'text-amber-400',
    };
  }
  if (cat.includes('maint')) {
    return {
      badge: 'bg-violet-500/15 border-violet-500/30 text-violet-400',
      pill: 'bg-violet-500',
      icon: '🛡️',
      accent: 'text-violet-400',
    };
  }
  if (cat.includes('sos') || cat.includes('emerg')) {
    return {
      badge: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      pill: 'bg-rose-500',
      icon: '🚨',
      accent: 'text-rose-400',
    };
  }
  return {
    badge: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
    pill: 'bg-cyan-500',
    icon: '🛠️',
    accent: 'text-cyan-400',
  };
};

export default function AllServices() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Purely using handleGetallService and Redux state from useOrder
  const { handleGetallService } = useOrder();

  // 4-Layer Architecture: Direct Redux Selectors from state.order (Layer 3: State Management)
  const reduxServices = useSelector((state) => state.order?.services || []);
  const reduxOrders = useSelector((state) => state.order?.orders || state.order?.item || []);
  const reduxSelectedService = useSelector((state) => state.order?.selectedService || null);
  const reduxLoading = useSelector((state) => state.order?.loading || false);
  const reduxError = useSelector((state) => state.order?.error || null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'under500', '500to1500', 'above1500'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price-low', 'price-high', 'time'
  const [detailModalService, setDetailModalService] = useState(null);

  // Fetch real data on mount using handleGetallService from useOrder (saves directly to Redux)
  useEffect(() => {
    handleGetallService().catch((err) => {
      console.error('Error fetching services with handleGetallService:', err);
    });
  }, []);

  // Extract distinct categories and their counts directly from real Redux services
  const categoryCounts = useMemo(() => {
    const counts = { All: reduxServices.length };
    reduxServices.forEach((s) => {
      const cat = s.category ? s.category.trim() : 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [reduxServices]);

  const categories = useMemo(() => {
    return Object.keys(categoryCounts);
  }, [categoryCounts]);

  // Filter & Sort strictly based on real Redux services
  const filteredServices = useMemo(() => {
    return reduxServices
      .filter((service) => {
        // Category filter
        const matchesCategory =
          selectedCategory === 'All' ||
          (service.category &&
            service.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim());

        // Search filter
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          (service.serviceName && service.serviceName.toLowerCase().includes(query)) ||
          (service.category && service.category.toLowerCase().includes(query));

        // Price range filter
        const amount =
          typeof service.price === 'object'
            ? service.price?.amount || 0
            : Number(service.price) || 0;

        let matchesPrice = true;
        if (priceFilter === 'under500') matchesPrice = amount < 500;
        else if (priceFilter === '500to1500') matchesPrice = amount >= 500 && amount <= 1500;
        else if (priceFilter === 'above1500') matchesPrice = amount > 1500;

        return matchesCategory && matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        const priceA =
          typeof a.price === 'object' ? a.price?.amount || 0 : Number(a.price) || 0;
        const priceB =
          typeof b.price === 'object' ? b.price?.amount || 0 : Number(b.price) || 0;
        const timeA = a.EstimatedTimeMinutes || 45;
        const timeB = b.EstimatedTimeMinutes || 45;

        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        if (sortBy === 'time') return timeA - timeB;
        return 0;
      });
  }, [reduxServices, selectedCategory, searchQuery, priceFilter, sortBy]);

  // Action: Book Service -> passes real service object & _id to /customer/booking
  const onBookService = (service) => {
    dispatch(setSelectedService(service));
    navigate('/customer/booking', {
      state: {
        _id: service._id,
        serviceId: service._id,
        service: service,
        category: service.category,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#070E1A]/97 via-[#0A1628]/88 to-[#0A1628]/55 text-white font-['Inter',sans-serif] selection:bg-orange-500 selection:text-white relative overflow-x-hidden">
      {/* ── Ambient Glow Backgrounds ── */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-20"
        style={{ backgroundImage: `url('/images/hero-bg.png')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#070E1A]/95 via-[#0A1628]/90 to-[#0A1628]/80 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Global Top Navbar */}
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24">
        {/* ══════════════════════════════════════════════════════════
            HERO HEADER
        ══════════════════════════════════════════════════════════ */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-emerald-400 font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs uppercase tracking-wider">
              Work 1st Policy · Live Services Directory
            </span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight mb-4">
            All Plumbing <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Services</span>
          </h1>

          <p className="text-white/60 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
            Real services and upfront pricing powered by certified master plumbers. Select any service to book instant doorstep assistance.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-white/50 font-medium">
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
              <span>🛠️</span> {reduxServices.length} Live Services
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
              <span>⚡</span> 18-Min Dispatch
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
              <span>⭐</span> 4.9★ Customer Rating
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
              <span>🛡️</span> 30-Day Guarantee
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            SEARCH, FILTER & CONTROLS TOOLBAR
        ══════════════════════════════════════════════════════════ */}
        <div className="bg-[#0A1628]/90 border border-white/10 rounded-2xl p-4 sm:p-5 mb-8 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search by serviceName or category */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-base">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g. Tape Leakage, Blockage, Installation)..."
              className="w-full bg-[#101C30]/90 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-white text-xs sm:text-sm placeholder-white/30 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Price Filters */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Rates' },
              { id: 'under500', label: '< ₹500' },
              { id: '500to1500', label: '₹500 - ₹1.5k' },
              { id: 'above1500', label: '₹1.5k+' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriceFilter(p.id)}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  priceFilter === p.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-[#101C30] text-white/50 hover:text-white border border-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Sort & Refresh controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#101C30] border border-white/10 rounded-xl px-3.5 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 font-medium cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="time">Estimated Duration</option>
            </select>

     
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            DYNAMIC CATEGORY PILLS (With live real counts)
        ══════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-4 mb-8 sm:mb-10 no-scrollbar">
          {categories.map((cat) => {
            const style = getCategoryStyle(cat);
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            const count = categoryCounts[cat] || 0;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-['Plus_Jakarta_Sans',sans-serif] font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_20px_rgba(255,107,53,0.4)] scale-105'
                    : 'bg-[#0B1528] text-white/60 hover:text-white hover:bg-[#101C30] border border-white/10'
                }`}
              >
                <span>{cat === 'All' ? '✨' : style.icon}</span>
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════
            SERVICES GRID (Purely from handleGetallService)
        ══════════════════════════════════════════════════════════ */}
        {reduxLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-[#0B1528]/80 border border-white/10 rounded-2xl p-4 h-80 animate-pulse flex flex-col justify-between"
              >
                <div className="h-44 bg-white/5 rounded-xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
                <div className="h-10 bg-white/10 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {!reduxLoading && filteredServices.length === 0 && (
          <div className="py-16 px-4 text-center bg-[#0B1528]/70 border border-white/10 rounded-3xl backdrop-blur-xl max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-3xl mx-auto mb-4 text-orange-400 shadow-[0_0_20px_rgba(255,107,53,0.3)]">
              🛠️
            </div>
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-xl text-white mb-2">
              No Services Found
            </h3>
            <p className="text-white/50 text-xs sm:text-sm mb-6">
              {searchQuery
                ? `No service matches "${searchQuery}".`
                : 'No services available with the selected filters.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setPriceFilter('all');
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-xs sm:text-sm shadow-lg cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {!reduxLoading && filteredServices.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredServices.map((service) => {
              // Extract strictly according to schema:
              const amount =
                typeof service.price === 'object'
                  ? service.price?.amount || 0
                  : Number(service.price) || 0;

              const currency =
                typeof service.price === 'object'
                  ? service.price?.currency || 'INR'
                  : 'INR';

              const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';

              // Image URL strictly from serviceImg[0].url
              const imgUrl =
                service.serviceImg?.[0]?.url ||
                service.serviceImg?.[0] ||
                '/images/leakage.png';

              const estTime = service.EstimatedTimeMinutes || 45;
              const visitCharge = service.visitCharge || 0;
              const style = getCategoryStyle(service.category);

              return (
                <div
                  key={service._id}
                  className="bg-gradient-to-b from-[#0B1528]/95 to-[#0A1628]/95 hover:from-[#0E1A33] hover:to-[#0C1B35] border border-white/10 hover:border-cyan-400/50 rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(0,180,216,0.22)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group backdrop-blur-xl"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#0A1628] to-[#0F2A4A]">
                    <img
                      src={imgUrl}
                      alt={service.serviceName}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/images/leakage.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/40 to-transparent" />

                    {/* Category Badge Top Left */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`${style.pill} text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1`}
                      >
                        <span>{style.icon}</span>
                        <span>{service.category}</span>
                      </span>
                    </div>

                    {/* Quick View / Inspect Trigger Top Right */}
                    <button
                      type="button"
                      onClick={() => setDetailModalService(service)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white/80 hover:text-white flex items-center justify-center text-xs transition-all shadow-md cursor-pointer hover:scale-110"
                      title="Quick View Details"
                    >
                      👁️
                    </button>

                    {/* Bottom overlay: Estimated Arrival / Time */}
                    <div className="absolute bottom-2.5 left-3 text-[11px] text-white/80 font-semibold bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      ⚡ ~{estTime} mins service
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {service.serviceName}
                      </h3>
                      <p className="text-white/40 text-xs mt-0.5 font-medium">
                        Category: <span className="text-white/70">{service.category}</span>
                      </p>
                    </div>

                    {/* Price and Visit Charge */}
                    <div className="pt-3.5 mt-3.5 border-t border-white/10">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                            Fixed Rate
                          </div>
                          <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl text-orange-500 leading-tight">
                            {symbol}{amount}
                          </div>
                        </div>

                        {visitCharge > 0 && (
                          <div className="text-right">
                            <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                              Visit Charge
                            </div>
                            <div className="text-xs font-bold text-cyan-300">
                              +₹{visitCharge}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CTA Buttons Row */}
                      <div className="grid grid-cols-5 gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailModalService(service)}
                          className="col-span-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white font-bold text-xs transition-all cursor-pointer text-center"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => onBookService(service)}
                          className="col-span-3 flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs py-2.5 rounded-xl shadow-[0_4px_20px_rgba(255,107,53,0.35)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                        >
                          <span>Book</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            BOTTOM BANNER: EMERGENCY SOS & 24/7 SUPPORT
        ══════════════════════════════════════════════════════════ */}
        <div className="mt-16 sm:mt-20 bg-gradient-to-r from-rose-950/40 via-[#0E1E38] to-[#0A1628] border border-rose-500/30 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-lg">
              🚨
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-xl sm:text-2xl text-white">
                Need Emergency Plumbing Dispatch Right Now?
              </h3>
              <p className="text-white/60 text-xs sm:text-sm mt-1 max-w-xl">
                Burst pipe or major drainage overflow? Our priority response team arrives within 15–20 minutes with zero waiting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <a
              href="tel:+919876543210"
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm px-6 py-3.5 rounded-xl shadow-[0_0_24px_rgba(225,29,72,0.4)] transition-all no-underline"
            >
              <span>📞</span>
              <span>Call Emergency Plumber</span>
            </a>
            <Link
              to="/customer/booking"
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm px-6 py-3.5 rounded-xl transition-all no-underline"
            >
              <span>Quick Booking</span>
            </Link>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════
          QUICK VIEW SERVICE DETAILS MODAL
      ══════════════════════════════════════════════════════════ */}
      {detailModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1528] border border-white/15 rounded-3xl w-full max-w-lg shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden">
            {/* Modal Image */}
            <div className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden">
              <img
                src={
                  detailModalService.serviceImg?.[0]?.url ||
                  detailModalService.serviceImg?.[0] ||
                  '/images/leakage.png'
                }
                alt={detailModalService.serviceName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent" />
              <button
                type="button"
                onClick={() => setDetailModalService(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer border border-white/20"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-4">
                <span
                  className={`${
                    getCategoryStyle(detailModalService.category).pill
                  } text-white font-bold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md`}
                >
                  {detailModalService.category}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-xl text-white mb-2">
                {detailModalService.serviceName}
              </h2>

              <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-6">
                Certified plumbing technician dispatched to your address with specialized diagnostics and repair equipment. Quality workmanship backed by our Work 1st Policy.
              </p>

              {/* Price Breakdown Card */}
              <div className="bg-[#101C30] border border-white/10 rounded-2xl p-4 mb-6 space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm text-white/70">
                  <span>Standard Labor Rate:</span>
                  <span className="font-bold text-white">
                    ₹{typeof detailModalService.price === 'object' ? detailModalService.price?.amount : detailModalService.price}
                  </span>
                </div>
                {detailModalService.visitCharge > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm text-white/70">
                    <span>Doorstep Visit / Inspection Fee:</span>
                    <span className="font-bold text-cyan-300">
                      +₹{detailModalService.visitCharge}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs sm:text-sm text-white/70">
                  <span>Estimated Service Duration:</span>
                  <span className="font-bold text-emerald-400">
                    ~{detailModalService.EstimatedTimeMinutes || 45} mins
                  </span>
                </div>
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between font-['Plus_Jakarta_Sans',sans-serif] font-black text-sm sm:text-base text-white">
                  <span>Starting Estimate:</span>
                  <span className="text-orange-500 text-lg sm:text-xl">
                    ₹
                    {(typeof detailModalService.price === 'object'
                      ? detailModalService.price?.amount || 0
                      : Number(detailModalService.price) || 0) +
                      (detailModalService.visitCharge || 0)}
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDetailModalService(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const svc = detailModalService;
                    setDetailModalService(null);
                    onBookService(svc);
                  }}
                  className="flex-2 py-3 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(255,107,53,0.4)] transition-all cursor-pointer text-center"
                >
                  Book This Service Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

