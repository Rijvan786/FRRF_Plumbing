import { response, Router } from "express";
import { validatedAndFormate } from "../validator/contact.validator.js";
import UserModel from "../models/auth.model.js";
import { Config } from "../config/config.js";
import jwt from "jsonwebtoken";
import { SendMailDynamicContent } from "../service/email.service.js";
import {
  clientWelcomeEmail,
  technicianWelcomeEmail,
  loginSuccessEmail,
  resetPasswordEmail,
  getLogoSrc,
  BRAND,
} from "../utils/emailTemplates.js";
import bcrypt from "bcryptjs";
import BlackListModel from "../models/Blacklist.model.js";
import AddressModel from "../models/address.model.js";
import OrderModel from "../models/Order.model.js";

// ──────────────────────────────────────────────
//  HELPER : Sign JWT & send cookie + JSON
// ──────────────────────────────────────────────
async function SendTokenResponse(user, res, message) {
 try {
    const token = jwt.sign(
    {
      id: user._id,
      FullName: user.FullName,
      email: user.email,
      role: user.role,
    },
    Config.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    message,
    success: true,
    user: {
      FullName: user.FullName,
      email: user.email,
      contact: user.contact,
      city: user.city,
      role: user.role,
      isVerifiedTech: user.isVerifiedTech,
      experienceYears: user.experienceYears,
    },
  });
 } catch (error) {
  console.log(error);
    res.status(200).json({
      message:"Internal Server Error",
      err:error.message
    })
 }
}

// ──────────────────────────────────────────────
//  REGISTER CONTROLLER
//  Sends role-specific welcome email on sign-up
// ──────────────────────────────────────────────
export async function RegisterController(req, res) {    
  try {
    const {
      FullName,
      email,
      contact,
      role,
      password,OrderId,
      label,street, city,pin_code ,longitude,latitude
    } = req.body;
  
console.log(contact);

    console.log("📥 Register attempt:", { FullName, email, role });

    // ── Validate phone number ──
    const ValidContact = await validatedAndFormate(contact);
    if (!ValidContact) {
      return res.status(400).json({ message: "Invalid Contact Number" });
    }
 const isExist = await UserModel.findOne({
            $or: [
                {FullName:FullName},
                { email: email },
                { contact: ValidContact },
           
            ]
        })

        if (isExist) {
            return res.status(400).json(
              {message: `User ${isExist.FullName === FullName ? "Username  is already registered" : isExist.email===  email?"This  Email is already registered": isExist.contact===contact?"This contact is all ready Register":"  is all ready registered"}`})
        }
    // ── Create user in DB ──
    const user = await UserModel.create({
      FullName,
      email,
      contact: ValidContact,
      role,
      password,

      
    });
   
  
    

    // ── Generate email-verification token (7d) ──
    const verifyToken = jwt.sign({ email: user.email }, Config.JWT_SECRET, {
      expiresIn: "7d",
    });

    const verifyUrl = `${
     "https://frpf-plumbing.onrender.com" || Config.BASE_URL || process.env.BASE_URL 
    }/api/auth/verify-email?token=${verifyToken}`;

    // ── Choose email template based on role ──
    let emailHtml;
    let emailSubject;

    if (role === "technician") {
      // ── Technician welcome ──
      emailSubject =
        "🔧 Welcome to FRRF Plumbing Partner Network — Verify Your Email";
      emailHtml = technicianWelcomeEmail({
        FullName,
        email,
        experienceYears,
        city: req.body.city || "Operational Area",
        verifyUrl,
      });
    } else {
      // ── Client / Customer welcome ──
      emailSubject =
        "🎉 Welcome to FRRF Plumbing — Verify Your Email (Work 1st Policy)";
      emailHtml = clientWelcomeEmail({
        FullName,
        email,
        verifyUrl,
      });
    }

    // ── Send welcome email ──
    await SendMailDynamicContent({
      email: email,
      subject: emailSubject,
      subject_line: emailSubject,
      html: emailHtml,
    });
    

    console.log(`✅ Welcome email sent to: ${email} (role: ${role})`);
if(OrderId){
     
    const OrderModelEditUserid=await OrderModel.findOneAndUpdate({ 
      _id:OrderId
    },{ 
            $set: { 
                userId: user._id, 
                "address.userId": user._id // 👈 Dot notation: सिर्फ address के अंदर का userId बदलेगा, बाकी एड्रेस सेफ रहेगा
            } 
        }, // 2nd Argument: Update data
        { returnDocument:'after' })


   

}
    // ── Respond with token cookie ──
    await SendTokenResponse(
      user,
      res,
      "Account created successfully! Please check your email to verify your account.",
    );
  } catch (err) {
    console.error("❌ RegisterController Error:", err);

    // Handle duplicate email
    
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
}

// ──────────────────────────────────────────────────────────
//  RESEND VERIFICATION EMAIL CONTROLLER
//  POST /api/auth/resend-verification
//  Body: { email }
//  Supports 1M+ scale: rate-limiting & role-aware notifications
// ──────────────────────────────────────────────────────────
export async function ResendMailController(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const user = await UserModel.findOne({ email });

    // Protect privacy: uniform response even if user doesn't exist
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If this email is registered and unverified, a verification link has been sent.",
      });
    }

    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: "Your account is already verified! Please proceed to login.",
      });
    }

    // Rate-limiting check: 60 seconds cooldown to protect SMTP quota
    const lastSent = user.updatedAt ? new Date(user.updatedAt).getTime() : 0;
    const now = Date.now();
    const COOLDOWN_MS = 60 * 1000;

    if (now - lastSent < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds}s before requesting a new verification email.`,
        retryAfter: waitSeconds,
      });
    }

    // Generate secure 7-day token
    const verifyToken = jwt.sign({ email: user.email }, Config.JWT_SECRET, {
      expiresIn: "7d",
    });

    const baseUrl = process.env.BASE_URL || "https://frpf-plumbing.onrender.com";
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${verifyToken}`;

    let emailHtml;
    let emailSubject;

    if (user.role === "technician") {
      emailSubject =
        "🔧 FRRF Plumbing — Resend Verification Link (Technician Partner)";
      emailHtml = technicianWelcomeEmail({
        FullName: user.FullName,
        email: user.email,
        experienceYears: user.experienceYears || 0,
        city: user.city || "Operational Area",
        verifyUrl,
      });
    } else {
      emailSubject = "🎉 FRRF Plumbing — Verify Your Account (Work 1st Policy)";
      emailHtml = clientWelcomeEmail({
        FullName: user.FullName,
        email: user.email,
        verifyUrl,
      });
    }

    await SendMailDynamicContent({
      email: user.email,
      subject: emailSubject,
      subject_line: emailSubject,
      text: `Hello ${user.FullName},\n\nClick the link below to verify your FRRF Plumbing account:\n${verifyUrl}\n\nValid for 7 days under our Work 1st Policy.\n\n— FRRF Plumbing Team`,
      html: emailHtml,
    });

    // Update timestamp for rate limit tracking
    user.updatedAt = new Date();
    await user.save({ timestamps: false });

    console.log(
      `✅ Resent verification email to: ${user.email} (${user.role})`,
    );
    await SendTokenResponse(
      user,
      res,
      "Verification email has been resent successfully. Please check your inbox or spam folder.",
    );
  } catch (err) {
    console.error("❌ ResendMailController Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email. Please try again later.",
      error: err.message,
    });
  }
}

// ──────────────────────────────────────────────────────────
//  EMAIL VERIFICATION CONTROLLER (Renders Modern Web Page)
//  GET /api/auth/verify-email?token=xxx
// ──────────────────────────────────────────────────────────
export async function EmailVerification(req, res) {
  const { token } = req.query;

  if (!token) {
    return res
      .status(400)
      .send(verificationPage("error", "No verification token provided."));
  }

  try {
    const decoded = jwt.verify(token, Config.JWT_SECRET);
    const user = await UserModel.findOne({ email: decoded.email });

    if (!user) {
      return res
        .status(404)
        .send(
          verificationPage("error", "Account not found or link has expired."),
        );
    }

    if (user.verified) {
      return res
        .status(200)
        .send(verificationPage("already", user.FullName, user.role));
    }

    user.verified = true;
    await user.save();

    console.log(`🎉 Account verified: ${user.email} (${user.role})`);
    return res
      .status(200)
      .send(verificationPage("success", user.FullName, user.role));
  } catch (error) {
    console.error("❌ EmailVerification Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(410).send(verificationPage("expired", ""));
    }
    return res
      .status(400)
      .send(
        verificationPage("error", "Invalid or expired verification token."),
      );
  }
}

// ──────────────────────────────────────────────────────────────────────────
//  EMAIL VERIFICATION SCREEN (Exact Match to Home.jsx Hero UI - No Extra Clutter)
// ──────────────────────────────────────────────────────────────────────────
function verificationPage(type, name = "User", role = "customer") {
  const isTechnician = role === "technician";
  const firstName = name
    ? name.split(" ")[0]
    : isTechnician
      ? "Partner"
      : "Customer";

  const frontendUrl = process.env.FRONTEND_URL || "https://frpf-plumbing.onrender.com";
  const logoUrl = "https://ik.imagekit.io/Rizwan786/FRRF_Plumbing_Services/frrf-logo.png";

  const configs = {
    success: {
      badge: "Email Successfully Verified · Account Active",
      badgeExtra: "Work 1st Policy",
      headlinePrefix: isTechnician ? "Welcome Certified" : "Your Trusted",
      headlineAccent: isTechnician ? "Plumbing Partner" : "Plumbing Experts",
      subtitle: isTechnician
        ? `Welcome aboard, ${firstName}! Your technician account is 100% verified. You are now authorized to accept emergency dispatch requests in your pin code.`
        : `Welcome aboard, ${firstName}! Fast, Reliable & Affordable Plumbing Services at Your Doorstep. Certified master technicians for rapid residential & commercial repair.`,
      primaryAction: isTechnician ? "Open Partner Dashboard →" : "Book a Plumber Now →",
      primaryUrl: isTechnician ? `${frontendUrl}/Technician-register` : `${frontendUrl}/booking`,
      confetti: true,
    },
    already: {
      badge: "Account Already Active · Verified",
      badgeExtra: "Work 1st Policy",
      headlinePrefix: "Your Account is",
      headlineAccent: "Verified & Ready",
      subtitle: `Welcome back, ${firstName}! Your profile is fully active. Fast, reliable & affordable plumbing services at your doorstep with certified technicians.`,
      primaryAction: "Book a Plumber Now →",
      primaryUrl: `${frontendUrl}/booking`,
      confetti: false,
    },
    expired: {
      badge: "Security Verification Link Expired",
      badgeExtra: "Valid for 7 Days",
      headlinePrefix: "Verification Link",
      headlineAccent: "Needs Renewal",
      subtitle: `Security verification links expire after 7 days to protect your account. Request a new verification email in one click below.`,
      primaryAction: "Request New Verification Link →",
      primaryUrl: `${frontendUrl}/resend-email`,
      confetti: false,
    },
    error: {
      badge: "Verification Issue Detected",
      badgeExtra: "24/7 Helpline Available",
      headlinePrefix: "Verification Link",
      headlineAccent: "Not Recognized",
      subtitle: name || `This verification link is invalid or has already been used. Please reach out to customer care for instant assistance.`,
      primaryAction: "Go to Homepage →",
      primaryUrl: frontendUrl,
      confetti: false,
    },
  };

  const state = configs[type] || configs.error;

  return `<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FRRF Plumbing Services — Verified</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="min-h-screen bg-[#070E1A] font-['Plus_Jakarta_Sans',sans-serif] text-white flex flex-col overflow-x-hidden">

  <!-- NAVBAR (Tailwind CSS matching Home.jsx) -->
  <header class="fixed top-0 left-0 right-0 z-50 backdrop-blur h-16 sm:h-[72px]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
      <a href="${frontendUrl}" class="flex items-center bg-transparent border-0 cursor-pointer p-0 shrink-0">
        <img
          src="${logoUrl}"
          alt="FRRF Plumbing Services"
          class="w-28 h-28 sm:w-30 sm:h-30 object-contain shrink-0"
          style="filter: brightness(1.15) contrast(1.05);"
        />
      </a>

      <nav class="hidden md:flex items-center">
        <div class="flex items-center gap-1 bg-[#091427] border border-white/10 rounded-lg px-2 py-1.5 backdrop-blur-sm">
          <a href="${frontendUrl}/" class="px-4 py-1.5 rounded-full text-white/80 font-semibold text-sm hover:text-cyan-400 transition-colors">Home</a>
          <a href="${frontendUrl}/#services" class="px-4 py-1.5 rounded-full text-white/80 font-semibold text-sm hover:text-cyan-400 transition-colors">Services</a>
          <a href="${frontendUrl}/#about" class="px-4 py-1.5 rounded-full text-white/80 font-semibold text-sm hover:text-cyan-400 transition-colors">About</a>
          <a href="${frontendUrl}/#contact" class="px-4 py-1.5 rounded-full text-white/80 font-semibold text-sm hover:text-cyan-400 transition-colors">Contact</a>
          <a href="${frontendUrl}/technician-register" class="px-4 py-1.5 rounded-full text-white/80 font-semibold text-sm hover:text-cyan-400 transition-colors">Get Job</a>
        </div>
      </nav>

      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <div class="hidden lg:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1.5 text-emerald-400 text-xs font-semibold">
          <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"></span>
          24/7 Live
        </div>
        <a href="${frontendUrl}/login" class="hidden sm:block border border-white/20 text-white/80 px-4 py-2 rounded-full font-semibold text-sm hover:border-white/50 hover:text-white transition-all">Sign In</a>
        <a href="${frontendUrl}/booking" class="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-sm shadow-[0_0_16px_rgba(255,107,53,0.38)] hover:-translate-y-0.5 transition-all whitespace-nowrap">Book Now ⚡</a>
      </div>
    </div>
  </header>

  <!-- HERO VIEW (Tailwind CSS matching Home.jsx) -->
  <main class="relative min-h-screen flex items-center overflow-hidden pt-20 sm:pt-[72px] bg-cover bg-center" style="background-image: linear-gradient(to right, rgba(7,14,26,0.97) 0%, rgba(10,22,40,0.88) 50%, rgba(10,22,40,0.55) 100%), url('${frontendUrl}/images/hero-bg.png');">
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
      
      <!-- Live Status Badge -->
      <div class="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6 sm:mb-8">
        <span class="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399] animate-pulse"></span>
        <span class="text-emerald-400 font-bold text-xs sm:text-sm tracking-wide">⚡ ${state.badge} · ${state.badgeExtra}</span>
      </div>

      <!-- Headline -->
      <h1 class="font-black text-[clamp(32px,6.5vw,70px)] text-white leading-[1.07] tracking-[-0.03em] mb-5 max-w-3xl">
        ${state.headlinePrefix} <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">${state.headlineAccent}</span> — 24/7
      </h1>

      <!-- Subtitle -->
      <p class="text-[clamp(15px,2.2vw,19px)] text-white/70 max-w-xl leading-relaxed mb-8 sm:mb-10">
        ${state.subtitle}
      </p>

      <!-- Three CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10">
        <a href="${state.primaryUrl}" class="flex items-center justify-center gap-2 bg-gradient-to-br from-orange-500 to-orange-700 text-white px-7 py-4 rounded-xl font-bold text-base shadow-[0_0_28px_rgba(255,107,53,0.42)] hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(255,107,53,0.52)] transition-all">
          ${state.primaryAction}
        </a>
        <a href="${frontendUrl}/#services" class="flex items-center justify-center gap-2 bg-white/10 border-[1.5px] border-white/30 text-white px-6 py-4 rounded-xl font-bold text-base backdrop-blur-md hover:bg-white/15 transition-all">
          View Services
        </a>
        <a href="tel:18007586237" class="flex items-center justify-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-5 py-4 rounded-xl font-bold text-base hover:bg-cyan-500/20 transition-all">
          📞 Call 24/7
        </a>
      </div>

    </div>
  </main>

  ${
    state.confetti
      ? `
  <canvas id="confetti" style="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;"></canvas>
  <script>
    (function(){
      const canvas = document.getElementById('confetti');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const pieces = Array.from({length: 60}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 5 + 3,
        color: ['#00B4D8','#FF6B35','#10B981','#38BDF8','#F59E0B'][Math.floor(Math.random()*5)],
        speed: Math.random() * 3 + 2,
        osc: Math.random() * 15
      }));
      let count = 0;
      function anim() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x + Math.sin(count/15)*p.osc, p.y, p.r, 0, Math.PI*2);
          ctx.fillStyle = p.color;
          ctx.fill();
          p.y += p.speed;
          if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
        });
        count++;
        if (count < 180) requestAnimationFrame(anim);
        else ctx.clearRect(0,0,canvas.width,canvas.height);
      }
      anim();
    })();
  </script>
  `
      : ""
  }

</body>
</html>`;
}

export async function LoginController(req, res) {
  try {
    const { email, FullName, password,OrderId } = req.body;
    console.log(email,FullName, password);
    // ── Build query by email or FullName ──
    // ── Find user with password included ──

   const user=await UserModel.findOne({
    $or:[
     {FullName:FullName}, {email:email},
    ]
   }).select("+password")

  

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found with provided email or contact number.",
      });
    }

    // ── Check if email is verified ──
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not verified yet. Please check your email inbox to verify your account or request a resend.",
      });
    }

    // ── Verify password ──
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid password. Please check your credentials and try again.",
      });
    }

    // ── Generate JWT token ──
    const token = jwt.sign(
      {
        id: user._id,
        FullName: user.FullName,
        email: user.email,
        role: user.role,
      },    
      Config.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // ── Set Cookie ──
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ── Send Logged-In Success Email Notification ──
    const loginTimeStr = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium",
    });

    // const emailHtml = loginSuccessEmail({
    //   FullName: user.FullName,
    //   email: user.email,
    //   role: user.role,
    //   loginTime: loginTimeStr,
    // });

    // const emailSubject = user.role === "technician"
    //   ? "🔧 Security Alert: Technician Partner Login Detected — FRRF Plumbing"
    //   : "🔐 Security Alert: Successful Account Login — FRRF Plumbing";

    // // Send email via Sendmail service
    // Sendmail({
    //   to: user.email,
    //   subject: emailSubject,
    //   text: `Hello ${user.FullName},\n\nYou have successfully logged in to your FRRF Plumbing account on ${loginTimeStr} IST.\n\nIf you did not initiate this login, please secure your account immediately.\n\n— FRRF Plumbing Security Team`,
    //   html: emailHtml,
    // }).then(() => {
    //   console.log(`📧 Login notification email sent to: ${user.email} (${user.role})`);
    // }).catch((emailErr) => {
    //   console.error(`⚠️ Failed to send login notification email to ${user.email}:`, emailErr.message);
    // });

    // ── Send JSON Response ──
if(OrderId){
     
    const OrderModelEditUserid=await OrderModel.findOneAndUpdate({ 
      _id:OrderId
    },{ 
            $set: { 
                userId: user._id, 
                "address.userId": user._id // 👈 Dot notation: सिर्फ address के अंदर का userId बदलेगा, बाकी एड्रेस सेफ रहेगा
            } 
        }, // 2nd Argument: Update data
        { returnDocument:'after' })


   

}
    return await SendTokenResponse(
      user,
      res,
      `Welcome back, ${user.FullName}! Logged in successfully.`,
    );
  } catch (error) {
    console.error("❌ LoginController Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during login.",
      error: error.message,
    });
  }
}

export async function ResetPasswordMailController(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User is not found",
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: "User is unauthorized",
      });
    }

    // ── Generate 1-hour secure password reset token ──
    const resetToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      Config.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // ── Redirect URL: https://frpf-plumbing.onrender.com/forgot-passwordpage ──
    const frontendBaseUrl = Config.FRONTEND_URL || "https://frpf-plumbing.onrender.com";
    const resetUrl = `${frontendBaseUrl}/forgot-passwordpage?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // ── Product-level modern HTML email template ──
    const emailHtml = resetPasswordEmail({
      FullName: user.FullName,
      email: user.email,
      role: user.role,
      resetUrl,
    });

    const emailSubject =
      user.role === "technician"
        ? "🔧 Security Alert: Reset Password Request — FRRF Plumbing Partner Portal"
        : "🔐 Password Reset Request — FRRF Plumbing Services";

    // ── Send email via email service ──
    await SendMailDynamicContent({
      email: user.email,
      subject: emailSubject,
      subject_line: emailSubject,
      text: `Hello ${user.FullName},\n\nWe received a request to reset your FRRF Plumbing password.\n\nPlease click the link below to set a new password:\n${resetUrl}\n\nNote: This link will expire in 1 hour under our Work 1st Security Guard.\n\nIf you did not request a password reset, please ignore this email.\n\n— FRRF Plumbing Security Team`,
      html: emailHtml,
    });

    console.log(
      `🔑 Password reset email sent to: ${user.email} (${user.role})`,
    );

    return res.status(200).json({
      success: true,
      message:
        "Password reset link sent to your email successfully. Please check your inbox or spam folder.",
      resetUrl: process.env.NODE_ENV === "development" ? resetUrl : undefined,
    });
  } catch (error) {
    console.error("❌ ResetPasswordMail Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send password reset email. Please try again later.",
      error: error.message,
    });
  }
}

export async function ForgetPasswordController(req, res) {
  try {
    const { email, NewPassword } = req.body;
    const user = await UserModel.findOne({
      email: email,
    });
    if (!user) {
      return res.status(404).json({
        message: "User is not found",
      });
    }
    if (!user.verified) {
      return res.status(403).json({
        message: "User is not verified",
      });
    }
    await UserModel.findOneAndUpdate(
      { email: email },
      { password: await bcrypt.hash(NewPassword, 10) },
      { new: true },
    );

    await SendTokenResponse(user, res, "Forget Password Successfully");
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

export async function LogoutController(req, res) {
  const token = req.cookies.token;
  const user = req.user;

  res.clearCookie("token");

  await BlackListModel.create({ token: token });

 res.status(200).json({
  message:"User Logout Successfully"
 })
}

export async function GetMeController(req, res) {
  const userid = req.user.id;

  const user = await UserModel.findOne({
    _id: userid,
  });

  await SendTokenResponse(user, res, "User is fetch successfully");
}

// ──────────────────────────────────────────────────────────
// Modern Product-Level Email Generator for Google OAuth
// Scale: 1M+ users, supports both Customer & Technician roles
// ──────────────────────────────────────────────────────────
function generateGoogleAuthEmail({
  FullName,
  email,
  role,
  isNewUser,
  redirectUrl,
}) {
  const isTechnician = role === "technician";
  const firstName = FullName
    ? FullName.split(" ")[0]
    : isTechnician
      ? "Partner"
      : "User";
  const year = new Date().getFullYear();
  const themeColor = isTechnician ? "#FF6B35" : "#00B4D8";
  const themeGradient = isTechnician
    ? "linear-gradient(135deg, #070E1A 0%, #0F1F38 50%, #FF6B35 100%)"
    : "linear-gradient(135deg, #070E1A 0%, #0F1F38 55%, #00B4D8 100%)";
  const loginTimeStr = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "medium",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Google Sign-In Alert | FRRF Plumbing</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #070E1A;
      font-family: 'Plus Jakarta Sans', 'Inter', Arial, sans-serif;
      color: #F8FAFC;
      padding: 32px 16px;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #0A1628;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(7, 14, 26, 0.7);
      border: 1px solid rgba(0, 180, 216, 0.25);
    }
    .header {
      background: ${themeGradient};
      padding: 34px 32px 28px;
      text-align: center;
      color: #FFFFFF;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(0, 180, 216, 0.15);
      border: 1px solid rgba(0, 180, 216, 0.35);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 100px;
      margin-bottom: 14px;
      color: #00B4D8;
    }
    .header h1 {
      font-size: 23px;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.25;
    }
    .body {
      padding: 32px;
    }
    .intro {
      font-size: 14px;
      color: #94A3B8;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .info-box {
      background: #0F1F38;
      border: 1px solid rgba(0, 180, 216, 0.25);
      border-left: 4px solid ${themeColor};
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { color: #94A3B8; font-weight: 600; }
    .info-val { color: #FFFFFF; font-weight: 700; }
    .cta-btn {
      display: block;
      width: 100%;
      text-align: center;
      padding: 16px 24px;
      background: linear-gradient(135deg, #FF6B35 0%, #FA5A1E 100%);
      color: #FFFFFF !important;
      font-size: 15px;
      font-weight: 700;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 10px 25px -4px rgba(255, 107, 53, 0.45);
      margin: 24px 0 16px;
    }
    .link-fallback {
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed rgba(0, 180, 216, 0.3);
      border-radius: 12px;
      padding: 14px 18px;
      font-size: 11px;
      color: #94A3B8;
      word-break: break-all;
    }
    .footer {
      background: #070E1A;
      color: #64748B;
      padding: 24px 32px;
      text-align: center;
      font-size: 11px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .footer a { color: #00B4D8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="badge">🌐 Google Security Authorization</div>
      <img src="${getLogoSrc()}" alt="FRRF Plumbing" width="76" height="76" style="margin: 0 auto 12px; display: block; border-radius: 16px; border: 2px solid rgba(0, 180, 216, 0.4); object-fit: contain; background: #070E1A;" />
      <h1>${isNewUser ? `Welcome to FRRF Plumbing, ${firstName}! 🎉` : `Google Login Detected, ${firstName}! 🔐`}</h1>
    </div>
    <div class="body">
      <p class="intro">
        ${
          isNewUser
            ? `Your FRRF Plumbing account was successfully created via Google OAuth. You can now book rapid emergency plumbing, CPVC repairs, and water tank maintenance under our signature Work 1st Policy.`
            : `You have successfully signed in to your FRRF Plumbing account using Google OAuth under our Work 1st Security Guard.`
        }
      </p>

      <div class="info-box">
        <div class="info-row"><span class="info-label">Account Name:</span><span class="info-val">${FullName}</span></div>
        <div class="info-row"><span class="info-label">Email Address:</span><span class="info-val" style="color:#00B4D8;">${email}</span></div>
        <div class="info-row"><span class="info-label">Account Role:</span><span class="info-val">${isTechnician ? "🔧 Master Plumber Partner" : "🧑 Registered Customer"}</span></div>
        <div class="info-row"><span class="info-label">Authentication:</span><span class="info-val">Google OAuth 2.0 (Verified)</span></div>
        <div class="info-row"><span class="info-label">Session Timestamp:</span><span class="info-val">${loginTimeStr} IST</span></div>
      </div>

      <p style="font-size:13px; color:#94A3B8;">
        Need to manage your account or book an emergency service? Click the button below:
      </p>

      <a href="${redirectUrl}" class="cta-btn" target="_blank">
        ⚡ Open FRRF Plumbing Portal →
      </a>

      <div class="link-fallback">
        <strong>Direct Link:</strong><br/>
        <a href="${redirectUrl}" style="color:#00B4D8;">${redirectUrl}</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${year} FRRF Plumbing Services Private Limited. All rights reserved.</p>
      <p style="margin-top:6px;"><a href="mailto:support@frrfplumbing.com">support@frrfplumbing.com</a> · 24/7 Rapid Emergency Support</p>
    </div>
  </div>
</body>
</html>`;
}

export async function GoogleCallback(req, res) {
  try {
    const { id, displayName, emails, photos } = req.user;
    const email = emails[0].value;
    const photo = photos?.[0]?.value || null;
    const userFullName = displayName || "Google User";

    let user = await UserModel.findOne({ email });
    const isNewUser = !user;

    if (isNewUser) {
      user = await UserModel.create({
        googleId: id,
        FullName: userFullName,
        email,
        photo,
        verified: true,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        FullName: user.FullName,
        role: user.role || "customer",
      },
      Config.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: Config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ── Target redirect URL: https://frpf-plumbing.onrender.com/ ──
    const redirectUrl = `https://frpf-plumbing.onrender.com/`;

    // ── Generate & send modern email notification ──
    const emailHtml = generateGoogleAuthEmail({
      FullName: user.FullName,
      email: user.email,
      role: user.role || "customer",
      isNewUser,
      redirectUrl,
    });

    const emailSubject =
      user.role === "technician"
        ? "🔧 Security Alert: Google Partner Sign-In — FRRF Plumbing"
        : "🔐 Security Alert: Google Sign-In Successful — FRRF Plumbing";

    // Dispatch email asynchronously
    await SendMailDynamicContent({
      email: user.email,
      subject: emailSubject,
      subject_line: emailSubject,
      html: emailHtml,
    })
      .then(() => {
        console.log(
          `📧 Google OAuth notification email sent to: ${user.email}`,
        );
      })
      .catch((emailErr) => {
        console.error(
          `⚠️ Failed to send Google callback email to ${user.email}:`,
          emailErr.message,
        );
      });
    // 
    return res.redirect("https://frpf-plumbing.onrender.com/");
  } catch (error) {
    console.error("❌ GoogleCallback Error:", error.message);
    return res.redirect(
      "https://frpf-plumbing.onrender.com/?error=google_failed",
    );
  }
}


export async function ProfileEditController(){

  const {FullName,email,contact,ScheduleTime,}=req.body
  
}