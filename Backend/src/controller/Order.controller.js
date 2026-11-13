import OrderModel from "../models/Order.model.js";
import ServiceModel from "../models/Service.model.js";
import { uploadFile } from "../service/storage.service.js";
import { RegisterController } from "../controller/auth.controller.js";
import TechnicianProfileModel from "../models/Technicianprofile.model.js";
import { getIo } from "../socket/server.socket.js";

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
          amount: service_Data.price.amount,
          currency: service_Data.price.currency,
        },
        serviceImg: service_Data.serviceImg,
      },
      issueDescription: issueDescription,
      issueImageUrl: Images,
      scheduleDate: scheduleDate || new Date(),
      total_Amount:{
        amount:  service_Data.price.amount ,
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

    const Order = await OrderModel.findById(OrderId).populate("technicianId").populate("userId");

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
