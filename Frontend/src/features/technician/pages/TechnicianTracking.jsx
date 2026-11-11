import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTrackSocket, calculateDistanceKm } from '../../socketio/hook/usetrack.js';
import { useLocationSender } from '../hook/useLocationSender.jsx';
import { emitTechnicianStatus, emitTechnicianLocation } from '../services/socket.api.jsx';
import { setTechnicianLocation } from '../../socketio/state/track.slice.jsx';

export default function TechnicianTracking() {
  const { OrderId: routeOrderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux Selectors
  const reduxOrders = useSelector((state) => state.order?.orders || state.order?.item || []);
  const reduxUser = useSelector((state) => state.auth?.User);
  const trackState = useSelector((state) => state.trackUser);
  const {
    technicianLocation,
    customerLocation,
    orderStatus,
    distanceKm: trackedDistance,
    orderData,
    loading: trackLoading,
  } = trackState;

  // Resolve active Order ID
  const activeOrderId =
    routeOrderId ||
    orderData?._id ||
    (Array.isArray(reduxOrders) && reduxOrders[0]?._id) ||
    'LIVE_DEMO_ORDER';

  // Activate Tracking Hook
  useTrackSocket({ OrderId: activeOrderId });

  // Broadcasting State & Location Sender hook
  const [isBroadcasting, setIsBroadcasting] = useState(true);
  const [showAcceptPopup, setShowAcceptPopup] = useState(true);
  useLocationSender({
    OrderId: activeOrderId,
    startTracking: isBroadcasting,
  });

  // 1. Effective Customer Destination Coordinates from Database Order
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
        return [lat, lng];
      }
    }
    if (orderData?.address?.latitude && orderData?.address?.longitude) {
      const lat = Number(orderData.address.latitude);
      const lng = Number(orderData.address.longitude);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    return [19.0760, 72.8777]; // Default Mumbai center
  }, [customerLocation, orderData]);

  // 2. Effective Technician Coordinates (live GPS or initial offset)
  const [simulatedOffset, setSimulatedOffset] = useState({ lat: 0.0185, lng: 0.0152 });

  const effectiveTechCoords = useMemo(() => {
    let tLat = null;
    let tLng = null;

    if (technicianLocation?.latitude && technicianLocation?.longitude) {
      tLat = Number(technicianLocation.latitude);
      tLng = Number(technicianLocation.longitude);
    } else {
      const tCoords = orderData?.technicianProfile?.liveLocation?.coordinates;
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

    // Realistic approach offset (~2.4 km away from customer)
    return [
      effectiveCustCoords[0] + simulatedOffset.lat,
      effectiveCustCoords[1] + simulatedOffset.lng,
    ];
  }, [technicianLocation, orderData, effectiveCustCoords, simulatedOffset]);

  // 3. Live distance in KM ("according to KM")
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
    return Math.max(2, Math.round(liveKmDistance * 3.5));
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

    // 1. Initialize Map instance once
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

    // Custom Glowing DivIcon for Customer Home Marker
    const customerIcon = L.divIcon({
      className: 'custom-customer-pin',
      html: `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; inset:0; border-radius:9999px; background:rgba(0,242,254,0.3); animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position:relative; width:36px; height:36px; border-radius:9999px; background:#070E1A; border:2px solid #00F2FE; box-shadow:0 0 16px rgba(0,242,254,0.6); display:flex; align-items:center; justify-content:center; font-size:18px;">
            🏠
          </div>
          <span style="position:absolute; bottom:-18px; white-space:nowrap; background:rgba(7,14,26,0.95); border:1px solid rgba(0,242,254,0.4); color:#00F2FE; font-size:10px; font-weight:700; padding:1px 6px; border-radius:4px; font-family:'Space Grotesk',sans-serif;">
            Client Destination
          </span>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    // Custom Glowing DivIcon for Technician Van Marker
    const technicianIcon = L.divIcon({
      className: 'custom-technician-pin',
      html: `
        <div style="position:relative; width:52px; height:52px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; inset:0; border-radius:9999px; background:rgba(255,107,0,0.4); animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position:relative; width:40px; height:40px; border-radius:9999px; background:#FF6B00; border:2.5px solid #FFFFFF; box-shadow:0 0 24px rgba(255,107,0,0.9); display:flex; align-items:center; justify-content:center; font-size:20px;">
            🚐
          </div>
          <span style="position:absolute; bottom:-18px; white-space:nowrap; background:rgba(7,14,26,0.95); border:1px solid rgba(255,107,0,0.6); color:#FF8A00; font-size:10px; font-weight:800; padding:1px 6px; border-radius:4px; font-family:'Space Grotesk',sans-serif;">
            You (GPS Transmitter)
          </span>
        </div>
      `,
      iconSize: [52, 52],
      iconAnchor: [26, 26],
    });

    // 2. Manage Customer Marker with Real Data & Order Accept Popup
    const customerPopupContent = `
      <div style="font-family:'Space Grotesk',sans-serif; color:#070E1A; padding:6px; min-width:190px;">
        <div style="display:inline-block; background:#10b981; color:#ffffff; font-size:9px; font-weight:800; padding:2px 7px; border-radius:4px; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px;">
          ✓ Order Accepted
        </div>
        <div style="font-size:13px; font-weight:800; color:#0f172a; margin-bottom:2px;">
          ${displayCustomerName}
        </div>
        <div style="font-size:11px; color:#475569; margin-bottom:4px; line-height:1.3;">
          📍 ${displayAddress}
        </div>
        <div style="font-size:11px; font-weight:700; color:#0284c7; margin-bottom:2px;">
          🔧 ${displayService}
        </div>
        ${displayCustomerPhone ? `<div style="font-size:11px; font-weight:600; color:#059669;">📞 ${displayCustomerPhone}</div>` : ''}
        <div style="font-size:10px; font-weight:700; color:#ea580c; margin-top:4px; border-top:1px solid #e2e8f0; padding-top:3px;">
          Distance: ${liveKmDistance} KM to Destination
        </div>
      </div>
    `;

    if (!customerMarkerRef.current) {
      customerMarkerRef.current = L.marker(effectiveCustCoords, { icon: customerIcon })
        .addTo(map)
        .bindPopup(customerPopupContent);

      // Auto-open popup on map load showing accepted order!
      setTimeout(() => {
        if (customerMarkerRef.current) {
          customerMarkerRef.current.openPopup();
        }
      }, 500);
    } else {
      customerMarkerRef.current.setLatLng(effectiveCustCoords);
      customerMarkerRef.current.setPopupContent(customerPopupContent);
    }

    // 3. Manage Technician Marker with Real Data Popup
    if (!technicianMarkerRef.current) {
      technicianMarkerRef.current = L.marker(effectiveTechCoords, { icon: technicianIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'Space Grotesk',sans-serif; color:#070E1A; padding:4px;">
            <b style="color:#ea580c; font-size:12px;">🚐 Your Service Van</b><br/>
            <span style="font-size:11px; color:#334155;">Live Distance: ${liveKmDistance} KM to Client</span><br/>
            <span style="font-size:10px; color:#2563eb; font-weight:bold;">Status: ${orderStatus || 'On-the-way'}</span>
          </div>
        `);
    } else {
      technicianMarkerRef.current.setLatLng(effectiveTechCoords);
    }

    // 4. Manage Glowing Route Line between Technician and Customer
    const routeCoords = [effectiveTechCoords, effectiveCustCoords];
    if (!polylineRef.current) {
      polylineRef.current = L.polyline(routeCoords, {
        color: '#FF6B00',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.9,
      }).addTo(map);
    } else {
      polylineRef.current.setLatLngs(routeCoords);
    }

    // 5. 25 Km Service Radius Area Circle
    if (!radiusCircleRef.current) {
      radiusCircleRef.current = L.circle(effectiveCustCoords, {
        radius: 25000,
        color: '#00F2FE',
        weight: 1,
        dashArray: '4, 8',
        fillColor: '#00F2FE',
        fillOpacity: 0.04,
      }).addTo(map);
    } else {
      radiusCircleRef.current.setLatLng(effectiveCustCoords);
      radiusCircleRef.current.setRadius(25000);
    }

    // Fit map bounds to encompass both markers
    map.fitBounds([effectiveTechCoords, effectiveCustCoords], {
      padding: [70, 70],
      maxZoom: 15,
    });
  }, [effectiveCustCoords, effectiveTechCoords, liveKmDistance, orderStatus, orderData]);

  // Map Controls: Recenter and Zoom
  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.fitBounds([effectiveTechCoords, effectiveCustCoords], {
        padding: [60, 60],
        maxZoom: 15,
      });
    }
  };

  const handleZoomIn = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomOut();
  };

  // Status Change Handler (Emits over socket + updates order)
  const handleStatusChange = (newStatus) => {
    emitTechnicianStatus({ OrderId: activeOrderId, status: newStatus });
  };

  // Simulate Drive Step towards customer (for seamless testing & simulation)
  const handleAdvanceStep = () => {
    setSimulatedOffset((prev) => {
      const nextLat = Math.max(0, prev.lat - 0.004);
      const nextLng = Math.max(0, prev.lng - 0.0035);
      const nextTechLat = effectiveCustCoords[0] + nextLat;
      const nextTechLng = effectiveCustCoords[1] + nextLng;

      // Broadcast new position immediately via socket
      emitTechnicianLocation({
        OrderId: activeOrderId,
        latitude: nextTechLat,
        longitude: nextTechLng,
        isOnline: true,
        status: nextLat === 0 && nextLng === 0 ? "Working" : "On-the-way",
      });

      dispatch(
        setTechnicianLocation({
          latitude: nextTechLat,
          longitude: nextTechLng,
        })
      );

      return { lat: nextLat, lng: nextLng };
    });
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

  const displayCustomerName =
    orderData?.userId?.FullName || orderData?.userId?.name || 'Valued Client';
  const displayCustomerPhone =
    orderData?.userId?.contact || orderData?.userId?.phone || '';

  return (
    <div
      className="min-h-screen bg-[#070E1A] text-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-orange-500 selection:text-black pb-20 relative overflow-x-hidden"
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
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* ── TOP HEADER / NAV BAR ── */}
      <header className="sticky top-0 z-40 bg-[#0A1628]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/technician/Technician-Dashboard')}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            title="Back to Technician Dashboard"
          >
            ←
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk',sans-serif] font-black text-lg sm:text-xl text-white tracking-tight">
                Technician GPS Navigation Console
              </span>
              <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 border border-orange-500/25 px-2 py-0.5 rounded-full hidden sm:inline">
                {activeOrderId.slice(0, 10)}
              </span>
            </div>
            <p className="text-[11px] text-white/50 hidden sm:block">
              Broadcasting sub-meter telemetry to client • 25 Km service radial zone
            </p>
          </div>
        </div>

        {/* Live Broadcast Status Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_#ff6b00] animate-ping" />
            <span className="text-xs font-bold text-orange-400 tracking-wide uppercase">
              GPS Transmitter Active
            </span>
          </div>

          {/* Switch to Customer Tracking Link */}
          <Link
            to={`/customer/customer_tracking/${activeOrderId}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-xl transition-all no-underline"
          >
            <span>👁️ Customer View →</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN RADAR BODY ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Order Accepted Floating Alert Popup Banner */}
        {showAcceptPopup && (
          <div className="relative bg-gradient-to-r from-emerald-950/80 via-[#0A1628]/95 to-[#0A1628]/95 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 shadow-[0_15px_40px_rgba(16,185,129,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-2xl shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                ✓
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                    Order Accepted!
                  </span>
                  <span className="text-xs text-white/50 font-mono">
                    Client: <strong className="text-white">{displayCustomerName}</strong>
                  </span>
                </div>
                <h3 className="font-['Space_Grotesk',sans-serif] font-black text-sm sm:text-base text-white mt-1">
                  Navigating to {displayAddress}
                </h3>
                <p className="text-xs text-cyan-300 font-medium mt-0.5">
                  Job: {displayService} • Est. Payout: <strong className="text-emerald-400 font-bold">₹{orderData?.total_Amount?.amount || 500}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              {displayCustomerPhone && (
                <a
                  href={`tel:${displayCustomerPhone}`}
                  className="flex-1 md:flex-none text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 no-underline"
                >
                  <span>📞 Call</span>
                </a>
              )}
              <button
                onClick={() => {
                  if (customerMarkerRef.current) {
                    customerMarkerRef.current.openPopup();
                  }
                  setShowAcceptPopup(false);
                }}
                className="flex-1 md:flex-none text-xs bg-white/10 hover:bg-white/15 text-white font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                View on Map 📍
              </button>
              <button
                onClick={() => setShowAcceptPopup(false)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-sm transition-all cursor-pointer"
                title="Dismiss banner"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Navigation Action Strip */}
        <div className="bg-[#0A1628]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-xl shrink-0">
              🧭
            </div>
            <div>
              <h2 className="font-['Space_Grotesk',sans-serif] font-bold text-sm sm:text-base text-white">
                Active Navigation to Client: <span className="text-cyan-400">{displayCustomerName}</span>
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Remaining Distance: <strong className="text-orange-400 font-mono">{liveKmDistance} KM</strong> • Estimated Arrival: <strong className="text-emerald-400 font-mono">~{estimatedMins} Mins</strong>
              </p>
            </div>
          </div>

          {/* Technician Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAdvanceStep}
              className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white px-3 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Advance GPS step towards client (for local testing)"
            >
              <span>🚗</span>
              <span>Simulate Drive Step (-0.5 km)</span>
            </button>

            {orderStatus !== 'Working' && orderStatus !== 'Completed' && (
              <button
                onClick={() => handleStatusChange('Working')}
                className="text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                Mark Arrived ✓
              </button>
            )}

            {orderStatus === 'Working' && (
              <button
                onClick={() => handleStatusChange('Completed')}
                className="text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                Complete Job & Invoice ✓
              </button>
            )}
          </div>
        </div>

        {/* ── MAP CONTAINER (LEAFLET.JS with Free OpenStreetMap Tiles) ── */}
        <div className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-[#070E1A]">
          
          {/* Leaflet DOM Anchor with Dark Obsidian Styling */}
          <div ref={mapContainerRef} className="dark-obsidian-map w-full h-full z-0" />

          {/* Floating Top Telemetry HUD Pill */}
          <div className="absolute top-4 inset-x-4 flex justify-center pointer-events-none z-10">
            <div className="bg-[#070E1A]/90 backdrop-blur-2xl border border-orange-500/40 px-5 py-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_12px_#ff6b00] animate-ping" />
              <span className="font-['Space_Grotesk',sans-serif] font-bold text-xs sm:text-sm text-white">
                Status:{' '}
                <span className="text-orange-400 font-extrabold uppercase">
                  {orderStatus || 'On the way'}
                </span>
              </span>
              <span className="text-white/30">•</span>
              <span className="font-['Space_Grotesk',sans-serif] font-black text-xs sm:text-sm text-cyan-400">
                {liveKmDistance} KM to Destination
              </span>
              <span className="text-white/30">•</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">
                ETA ~{estimatedMins} mins
              </span>
            </div>
          </div>

          {/* Floating 25 KM Radius Radar Chip */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:block">
            <div className="bg-[#070E1A]/85 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-xl flex items-center gap-2 text-xs text-white/70 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full border border-cyan-400 bg-cyan-500/20" />
              <span>
                Coverage Radar: <strong className="text-cyan-300">25 Km Operational Radius</strong>
              </span>
            </div>
          </div>

          {/* Floating Map Controls Cluster */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
            <button
              onClick={handleRecenter}
              aria-label="Recenter map bounds"
              className="w-10 h-10 rounded-xl bg-[#0A1628]/90 hover:bg-[#0A1628] border border-orange-500/40 text-orange-400 hover:text-orange-300 flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer font-bold text-base"
              title="Fit map to You & Customer"
            >
              🎯
            </button>
            <button
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="w-10 h-10 rounded-xl bg-[#0A1628]/90 hover:bg-[#0A1628] border border-white/15 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer font-bold text-lg"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="w-10 h-10 rounded-xl bg-[#0A1628]/90 hover:bg-[#0A1628] border border-white/15 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer font-bold text-lg"
            >
              −
            </button>
          </div>
        </div>

        {/* ── TWO-COLUMN NAVIGATION & CLIENT DETAILS SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (2 Cols): Excalidraw Distance Stepper ("according to KM") */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-['Space_Grotesk',sans-serif] font-black text-lg sm:text-xl text-white">
                    Approach Telemetry (According to KM)
                  </h3>
                  <p className="text-xs text-white/50">
                    Real-time distance milestones from 25 Km perimeter to arrival
                  </p>
                </div>
                <span className="px-3 py-1 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold rounded-full uppercase">
                  {liveKmDistance} KM Remaining
                </span>
              </div>

              {/* Progress Milestones: 25 Km -> 15 Km -> 5 Km -> Arrived */}
              <div className="space-y-4">
                
                {/* 25 Km Away */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                    <div>
                      <h4 className="font-bold text-sm text-white">25 Km Radial Zone Entry</h4>
                      <p className="text-xs text-white/50">Within emergency service radius</p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">Passed</span>
                  </div>
                </div>

                {/* 15 Km Away */}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full ${liveKmDistance <= 15 ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400' : 'bg-white/5 border border-white/20 text-white/40'} flex items-center justify-center text-xs font-bold shrink-0`}>
                    {liveKmDistance <= 15 ? '✓' : '15'}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                    <div>
                      <h4 className="font-bold text-sm text-white">15 Km Approach Corridor</h4>
                      <p className="text-xs text-white/50">Local sector transit active</p>
                    </div>
                    <span className={`text-xs font-mono font-bold ${liveKmDistance <= 15 ? 'text-emerald-400' : 'text-white/40'}`}>
                      {liveKmDistance <= 15 ? 'Cleared' : 'Approaching'}
                    </span>
                  </div>
                </div>

                {/* 5 Km Away */}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full ${liveKmDistance <= 5 ? 'bg-orange-500 text-white shadow-[0_0_14px_#ff6b00]' : 'bg-white/5 border border-white/20 text-white/40'} flex items-center justify-center text-xs font-bold shrink-0`}>
                    {liveKmDistance <= 5 ? '⚡' : '5'}
                  </div>
                  <div className={`flex-1 min-w-0 flex items-center justify-between p-3 rounded-xl border ${liveKmDistance <= 5 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div>
                      <h4 className={`font-bold text-sm ${liveKmDistance <= 5 ? 'text-orange-400' : 'text-white'}`}>5 Km Immediate Vicinity</h4>
                      <p className="text-xs text-white/50">Client notified of near arrival</p>
                    </div>
                    <span className={`text-xs font-mono font-bold ${liveKmDistance <= 5 ? 'text-orange-300' : 'text-white/40'}`}>
                      {liveKmDistance <= 5 ? 'In Range' : 'Approaching'}
                    </span>
                  </div>
                </div>

                {/* Arrived */}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full ${liveKmDistance <= 0.2 || orderStatus === 'Working' || orderStatus === 'Completed' ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_16px_#10b981]' : 'bg-white/5 border border-white/20 text-white/40'} flex items-center justify-center text-xs font-bold shrink-0`}>
                    🏠
                  </div>
                  <div className={`flex-1 min-w-0 flex items-center justify-between p-3 rounded-xl border ${liveKmDistance <= 0.2 || orderStatus === 'Working' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div>
                      <h4 className="font-bold text-sm text-white">Client Destination Arrival</h4>
                      <p className="text-xs text-white/50">Park van & commence CPVC inspection</p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {orderStatus === 'Working' || liveKmDistance <= 0.2 ? 'Arrived' : 'Target'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details Box */}
            <div className="bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-3xl p-5 sm:p-6 shadow-lg">
              <h3 className="font-bold text-sm uppercase tracking-wider text-white/60 mb-3">
                Job Requirement
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
                <div>
                  <h4 className="font-black text-base sm:text-lg text-white">
                    {displayService}
                  </h4>
                  <span className="inline-block mt-1 bg-cyan-500/15 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                    {displayCategory}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Payout Value</span>
                  <p className="font-black text-xl text-emerald-400">
                    ₹{orderData?.total_Amount?.amount || 500}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs text-white/70">
                <span className="text-cyan-400 text-sm mt-0.5">📍</span>
                <div>
                  <span className="font-bold text-white">Client Address: </span>
                  <span>{displayAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Real Customer Destination Card */}
          <div className="space-y-6">
            
            <div className="bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Client Contact & Turn-by-Turn
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl shrink-0">
                  👤
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {displayCustomerName}
                  </h3>
                  <p className="text-xs text-white/60 font-mono mt-0.5">
                    {displayCustomerPhone || 'Contact on file'}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Verified Customer
                  </span>
                </div>
              </div>

              {/* Action Buttons: Call & Turn-by-Turn Nav */}
              <div className="space-y-2.5 pt-2 border-t border-white/8">
                {displayCustomerPhone ? (
                  <a
                    href={`tel:${displayCustomerPhone}`}
                    className="w-full py-3.5 px-4 rounded-xl font-['Space_Grotesk',sans-serif] font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer no-underline"
                  >
                    <span>📞</span>
                    <span>Call Client ({displayCustomerPhone})</span>
                  </a>
                ) : (
                  <div className="w-full py-3 px-4 rounded-xl font-medium text-xs bg-white/5 border border-white/10 text-white/50 text-center">
                    Phone contact active upon dispatch
                  </div>
                )}

                {/* Google Maps Turn-by-Turn Navigation */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${effectiveCustCoords[0]},${effectiveCustCoords[1]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl font-['Space_Grotesk',sans-serif] font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,107,0,0.35)] transition-all cursor-pointer no-underline"
                >
                  <span>🗺️</span>
                  <span>Turn-by-Turn Navigation (Google Maps)</span>
                </a>
              </div>
            </div>

            {/* Protocol Card */}
            <div className="bg-[#070E1A]/85 border border-white/8 rounded-2xl p-4 text-center">
              <span className="text-xl">🧰</span>
              <h5 className="font-bold text-xs text-white mt-1">Arrival Safety Protocol</h5>
              <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                Ensure safety gear, main valve turn-off protocol, and photo documentation before commencing CPVC joint or pressure repairs.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
