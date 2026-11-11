import { Router } from "express";
import { 
    acceptJobController,
    GetTechnicianController,
    GetTechnicianNotificationsController,
    RegisterTechnicianController } from "../controller/Technician.controller.js";
import { RegisterValidator } from "../validator/auth.validator.js";
import { AuthenticateTechnician, AuthenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/TechnicianRegister", RegisterValidator, RegisterTechnicianController);

router.post("/acceptJob", AuthenticateUser, AuthenticateTechnician, acceptJobController);

router.get("/getTechnician", AuthenticateUser, AuthenticateTechnician, GetTechnicianController);

router.get("/notifications", GetTechnicianNotificationsController);

export default router;
