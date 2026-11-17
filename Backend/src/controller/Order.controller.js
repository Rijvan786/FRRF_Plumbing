import OrderModel from "../models/Order.model.js";
import ServiceModel from "../models/Service.model.js";
import { uploadFile } from "../service/storage.service.js";
import { RegisterController } from "../controller/auth.controller.js";
import TechnicianProfileModel from "../models/Technicianprofile.model.js";
import { getIo } from "../socket/server.socket.js";
import { CreateOrder } from "../service/Payment.service.js";
import PaymentModel from "../models/Payment.model.js";
import mongoose from "mongoose"
import { Config } from "../config/config.js";
export async function CreateOrderController(req, res) {
  try {  
    const {
      serviceId,
      issueDescription,
      currency,
      label,
      street,
      city,
      pin_code,
      longitude,
      latitude,
      scheduleDate,
    } = req.body;
  
    console.log("CreateOrder incoming location:", longitude, latitude);
  
    const service_Data = await ServiceModel.findById(serviceId);
    if (!service_Data || !service_Data.isActive) {
      return res.status(404).json({
        message: "Service is not available",
      });
    }
    console.log(service_Data.category);
    let total_Amount
    if(service_Data.category === 'Full Setup'){
        total_Amount=service_Data.visitCharge
    }
   else{
     total_Amount=service_Data.price.amount
   }

    

    const Images = req.files
      ? await Promise.all(
          req.files.map(async (file) => {
            return await uploadFile({
              buffer: file.buffer,
              fileName: file.originalname,
            });
          })
        )
      : [];

    // 1. Try finding nearby plumbers within 25 KM using 2dsphere
    let nearbyPlumbers = [];
    try {
      if (longitude && latitude && !isNaN(parseFloat(longitude)) && !isNaN(parseFloat(latitude))) {
        nearbyPlumbers = await TechnicianProfileModel.find({
          liveLocation: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
              },
              $maxDistance: 25000, // 25 KM
            },
          },
        }).populate("userId");
      }
    } catch (geoErr) {
      console.warn("2dsphere query note:", geoErr?.message || geoErr);
    }

    // 2. Fallback to all registered technicians so booking NEVER fails
    if (!nearbyPlumbers || nearbyPlumbers.length === 0) {
      nearbyPlumbers = await TechnicianProfileModel.find().populate("userId");
    }

    const order = await OrderModel.create({
      userId: req.user?._id || req.user?.id || null,
      ServiceDetails: {
        serviceName: service_Data.serviceName,
        category: service_Data.category,
        price: {
          amount: total_Amount,
          currency: service_Data.price.currency,
        },
        serviceImg: service_Data.serviceImg,
      },
      issueDescription: issueDescription,
      issueImageUrl: Images,
      scheduleDate: scheduleDate || new Date(),
      total_Amount:{
        amount: total_Amount,
        currency: service_Data.price.currency || currency,
      },
      address: {
        label: label || "Home",
        street: street,
        city: city,
        location: {
          type: "Point",
          coordinates: [parseFloat(longitude) || 72.8777, parseFloat(latitude) || 19.0760],
        },
        pin_code: pin_code,
      },
    });

    const io = getIo();

    const bookingPayload = {
      id: order._id.toString(),
      orderId: order._id.toString(),
      OrderId: order._id.toString(),
      order: order,
      title: "🚨 Emergency Plumbing Dispatch",
      customer: req.user?.FullName || req.user?.name || street || "Customer",
      phone: req.user?.contact || req.user?.phone || "",
      street: street,
      city: city,   
      pinCode: pin_code,
      location: [street, city, pin_code].filter(Boolean).join(", "),
      coordinates: [parseFloat(longitude) || 72.8777, parseFloat(latitude) || 19.0760],
      latitude: parseFloat(latitude) || 19.0760,
      longitude: parseFloat(longitude) || 72.8777,
      message: service_Data.serviceName || "New Job Nearby!",
      serviceType: service_Data.serviceName || issueDescription || "Emergency Plumbing Repair",
      distance: "Within 25 Km Zone",
      estimatedPrice: `₹${ service_Data.price?.amount || 500}`,
      amount:  service_Data.price?.amount || 500,
      time: "Just now",
      urgent: true,
      unread: true,
      status: "Pending",
    };

    // Broadcast to:
    // 1. Global room "technicians"
    io.to("technicians").emit("new-booking-request", bookingPayload);

    // 2. Global io.emit fallback
    io.emit("new-booking-request", bookingPayload);

    // 3. Each specific nearby plumber room
    nearbyPlumbers.forEach((plumber) => {
      io.to(plumber._id.toString()).emit("new-booking-request", bookingPayload);
      if (plumber.userId) {
        const uId = plumber.userId._id ? plumber.userId._id.toString() : plumber.userId.toString();
        io.to(uId).emit("new-booking-request", bookingPayload);
      }
    });

    res.status(201).json({
      message: "Order Created Successfully",
      order,
    });
  } catch (err) {
    console.log("Internal Server error:", err);
    res.status(500).json({
      message: "Internal Server error",
      error: err.message,
    });
  }
}

// Basis on UserId
export async function GetOrderDetailController(req, res) {
  const order = await OrderModel.find({ userId: req.user.id }).populate("userId");

  res.status(200).json({
    message: "Order get Successfully",
    order,
  });
}

export async function GetAllServicesController(req, res) {
  try {
    const services = await ServiceModel.find();

    res.status(200).json({
      message: "get All services Successfully",
      services,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
}

export async function GetIdController(req, res) {
  try {
    const { OrderId } = req.params;

    const Order = await OrderModel.findById(OrderId).populate("userId").populate({
        path: "technicianId",
        populate: {
            path: "userId" // यह Technician Profile के अंदर मौजूद userId है
        }
    });

    if (!Order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let technicianProfile = null;
    if (Order.technicianId) {
      const techUserId = Order.technicianId._id || Order.technicianId;
      technicianProfile = await TechnicianProfileModel.findOne({ userId: techUserId });
    }

    res.status(200).json({
      message: "Get Order Successfully",
      order: Order,
      technicianProfile,
      OrderId: Order._id,
    });
  } catch (error) {
    console.log("Error In GetIdController", error);
    res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
}

export const CreateOrderPaymentController = async (req, res) => {
  try {
    const { accordingToWork, amount, PaymentType, currency, OrderId} = req.body;

    const targetOrderId = OrderId ;
    const workDetails = accordingToWork || "General plumbing repair & maintenance";
    const paymentMode = (PaymentType || payment_type || "online").toLowerCase();
    const curr = currency || "INR";
    const totalAmountNum = Number(amount) || 500;

    let razorpayOrder = null;
    const order=await OrderModel.findById(OrderId)
    if(!order){
      return res.status(404).json({
        message:"OrderIs not found"
      })
    }
    
    if(order.technicianId==null){
            return res.status(404).json({
        message:"Order is not accepted By any technician"
      })
    }
  
    
   
    if(order.status!=="Completed"){
      return res.status(404).json({
        message:"Order is not completed By any technician"
      })
    }
   
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
    { returnDocument:'after'})

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
        {returnDocument:'after'}
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
    });
  } catch (error) {
    console.error("GetPaymentDetailController error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
