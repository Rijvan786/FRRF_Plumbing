import mongoose from "mongoose";
import UserModel from "../models/auth.model.js";
import TechnicianProfileModel from "../models/Technicianprofile.model.js";
import { SendMailDynamicContent } from "../service/email.service.js";
import { validatedAndFormate } from "../validator/contact.validator.js";
import { technicianWelcomeEmail, BRAND } from "../utils/emailTemplates.js";
import jwt from "jsonwebtoken";
import { Config } from "../config/config.js";
import OrderModel from "../models/Order.model.js";
import { getIo } from "../socket/server.socket.js";
import PaymentModel from "../models/Payment.model.js"
import { CreateOrder } from "../service/Payment.service.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js"

export const RegisterTechnicianController = async (req, res) => {
  try {
    const {
      FullName,
      email,
      contact,
      password,
      role = "technician",
      experienceYears,
      street,
      city,
      pin_code,
      longitude,
      latitude,
    } = req.body;
    console.log(FullName, email, contact, password, experienceYears);

    const ValidContact = await validatedAndFormate(contact);
    if (!ValidContact) {
      return res.status(400).json({ message: "Invalid Contact Number" });
    }

    const isExist = await UserModel.findOne({
      $or: [{ email: email }, { contact: ValidContact }],
    });

    if (isExist) {
      return res.status(400).json({
        message: `User ${
          isExist.email === email
            ? "email is already registered"
            : "contact is already registered"
        }`,
      });
    }

    const user = await UserModel.create({
      FullName,
      email,
      contact: ValidContact,
      password: password,
      role: role || "technician",
    });
    console.log(user._id, "ID of User");

    const TechnicianProfile = await TechnicianProfileModel.create({
      userId: user._id,
      experienceYears: experienceYears,
      permanentAddress: {
        street: street,
        city: city,
        pin_code: pin_code,
      },
      liveLocation: {
        type: "Point",
        coordinates: [Number(longitude) || 0, Number(latitude) || 0],
      },
    });

    // ── Generate verification link & email template ──
    const verifyToken = jwt.sign(
      { email: user.email },
      Config.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "7d" }
    );

    const baseUrl = 
      process.env.BASE_URL ||
      Config.BASE_URL ||
      "https://frpf-plumbing.onrender.com";
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${verifyToken}`;

    const subject =
      "🔧 Welcome to FRRF Plumbing Partner Network — Application Received & Interview Schedule";

    let html = "";
    if (typeof technicianWelcomeEmail === "function") {
      html = technicianWelcomeEmail({
        FullName,
        email,
        experienceYears: Number(experienceYears) || 0,
        city: city || street || "Operational Area",
        verifyUrl,
      });
    }

    if (!html) {
      const firstName = FullName?.split(" ")[0] || "Partner";
      html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"/><title>Technician Partner Registration</title></head>
        <body style="background:#070E1A; color:#ffffff; font-family:'Plus Jakarta Sans', Arial, sans-serif; padding:20px;">
          <div style="max-width:600px; margin:0 auto; background:#0A1628; border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:32px;">
            <div style="text-align:center; margin-bottom:24px;">
              <span style="background:rgba(255,107,53,0.15); color:#FF6B35; font-size:12px; font-weight:bold; padding:4px 12px; border-radius:20px; text-transform:uppercase;">
                🛠️ Application & Interview Scheduled
              </span>
              <h1 style="color:#ffffff; font-size:24px; font-weight:800; margin-top:12px;">Welcome, ${firstName}!</h1>
              <p style="color:#94A3B8; font-size:14px;">Your registration as a certified technician partner has been submitted successfully.</p>
            </div>
            <div style="background:#0F1F38; border:1px solid rgba(0,180,216,0.25); border-radius:12px; padding:20px; margin-bottom:24px;">
              <h3 style="color:#00B4D8; font-size:14px; margin-top:0;">📋 Partner Details</h3>
              <p style="margin:6px 0; color:#E2E8F0; font-size:13px;"><strong>Name:</strong> ${FullName}</p>
              <p style="margin:6px 0; color:#E2E8F0; font-size:13px;"><strong>Email:</strong> ${email}</p>
              <p style="margin:6px 0; color:#E2E8F0; font-size:13px;"><strong>Contact:</strong> ${ValidContact}</p>
              <p style="margin:6px 0; color:#E2E8F0; font-size:13px;"><strong>Experience:</strong> ${experienceYears || 0} Years</p>
              <p style="margin:6px 0; color:#E2E8F0; font-size:13px;"><strong>Operating City:</strong> ${city || ""}</p>
            </div>
            <div style="text-align:center; margin:28px 0;">
              <a href="${verifyUrl}" style="background:linear-gradient(135deg, #00B4D8 0%, #0096C7 100%); color:#070E1A; text-decoration:none; padding:14px 28px; border-radius:10px; font-weight:800; display:inline-block; font-size:14px;">
                🔧 Verify Email & Unlock Dashboard →
              </a>
            </div>             
            <p style="color:#64748B; font-size:12px; text-align:center;">Our technician onboarding team will reach out to schedule your skill verification and interview according to your assigned time slot.</p>
          </div>
        </body>
        </html>
      `;    
    }

    try { 
      await SendMailDynamicContent({
        subject,
        email,
        html,
      });
      console.log(`✅ Technician onboarding email sent to: ${email}`);
    } catch (mailError) {
      console.error("⚠️ SendMailDynamicContent error:", mailError.message);
    }

    return res.status(200).json({
      message:
        "Plumber is Register successfully And Schedule their Interview According to time slot ",
      TechnicianProfile,
      user: {
        _id: user._id,
        FullName: user.FullName,
        email: user.email,
        contact: user.contact,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("RegisterTechnicianController error:", error);
    return res.status(500).json({
      message: "Internal Server error",
      error: error.message,
    });
  }
}
// orderController.js
export const acceptJobController = async (req, res) => {
    try {
        const { OrderId, technicianId } = req.body;

        // 1. डेटाबेस में ऑर्डर अपडेट करो (Pending से Accepted)
        const updatedOrder = await OrderModel.findOneAndUpdate(
            { _id: OrderId, status: { $in: ["Pending", "Accepted"] } }, 
            { 
                status: "Accepted", 
                technicianId: technicianId 
            },
            { returnDocument: 'after' }
        ).populate('technicianId').populate('userId');

        if (!updatedOrder) {
            return res.status(400).json({ success: false, message: "Job already taken or not found!" });
        }

        // Fetch technician profile to include live location
        let techProfile = null;
        if (technicianId) {
            techProfile = await TechnicianProfileModel.findOne({ userId: technicianId });
        }
        if (!techProfile && updatedOrder.technicianId) {
            techProfile = await TechnicianProfileModel.findOne({
                userId: updatedOrder.technicianId._id || updatedOrder.technicianId,
            });
        }

        const payload = {
            order: updatedOrder,
            technician: updatedOrder.technicianId,
            technicianProfile: techProfile,
            technicianLocation: techProfile?.liveLocation?.coordinates
                ? {
                    longitude: Number(techProfile.liveLocation.coordinates[0]),
                    latitude: Number(techProfile.liveLocation.coordinates[1]),
                }
                : null,
            status: "Accepted",
        };

        // 2. 🚀 Customer को Socket से बता दो कि "तुम्हें प्लंबर मिल गया है!"
        const io = await getIo();
        if (updatedOrder.userId) {
            const uId = updatedOrder.userId._id
                ? updatedOrder.userId._id.toString()
                : updatedOrder.userId.toString();
            io.to(uId).emit('plumber-assigned', payload);
        }
        io.to(OrderId.toString()).emit('plumber-assigned', payload);
        io.to(OrderId.toString()).emit('receive-status', { status: "Accepted" });

        res.status(200).json({ success: true, message: "Job Accepted!", order: updatedOrder });
    } catch (err) {
        console.error("acceptJobController error:", err);
        res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};

export const GetTechnicianNotificationsController = async (req, res) => {
    try {
        // Fetch all pending / active orders available for technicians
        const orders = await OrderModel.find({ status: { $in: ["Pending", "Accepted"] } })
            .populate("userId")
            .sort({ createdAt: -1 })
            .limit(25);

        const notifications = orders.map((order) => {
            const user = order.userId || {};
            const street = order.address?.street || "Nearby Customer Address";
            const city = order.address?.city || "";
            const pinCode = order.address?.pin_code || "";
            const coords = order.address?.location?.coordinates || [72.8777, 19.0760];

            return {
                id: order._id.toString(),
                orderId: order._id.toString(),
                OrderId: order._id.toString(),
                title: "🚨 Emergency Plumbing Dispatch",
                customer: user.FullName || user.name || "Customer",
                phone: user.contact || user.phone || "",
                email: user.email || "",
                serviceType: order.ServiceDetails?.serviceName || order.issuedDescription || "Emergency Leakage / Repair",
                category: order.ServiceDetails?.category || "General Repair",
                address: order.address,
                street,
                city,
                pinCode,
                location: [street, city, pinCode].filter(Boolean).join(", "),
                coordinates: coords, // [lng, lat]
                latitude: Number(coords[1]) || 19.0760,
                longitude: Number(coords[0]) || 72.8777,
                distance: "Within 25 Km Zone",
                estimatedPrice: order.total_Amount?.amount ? `₹${order.total_Amount.amount}` : "₹500",
                amount: order.total_Amount?.amount || 500,
                status: order.status,
                isAccepted: order.status === "Accepted" || order.status === "On-the-way" || order.status === "Working" || order.status === "Completed" || !!order.technicianId,
                technicianId: order.technicianId,
                urgent: true,
                unread: true,
                createdAt: order.createdAt,
                time: "Recently Dispatched",
            };
        });

        res.status(200).json({
            success: true,
            message: "Technician notifications loaded",
            notifications,
        });
    } catch (error) {
        console.error("GetTechnicianNotificationsController error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const GetTechnicianController=async(req,res)=>{
     const userid = req.user?._id || req.user?.id;
     const TechnicianData=await TechnicianProfileModel.findOne({userId:userid}).populate('userId')

     res.status(200).json({
      message:"Get Technician Successfully",
      TechnicianData
     })
}


export const CreateOrderPaymentController = async (req, res) => {
  try {
    const { accordingToWork, amount, PaymentType, currency, OrderId,  } = req.body;

    const targetOrderId = OrderId ;
    const workDetails = accordingToWork || "General plumbing repair & maintenance";
    const paymentMode = (PaymentType || payment_type || "online").toLowerCase();
    const curr = currency || "INR";
    const totalAmountNum = Number(amount) || 500;

    let razorpayOrder = null;
    if (paymentMode === "online") {
      try {
        razorpayOrder = await CreateOrder({ amount: totalAmountNum, currency: curr });
      } catch (rzpErr) {
        console.warn("Razorpay create order note, fallback ID generated:", rzpErr.message);
        razorpayOrder = {
          id: "order_FRRF_" + Date.now(),
          amount: totalAmountNum * 100,
          currency: curr,
        };
      }
    } else {
      razorpayOrder = {
        id: "cash_" + Date.now(),
        amount: totalAmountNum * 100,
        currency: curr,
      };
    }

    const newPayment = await PaymentModel.create({
      status: paymentMode === "cash" ? "paid" : "pending",
      totalAmount: {
        amount: totalAmountNum,
        currency: curr,
      },
      razorpay: {
        orderId: razorpayOrder?.id || "",
      },
      user: req.user?._id || req.user?.id || null,
      accordingToWork: workDetails,
      PaymentType: paymentMode === "cash" ? "cash" : "online",
      Order_details: targetOrderId,
    });

    if (paymentMode === "cash" && targetOrderId) {
      await OrderModel.findByIdAndUpdate(targetOrderId, { status: "Completed" });
      try {
        const io = await getIo();
        io.to(targetOrderId.toString()).emit("receive-status", { status: "Completed" });
        io.to(targetOrderId.toString()).emit("order-completed", { orderId: targetOrderId, paymentId: newPayment._id });
      } catch (sErr) {
        console.warn("Socket notification note:", sErr.message);
      }
    }

    const PaymentData = await PaymentModel.findById(newPayment._id)
      .populate("Order_details")
      .populate("user");
    const updated_payment=await OrderModel.findByIdAndUpdate(OrderId,{
      $set:{"total_Amount.amount":totalAmountNum}},
    { new: true })

    return res.status(200).json({
      success: true,
      message: "Payment Order Created Successfully",
      PaymentData,
      order: razorpayOrder,
    });
  } catch (error) {
    console.error("CreateOrderPaymentController error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const VerifyOrderController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, OrderId, orderId } = req.body;

    let payment = null;
    if (razorpay_order_id) {
      payment = await PaymentModel.findOne({ "razorpay.orderId": razorpay_order_id }).populate("Order_details");
    }
    if (!payment && (OrderId || orderId)) {
      payment = await PaymentModel.findOne({ Order_details: OrderId || orderId }).sort({ createdAt: -1 }).populate("Order_details");
    }

    if (!payment) {
      return res.status(400).json({
        success: false,
        message: "Payment record not found",
      });
    }

    if (razorpay_signature && Config.RAZORPAY_KEY_SECRET) {
      try {
        const isValidate = validatePaymentVerification(
          { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
          razorpay_signature,
          Config.RAZORPAY_KEY_SECRET
        );
        if (!isValidate) {
          payment.status = "failed";
          await payment.save();
          return res.status(400).json({
            success: false,
            message: "Payment verification signature failed",
          });
        }
      } catch (sigErr) {
        console.warn("Signature verification note:", sigErr.message);
      }
    }

    payment.razorpay.paymentId = razorpay_payment_id || ("pay_" + Date.now());
    payment.razorpay.signature = razorpay_signature || "";
    payment.status = "paid";
    await payment.save();

    const targetOrderId = payment.Order_details?._id || payment.Order_details || OrderId || orderId;
    let updatedOrder = null;
    if (targetOrderId) {
      updatedOrder = await OrderModel.findByIdAndUpdate(
        targetOrderId,
        { status: "Completed" },
        { new: true }
      ).populate("technicianId").populate("userId");

      try {
        const io = await getIo();
        io.to(targetOrderId.toString()).emit("receive-status", { status: "Completed" });
        io.to(targetOrderId.toString()).emit("order-completed", { orderId: targetOrderId, paymentId: payment._id });
      } catch (sErr) {
        console.warn("Socket notification note:", sErr.message);
      }
    }

    return res.status(200).json({
      message: "Order is Verified Successfully",
      success: true,
      payment,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error In VerifyOrderController:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const GetPaymentDetailController = async (req, res) => {
  try {
    const { OrderId } = req.params;

    let payment = null;
    if (mongoose.isValidObjectId(OrderId)) {
      payment = await PaymentModel.findOne({
        $or: [{ Order_details: OrderId }, { _id: OrderId }],
      }).sort({ createdAt: -1 }).populate({
        path: "Order_details",
        populate: [{ path: "userId" }, { path: "technicianId" }],
      }).populate("user");
    }

    if (!payment) {
      payment = await PaymentModel.findOne({ "razorpay.orderId": OrderId })
        .populate({
          path: "Order_details",
          populate: [{ path: "userId" }, { path: "technicianId" }],
        }).populate("user");
    }

    let order = null;
    if (mongoose.isValidObjectId(OrderId)) {
      order = await OrderModel.findById(OrderId)
        .populate("userId")
        .populate("technicianId");
    }

    return res.status(200).json({
      success: true,
      payment,
      order: order || payment?.Order_details,
    });
  } catch (error) {
    console.error("GetPaymentDetailController error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ──────────────────────────────────────────────────────────
// 1. TECHNICIAN ONLINE & OFFLINE TOGGLE CONTROLLER
// ──────────────────────────────────────────────────────────
export const ToggleOnlineStatusController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID missing" });
    }

    if (req.user?.role !== "technician") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only certified technicians can change online status.",
      });
    }

    const { isOnline } = req.body;

    let currentProfile = await TechnicianProfileModel.findOne({ userId });
    if (!currentProfile) {
      currentProfile = await TechnicianProfileModel.create({
        userId,
        experienceYears: 1,
        isOnline: typeof isOnline === "boolean" ? isOnline : true,
      });
    } else {
      const newStatus = typeof isOnline === "boolean" ? isOnline : !currentProfile.isOnline;
      currentProfile.isOnline = newStatus;
      await currentProfile.save();
    }

    const populatedProfile = await TechnicianProfileModel.findOne({ userId }).populate("userId");

    return res.status(200).json({
      success: true,
      message: `Technician status is now ${currentProfile.isOnline ? "Online (Duty Active)" : "Offline (Duty Off)"}`,
      isOnline: currentProfile.isOnline,
      technician: populatedProfile,
    });
  } catch (error) {
    console.error("ToggleOnlineStatusController error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating status",
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────
// 2. EDIT PROFILE CONTROLLER (TECHNICIAN ONLY)
// ──────────────────────────────────────────────────────────
export const EditProfileController = async (req, res) => {
  try {


    const {
      FullName,
      contact,
      experienceYears,
      street,
      city,
      pin_code,
      skills,
      longitude,
      latitude,
    } = req.body;

    // 1. Update basic user credentials
    const userUpdate = {};
    if (FullName && typeof FullName === "string" && FullName.trim()) {
      userUpdate.FullName = FullName.trim();
    }
    if (contact && typeof contact === "string" && contact.trim()) {
      userUpdate.contact = contact.trim();
    }

    if (Object.keys(userUpdate).length > 0) {
      await UserModel.findByIdAndUpdate(userId, { $set: userUpdate });
    }

    // 2. Update technician specific profile
    const techUpdate = {};
    if (experienceYears !== undefined && experienceYears !== null && experienceYears !== "") {
      techUpdate.experienceYears = Number(experienceYears) || 0;
    }

    if (street !== undefined || city !== undefined || pin_code !== undefined) {
      const existingProfile = await TechnicianProfileModel.findOne({ userId });
      techUpdate.permanentAddress = {
        street: street !== undefined ? String(street).trim() : existingProfile?.permanentAddress?.street || "",
        city: city !== undefined ? String(city).trim() : existingProfile?.permanentAddress?.city || "",
        pin_code: pin_code !== undefined ? String(pin_code).trim() : existingProfile?.permanentAddress?.pin_code || "",
      };
    }

    if (skills) {
      if (Array.isArray(skills)) {
        techUpdate.skills = skills.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof skills === "string") {
        techUpdate.skills = skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    if (longitude !== undefined && latitude !== undefined) {
      techUpdate.liveLocation = {
        type: "Point",
        coordinates: [Number(longitude) || 0, Number(latitude) || 0],
      };
    }

    const updatedProfile = await TechnicianProfileModel.findOneAndUpdate(
      { userId },
      { $set: techUpdate },
      { new: true, upsert: true }
    ).populate("userId");

    return res.status(200).json({
      success: true,
      message: "Technician profile updated successfully",
      technician: updatedProfile,
    });
  } catch (error) {
    console.error("editprofilecontroller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating technician profile",
      error: error.message,
    });
  }
};






