import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

/**
 * Converts technical API error messages, status codes, and exceptions
 * into warm, polite, and conversational human-friendly sentences.
 */
export function formatFriendlyMessage(rawMsg, type = 'info') {
  if (!rawMsg) {
    return type === 'error'
      ? 'Oops! Something went wrong. Please check your information and try again.'
      : 'Action completed successfully!';
  }

  // If it's an object (like Axios error response or Error instance)
  let msg = typeof rawMsg === 'object'
    ? rawMsg?.response?.data?.message || rawMsg?.message || JSON.stringify(rawMsg)
    : String(rawMsg);

  // Clean raw prefixes
  msg = msg.replace(/^Error:\s*/i, '').trim();

  const lower = msg.toLowerCase();

  // Network & Connectivity errors
  if (lower.includes('network error') || lower.includes('econnrefused') || lower.includes('failed to fetch')) {
    return "We're having trouble connecting right now. Please check your internet connection and try again.";
  }

  // Authentication & Credentials
  if (
    lower.includes('invalid credentials') ||
    lower.includes('password does not match') ||
    lower.includes('incorrect password') ||
    lower.includes('wrong password') ||
    lower.includes('user not found') ||
    lower.includes('no user') ||
    lower.includes('email or password')
  ) {
    return "Oops! That email and password combination doesn't match our records. Please double-check and try again.";
  }

  // Duplicate Account / Registration
  if (
    lower.includes('already exists') ||
    lower.includes('duplicate key') ||
    lower.includes('e11000') ||
    lower.includes('already registered')
  ) {
    return 'An account with this email or phone is already registered. Please log in directly!';
  }

  // Session / JWT Expiry
  if (lower.includes('jwt expired') || lower.includes('token expired') || lower.includes('unauthorized') || lower.includes('401')) {
    return 'Your session has timed out for security. Please sign in again to continue.';
  }

  // Validation / Required fields
  if (lower.includes('required') || lower.includes('validation failed') || lower.includes('empty field')) {
    return 'Please fill in all the required details before submitting.';
  }

  // Verification
  if (lower.includes('not verified') || lower.includes('verification pending')) {
    return 'Your profile is pending verification by our team. We will notify you as soon as it is approved!';
  }

  // Server errors (500)
  if (lower.includes('500') || lower.includes('internal server error') || lower.includes('something went wrong')) {
    return 'Something unexpected happened on our end. Please give us a moment and try again.';
  }

  // Geolocation / GPS
  if (lower.includes('geolocation') || lower.includes('denied geolocation') || lower.includes('location permission')) {
    return 'We need your location permission to match you with nearby technicians. Please allow GPS access in your browser.';
  }

  // Password Reset / Email Sent
  if (lower.includes('reset link') || lower.includes('email sent') || lower.includes('mail sent')) {
    return 'Password reset link sent! Please check your inbox (and spam folder) to reset your password.';
  }

  // Standard Success Fallbacks
  if (type === 'success') {
    if (lower.includes('login') || lower.includes('sign in')) {
      return "Welcome back! You're successfully logged in.";
    }
    if (lower.includes('register') || lower.includes('signup') || lower.includes('created')) {
      return 'Welcome aboard! Your account has been created successfully.';
    }
    if (lower.includes('service') && (lower.includes('add') || lower.includes('create'))) {
      return 'Great news! Your service has been added and published successfully.';
    }
    if (lower.includes('update') || lower.includes('profile')) {
      return 'Your profile details have been updated successfully.';
    }
  }

  return msg;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      type = 'success', // 'success' | 'error' | 'warning' | 'info'
      title,
      message,
      actionText,
      onAction,
      duration = 4500,
    }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      const friendlyMessage = formatFriendlyMessage(message, type);

      const defaultTitle =
        title ||
        (type === 'success'
          ? 'Success!'
          : type === 'error'
          ? 'Oops, notice'
          : type === 'warning'
          ? 'Please note'
          : 'Notification');

      const newToast = {
        id,
        type,
        title: defaultTitle,
        message: friendlyMessage,
        actionText,
        onAction,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Toast Notification Container — Anchored at top right, fully responsive */}
      <aside
        aria-label="Notifications"
        className="fixed top-20 sm:top-24 right-3 sm:right-6 z-[99999] flex flex-col gap-3 pointer-events-none w-[calc(100%-1.5rem)] max-w-sm sm:max-w-md"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

/**
 * Individual Toast Notification Card
 * Styled using Tailwind CSS with Home.jsx theme tokens:
 * - Obsidian background #0A1628 / #070E1A
 * - Glowing borders: Emerald #10B981, Rose #F43F5E, Amber #FF6B00
 * - Frosted glassmorphism (backdrop-blur-2xl)
 * - Animated icon badge with pulsing ring
 */
function ToastCard({ toast, onDismiss }) {
  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';

  // Palette configurations strictly adhering to Home.jsx
  const config = isError
    ? {
        borderClass: 'border-rose-500/40',
        glowClass: 'shadow-[0_0_30px_rgba(244,63,94,0.22),0_12px_40px_rgba(7,14,26,0.9)]',
        bgGradient: 'from-rose-500/10 via-[#0A1628]/95 to-[#070E1A]/95',
        iconBg: 'bg-rose-950 border-rose-400/80 text-rose-400',
        pulseBg: 'bg-rose-500/20',
        accentBar: 'bg-rose-500 shadow-[0_0_10px_#f43f5e]',
        titleColor: 'text-rose-400',
        progressBar: 'bg-rose-500',
      }
    : isWarning
    ? {
        borderClass: 'border-orange-500/40',
        glowClass: 'shadow-[0_0_30px_rgba(255,107,0,0.22),0_12px_40px_rgba(7,14,26,0.9)]',
        bgGradient: 'from-orange-500/10 via-[#0A1628]/95 to-[#070E1A]/95',
        iconBg: 'bg-orange-950 border-orange-400/80 text-orange-400',
        pulseBg: 'bg-orange-500/20',
        accentBar: 'bg-orange-500 shadow-[0_0_10px_#ff6b00]',
        titleColor: 'text-orange-400',
        progressBar: 'bg-orange-500',
      }
    : {
        borderClass: 'border-emerald-500/40',
        glowClass: 'shadow-[0_0_30px_rgba(16,185,129,0.22),0_12px_40px_rgba(7,14,26,0.9)]',
        bgGradient: 'from-emerald-500/10 via-[#0A1628]/95 to-[#070E1A]/95',
        iconBg: 'bg-emerald-950 border-emerald-400/80 text-emerald-300',
        pulseBg: 'bg-emerald-500/20',
        accentBar: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
        titleColor: 'text-emerald-400',
        progressBar: 'bg-emerald-400',
      };

  return (
    <div
      role="status"
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl bg-gradient-to-b ${config.bgGradient} backdrop-blur-2xl border ${config.borderClass} ${config.glowClass} p-4 text-white transition-all duration-300 animate-in fade-in slide-in-from-top-4`}
    >
      {/* Top ambient radial glow inside card */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex items-start gap-3.5">
        {/* Left Vertical Glowing Accent Bar */}
        <span className={`w-1 self-stretch rounded-full shrink-0 ${config.accentBar}`} />

        {/* Animated Badge Icon with Pulsing Halo */}
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <span className={`absolute w-9 h-9 rounded-full ${config.pulseBg} animate-ping opacity-75`} />
          <div
            className={`relative w-8 h-8 rounded-full border flex items-center justify-center ${config.iconBg} shadow-inner`}
          >
            {isError ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : isWarning ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${config.titleColor} font-['Space_Grotesk',sans-serif]`}>
            {toast.title}
          </h4>
          <p className="text-xs sm:text-sm text-white/85 mt-1 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
            {toast.message}
          </p>

          {/* Optional Action CTA Button */}
          {toast.actionText && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                onDismiss();
              }}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] text-white shadow-[0_0_12px_rgba(255,107,0,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>{toast.actionText}</span>
              <span>→</span>
            </button>
          )}
        </div>

        {/* Top-Right Dismiss '✕' Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90"
          aria-label="Dismiss notification"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Bottom subtle auto-dismiss progress bar */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/5 overflow-hidden">
          <div
            className={`h-full ${config.progressBar} opacity-60`}
            style={{
              animation: `toast-progress ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
