import { Server } from "socket.io";
import trackingHandler from "./trackinghandler.js";

let io = null;

export function Initfunction(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "https://frpf-plumbing.onrender.com",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  console.log("⚡ Socket.IO server initialized with CORS");

  io.on("connect", (socket) => {
    console.log("🟢 User connected to Socket.IO server:", socket.id);
    trackingHandler({ io, socket });
  });

  return io;
}

export function getIo() {
  if (!io) {
    throw new Error("Socket.IO is not initialized yet");
  }
  return io;
}
