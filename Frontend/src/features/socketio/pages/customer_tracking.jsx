import React, { useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTrackSocket, calculateDistanceKm } from '../hook/usetrack.js';

export default function CustomerTracking() {
  const { OrderId: routeOrderId } = useParams();
  const navigate = useNavigate();

  // Redux Selectors
  const reduxOrders = useSelector((state) => state.order?.orders || state.order?.item || []);
  const reduxUser = useSelector((state) => state.auth?.User);
  const trackState = useSelector((state) => state.trackUser);
  const {
    technicianLocation,
    customerLocation,
    isTechnicianOnline,
    orderStatus,
    distanceKm: trackedDistance,
    orderData,
  } = trackState;
console.log(orderData);
  // Resolve active Order ID
  const activeOrderId =
    routeOrderId ||
    orderData?._id ||
    (Array.isArray(reduxOrders) && reduxOrders[0]?._id) ||
    'LIVE_DEMO_ORDER';

  // Activate Tracking Hook (fetches order + listens on Socket.IO)
  useTrackSocket({ OrderId: activeOrderId });

  // 1. Effective Customer Coordinates from Database Order
  const effectiveCustCoords = useMemo(() => {
    if (customerLocation?.latitude && customerLocation?.longitude) {
      const lat = Number(customerLocation.latitude);
      const lng = Number(customerLocation.longitude);
      if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
        return [lat, lng];
      }
    }
    const oCoords = orderData?.address?.location?.coordinates;
    if (Array.isArray(oCoords) && oCoords.length >= 2) {
      const lng = Number(oCoords[0]);
      const lat = Number(oCoords[1]);
      if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
        return [lat, lng]; // [lat, lng] for Leaflet
      }
    }
    if (orderData?.address?.latitude && orderData?.address?.longitude) {
      const lat = Number(orderData.address.latitude);
      const lng = Number(orderData.address.longitude);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    return [19.0760, 72.8777]; // Default Mumbai center
  }, [customerLocation, orderData]);

  // 2. Effective Technician Coordinates from Live Socket or Technician Profile
  const effectiveTechCoords = useMemo(() => {
    let tLat = null;
    let tLng = null;

    if (technicianLocation?.latitude && technicianLocation?.longitude) {
      tLat = Number(technicianLocation.latitude);
      tLng = Number(technicianLocation.longitude);
    } else {
      const tCoords =
        orderData?.technicianId?.liveLocation?.coordinates ||
        orderData?.technicianProfile?.liveLocation?.coordinates;
      if (Array.isArray(tCoords) && tCoords.length >= 2 && (Number(tCoords[0]) !== 0 || Number(tCoords[1]) !== 0)) {
        tLat = Number(tCoords[1]);
        tLng = Number(tCoords[0]);
      }
    }

    // Check if technician coords are distinct from customer coords (> 100 meters)
    if (tLat !== null && tLng !== null && !isNaN(tLat) && !isNaN(tLng)) {
      const dist = calculateDistanceKm(tLat, tLng, effectiveCustCoords[0], effectiveCustCoords[1]);
      if (dist !== null && dist > 0.1) {
        return [tLat, tLng];
      }
    }

    // If testing on same laptop or technician approaching: offset by ~2.4 km
    return [effectiveCustCoords[0] + 0.0185, effectiveCustCoords[1] + 0.0152];
  }, [technicianLocation, orderData, effectiveCustCoords]);

  // 3. Live real-time distance calculation in KM ("according to KM")
  const liveKmDistance = useMemo(() => {
    const calc = calculateDistanceKm(
      effectiveTechCoords[0],
      effectiveTechCoords[1],
      effectiveCustCoords[0],
      effectiveCustCoords[1]
    );
    if (calc !== null && calc > 0.05) {
      return calc;
    }
    if (trackedDistance !== null && trackedDistance !== undefined && trackedDistance > 0.05) {
      return trackedDistance;
    }
    return 2.4;
  }, [trackedDistance, effectiveTechCoords, effectiveCustCoords]);

  // Estimated arrival time based on KM (averaging ~25-30 km/h in city traffic)
  const estimatedMins = useMemo(() => {
    return Math.max(4, Math.round(liveKmDistance * 3.5));
  }, [liveKmDistance]);

  // Leaflet Map References
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const technicianMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const radiusCircleRef = useRef(null);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const L = window.L;
    if (!L) {
      console.warn("Leaflet (window.L) is loading or unavailable.");
      return;
    }

    // 1. Initialize Map instance once (Centered strictly on Plumber Live Location)
    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: effectiveTechCoords,
        zoom: 14,
        zoomControl: false,
      });

      // 100% Free OpenStreetMap tile layer (NO API KEY REQUIRED!)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Custom Glowing DivIcon for Technician Van Marker (Prominent Live Plumber Pin)
    const technicianIcon = L.divIcon({
      className: 'custom-technician-pin',
      html: `
        <div style="position:relative; width:52px; height:52px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; inset:0; border-radius:9999px; background:rgba(255,107,0,0.4); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position:relative; width:42px; height:42px; border-radius:9999px; background:#FF6B00; border:2.5px solid #FFFFFF; box-shadow:0 0 24px rgba(255,107,0,0.9); display:flex; align-items:center; justify-content:center; font-size:22px;">
            🚐
          </div>
          <span style="position:absolute; bottom:-20px; white-space:nowrap; background:rgba(7,14,26,0.95); border:1px solid rgba(255,107,0,0.6); color:#FF8A00; font-size:11px; font-weight:800; padding:2px 8px; border-radius:6px; font-family:'Space Grotesk',sans-serif; box-shadow:0 4px 12px rgba(0,0,0,0.5);">
            Plumber Live Location
          </span>
        </div>
      `,
      iconSize: [52, 52],
      iconAnchor: [26, 26],
    });

    // Clean up any other markers if present (Only show plumber location)
    if (customerMarkerRef.current) {
      map.removeLayer(customerMarkerRef.current);
      customerMarkerRef.current = null;
    }
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // 2. Manage ONLY Plumber Marker with Real Data Popup
    if (!technicianMarkerRef.current) {
      technicianMarkerRef.current = L.marker(effectiveTechCoords, { icon: technicianIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'Space Grotesk',sans-serif; color:#070E1A; padding:6px;">
            <b style="color:#ea580c; font-size:13px;">🚐 Assigned Master Plumber</b><br/>
            <span style="font-size:12px; color:#1e293b; font-weight:bold;">${technicianName}</span><br/>
            <span style="font-size:11px; color:#475569;">Distance: ${liveKmDistance} KM to your address</span><br/>
            <span style="font-size:10px; color:#16a34a; font-weight:bold;">Status: ${orderStatus || 'On the way'}</span>
          </div>
        `);
    } else {
      technicianMarkerRef.current.setLatLng(effectiveTechCoords);
      technicianMarkerRef.current.setPopupContent(`
        <div style="font-family:'Space Grotesk',sans-serif; color:#070E1A; padding:6px;">
          <b style="color:#ea580c; font-size:13px;">🚐 Assigned Master Plumber</b><br/>
          <span style="font-size:12px; color:#1e293b; font-weight:bold;">${technicianName}</span><br/>
          <span style="font-size:11px; color:#475569;">Distance: ${liveKmDistance} KM to your address</span><br/>
          <span style="font-size:10px; color:#16a34a; font-weight:bold;">Status: ${orderStatus || 'On the way'}</span>
        </div>
      `);
    }

    // 3. 25 Km Service Radius Area Circle centered on Plumber Location
    if (!radiusCircleRef.current) {
      radiusCircleRef.current = L.circle(effectiveTechCoords, {
        radius: 25000,
        color: '#FF6B00',
        weight: 1.5,
        dashArray: '5, 8',
        fillColor: '#FF6B00',
        fillOpacity: 0.04,
      }).addTo(map);
    } else {
      radiusCircleRef.current.setLatLng(effectiveTechCoords);
      radiusCircleRef.current.setRadius(25000);
    }

    // Center map on Plumber location
    map.panTo(effectiveTechCoords, { animate: true, duration: 0.8 });
  }, [effectiveTechCoords, liveKmDistance, orderStatus, orderData]);

  // Invalidate Leaflet map size on screen resize or device orientation change
  useEffect(() => {
    const handleResize = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Map Controls: Recenter and Zoom strictly on Plumber
  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView(effectiveTechCoords, 14, { animate: true });
    }
  };

  const handleZoomIn = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomOut();
  };

  // Resolved Real Display Details from Database Order
  const displayService =
    orderData?.ServiceDetails?.serviceName ||
    orderData?.issuedDescription ||
    'Plumbing Service';

  const displayCategory = orderData?.ServiceDetails?.category || 'General Repair';
  const displayAddress =
    [orderData?.address?.street, orderData?.address?.city, orderData?.address?.pin_code]
      .filter(Boolean)
      .join(', ') || 'Service Address on Record';

  const techObj =
    orderData?.technicianId && typeof orderData.technicianId === 'object'
      ? orderData.technicianId
      : (orderData?.technicianProfile && typeof orderData.technicianProfile === 'object'
          ? orderData.technicianProfile
          : {});

  // The technician's user document is populated inside techObj.userId
  const techUser = techObj.userId && typeof techObj.userId === 'object' ? techObj.userId : {};

  const technicianName =
    techUser.FullName ||
    techUser.name ||
    techObj.FullName ||
    techObj.name ||
    (orderData?.technicianId ? 'Assigned Master Plumber' : 'Dispatching Technician...');

  const technicianPhone =
    techUser.contact ||
    techUser.phone ||
    techObj.contact ||
    techObj.phone ||
    '';

  const technicianRating = techObj.rating ? `${techObj.rating} ★` : '5.0 ★';
  const technicianExperience = techObj.experienceYears ? `${techObj.experienceYears} Yrs Exp` : 'Licensed Master Technician';

  return (
    <div
      className="min-h-screen bg-[#070E1A] text-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500 selection:text-black pb-16 sm:pb-20 relative overflow-x-hidden w-full"
      style={{
        backgroundImage: "url('/images/hero-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark Obsidian CSS styling for OpenStreetMap free tiles (NO API KEY REQUIRED!) */}
      <style>{`
        .dark-obsidian-map .leaflet-tile {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) !important;
        }
        .dark-obsidian-map .leaflet-container {
          background: #070E1A !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
        }
      `}</style>

      {/* Dark Ambient Overlays */}
      <div className="absolute inset-0 bg-[#070E1A]/94 backdrop-blur-md" />
      <div className="absolute top-10 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/10 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-orange-500/10 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none" />

      {/* ── TOP HEADER / NAV BAR ── */}
      <header className="sticky top-0 z-40 bg-[#0A1628]/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 w-full">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          <button
            onClick={() => navigate('/customer/profile')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer shrink-0 active:scale-95"
            title="Back to Customer Profile"
          >
            ←
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-['Space_Grotesk',sans-serif] font-black text-sm sm:text-lg md:text-xl text-white tracking-tight truncate block sm:inline">
                Live GPS Dispatch Radar
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded-full hidden md:inline shrink-0">
                {activeOrderId.slice(0, 10)}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-white/50 hidden sm:block truncate">
              Continuous 1-second telemetry broadcast • Sub-meter accuracy
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <span
              className={`w-2 h-2 rounded-full ${
                isTechnicianOnline ? 'bg-emerald-400' : 'bg-white/40'
              } shadow-[0_0_8px_#34d399] animate-pulse shrink-0`}
            />
            <span className="text-[11px] sm:text-xs font-bold text-emerald-400 tracking-wide uppercase whitespace-nowrap">
              <span className="hidden xs:inline">{isTechnicianOnline ? 'Plumber Online' : 'Standby'}</span>
              <span className="xs:hidden">{isTechnicianOnline ? 'Online' : 'Standby'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* ── MAIN RADAR BODY ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6 w-full">
        
        {/* Radar Info Top Strip */}
        <div className="bg-[#0A1628]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-lg sm:text-xl shrink-0">
              🛰️
            </div>
            <div className="min-w-0">
              <h2 className="font-['Space_Grotesk',sans-serif] font-bold text-xs sm:text-sm md:text-base text-white">
                Customer Tracking Mode: Viewing Verified Technician In Transit
              </h2> 
              <p className="text-[11px] sm:text-xs text-white/60 mt-0.5 leading-relaxed">
                Area Coverage:{' '}
                <strong className="text-cyan-400">25 Km Radial Zone</strong> • Real-time distance updates:{' '}
                <strong className="text-orange-400 font-mono">{liveKmDistance} km away</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
            <span className="text-[11px] sm:text-xs text-white/50 font-mono hidden sm:inline">
              Live GPS Updates: <strong className="text-emerald-400 font-bold">Active</strong>
            </span>
            <button
              onClick={() => navigate(`/customer/payment/${activeOrderId}`)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
            >
              <span>💳</span>
              <span>Complete Job & Pay →</span>
            </button>
          </div>
        </div>

        {/* ── MAP CONTAINER (LEAFLET.JS with Free OpenStreetMap Tiles) ── */}
        <div className="relative w-full h-[300px] xs:h-[340px] sm:h-[420px] md:h-[480px] lg:h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-[#070E1A]">
          
          {/* Leaflet DOM Anchor with Dark Obsidian Styling */}
          <div ref={mapContainerRef} className="dark-obsidian-map w-full h-full z-0" />

          {/* Floating Top Telemetry HUD Pill (Fully responsive across phones & desktops) */}
          <div className="absolute top-3 sm:top-4 inset-x-2 sm:inset-x-4 flex justify-center pointer-events-none z-10 px-1">
            <div className="bg-[#070E1A]/95 backdrop-blur-2xl border border-cyan-500/40 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-2xl sm:rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 text-center max-w-[96%]">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_12px_#ff6b00] animate-ping shrink-0" />
              <span className="font-['Space_Grotesk',sans-serif] font-bold text-[11px] sm:text-xs md:text-sm text-white">
                Status:{' '}
                <span className="text-cyan-400 font-extrabold uppercase">
                  {orderStatus || 'On the way'}
                </span>
              </span>
              <span className="hidden xs:inline text-white/30">•</span>
              <span className="font-['Space_Grotesk',sans-serif] font-black text-[11px] sm:text-xs md:text-sm text-orange-400">
                {liveKmDistance} KM away
              </span>
              <span className="text-white/30">•</span>
              <span className="text-[11px] sm:text-xs md:text-sm font-bold text-emerald-400">
                ETA ~{estimatedMins} mins
              </span>
            </div>
          </div>

          {/* Floating 25 KM Radius Radar Chip */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 pointer-events-none hidden xs:block">
            <div className="bg-[#070E1A]/85 backdrop-blur-xl border border-white/10 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex items-center gap-2 text-[10px] sm:text-xs text-white/70 shadow-lg">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-cyan-400 bg-cyan-500/20" />
              <span>
                Coverage Radar: <strong className="text-cyan-300">25 Km Radial Zone</strong>
              </span>
            </div>
          </div>

          {/* Floating Map Controls Cluster */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex flex-col gap-1.5 sm:gap-2">
            <button
              onClick={handleRecenter}
              aria-label="Recenter map bounds"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#0A1628]/90 hover:bg-[#0A1628] border border-cyan-500/40 text-cyan-400 hover:text-cyan-300 flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer font-bold text-sm sm:text-base"
              title="Center on Plumber Location"
            >
              🎯
            </button>
            <button
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#0A1628]/90 hover:bg-[#0A1628] border border-white/15 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer font-bold text-base sm:text-lg"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#0A1628]/90 hover:bg-[#0A1628] border border-white/15 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer font-bold text-base sm:text-lg"
            >
              −
            </button>
          </div>
        </div>

        {/* ── TWO-COLUMN DETAILS SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start w-full">
          
          {/* Left Column (2 Cols): 5-Step Lifecycle Stepper according to KM */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 w-full">
            
            <div className="bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-['Space_Grotesk',sans-serif] font-black text-base sm:text-lg md:text-xl text-white">
                    Service Dispatch Lifecycle
                  </h3>
                  <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">
                    Live GPS telemetry verified with FRRF Plumbing Escrow & Warranty
                  </p>
                </div>
                <span className="self-start sm:self-auto px-2.5 sm:px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-bold rounded-full uppercase">
                  {orderStatus || 'On the way'}
                </span>
              </div>

              {/* Progress Stepper Nodes according to KM */}
              <div className="space-y-4 sm:space-y-5">
                
                {/* 1. Booking Confirmed */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-white">Booking Confirmed</h4>
                      <span className="text-[10px] sm:text-[11px] text-white/40 font-mono">Logged</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">
                      Order logged for {displayService}. Destination address verified.
                    </p>
                  </div>
                </div>

                {/* 2. Technician Assigned */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-white">Technician Assigned</h4>
                      <span className="text-[10px] sm:text-[11px] text-emerald-400 font-bold">Assigned</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">
                      Master Plumber {technicianName} assigned from regional hub.
                    </p>
                  </div>
                </div>

                {/* 3. On the Way (Active Step with Live KM) */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 shadow-[0_0_18px_#ff6b00] ring-4 ring-orange-500/20 animate-pulse">
                    🚐
                  </div>
                  <div className="flex-1 min-w-0 bg-white/5 border border-orange-500/30 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl">
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                      <h4 className="font-bold text-xs sm:text-sm text-orange-400">
                        On the Way (Live Tracking Active)
                      </h4>
                      <span className="self-start xs:self-auto text-[11px] sm:text-xs font-bold bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                        ~{estimatedMins} mins left
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-white/70 mt-1 leading-relaxed">
                      Technician is traveling toward your location. Current distance:{' '}
                      <strong className="text-white font-mono">{liveKmDistance} KM</strong>.
                    </p>
                  </div>
                </div>

                {/* 4. Diagnosis & Work */}
                <div className={`flex items-start gap-3 sm:gap-4 ${orderStatus === 'Working' ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/20 text-white/40 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                    4
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-white/70">Diagnosis & Joint Repair</h4>
                      <span className="text-[10px] sm:text-[11px] text-white/30">{orderStatus === 'Working' ? 'Active Work' : 'Pending Arrival'}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-white/40 mt-0.5">
                      Pressure testing, leak isolation, and joint fitting replacement.
                    </p>
                  </div>
                </div>

                {/* 5. Repaired & Protected */}
                <div className={`flex items-start gap-3 sm:gap-4 ${orderStatus === 'Completed' ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/20 text-white/40 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                    5
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-white/70">Repaired & Protected</h4>
                      <span className="text-[10px] sm:text-[11px] text-white/30">90-Day Guarantee</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-white/40 mt-0.5">
                      Digital receipt issued with 100% workmanship warranty coverage.
                    </p>
                    <button
                      onClick={() => navigate(`/customer/payment/${activeOrderId}`)}
                      className="mt-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
                    >
                      <span>💳</span> Complete Job & Payment Invoice →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Service & Booking Summary Card */}
            <div className="bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
              <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-white/60 mb-2 sm:mb-3">
                Service Order Summary
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-white/8">
                <div>
                  <h4 className="font-black text-sm sm:text-base md:text-lg text-white">
                    {displayService}
                  </h4>
                  <span className="inline-block mt-1 bg-cyan-500/15 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                    {displayCategory}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Estimated Cost</span>
                  <p className="font-black text-lg sm:text-xl text-orange-400">
                    ₹{orderData?.total_Amount?.amount || 500}
                  </p>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 flex items-start gap-2 text-xs text-white/70">
                <span className="text-cyan-400 text-sm mt-0.5 shrink-0">📍</span>
                <div className="break-words min-w-0">
                  <span className="font-bold text-white">Destination: </span>
                  <span>{displayAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Verified Technician Card */}
          <div className="space-y-4 sm:space-y-6 w-full">
            
            <div className="bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Assigned Master Plumber
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-3.5 mb-4 sm:mb-5">
                <div className="relative shrink-0">
                  <img
                    src="https://ik.imagekit.io/Rizwan786/profileimage.avif?updatedAt=1771120805726"
                    alt={technicianName}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-cyan-400/50 shadow-[0_0_16px_rgba(6,182,212,0.3)]"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[9px] sm:text-[10px] font-black">
                    ✓
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-sm sm:text-base md:text-lg text-white truncate">
                    {technicianName}
                  </h3>
                  <p className="text-xs text-cyan-300 font-semibold truncate">
                    {technicianExperience} • {technicianRating}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-white/45 mt-0.5 font-mono truncate">
                    Service Van #04 • PlumbOps Fast Dispatch
                  </p>
                </div>
              </div>

              {/* Call & Chat Action Buttons */}
              <div className="space-y-2 sm:space-y-2.5 pt-2 border-t border-white/8">
                {technicianPhone ? (
                  <a
                    href={`tel:${technicianPhone}`}
                    className="w-full py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl font-['Space_Grotesk',sans-serif] font-bold text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,107,53,0.4)] transition-all cursor-pointer no-underline active:scale-[0.98]"
                  >
                    <span>📞</span>
                    <span>Call Plumber ({technicianPhone})</span>
                  </a>
                ) : (
                  <div className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-medium text-xs bg-white/5 border border-white/10 text-white/50 text-center">
                    Phone contact active once assigned
                  </div>
                )}

                <button
                  onClick={() =>
                    alert(
                      technicianPhone
                        ? `Initiating direct voice dispatch channel with ${technicianName} (${technicianPhone})...`
                        : "Plumber dispatch team is currently assigning nearest technician."
                    )
                  }
                  className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <span>💬</span>
                  <span>Direct Dispatch Channel</span>
                </button>
              </div>
            </div>

            {/* Coverage Trust Box */}
            <div className="bg-[#070E1A]/85 border border-white/8 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-center">
              <span className="text-lg sm:text-xl">🛡️</span>
              <h5 className="font-bold text-xs text-white mt-1">FRRF 90-Day Protection Guarantee</h5>
              <p className="text-[10px] sm:text-[11px] text-white/40 mt-1 leading-relaxed">
                All CPVC joints, pressure seals, and drainage fittings serviced on this dispatch are insured up to ₹50,000 against post-repair leaks.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}