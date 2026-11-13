import { Router } from "express";
import {
  RegisterController,
  EmailVerification,
  ResendMailController,
  LoginController,
  ResetPasswordMailController,
  ForgetPasswordController,
  GetMeController,
  LogoutController,
  GoogleCallback,
  ProfileEditController,
} from "../controller/auth.controller.js";
import { AuthenticateUser } from "../middleware/auth.middleware.js";
import passport from "passport";
import { Config } from "../config/config.js";
import { RegisterValidator } from "../validator/auth.validator.js";

const router = Router();

// POST /api/auth/register               — Register new user (client or technician)
router.post("/register",RegisterValidator, RegisterController);

// POST /api/auth/login                  — Login user and send security email notification
router.post("/login",LoginController);

// GET  /api/auth/verify-email           — Verify email from link in inbox
router.get("/verify-email",EmailVerification);

// POST /api/auth/resend-verification     — Resend verification email
router.post("/resend-verification", ResendMailController);

// POST /api/auth/reset-password-mail    — Send password reset email linking to https://frpf-plumbing.onrender.com/forgot-passwordpage
router.get("/reset-password-mail",ResetPasswordMailController);

// POST /api/auth/reset-password         — Update password with reset token
router.patch("/reset-password", ForgetPasswordController);


// POST /api/auth/logout                 — Clear authentication cookie
router.get("/logout",AuthenticateUser,LogoutController);

router.get("/get-me",AuthenticateUser,GetMeController)

router.get("/google",passport.authenticate("google",{scope:["profile","email"]}))

router.get("/google/callback",passport.authenticate("google",{session:false,failureRedirect:Config.NODE_ENV="development"?"https://frpf-plumbing.onrender.com/":"/"}),
GoogleCallback
)

router.put("/edit-profile", AuthenticateUser, ProfileEditController);



export default router;