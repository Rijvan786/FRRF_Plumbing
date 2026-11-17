import { Router } from "express";
import { 
    acceptJobController,
    GetTechnicianController,
    GetTechnicianNotificationsController,
    RegisterTechnicianController, 
    ToggleOnlineStatusController,
    EditProfileController,
    VerifyPlumberWorkController,
    GetPaymentDetailController,
    GetIdController,
} from "../controller/Technician.controller.js";
import { RegisterValidator } from "../validator/auth.validator.js";
import { AuthenticateTechnician, AuthenticateUser } from "../middleware/auth.middleware.js";
import multer from "multer";

const upload=multer({storage:multer.memoryStorage(),
    limits:5*1024*1024
})
const router = Router();

router.post("/TechnicianRegister", RegisterValidator, RegisterTechnicianController);

router.post("/acceptJob", AuthenticateUser, AuthenticateTechnician, acceptJobController);

router.post("/verify-plumber-work",upload.array("Images",7),AuthenticateTechnician,AuthenticateUser,VerifyPlumberWorkController)

router.get("/getTechnician", AuthenticateUser, AuthenticateTechnician, GetTechnicianController);

router.get("/notifications", GetTechnicianNotificationsController);

router.get("/payment-detail/:OrderId",AuthenticateUser,GetPaymentDetailController)

router.get("/:OrderId",GetIdController)
// Payment endpoints - AuthenticateUser allows both customer and technician

router.patch("/toggle-online", AuthenticateUser, AuthenticateTechnician, ToggleOnlineStatusController);

router.put("/edit-profile", AuthenticateUser, AuthenticateTechnician, EditProfileController);

export default router;
