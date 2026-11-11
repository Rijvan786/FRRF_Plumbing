import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("https://frpf-plumbing.onrender.com", {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    console.log("⚡ Singleton Socket.IO instance created");
  }
  return socket;
};

export const joinTrackingRoom = (orderId) => {
  if (!orderId) return;
  const s = getSocket();
  s.emit("join-tracking-room", orderId.toString());
};

export const leaveTrackingRoom = (orderId) => {
  if (!orderId) return;
  const s = getSocket();
  s.emit("leave-tracking-room", orderId.toString());
};

export const emitStatusUpdate = ({ OrderId, status }) => {
  if (!OrderId || !status) return;
  const s = getSocket();
  s.emit("update-status", { OrderId, status });
};
