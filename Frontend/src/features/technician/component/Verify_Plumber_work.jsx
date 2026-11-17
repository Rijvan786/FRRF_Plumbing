import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import useTechnician from '../hook/useTechnician.jsx';
import { useToast } from '../../auth/component/ToastPopup.jsx';
import { getSocket } from '../../socketio/service/track_socketio.api.js';

export default function Verify_Plumber_work() {
  const { OrderId: routeOrderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  // ── 4-LAYER ARCHITECTURE ──
  // Layer 1: API functions in technician.api.jsx (VerifyPlumberWork, GetIdS, GetPaymentDetail)
  // Layer 2: Redux Slice in technician.slice.jsx (currentOrder, paymentDetail, verifiedWork, loading)
  // Layer 3: Custom Hook in useTechnician.jsx (handleGetIdS, handleVerifiedPlumberWork, handleGetPaymentDetail)
  // Layer 4: UI Component (Verify_Plumber_work.jsx) reads Redux directly via useSelector, calls hook functions (NO direct API calls)
  const { handleGetIdS, handleGetPaymentDetail, handleVerifiedPlumberWork } = useTechnician();

  // Redux state selection (Layer 2 & 4 binding)
  const currentOrder = useSelector((state) => state.technician?.currentOrder);
  const paymentDetail = useSelector((state) => state.technician?.paymentDetail);
  const verifiedWork = useSelector((state) => state.technician?.verifiedWork);
  const reduxLoading = useSelector((state) => state.technician?.loading);
  const reduxUser = useSelector((state) => state.auth?.User);

  // Active Order Identification
  const OrderId = routeOrderId || 'LIVE_DEMO_ORDER';

  // Form & Interaction State (Local UI interaction only, all domain data persists in Redux)
  const [workImages, setWorkImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [workDetail, setWorkDetail] = useState('');
  const [extraCharges, setExtraCharges] = useState(0);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [isWorkSubmitted, setIsWorkSubmitted] = useState(false);

  // Live Customer Payment Monitoring Modal State
  const [isAwaitingPayment, setIsAwaitingPayment] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Base service charge and total calculation derived directly from Redux currentOrder
  const baseServiceCharge = Number(
    currentOrder?.total_Amount?.amount ||
    currentOrder?.ServiceDetails?.visitCharge ||
    currentOrder?.ServiceDetails?.price?.amount ||
    500
  );
  const totalPayableAmount = Math.max(0, baseServiceCharge + Number(extraCharges || 0));

  // 1. Fetch Order details on mount via Hook function (Layer 3 -> updates Redux Layer 2)
  useEffect(() => {
    if (OrderId && OrderId !== 'LIVE_DEMO_ORDER') {
      handleGetIdS({ OrderId }).catch((err) => {
        console.warn('handleGetIdS note in Verify_Plumber_work:', err?.message || err);
      });
    }
  }, [OrderId]);

  // Synchronize initial work detail if already verified on server
  useEffect(() => {
    if (currentOrder?.PaymentWorkDetail) {
      setWorkDetail(currentOrder.PaymentWorkDetail);
      setIsWorkSubmitted(true);
      setIsAwaitingPayment(true);
    }
  }, [currentOrder]);

  // 2. Real-Time Socket Connection to monitor Customer Payment
  useEffect(() => {
    if (!OrderId || OrderId === 'LIVE_DEMO_ORDER') return;

    const socket = getSocket();
    socketRef.current = socket;

    // Join room for this specific Order
    socket.emit('join-tracking-room', OrderId.toString());
    socket.emit('join-booking', OrderId.toString());

    // Trigger payment verification check via useTechnician Hook (Layer 3)
    const triggerPaymentVerification = async () => {
      try {
        const paymentRes = await handleGetPaymentDetail(OrderId);
        const resolvedPayment = paymentRes?.payment || paymentRes?.data?.payment || paymentRes;
        if (resolvedPayment && (resolvedPayment.status === 'paid' || resolvedPayment.status === 'Completed')) {
          setShowPaymentSuccessModal(true);
          showToast({
            type: 'success',
            message: 'Customer payment received successfully! Payout confirmed.',
            duration: 4000,
          });
        }
      } catch (err) {
        console.warn('Silent payment check note:', err?.message || err);
      }
    };

    // Socket Event: Order Completed / Payment Paid
    const handleOrderCompleted = (data) => {
      console.log('⚡ Socket event [order-completed] received:', data);
      triggerPaymentVerification();
    };

    // Socket Event: Status Updated to Completed
    const handleStatusUpdate = (data) => {
      console.log('⚡ Socket event [receive-status] received:', data);
      if (data?.status === 'Completed' || data?.status === 'paid') {
        triggerPaymentVerification();
      }
    };

    socket.on('order-completed', handleOrderCompleted);
    socket.on('receive-status', handleStatusUpdate);

    // Also poll every 6 seconds as a robust fallback while awaiting payment
    if (isAwaitingPayment) {
      pollIntervalRef.current = setInterval(() => {
        triggerPaymentVerification();
      }, 6000);
    }

    return () => {
      socket.off('order-completed', handleOrderCompleted);
      socket.off('receive-status', handleStatusUpdate);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [OrderId, isAwaitingPayment]);

  // 3. Countdown timer for auto-navigation after payment success
  useEffect(() => {
    let timer;
    if (showPaymentSuccessModal && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showPaymentSuccessModal && redirectCountdown === 0) {
      handleNavigateToSuccess();
    }
    return () => clearTimeout(timer);
  }, [showPaymentSuccessModal, redirectCountdown]);

  // Handle Image File Selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setWorkImages((prev) => [...prev, ...files]);

    // Create live preview URLs
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove selected image
  const handleRemoveImage = (indexToRemove) => {
    setWorkImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews((prev) => {
      const removed = prev[indexToRemove];
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  // Quick chips for common work descriptions
  const quickWorkTags = [
    'CPVC Pipe Leak Sealed & Pressure Tested',
    'Brass Stop-Cock & Ceramic Disc Replaced',
    'Main Supply Valve Fitment & Teflon Wrapped',
    'Concealed Drainage Jet Cleaned & Unclogged',
    'Overhead Tank Float Valve Calibrated',
    'Heavy-Duty Sealant Applied Around Trap Joint',
  ];

  const handleAddTag = (tag) => {
    setWorkDetail((prev) => {
      if (!prev.trim()) return tag;
      if (prev.includes(tag)) return prev;
      return `${prev}, ${tag}`;
    });
  };

  // Submit Work Verification ("Payment and work detail") via Hook (Layer 3)
  const handleSubmitWorkVerification = async (e) => {
    e.preventDefault();

    if (!workDetail.trim()) {
      showToast({
        type: 'warning',
        message: 'Please enter details of the completed plumbing work before proceeding.',
      });
      return;
    }

    try {
      setIsSubmittingWork(true);

      const formData = new FormData();
      formData.append('OrderId', OrderId);
      formData.append('PaymentWorkDetail', workDetail.trim());
      formData.append('extraAmount', Number(extraCharges || 0));
      formData.append('totalAmount', totalPayableAmount);

      // Append proof images
      workImages.forEach((imgFile) => {
        formData.append('Images', imgFile);
      });

      // Pure 4-layer call: Invokes handleVerifiedPlumberWork from useTechnician
      await handleVerifiedPlumberWork(formData);

      setIsWorkSubmitted(true);
      setIsAwaitingPayment(true);

      showToast({
        type: 'success',
        message: 'Work verification submitted! Customer has been notified to complete the payment.',
        duration: 4000,
      });
    } catch (err) {
      console.error('Work verification submission error:', err);
      showToast({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Could not submit work verification. Please try again.',
      });
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // Manual trigger to check customer payment via Hook (Layer 3)
  const handleManualCheckPayment = async () => {
    try {
      showToast({
        type: 'info',
        message: 'Checking customer payment status...',
        duration: 2000,
      });

      const paymentRes = await handleGetPaymentDetail(OrderId);
      const resolvedPayment = paymentRes?.payment || paymentRes?.data?.payment || paymentRes;

      if (resolvedPayment && (resolvedPayment.status === 'paid' || resolvedPayment.status === 'Completed')) {
        setShowPaymentSuccessModal(true);
        showToast({
          type: 'success',
          message: 'Payment verified! Customer has completed the payment.',
          duration: 4000,
        });
      } else {
        showToast({
          type: 'warning',
          message: 'Customer payment is still pending. Waiting for customer to pay via Razorpay or Cash.',
          duration: 3500,
        });
      }
    } catch (err) {
      console.warn('Manual payment check error:', err);
      showToast({
        type: 'error',
        message: 'Could not fetch payment record. Please ensure customer completes checkout.',
      });
    }
  };

  // Navigate to Payment Success digital receipt
  const handleNavigateToSuccess = () => {
    const payment = paymentDetail?.payment || paymentDetail;
    const paymentId = payment?.razorpay?.paymentId || payment?.razorpay?.orderId || payment?._id || 'PAY_' + Date.now().toString().slice(-6);
    const pType = payment?.PaymentType || 'online';
    const finalAmt = payment?.totalAmount?.amount || totalPayableAmount;

    navigate(
      `/technician/payment-success?OrderId=${OrderId}&paymentId=${paymentId}&type=${pType}&amount=${finalAmt}`
    );
  };

  // Customer Display Information derived from Redux currentOrder
  const customerName =
    currentOrder?.userId?.FullName ||
    currentOrder?.userId?.name ||
    currentOrder?.customer ||
    'Valued Customer';
  const customerPhone =
    currentOrder?.userId?.contact ||
    currentOrder?.userId?.phone ||
    currentOrder?.phone ||
    '+91 98765 43210';
  const customerAddress =
    [currentOrder?.address?.street, currentOrder?.address?.city, currentOrder?.address?.pin_code]
      .filter(Boolean)
      .join(', ') || 'Customer address on record';
  const serviceName =
    currentOrder?.ServiceDetails?.serviceName ||
    currentOrder?.issuedDescription ||
    'Emergency Plumbing Repair';
  const serviceCategory =
    currentOrder?.ServiceDetails?.category || 'CPVC & Piping Fix';

  // Derived resolved payment for the modal
  const resolvedPayment = paymentDetail?.payment || paymentDetail;

  return (
    <div
      className="min-h-screen bg-[#070E1A] text-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-orange-500 selection:text-black pb-16 sm:pb-24 relative overflow-x-hidden w-full"
      style={{
        backgroundImage: "url('/images/hero-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Ambient Deep Glow Overlays */}
      <div className="absolute inset-0 bg-[#070E1A]/95 backdrop-blur-md" />
      <div className="absolute top-10 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-orange-500/10 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/10 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none" />

      {/* ── TOP HEADER / NAV BAR ── */}
      <header className="sticky top-0 z-40 bg-[#0A1628]/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 md:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Go Back"
          >
            ←
          </button>
          <div className="min-w-0">
            <h1 className="font-['Space_Grotesk',sans-serif] font-black text-sm sm:text-base md:text-xl text-white tracking-tight flex flex-wrap items-center gap-1.5 sm:gap-2 truncate">
              <span className="truncate">Job Verification & Payment</span>
              <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-1.5 sm:px-2 py-0.5 rounded-full uppercase shrink-0">
                Step 2 of 2
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-white/50 truncate">
              Order #{String(OrderId).slice(-8)} • Upload proof photos & verify billable work
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/technician/Technician-Dashboard"
            className="hidden sm:inline-flex text-xs font-bold text-white/70 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all no-underline"
          >
            Dashboard
          </Link>
          <span className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>On Duty</span>
          </span>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8">
        
        {/* ── CLIENT & SERVICE RECAP CARD (Derived directly from Redux currentOrder) ── */}
        <section className="bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/8">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl shrink-0">
                🛠️
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  {serviceCategory}
                </span>
                <h2 className="font-['Space_Grotesk',sans-serif] font-black text-base sm:text-xl text-white truncate">
                  {serviceName}
                </h2>
                <p className="text-xs text-white/60 truncate mt-0.5">
                  Client: <strong className="text-white">{customerName}</strong> • {customerPhone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end bg-white/5 border border-white/10 rounded-xl p-3">
              <div>
                <span className="text-[10px] text-white/50 uppercase font-bold block">Base Service Charge</span>
                <span className="font-['Space_Grotesk',sans-serif] font-black text-base sm:text-lg text-emerald-400">
                  ₹{baseServiceCharge}
                </span>
              </div>
              <div className="text-right pl-3 border-l border-white/10">
                <span className="text-[10px] text-white/50 uppercase font-bold block">Estimated Total</span>
                <span className="font-['Space_Grotesk',sans-serif] font-black text-lg sm:text-xl text-orange-400">
                  ₹{totalPayableAmount}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-white/70">
            <span className="text-cyan-400 text-sm mt-0.5 shrink-0">📍</span>
            <div className="break-words min-w-0">
              <span className="font-bold text-white">Service Location: </span>
              <span>{customerAddress}</span>
            </div>
          </div>
        </section>

        {/* ── FORM & VERIFICATION WORKFLOW ── */}
        <form onSubmit={handleSubmitWorkVerification} className="space-y-6">
          
          {/* STEP 1: IMAGE OF WORK COMPLETED */}
          <div className="bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] shrink-0" />
                <h3 className="font-['Space_Grotesk',sans-serif] font-black text-sm sm:text-base text-white uppercase tracking-wider">
                  Image of work completed
                </h3>
              </div>
              <span className="text-[11px] text-cyan-300 font-mono">
                {workImages.length} photo(s) selected
              </span>
            </div>

            <p className="text-xs text-white/60 mb-4">
              Upload clear photographs of the repaired pipe joints, replaced valves, or tested leak points as proof of work.
            </p>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="hidden"
            />

            {/* Dropzone Upload Button */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all active:scale-[0.99] group"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📸
              </div>
              <p className="font-['Space_Grotesk',sans-serif] font-bold text-sm sm:text-base text-white mt-3">
                Click to browse or take photos of completed work
              </p>
              <p className="text-xs text-white/40 mt-1">
                Supports JPG, PNG, WEBP (Up to 5 images recommended)
              </p>
            </div>

            {/* Selected Image Thumbnails Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-4 pt-4 border-t border-white/8">
                {imagePreviews.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-white/15 bg-white/5 aspect-square"
                  >
                    <img
                      src={item.url}
                      alt={`Proof ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-2 pointer-events-none">
                      <p className="text-[10px] text-white font-mono truncate">{item.name}</p>
                      <span className="text-[9px] text-cyan-300">{item.size}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-lg hover:bg-rose-600 cursor-pointer transition-transform active:scale-90"
                      title="Remove Photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STEP 2: PAYMENT AND WORK DETAIL */}
          <div className="bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff6b00] shrink-0" />
              <h3 className="font-['Space_Grotesk',sans-serif] font-black text-sm sm:text-base text-white uppercase tracking-wider">
                Payment and work detail
              </h3>
            </div>

            <p className="text-xs text-white/60 mb-4">
              Specify the exact repairs performed, parts replaced, and any additional billable work according to site conditions.
            </p>

            {/* Quick Tag Suggestions */}
            <div className="mb-4">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block mb-2">
                Quick Description Presets:
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {quickWorkTags.map((tag, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="text-[11px] sm:text-xs bg-white/5 hover:bg-white/10 border border-white/15 hover:border-orange-500/40 text-white/80 hover:text-white px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-left"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Detail Textarea */}
            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-bold text-white flex items-center justify-between">
                <span>Detailed Description (PaymentWorkDetail) <span className="text-orange-400">*</span></span>
                <span className="text-[10px] text-white/40 font-mono">{workDetail.length} characters</span>
              </label>
              <textarea
                rows={3}
                value={workDetail}
                onChange={(e) => setWorkDetail(e.target.value)}
                placeholder="e.g. Replaced 1/2-inch CPVC elbow connector, applied high-pressure solvent cement, re-seated brass valve, pressure tested without leak for 15 mins..."
                required
                className="w-full bg-[#070E1A] border border-white/15 focus:border-orange-500 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-orange-500/40 transition-all font-mono"
              />
            </div>

            {/* Extra Charges Input & Dynamic Bill Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/8">
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Additional Work Charges (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={extraCharges}
                    onChange={(e) => setExtraCharges(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-full bg-[#070E1A] border border-white/15 focus:border-cyan-500 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/40 font-mono"
                  />
                </div>
                <p className="text-[10px] text-white/40 mt-1">
                  For extra materials, CPVC pipes, sealants, or extended labor
                </p>
              </div>

              {/* Bill Calculation Box */}
              <div className="bg-[#070E1A] border border-white/10 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Base Service Charge:</span>
                  <span className="font-mono font-bold text-white">₹{baseServiceCharge}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Extra Work Charges:</span>
                  <span className="font-mono font-bold text-cyan-400">+ ₹{Number(extraCharges || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span className="font-['Space_Grotesk',sans-serif]">Total Payable by Customer:</span>
                  <span className="font-mono text-emerald-400 font-black text-base">₹{totalPayableAmount}</span>
                </div>
              </div>
            </div>

            {/* Submit Verification Action Button */}
            <div className="pt-6 mt-4 border-t border-white/8 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmittingWork || isWorkSubmitted || reduxLoading}
                className={`flex-1 py-3.5 sm:py-4 px-6 rounded-xl font-['Space_Grotesk',sans-serif] font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-[0.98] ${
                  isWorkSubmitted
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-default'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-[0_0_25px_rgba(255,107,0,0.35)]'
                }`}
              >
                {isSubmittingWork || reduxLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Work Detail...</span>
                  </>
                ) : isWorkSubmitted ? (
                  <>
                    <span>✓</span>
                    <span>Work Detail Submitted & Verified</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Submit Payment & Work Detail</span>
                  </>
                )}
              </button>

              {isWorkSubmitted && (
                <button
                  type="button"
                  onClick={handleManualCheckPayment}
                  className="py-3.5 sm:py-4 px-5 rounded-xl font-bold text-xs bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md"
                >
                  <span>🔄</span>
                  <span>Check Customer Payment</span>
                </button>
              )}
            </div>
          </div>
        </form>

        {/* ── LIVE CUSTOMER PAYMENT MONITORING RADAR ── */}
        {isAwaitingPayment && (
          <div className="mt-6 bg-[#0A1628]/95 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,180,216,0.15)] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
              <div className="absolute inset-1.5 rounded-full border border-cyan-400/40 animate-spin" />
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_#00f2fe]">
                💳
              </div>
            </div>

            <h3 className="font-['Space_Grotesk',sans-serif] font-black text-base sm:text-xl text-white">
              Awaiting Customer Payment ({customerName})
            </h3>
            <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto mt-1 leading-relaxed">
              Customer is reviewing the bill of <strong className="text-emerald-400 font-mono">₹{totalPayableAmount}</strong> on their tracking screen. Once payment is made via Razorpay or Cash, this page will update automatically.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
              <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white/70">
                Listening on Socket Room #{String(OrderId).slice(-6)}
              </span>
              <button
                type="button"
                onClick={handleManualCheckPayment}
                className="bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 px-3 py-1.5 rounded-full font-bold cursor-pointer transition-all"
              >
                Instant Status Query ↻
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── CUTTING-EDGE OBSIDIAN PAYMENT SUCCESS POPUP MODAL ── */}
      {showPaymentSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0A1628] border-2 border-emerald-500/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_25px_80px_rgba(16,185,129,0.35)] text-center overflow-hidden">
            
            {/* Pulsing Emerald Halo Accent */}
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Big Success Badge */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_30px_#10b981]">
                ✓
              </div>
            </div>

            {/* Heading */}
            <span className="inline-block text-[10px] sm:text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-widest mb-2">
              Payment Confirmed & Verified
            </span>
            <h2 className="font-['Space_Grotesk',sans-serif] font-black text-xl sm:text-2xl md:text-3xl text-white tracking-tight">
              Payment Successfully Paid!
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Customer has settled the invoice for Order #{String(OrderId).slice(-8)}
            </p>

            {/* Payment Details Container */}
            <div className="mt-5 bg-[#070E1A]/90 border border-white/12 rounded-2xl p-4 sm:p-5 text-left space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-white/8">
                <span className="text-white/60">Amount Settled:</span>
                <span className="font-['Space_Grotesk',sans-serif] font-black text-emerald-400 text-lg sm:text-xl">
                  ₹{resolvedPayment?.totalAmount?.amount || totalPayableAmount}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Payment Mode:</span>
                <span className="font-bold text-cyan-400 uppercase font-mono">
                  {resolvedPayment?.PaymentType === 'cash' ? '💵 Cash Received' : '💳 Online (Razorpay)'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Payment Transaction ID:</span>
                <span className="font-mono text-white/80 truncate max-w-[200px]">
                  {resolvedPayment?.razorpay?.paymentId || resolvedPayment?.razorpay?.orderId || resolvedPayment?._id || `pay_${Date.now().toString().slice(-8)}`}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Customer:</span>
                <span className="font-bold text-white">{customerName}</span>
              </div>

              {workDetail && (
                <div className="pt-2 border-t border-white/8 text-[11px] sm:text-xs text-white/70">
                  <span className="font-bold text-white/90 block mb-0.5">Work Verified:</span>
                  <p className="font-mono text-white/60 line-clamp-2">{workDetail}</p>
                </div>
              )}
            </div>

            {/* Countdown Alert */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/60 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Redirecting to digital receipt in {redirectCountdown}s...</span>
            </div>

            {/* Manual Action Button */}
            <div className="mt-5">
              <button
                type="button"
                onClick={handleNavigateToSuccess}
                className="w-full py-3.5 sm:py-4 px-6 rounded-xl font-['Space_Grotesk',sans-serif] font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer active:scale-95"
              >
                <span>View Final Receipt & Summary</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
