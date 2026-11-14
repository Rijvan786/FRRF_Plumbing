import React, { useState, useRef } from 'react';
import { Form, useNavigate } from 'react-router-dom';
import { usepulmberService } from '../hook/useplumberservice.jsx';
import { current } from '@reduxjs/toolkit';

/* ── Inline SVG Icons ── */
const UploadCloudIcon = ({ className = 'w-9 h-9' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const TrashIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const CloseIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CATEGORY_OPTIONS = [
  { id: "Leakage", label: "Leakage", icon: '💧', desc: 'Tap, Concealed Pipe & Joints' },
  { id: "Blockage", label: "Blockage", icon: '🔧', desc: 'Sink, Toilet & Sewer' },
  { id: "Installation", label: "Installation", icon: '⚙️', desc: 'Tank, Motor & Geyser' },
  { id: "Full Setup", label: "Full Setup", icon: '🚽', desc: 'Commode, Basin & Siphon' },
  { id: "Inspection", label: "Inspection", icon: '🔍', desc: 'Pressure & Acoustic Scan' },
  { id: "Maintenance", label: "Maintenance", icon: '🔍', desc: 'Water Tank Cleaning,Health Faucet Repair' },
 
  { id: "Emergency SOS", label: "Emergency SOS", icon: '🚨', desc: '18-Min Immediate Arrival' },
];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹ - Indian Rupee)' },
  { code: 'USD', symbol: '$', label: 'USD ($ - US Dollar)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€ - Euro)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£ - British Pound)' },
  { code: 'AED', symbol: 'AED', label: 'AED (Dirham)' },
];

const QUICK_DURATIONS = ['30', '45', '60', '90', '120'];

export default function CreateService({ isModal = false, onClose, onServiceCreated }) {
  const navigate = useNavigate();
  const { handleCreateService, loadingAction } = usepulmberService();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    serviceName: '',
    category: '',
    currency: 'INR',
    amount: '',
    EstimatedTimeMinutes: '45',
    description: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Drag and Drop listeners
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const onFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles) => {
    setErrorMsg('');
    const validImages = newFiles.filter((f) => f.type.startsWith('image/'));

    if (validImages.length === 0) {
      setErrorMsg('Please select valid image files (PNG, JPG, JPEG, WebP).');
      return;
    }

    if (images.length + validImages.length > 7) {
      setErrorMsg('You can upload a maximum of 7 images per service.');
      return;
    }

    const updatedImages = [...images, ...validImages];
    setImages(updatedImages);

    const newPreviews = validImages.map((file) => ({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      url: URL.createObjectURL(file),
      file,
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[indexToRemove]?.url);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.serviceName.trim()) {
      setErrorMsg('Please enter the Service Name.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setErrorMsg('Please enter a valid price amount.');
      return;
    }
    if (!formData.EstimatedTimeMinutes || Number(formData.EstimatedTimeMinutes) <= 0) {
      setErrorMsg('Please specify estimated time in minutes.');
      return;
    }

    setSubmitting(true);
    try {
      console.log("formdata before apend Formdata",formData.serviceName,formData.category,formData.currency,formData.amount,images);
      const formdata = new FormData();
      formdata.append('serviceName', formData.serviceName);
      formdata.append('category', formData.category);
      formdata.append('currency', formData.currency);
      formdata.append('amount', formData.amount);
      formdata.append('EstimatedTimeMinutes', formData.EstimatedTimeMinutes);

      images.forEach((imgFile) => {
        formdata.append('Images', imgFile);
      });
      console.log("Formdata",formdata);   

      const response = await handleCreateService(formdata);

      // Map matching Home page service style
      const defaultImg =
        formData.category.includes('Leak') ? '/images/leakage.png'
        : formData.category.includes('Block') ? '/images/blockage.png'
        : formData.category.includes('Install') ? '/images/installation.png'
        : formData.category.includes('Inspect') ? '/images/inspection.png'
        : '/images/maintenance.png';

      const createdServiceData = {
        id: response?.services?._id || `srv-${Date.now()}`,
        name: formData.serviceName.trim(),
        category: formData.category,
        currency: formData.currency,
        price: Number(formData.amount),
        estimatedMinutes: Number(formData.EstimatedTimeMinutes),
        status: 'Running',
        icon: CATEGORY_OPTIONS.find((c) => c.id === formData.category)?.icon || '💧',
        image: imagePreviews[0]?.url || defaultImg,
        images: imagePreviews.map((p) => p.url),
        activeTechs: 12,
        tag: 'New Active',
        tagBg: 'bg-orange-500',
        description: formData.description || `${formData.category} at upfront fixed rates`,
      };

      setSuccessMsg(`Service "${formData.serviceName}" is now published and Running!`);

      if (onServiceCreated) {
        onServiceCreated(createdServiceData);
      }

      setTimeout(() => {
        if (isModal && onClose) {
          onClose();
        } else if (!isModal) {
          navigate('/admin');
        }
      }, 1100);
    } catch (err) {
      console.error('Service creation error:', err);
      // Fallback in local state
      const defaultImg =
        formData.category.includes('Leak') ? '/images/leakage.png'
        : formData.category.includes('Block') ? '/images/blockage.png'
        : '/images/installation.png';

      const fallbackService = {
        id: `srv-${Date.now()}`,
        name: formData.serviceName.trim(),
        category: formData.category,
        currency: formData.currency,
        price: Number(formData.amount),
        estimatedMinutes: Number(formData.EstimatedTimeMinutes),
        status: 'Running',
        icon: CATEGORY_OPTIONS.find((c) => c.id === formData.category)?.icon || '💧',
        image: imagePreviews[0]?.url || defaultImg,
        images: imagePreviews.map((p) => p.url),
        activeTechs: 8,
        tag: 'New Active',
        tagBg: 'bg-orange-500',
        description: formData.description || `${formData.category} at upfront fixed rates`,
      };

      if (onServiceCreated) {
        onServiceCreated(fallbackService);
        setSuccessMsg(`Service "${formData.serviceName}" published locally!`);
        setTimeout(() => {
          if (isModal && onClose) onClose();
        }, 1100);
      } else {
        setErrorMsg(
          err?.response?.data?.message || err?.message || 'Failed to create service. Please check fields.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`w-full ${isModal ? '' : 'min-h-screen bg-gradient-to-r from-[#070E1A]/97 via-[#0A1628]/88 to-[#0A1628]/55 p-4 sm:p-8 flex items-center justify-center font-[\'Inter\',sans-serif] relative overflow-hidden'}`}>
      {!isModal && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-30"
            style={{ backgroundImage: `url('/images/hero-bg.png')` }}
          />
          <div className="fixed top-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="fixed bottom-0 right-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className={`w-full ${isModal ? 'bg-[#0B1528] rounded-2xl sm:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col' : 'max-w-3xl bg-[#0B1528]/95 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-9 shadow-[0_32px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl relative z-10'}`}>
        {/* Top Header Card matching Home Page Theme */}
        <div className="p-4 sm:p-7 border-b border-white/10 bg-gradient-to-r from-[#0E1E38] via-[#0A1628] to-[#122342] flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-orange-500/10 border border-orange-500/25 rounded-full px-2.5 sm:px-3.5 py-0.5 sm:py-1 mb-1.5 sm:mb-2">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-orange-400 rounded-full animate-pulse shadow-[0_0_8px_#fb923c]" />
              <span className="text-orange-400 font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                FRRF Core Operations
              </span>
            </div>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-lg sm:text-3xl text-white tracking-tight leading-tight">
              Add New Plumbing Service
            </h2>
            <p className="text-white/50 text-[11px] sm:text-sm mt-0.5 sm:mt-1">
              Configure pricing, categories, and upload service photos for customer booking
            </p>
          </div>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              title="Close modal"
            >
              <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* Feedback alerts */}
        {errorMsg && (
          <div className="mx-4 sm:mx-8 mt-4 sm:mt-6 bg-rose-500/10 border border-rose-500/25 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-4 sm:mx-8 mt-4 sm:mt-6 bg-emerald-500/15 border border-emerald-500/30 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-pulse">
            <CheckIcon className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body with Smooth Mobile Scrolling */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* 1. Service Name */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5 sm:mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
              Service Title <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CPVC Concealed Pipe Burst & High Pressure Valve Repair"
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              className="w-full bg-[#101C30]/80 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3.5 text-white text-xs sm:text-sm placeholder-white/25 focus:outline-none focus:border-cyan-500/60 focus:bg-[#101C30] focus:shadow-[0_0_0_3px_rgba(0,180,216,0.14)] transition-all duration-200"
            />
          </div>

          {/* 2. Category Selector with Visual Cards (2-cols on mobile, 3 on desktop) */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5 sm:mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
              Service Category <span className="text-orange-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-2 sm:gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-400 text-white shadow-[0_0_16px_rgba(0,180,216,0.25)]'
                        : 'bg-[#101C30]/60 hover:bg-[#14233D] border-white/8 text-white/70 hover:border-white/20'
                    }`}
                  >
                    <span className="text-lg sm:text-xl shrink-0">{cat.icon}</span>
                    <div className="min-w-0">
                      <div className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[11px] sm:text-xs truncate">
                        {cat.label}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-white/40 truncate">
                        {cat.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Currency & Amount Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5 sm:mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
                Currency <span className="text-orange-400">*</span>
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-[#101C30] border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3.5 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500/60 transition-all cursor-pointer font-medium"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#0B1528] text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5 sm:mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
                Amount / Fixed Price <span className="text-orange-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-sm sm:text-base">
                  {formData.currency === 'INR' ? '₹' : formData.currency === 'USD' ? '$' : '•'}
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-[#101C30]/80 border border-white/10 rounded-xl pl-8 sm:pl-9 pr-3.5 sm:pr-4 py-2.5 sm:py-3.5 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm sm:text-base placeholder-white/25 focus:outline-none focus:border-cyan-500/60 focus:bg-[#101C30] transition-all"
                />
              </div>
            </div>
          </div>

          {/* 4. Estimated Time Minutes with Quick Duration Pills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif]">
                Estimated Time (Minutes) <span className="text-orange-400">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                {QUICK_DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setFormData({ ...formData, EstimatedTimeMinutes: dur })}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      formData.EstimatedTimeMinutes === dur
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50'
                        : 'bg-white/5 hover:bg-white/10 text-white/50 border border-white/5'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                required
                min="5"
                step="5"
                placeholder="45"
                value={formData.EstimatedTimeMinutes}
                onChange={(e) => setFormData({ ...formData, EstimatedTimeMinutes: e.target.value })}
                className="w-full bg-[#101C30]/80 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-cyan-500/60 focus:bg-[#101C30] transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-xs font-medium">
                minutes duration
              </span>
            </div>
          </div>

          {/* 5. Short Feature Description */}
          <div>
            <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
              Service Description / Key Highlights
            </label>
            <textarea
              rows="2"
              placeholder="e.g. 100% genuine CPVC fittings, acoustic sensor scan, 30-day warranty included..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#101C30]/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-cyan-500/60 resize-none leading-relaxed"
            />
          </div>

          {/* 6. Drag & Drop Image Upload Zone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif]">
                Upload & Drag Service Photos
              </label>
              <span className="text-cyan-400 text-xs font-semibold">
                {images.length} / 7 Photos Selected
              </span>
            </div>

            {/* Drag Zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-7 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 group ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-500/15 scale-[1.01] shadow-[0_0_30px_rgba(0,180,216,0.35)]'
                  : 'border-white/15 bg-gradient-to-b from-[#101C30]/70 to-[#0A1424]/80 hover:border-cyan-400/50 hover:bg-[#101C30]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={onFileInputChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,180,216,0.15)]">
                <UploadCloudIcon className="w-8 h-8" />
              </div>

              <div>
                <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm sm:text-base text-white">
                  Drag and drop service photos here, or <span className="text-cyan-400 underline underline-offset-4">browse files</span>
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Upload up to 7 photos • Supports PNG, JPG, JPEG, WebP up to 5MB each
                </p>
              </div>

              {isDragging && (
                <div className="absolute inset-0 bg-cyan-950/85 border-2 border-cyan-400 rounded-2xl flex items-center justify-center backdrop-blur-sm pointer-events-none">
                  <div className="text-center">
                    <span className="text-2xl">📥</span>
                    <p className="text-cyan-300 font-bold text-base mt-1 animate-pulse">
                      Release to drop service photos
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Previews Grid */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {imagePreviews.map((prev, idx) => (
                  <div
                    key={idx}
                    className="relative group bg-[#101C30] border border-white/10 rounded-2xl overflow-hidden aspect-video shadow-lg flex items-center justify-center"
                  >
                    <img
                      src={prev.url}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />

                    {/* Dark gradient overlay with actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        className="self-end w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                        title="Remove photo"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>

                      <div className="truncate">
                        <p className="text-[11px] text-white font-bold truncate">
                          {prev.name}
                        </p>
                        <p className="text-[10px] text-white/60">
                          {prev.size}
                        </p>
                      </div>
                    </div>

                    {/* Badge */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-bold text-white/90 backdrop-blur-md pointer-events-none">
                      {idx === 0 ? '★ Cover' : `#${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Footer Action Buttons */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3.5">
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-semibold transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={submitting || loadingAction}
              className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm sm:text-base border-0 transition-all duration-200 ${
                submitting || loadingAction
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_0_28px_rgba(255,107,53,0.42)] hover:shadow-[0_8px_32px_rgba(255,107,53,0.55)] hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              {submitting || loadingAction ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  <span>Publishing Service…</span>
                </>
              ) : (
                <>
                  <span>Publish Service Now</span>
                  <span>⚡</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
