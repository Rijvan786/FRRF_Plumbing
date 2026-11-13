import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import AuthRouter from "./routes/auth.route.js";
import OrderRouter from "./routes/Order.route.js";
import AdminRouter from "./routes/Admin.route.js";
import TechnicianRouter from "./routes/Technician.route.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Config } from "./config/config.js";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(cookieParser());

app.use(cors({
  origin: "https://frpf-plumbing.onrender.com",
  credentials: true,
}));

// routes
app.use("/api/auth", AuthRouter);
app.use("/api/order", OrderRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/technician", TechnicianRouter);
app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: Config.GOOGLE_CLIENT_ID2,
  clientSecret: Config.GOOGLE_CLIENT_SECRET2,
  callbackURL: "https://frpf-plumbing.onrender.com/api/auth/google/callback",
},
(_, __, profile, done) => {
  return done(null, profile);
}
));


// Public for Backend Deployment

import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename=fileURLToPath(import.meta.url)
const __dirname=dirname(__filename)

app.use(express.static("./public"))


app.use("*name",((req,res)=>{

  res.sendFile(path.join(__dirname,".","../public/index.html"))
}))

export default app;
