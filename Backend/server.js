// your work is only run server and connect to the database

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import http from "http";
import { Initfunction } from "./src/socket/server.socket.js";

const httpServer = http.createServer(app);

// Initialize Socket.io single instance with CORS & tracking handlers
const io = Initfunction(httpServer);
app.set("io", io);

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});

connectDB();
