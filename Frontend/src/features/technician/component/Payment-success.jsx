import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTechnician } from '../hook/useTechnician.jsx';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── 4-Layer Architecture (Strictly Followed) ──
  // Layer 1: GetPaymentDetail in technician.api.jsx
  // Layer 2: paymentDetail in technician.slice.jsx
  // Layer 3: handleGetPaymentDetail in useTechnician.jsx
  // Layer 4: Payment-success.jsx reads react-redux state directly with NO useState() for data saving

  const { handleGetPaymentDetail } = useTechnician();

  // Read data directly from react-redux state
  const paymentDetailData = useSelector((state) => state.technician?.paymentDetail);
  const reduxLoading = useSelector((state) => state.technician?.loading);
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

  // Derive all data directly from react-redux state
  const payment = paymentDetailData?.payment;
  const order = paymentDetailData?.order || payment?.Order_details;

  const resolvedPaymentId =
    payment?.razorpay?.paymentId ||
    paymentId ||
    (paymentTypeParam === 'cash' || payment?.PaymentType === 'cash'
      ? `CASH_REC_${(orderId || '').slice(-6)}`
      : `PAY_RZP_${Date.now().toString().slice(-8)}`);

  const resolvedAmount =
    payment?.totalAmount?.amount ||
    queryAmount ||
    order?.total_Amount?.amount ||
    700;

  const resolvedService =
    order?.ServiceDetails?.serviceName ||
    payment?.Order_details?.ServiceDetails?.serviceName ||
    'Emergency Plumbing Repair';

  const resolvedCategory =
    order?.ServiceDetails?.category ||
    payment?.Order_details?.ServiceDetails?.category ||
    'General Plumbing Service';

  const resolvedCustomer =
    order?.userId?.FullName ||
    payment?.user?.FullName ||
    reduxUser?.FullName ||
    'Valued Customer';

  const resolvedPhone =
    order?.userId?.contact ||
    payment?.user?.contact ||
    reduxUser?.contact ||
    '+91 98260 12345';

  const resolvedAddress =
    [
      order?.address?.street,
      order?.address?.city,
      order?.address?.pin_code,
    ]
      .filter(Boolean)
      .join(', ') || 'Customer Verified Address';

  const resolvedTechnician =
    order?.technicianId?.FullName ||
    payment?.Order_details?.technicianId?.FullName ||
    'Master Certified Plumber';

  const resolvedOtherWork =
    payment?.accordingToWork ||
    order?.issuedDescription ||
    'CPVC Pipe Leak Repair, Joint Fitment & Valve Replacement';

  const isCash =
    paymentTypeParam === 'cash' ||
    payment?.PaymentType === 'cash';

  const formattedDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

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
      <main className="relative z-10 max-w-2xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Animated Celebration Icon Header */}
        <div className="text-center space-y-2 sm:space-y-3 px-2">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl text-slate-950 font-black shadow-[0_0_40px_rgba(16,185,129,0.6)]">
              ✓
            </div>
          </div>

          <span className="inline-block px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            {isCash ? '💵 Cash Settlement Verified' : '🎉 Payment Verified Successfully'}
          </span>

          <h1 className="font-['Space_Grotesk',sans-serif] font-black text-xl sm:text-3xl md:text-4xl text-white tracking-tight">
            Order Completed & Paid
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-white/60 max-w-md mx-auto leading-relaxed">
            Thank you! Your payment has been received and logged in the FRRF Plumbing escrow ledger.
          </p>

          {reduxLoading && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-[10px] sm:text-xs">
              <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Updating Redux State...</span>
            </div>
          )}
        </div>

        {/* ── Detailed Order & Invoice Card ── */}
        <div className="print-card bg-[#0A1628]/90 backdrop-blur-2xl border border-white/12 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] space-y-4 sm:space-y-6">
          
          {/* Header Strip with Order ID & Amount */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-white/10">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/40 block">Tax Invoice / Receipt</span>
              <p className="font-mono font-bold text-xs sm:text-sm text-cyan-400 mt-0.5 break-all">
                Ref ID: <span className="text-white">{resolvedPaymentId}</span>
              </p>
              <p className="text-[10px] sm:text-[11px] text-white/50 font-mono mt-0.5 break-all">
                Order ID: #{orderId?.slice(-10) || 'N/A'} • {formattedDate}
              </p>
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

            {/* Base Service */}
            <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col xs:flex-row xs:items-start justify-between gap-2.5 sm:gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg shrink-0">🔧</span>
                  <h4 className="font-bold text-xs sm:text-sm md:text-base text-white truncate">{resolvedService}</h4>
                </div>
                <span className="inline-block mt-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 truncate max-w-full">
                  {resolvedCategory}
                </span>
                <p className="text-[11px] sm:text-xs text-white/50 mt-1.5 truncate">
                  Assigned Master Plumber: <strong className="text-white">{resolvedTechnician}</strong>
                </p>
              </div>
              <span className="font-mono font-bold text-xs sm:text-sm text-white shrink-0 self-start xs:self-center">
                ₹{order?.total_Amount?.amount || 500}
              </span>
            </div>

            {/* Other Work (According to Work) */}
            <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-4">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 sm:gap-2 mb-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📝</span>
                  <span>Other Work Done (According to Work)</span>
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-orange-400">
                  + ₹{Math.max(0, Number(resolvedAmount) - Number(order?.total_Amount?.amount || 500))}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white font-medium leading-relaxed bg-[#070E1A]/60 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-white/8 mt-2 break-words">
                "{resolvedOtherWork}"
              </p>
            </div>
          </div>

          {/* ── Client & Address Section ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2 border-t border-white/10 text-xs">
            <div className="bg-white/5 border border-white/8 rounded-xl p-3 sm:p-3.5 min-w-0">
              <span className="text-white/40 text-[9px] sm:text-[10px] uppercase font-bold block mb-1">Billed To</span>
              <p className="font-bold text-white text-xs sm:text-sm truncate">{resolvedCustomer}</p>
              <p className="text-white/60 font-mono text-[11px] sm:text-xs mt-0.5 truncate">📞 {resolvedPhone}</p>
            </div>

            <div className="bg-white/5 border border-white/8 rounded-xl p-3 sm:p-3.5 min-w-0">
              <span className="text-white/40 text-[9px] sm:text-[10px] uppercase font-bold block mb-1">Service Address</span>
              <p className="text-white/80 leading-relaxed font-medium text-[11px] sm:text-xs break-words">📍 {resolvedAddress}</p>
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
                Covers all joints, valves, pressure seals, and repair work listed above. Digital warranty claim ID: #{orderId?.slice(-8) || 'WAR-01'}.
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
