import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useRazorpay } from 'react-razorpay';
import { useTechnician } from '../hook/useTechnician.jsx';
import { GetIdS } from '../../order/service/order.api.jsx';

export default function Payment() {
  const { OrderId } = useParams();
  const navigate = useNavigate();
  const { Razorpay, isLoaded } = useRazorpay();
  const { handleCreateOrderPayment, handleVerifyOrder } = useTechnician();

  // Current logged in user from Redux
  const reduxUser = useSelector((state) => state.auth?.User);

  // Order & Billing State
  const [orderData, setOrderData] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [otherWork, setOtherWork] = useState('');
  const [serviceBaseAmount, setServiceBaseAmount] = useState(500);
  const [extraAmount, setExtraAmount] = useState(0);
  const [paymentType, setPaymentType] = useState('online'); // 'online' | 'cash'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Total payable calculation: base service + technician extra work
  const totalAmount = Math.max(0, Number(serviceBaseAmount) + Number(extraAmount || 0));

  // Fetch Order details on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchOrder() {
      try {
        setLoadingOrder(true);
        if (OrderId && OrderId !== 'LIVE_DEMO_ORDER') {
          const res = await GetIdS({ OrderId });
          if (isMounted && res?.order) {
            setOrderData(res.order);
            const baseAmt = res.order?.total_Amount?.amount || 500;
            setServiceBaseAmount(Number(baseAmt));
            if (res.order?.issuedDescription) {
              setOtherWork(res.order.issuedDescription);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch order, using fallback demo state:', err?.message || err);
      } finally {
        if (isMounted) setLoadingOrder(false);
      }
    }
    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [OrderId]);

  // Razorpay Checkout handler
  const handleCheckout = (createdOrder, paymentDoc) => {
    return new Promise((resolve, reject) => {
      try {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

        const customerName =
          orderData?.userId?.FullName || reduxUser?.FullName || 'Valued Customer';
        const customerEmail =
          orderData?.userId?.email || reduxUser?.email || 'customer@frrfplumbing.com';
        const customerContact =
          orderData?.userId?.contact || reduxUser?.contact || '9876543210';

        const options = {
          key: razorpayKey,
          amount: totalAmount * 100, // paise
          currency: 'INR',
          name: 'FRRF Plumbing Services',
          description: `Invoice for ${orderData?.ServiceDetails?.serviceName || 'Plumbing Service'} - Order #${(OrderId || '').slice(-6)}`,
          image: '/frrf-logo.png',
          order_id: createdOrder?.id || createdOrder?.orderId,
          handler: async (response) => {
            try {
              setIsProcessing(true);
              const verifyPayload = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                OrderId: OrderId || orderData?._id,
              };

              const verifyResult = await handleVerifyOrder(verifyPayload);

              if (verifyResult?.success || verifyResult?.payment) {
                navigate(
                  `/technician/payment-success?OrderId=${OrderId || orderData?._id}&paymentId=${response.razorpay_payment_id}`
                );
                resolve(verifyResult);
              } else {
                setErrorMessage('Payment verification unconfirmed. Please contact support.');
                reject(new Error('Payment verification unconfirmed'));
              }
            } catch (vErr) {
              console.error('Verification error:', vErr);
              // Still navigate if payment was received
              navigate(
                `/technician/payment-success?OrderId=${OrderId || orderData?._id}&paymentId=${response.razorpay_payment_id}`
              );
              resolve(response);
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerContact,
          },
          notes: {
            OrderId: OrderId || '',
            accordingToWork: otherWork || 'Standard Work',
          },
          theme: {
            color: '#FF6B00',
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setErrorMessage('Payment popup closed. You can retry whenever ready.');
            },
          },
        };

        const razorpayInstance = new (window.Razorpay || Razorpay)(options);
        razorpayInstance.on('payment.failed', function (resp) {
          console.error('Razorpay payment failed:', resp.error);
          setErrorMessage(resp.error?.description || 'Payment transaction failed.');
          setIsProcessing(false);
          reject(resp.error);
        });
        razorpayInstance.open();
      } catch (err) {
        console.error('handleCheckout error:', err);
        setErrorMessage(err?.message || 'Failed to open Razorpay gateway.');
        setIsProcessing(false);
        reject(err);
      }
    });
  };

  // Main Pay Now click handler
  const handlePayNow = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otherWork.trim()) {
      setErrorMessage('Please enter details of the work done in "Other work (according to work)".');
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Hit API to create payment order ({ OrderId, accordingtowork, amount, payment_type })
      const payload = {
        OrderId: OrderId || orderData?._id || 'LIVE_DEMO_ORDER',
        accordingToWork: otherWork.trim(),
        amount: totalAmount,
        PaymentType: paymentType,
        currency: 'INR',
      };

      const res = await handleCreateOrderPayment(payload);

      // 2. Handle Online vs Cash flow
      if (paymentType === 'cash') {
        // Direct cash receipt completion
        navigate(
          `/technician/payment-success?OrderId=${OrderId || orderData?._id}&type=cash&amount=${totalAmount}`
        );
        return;
      }

      // Online: Trigger Razorpay popup
      if (res?.order) {
        await handleCheckout(res.order, res.PaymentData);
      } else {
        // Fallback checkout order
        await handleCheckout({ id: 'order_FRRF_' + Date.now() }, res?.PaymentData);
      }
    } catch (err) {
      console.error('Error during Pay Now:', err);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Payment initiation failed. Please try again.'
      );
      setIsProcessing(false);
    }
  };

  // Suggestions for quick work tags
  const workSuggestions = [
    'CPVC Pipe Leak Repair',
    'Brass Tap Replacement',
    'Drainage Clog Removal',
    'Water Motor Valve Fix',
    'Concealed Pipeline Joint',
    'Flush Tank Overhaul',
  ];

  return (
    <div
      className="min-h-screen bg-[#070E1A] text-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-orange-500 selection:text-black pb-12 sm:pb-20 relative overflow-x-hidden w-full"
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
      <header className="sticky top-0 z-40 bg-[#0A1628]/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 md:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-3">
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
              <span className="truncate">Invoice & Payment</span>
              <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 sm:px-2 py-0.5 rounded-full uppercase shrink-0">
                Job Completed
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-white/50 truncate">
              Order: <strong className="text-cyan-400 font-mono">#{OrderId?.slice(-8) || 'N/A'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-white/50 hidden md:inline">Protected by</span>
          <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] sm:text-xs font-bold text-cyan-300 flex items-center gap-1">
            🔒 <span className="hidden xs:inline">Razorpay</span> 256-Bit
          </span>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="relative z-10 max-w-4xl mx-auto px-3 sm:px-5 md:px-6 pt-4 sm:pt-6 md:pt-8 space-y-4 sm:space-y-6">
        
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="bg-rose-500/15 border-2 border-rose-500/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 sm:gap-3 shadow-lg">
            <span className="text-base sm:text-lg shrink-0">⚠️</span>
            <div className="flex-1 min-w-0 break-words">
              <strong className="block font-bold">Action Required</strong>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-rose-400 hover:text-white font-bold px-1.5 py-0.5 shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Order Summary Card ── */}
        <div className="bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 sm:gap-4 pb-3.5 sm:pb-4 border-b border-white/10">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Service Order Details
              </span>
              <h2 className="font-['Space_Grotesk',sans-serif] font-black text-base sm:text-xl md:text-2xl text-white mt-0.5 truncate">
                {orderData?.ServiceDetails?.serviceName || 'Emergency Plumbing Repair'}
              </h2>
              <span className="inline-block mt-1 bg-white/5 text-white/60 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 truncate max-w-full">
                {orderData?.ServiceDetails?.category || 'General Plumbing & Fittings'}
              </span>
            </div>

            <div className="text-left xs:text-right shrink-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/40 block">Base Service Fee</span>
              <span className="text-lg sm:text-2xl font-black text-emerald-400">
                ₹{serviceBaseAmount}
              </span>
            </div>
          </div>

          {/* Client & Address Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-3.5 sm:pt-4 text-xs">
            <div className="bg-white/5 border border-white/8 rounded-xl p-3 sm:p-3.5 min-w-0">
              <span className="text-white/40 text-[9px] sm:text-[10px] uppercase font-bold block mb-0.5">Client</span>
              <p className="font-bold text-white text-xs sm:text-sm truncate">
                {orderData?.userId?.FullName || reduxUser?.FullName || 'Valued Customer'}
              </p>
              <p className="text-white/60 font-mono text-[11px] sm:text-xs mt-0.5 truncate">
                📞 {orderData?.userId?.contact || reduxUser?.contact || '+91 98765 43210'}
              </p>
            </div>

            <div className="bg-white/5 border border-white/8 rounded-xl p-3 sm:p-3.5 min-w-0">
              <span className="text-white/40 text-[9px] sm:text-[10px] uppercase font-bold block mb-0.5">Service Location</span>
              <p className="text-white font-medium text-xs sm:text-xs leading-relaxed break-words">
                📍 {[orderData?.address?.street, orderData?.address?.city, orderData?.address?.pin_code].filter(Boolean).join(', ') || 'Service Address on File'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Main Payment & Work Entry Form (Per Flow Diagram) ── */}
        <form onSubmit={handlePayNow} className="space-y-4 sm:space-y-6">
          <div className="bg-[#0A1628]/85 backdrop-blur-2xl border border-white/12 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-5 sm:space-y-6">
            
            {/* 1. OTHER WORK (ACCORDING TO WORK) */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="font-['Space_Grotesk',sans-serif] font-bold text-xs sm:text-sm md:text-base text-white flex items-center gap-1.5 sm:gap-2">
                  <span>📝</span>
                  <span>Other work (according to work)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] sm:text-[11px] text-white/40">Work description</span>
              </div>

              <textarea
                value={otherWork}
                onChange={(e) => setOtherWork(e.target.value)}
                placeholder="Specify extra plumbing work, spare parts, joint replacements, or diagnostics performed according to work..."
                rows={3}
                required
                className="w-full bg-[#070E1A]/90 border border-white/15 focus:border-orange-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all font-sans leading-relaxed resize-y min-h-[80px]"
              />

              {/* Quick Suggestion Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-white/40 self-center mr-1 shrink-0">Quick Add:</span>
                {workSuggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!otherWork.includes(tag)) {
                        setOtherWork((prev) => (prev ? `${prev}, ${tag}` : tag));
                      }
                    }}
                    className="text-[9px] sm:text-[10px] font-semibold bg-white/5 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/40 border border-white/10 px-2 sm:px-2.5 py-1 rounded-lg text-white/70 transition-all cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. AMOUNT SECTION: SHOW SERVICE AMOUNT ALSO ADD ACCORDING WORK TECHNICIAN */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="font-['Space_Grotesk',sans-serif] font-bold text-xs sm:text-sm md:text-base text-white flex items-center gap-1.5 sm:gap-2">
                <span>💰</span>
                <span>Billing Breakdown (Base Service + Extra Work)</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Base Service Amount Display */}
                <div className="bg-[#070E1A]/90 border border-white/10 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
                  <span className="text-[11px] sm:text-xs text-white/50">Base Service Fee (Order)</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-xl sm:text-2xl font-black text-cyan-400">₹{serviceBaseAmount}</span>
                    <span className="text-[10px] text-white/40">Standard</span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">
                    Fixed standard diagnostics & visit fee
                  </p>
                </div>

                {/* Additional Technician Amount Input */}
                <div className="bg-[#070E1A]/90 border border-orange-500/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
                  <label className="text-[11px] sm:text-xs text-orange-300 font-bold flex items-center justify-between">
                    <span>Add According to Work (Technician)</span>
                    <span className="text-[10px] text-orange-400/80">Extra Charges</span>
                  </label>
                  
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-black text-base sm:text-lg">
                      + ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={extraAmount}
                      onChange={(e) => setExtraAmount(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full bg-white/5 border border-orange-500/40 rounded-xl py-2 pl-10 sm:pl-12 pr-3 text-white font-mono font-black text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      placeholder="0"
                    />
                  </div>

                  {/* Preset Amount Increment Buttons (Grid for all screens) */}
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                    {[100, 200, 350, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setExtraAmount(amt)}
                        className={`py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                          extraAmount === amt
                            ? 'bg-orange-500 text-black border-orange-400 font-black shadow-sm'
                            : 'bg-white/5 text-white/70 border-white/10 hover:border-orange-500/40'
                        }`}
                      >
                        +₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Calculation Highlight Strip */}
              <div className="bg-gradient-to-r from-[#070E1A] via-emerald-950/40 to-[#070E1A] border-2 border-emerald-500/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 sm:gap-4 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Total Final Payable
                  </span>
                  <p className="text-[11px] sm:text-xs text-white/60 mt-0.5">
                    ₹{serviceBaseAmount} (Base) + ₹{extraAmount} (Extra Work)
                  </p>
                </div>
                <div className="text-left xs:text-right">
                  <span className="font-['Space_Grotesk',sans-serif] font-black text-2xl sm:text-3xl text-emerald-400">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. PAYMENT TYPE SELECTION */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="font-['Space_Grotesk',sans-serif] font-bold text-xs sm:text-sm md:text-base text-white flex items-center gap-1.5 sm:gap-2">
                <span>💳</span>
                <span>Select Payment Type</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Option 1: Razorpay Online */}
                <div
                  onClick={() => setPaymentType('online')}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentType === 'online'
                      ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_25px_rgba(255,107,53,0.25)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    checked={paymentType === 'online'}
                    onChange={() => setPaymentType('online')}
                    className="mt-1 accent-orange-500 cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white">Online Payment (Razorpay)</span>
                      <span className="px-1.5 sm:px-2 py-0.5 bg-orange-500/20 text-orange-300 text-[9px] sm:text-[10px] font-bold rounded">
                        Fastest
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                      Instant verification via UPI (GPay, PhonePe, Paytm), Card, or Netbanking.
                    </p>
                  </div>
                </div>

                {/* Option 2: Cash on Completion */}
                <div
                  onClick={() => setPaymentType('cash')}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentType === 'cash'
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    checked={paymentType === 'cash'}
                    onChange={() => setPaymentType('cash')}
                    className="mt-1 accent-emerald-500 cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white">Cash on Delivery</span>
                      <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-bold rounded">
                        Cash
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                      Hand cash directly to Master Plumber upon satisfactory job completion.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. PAY NOW BUTTON */}
            <div className="pt-3 sm:pt-4 border-t border-white/10 space-y-2.5 sm:space-y-3">
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-['Space_Grotesk',sans-serif] font-black text-xs sm:text-sm md:text-base tracking-wide flex items-center justify-center gap-2 sm:gap-3 transition-all cursor-pointer active:scale-[0.98] shadow-2xl ${
                  isProcessing
                    ? 'bg-white/20 text-white/50 cursor-not-allowed'
                    : paymentType === 'online'
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-slate-950 shadow-[0_0_35px_rgba(255,107,53,0.5)]'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>Processing Payment Order...</span>
                  </>
                ) : (
                  <>
                    <span>🔒</span>
                    <span className="truncate">
                      {paymentType === 'online' ? `Pay Now ₹${totalAmount} via Razorpay →` : `Confirm Cash Settlement ₹${totalAmount} →`}
                    </span>
                  </>
                )}
              </button>

              <p className="text-[10px] sm:text-[11px] text-center text-white/40 leading-relaxed px-2">
                By completing payment you activate the <strong>FRRF 90-Day Leak Protection Warranty</strong> for this service.
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
