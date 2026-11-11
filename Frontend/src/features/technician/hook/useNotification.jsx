import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setNewJobOrderId, addNotification, setNotifications } from "../state/technician.slice.jsx";
import { subscribeToJobNotifications } from "../services/socket.api.jsx";
import { GetTechnicianNotifications } from "../services/technician.api.jsx";

export function useNotification({ technicianId, userId }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. Initial REST fetch for pending orders on mount
    GetTechnicianNotifications()
      .then((res) => {
        if (res?.notifications && Array.isArray(res.notifications) && res.notifications.length > 0) {
          dispatch(setNotifications(res.notifications));
          if (res.notifications[0]?.orderId) {
            dispatch(setNewJobOrderId(res.notifications[0].orderId));
          }
        }
      })
      .catch((err) => console.warn("Fetch notifications note:", err?.message || err));

    // 2. Real-time Socket.IO subscription
    const activeId = technicianId || userId || "technician";

    const cleanupTech = subscribeToJobNotifications({
      technicianId: activeId,
      onJobReceived: handleJob,
    });

    const cleanupUser =
      userId && userId !== activeId
        ? subscribeToJobNotifications({
            technicianId: userId,
            onJobReceived: handleJob,
          })
        : null;

    function handleJob(data) {
      console.log("⚡ Job dispatch alert received in useNotification hook:", data);
      const orderId = data?.orderId || data?.OrderId || data?.order?._id;
      if (orderId) {
        dispatch(setNewJobOrderId(orderId.toString()));
        dispatch(
          addNotification({
            id: `${orderId}-${Date.now()}`,
            orderId: orderId.toString(),
            OrderId: orderId.toString(),
            title: "🚨 Emergency Plumbing Dispatch",
            customer: data?.customer || data?.customerName || data?.order?.address?.street || "Incoming Client",
            phone: data?.phone || data?.order?.userId?.contact || "",
            street: data?.street || data?.order?.address?.street || "",
            city: data?.city || data?.order?.address?.city || "",
            pinCode: data?.pinCode || data?.order?.address?.pin_code || "",
            location: data?.location || [data?.street, data?.city].filter(Boolean).join(", ") || "Client Location",
            coordinates: data?.coordinates || [72.8777, 19.0760],
            latitude: data?.latitude || 19.0760,
            longitude: data?.longitude || 72.8777,
            serviceType:
              data?.serviceType ||
              data?.message ||
              data?.order?.ServiceDetails?.serviceName ||
              "Emergency Leakage / Repair Needed",
            distance: data?.distance || "Within 25 Km Zone",
            estimatedPrice: data?.estimatedPrice || (data?.amount ? `₹${data.amount}` : "₹500"),
            amount: data?.amount || 500,
            time: "Just now",
            urgent: true,
            unread: true,
            status: data?.status || "Pending",
          })
        );
      }
    }

    return () => {
      if (cleanupTech) cleanupTech();
      if (cleanupUser) cleanupUser();
    };
  }, [technicianId, userId, dispatch]);
}

export default useNotification;
