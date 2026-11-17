import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useOrder from '../hook/useOrder';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── 4-Layer Architecture ──
  // Layer 1: GetPaymentDetail in order.api.jsx
  // Layer 2: paymentDetail in order.slice.jsx
  // Layer 3: handleGetPaymentDetail in useOrder.jsx
  // Layer 4: Payment-success.jsx reads react-redux state directly
  const { handleGetPaymentDetail } = useOrder();

  // Read data directly from react-redux state (checking order.slice and technician.slice fallback)
  const paymentDetailData = useSelector((state) => state.order?.paymentDetail || state.technician?.paymentDetail);
  const reduxLoading = useSelector((state) => state.order?.loading || state.technician?.loading);
  const reduxUser = useSelector((state) => state.auth?.User);

  const orderId =
    searchParams.get('OrderId') ||
    searchParams.get('orderId') ||
    searchParams.get('order_id');
  const paymentId =
    searchParams.get('paymentId') ||
    searchParams.get('payment_id') ||
    searchParams.get('razorpay_payment_id');
  const paymentTypeParam = searchParams.get('type') || 'online';
  const queryAmount = searchParams.get('amount');

  // Trigger Hook function on mount to fetch and save data in Redux Slice
  useEffect(() => {
    if (orderId && orderId !== 'LIVE_DEMO_ORDER') {
      handleGetPaymentDetail(orderId).catch((err) => {
        console.warn('handleGetPaymentDetail note:', err?.message || err);
      });
    }
  }, [orderId]);

  // Derive real data structure: data.payment
  const payment = paymentDetailData?.payment || paymentDetailData;
  const order = payment?.Order_details || paymentDetailData?.order;

  // Resolve Real Data directly from data.payment
  const resolvedPaymentId =
    payment?.razorpay?.paymentId ||
    payment?.razorpay?.orderId ||
    paymentId ||
    payment?._id ||
    'PAY_U0uwrYPY6vXQy8';

  const resolvedOrderId =
    order?._id ||
    orderId ||
    payment?.Order_details?._id ||
    '6afb25188c156b6ae7e09dc0';

  const resolvedAmount =
    payment?.totalAmount?.amount ??
    order?.total_Amount?.amount ??
    (queryAmount ? Number(queryAmount) : 3250);

  const resolvedCurrency =
    payment?.totalAmount?.currency ||
    order?.total_Amount?.currency ||
    'INR';

  const resolvedStatus = payment?.status || order?.status || 'Completed';

  // Service Details from order.ServiceDetails
  const serviceDetails = order?.ServiceDetails;
  console.log(serviceDetails)
  const resolvedService = serviceDetails?.serviceName || 'Full Setup / Renovation';
  const resolvedCategory = serviceDetails?.category || 'Full Setup';
  const baseServiceFee =  serviceDetails?.price?.amount || 250;
  const estimatedTime = serviceDetails?.EstimatedTimeMinutes || 60;
  const serviceImageUrl = serviceDetails?.serviceImg?.[0]?.url;

  // Customer Information from payment.user or order.userId
  const customerUser = payment?.user || order?.userId || reduxUser;
  const resolvedCustomer = customerUser?.FullName || 'Rahul';
  const resolvedEmail = customerUser?.email || 'Rahul@gmail.com';
  const resolvedPhone = customerUser?.contact || '+91 85965 87482';

  // Technician Information from order.technicianId
  const techPartner = order?.technicianId;
  const resolvedTechnician =
    techPartner?.userId?.FullName ||
    techPartner?.FullName ||
    'Master Certified Plumber';
  const techExperience = techPartner?.experienceYears || 1;
  const techRating = techPartner?.rating || 5;
  const techSkills = Array.isArray(techPartner?.skills)
    ? techPartner.skills.join(', ')
    : techPartner?.skills || 'Plumbing & Pipe Repair';
  const techCity = techPartner?.permanentAddress?.city || 'Burhanpur';

  // Address Information from order.address
  const addressObj = order?.address;
  const addressLabel = addressObj?.label || 'Home';
  const resolvedAddress =
    [addressObj?.street, addressObj?.city, addressObj?.pin_code]
      .filter(Boolean)
      .join(', ') || 'Phopnar kalan, Buhranpur - 450431';

  // Work specifications & Extra charges
  const resolvedOtherWork =
    payment?.accordingToWork ||
    order?.PaymentWorkDetail ||
    order?.issueDescription ||
    'deal done by technician Payment 10000';

  const extraWorkAmount = Math.max(0, Number(resolvedAmount) - Number(baseServiceFee));

  const resolvedIssueDesc =
    order?.issueDescription ||
    'Inspection of home and finalization of plumbing setup';

  const paymentMode = (payment?.PaymentType || paymentTypeParam || 'online').toLowerCase();
  const isCash = paymentMode === 'cash';

  // Format Dates
  const formattedDate = payment?.createdAt
    ? new Date(payment.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      })
    : new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      });

  const scheduledDate = order?.scheduleDate
    ? new Date(order.scheduleDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      })
    : null;

  return (
    <div
      className="min-h-screen bg-[#070E1A] text-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500 selection:text-black py-6 sm:py-12 md:py-16 px-3 sm:px-6 relative overflow-x-hidden w-full"
      style={{
        backgroundImage: "url('/images/hero-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Print Specific Styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-card { border: 1px solid #ccc !important; background: white !important; color: black !important; box-shadow: none !important; }
          .print-card * { color: black !important; }
        }
      `}</style>

      {/* Ambient Glows */}
      <div className="absolute inset-0 bg-[#070E1A]/94 backdrop-blur-md" />
      <div className="absolute top-12 left-1/3 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      {/* ── MAIN RECEIPT CONTAINER (All-device responsive) ── */}
      <main className="relative z-10 max-w-3xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Animated Celebration Icon Header */}
        <div className="text-center space-y-2 sm:space-y-3 px-2">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl text-slate-950 font-black shadow-[0_0_40px_rgba(16,185,129,0.6)]">
              ✓
            </div>
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            {isCash ? '💵 Cash Settlement Verified' : '🎉 Payment Verified Successfully'}
          </span>

          <h1 className="font-['Space_Grotesk',sans-serif] font-black text-xl sm:text-3xl md:text-4xl text-white tracking-tight">
            Order Completed & Paid
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-white/60 max-w-md mx-auto leading-relaxed">
            Thank you! Your payment has been received and verified in the FRRF escrow ledger.
          </p>

          {reduxLoading && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-[10px] sm:text-xs">
              <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Updating Redux State...</span>
            </div>
          )}
        </div>

        {/* ── Detailed Order & Invoice Card ── */}
        <div className="print-card bg-[#0A1628]/90 backdrop-blur-2xl border border-white/12 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] space-y-5 sm:space-y-6">
          
          {/* Header Strip with Order ID & Amount */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-white/10">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/40 block">Tax Invoice / Digital Receipt</span>
              <p className="font-mono font-bold text-xs sm:text-sm text-cyan-400 mt-0.5 break-all">
                Ref ID: <span className="text-white">{resolvedPaymentId}</span>
              </p>
              <p className="text-[10px] sm:text-[11px] text-white/50 font-mono mt-0.5 break-all">
                Order ID: #{String(resolvedOrderId).slice(-10)} • {formattedDate}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-bold">
                  Status: {resolvedStatus}
                </span>
                {scheduledDate && (
                  <span className="text-[10px] text-white/40 font-mono">
                    Scheduled: {scheduledDate}
                  </span>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Total Paid
              </span>
              <span className="font-['Space_Grotesk',sans-serif] font-black text-2xl sm:text-3xl text-emerald-400">
                ₹{resolvedAmount}
              </span>
              <span className="block text-[10px] text-white/50 capitalize font-medium">
                Via {isCash ? 'Cash to Plumber' : 'Razorpay Secure'}
              </span>
            </div>
          </div>

          {/* ── Service Detail & Other Work (According to Work) ── */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-[11px] sm:text-xs uppercase tracking-wider text-cyan-400">
              Work Performed Breakdown
            </h3>

            {/* Base Service Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col xs:flex-row xs:items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {serviceImageUrl ? (
                  <img
                    src={serviceImageUrl}
                    alt={resolvedService}
                    className="w-12 h-12 rounded-xl object-cover border border-white/15 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl shrink-0">
                    🔧
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm md:text-base text-white truncate">
                    {resolvedService}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 truncate">
                      {resolvedCategory}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-white/50 font-mono">
                      ⏱️ {estimatedTime} mins
                    </span>
                  </div>
                  {resolvedIssueDesc && (
                    <p className="text-[11px] sm:text-xs text-white/50 mt-1.5 line-clamp-2">
                      <strong className="text-white/70">Issue Reported:</strong> {resolvedIssueDesc}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-white/40 uppercase block">Base Charge</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-white">
                  ₹{baseServiceFee}
                </span>
              </div>
            </div>

            {/* Other Work (According to Work) */}
            <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-4">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 sm:gap-2 mb-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📝</span>
                  <span>Other Work Done (According to Work)</span>
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-orange-400">
                  + ₹{extraWorkAmount}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white font-medium leading-relaxed bg-[#070E1A]/60 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-white/8 mt-2 break-words">
                "{resolvedOtherWork}"
              </p>
            </div>
          </div>

          {/* ── Client & Address Section ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2 border-t border-white/10 text-xs">
            {/* Customer Details */}
            <div className="bg-white/5 border border-white/8 rounded-xl p-3 sm:p-3.5 min-w-0">
              <span className="text-white/40 text-[9px] sm:text-[10px] uppercase font-bold block mb-1">
                Billed Client Details
              </span>
              <p className="font-bold text-white text-xs sm:text-sm truncate">{resolvedCustomer}</p>
              <p className="text-white/60 font-mono text-[11px] sm:text-xs mt-0.5 truncate">
                📞 {resolvedPhone}
              </p>
              {resolvedEmail && (
                <p className="text-white/45 font-mono text-[10px] truncate mt-0.5">
                  ✉️ {resolvedEmail}
                </p>
              )}
            </div>

            {/* Service Location */}
            <div className="bg-white/5 border border-white/8 rounded-xl p-3 sm:p-3.5 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/40 text-[9px] sm:text-[10px] uppercase font-bold">
                  Service Destination
                </span>
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                  {addressLabel}
                </span>
              </div>
              <p className="text-white/80 leading-relaxed font-medium text-[11px] sm:text-xs break-words">
                📍 {resolvedAddress}
              </p>
            </div>
          </div>

          {/* ── Assigned Certified Technician Card ── */}
          <div className="bg-white/5 border border-white/8 rounded-xl p-3.5 sm:p-4 text-xs">
            <span className="text-white/40 text-[9px] sm:text-[10px] uppercase font-bold block mb-1.5">
              Certified Technician Partner
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-sm font-bold text-cyan-300">
                  👨‍🔧
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs sm:text-sm">
                    {resolvedTechnician}
                  </h5>
                  <p className="text-[10px] sm:text-[11px] text-white/50">
                    {techExperience} Year Exp • {techCity} Operating Hub • Skills: {techSkills}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full self-start sm:self-center">
                ★ {techRating}.0 Top Rated Partner
              </span>
            </div>
          </div>

          {/* ── 90-Day Protection Guarantee Badge ── */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-start sm:items-center gap-3 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl sm:text-2xl shrink-0">
              🛡️
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-bold text-xs sm:text-sm text-emerald-300">
                FRRF 90-Day Workmanship Warranty Active
              </h5>
              <p className="text-[10px] sm:text-[11px] text-white/50 mt-0.5 leading-relaxed break-words">
                Covers all joints, valves, pressure seals, and repair work listed above. Digital warranty claim ID: #{String(resolvedOrderId).slice(-8)}.
              </p>
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS (NO-PRINT) ── */}
        <div className="no-print flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="w-full sm:flex-1 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <span>🖨️</span>
            <span>Print / Save Tax Invoice</span>
          </button>

          <button
            onClick={() => {
              if (reduxUser?.role === 'technician') {
                navigate('/technician/Technician-Dashboard');
              } else {
                navigate('/customer/profile');
              }
            }}
            className="w-full sm:flex-1 py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer active:scale-95"
          >
            <span>🏠</span>
            <span>Return to Dashboard →</span>
          </button>
        </div>

        <p className="no-print text-center text-[10px] sm:text-[11px] text-white/40 px-2 leading-relaxed">
          Need assistance with this invoice? Contact 24/7 Support at <strong>support@frrfplumbing.com</strong>
        </p>
      </main>
    </div>
  );
}
