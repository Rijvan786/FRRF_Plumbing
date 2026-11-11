import { getSocket } from "../../socketio/service/track_socketio.api.js";

export { getSocket };

// Send Location to Backend
export const emitTechnicianLocation = ({ OrderId, latitude, longitude, isOnline, status }) => {
  if (!OrderId) return;
  const s = getSocket();
  s.emit("send-location", {
    OrderId,
    latitude: Number(latitude),
    longitude: Number(longitude),
    isOnline: isOnline !== undefined ? isOnline : true,
    status: status || "On-the-way",
  });
};

// Send Status Update (e.g., On-the-way, Arrived, Working, Completed)
export const emitTechnicianStatus = ({ OrderId, status }) => {
  if (!OrderId || !status) return;
  const s = getSocket();
  s.emit("update-status", { OrderId, status });
};

// Subscribe to job notifications for technician room
export const subscribeToJobNotifications = ({ technicianId, onJobReceived }) => {
  if (!technicianId) return () => {};
  const s = getSocket();

  s.emit("join-booking", technicianId.toString());
  console.log(`📡 Technician joined booking room: ${technicianId}`);

  const handler = (data) => {
    console.log("⚡ New booking request received via socket:", data);
    if (onJobReceived) {
      onJobReceived(data);
    }
  };

  s.on("new-booking-request", handler);

  return () => {
    console.log(`🔌 Cleaning up socket listener for technician ${technicianId}...`);
    s.off("new-booking-request", handler);
  };
};
