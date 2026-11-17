import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setNewJobOrderId, addNotification, setNotifications, dismissNotification } from "../state/technician.slice.jsx";
import { getSocket, subscribeToJobNotifications } from "../services/socket.api.jsx";
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

    // 🚀 Listen for jobs taken by other technicians and remove them instantly!
    const socket = getSocket();
    const handleJobTaken = (data) => {
      console.log("⚡ job-taken alert received via socket:", data);
      const takenOrderId = data?.orderId || data?.OrderId || data?.id;
      const takenByTech = data?.technicianId ? String(data.technicianId) : null;
      const myId = String(activeId);

      // If taken by another technician, or broadcasted to remove from others:
      if (takenOrderId) {
        if (!takenByTech || takenByTech !== myId) {
          dispatch(dismissNotification(takenOrderId.toString()));
        }
      }
    };

    socket.on("job-taken", handleJobTaken);
    socket.on("job-already-accepted", handleJobTaken);

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
            status: data?.status || data?.order?.status || "Pending",
            isAccepted: (data?.status || data?.order?.status) === "Accepted" || (data?.status || data?.order?.status) === "Working" || !!data?.order?.technicianId,
          })
        );
      }
    }

    return () => {
      if (cleanupTech) cleanupTech();
      if (cleanupUser) cleanupUser();
      socket.off("job-taken", handleJobTaken);
      socket.off("job-already-accepted", handleJobTaken);
    };
  }, [technicianId, userId, dispatch]);
}

export default useNotification;
