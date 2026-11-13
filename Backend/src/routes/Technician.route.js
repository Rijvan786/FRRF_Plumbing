import { Router } from "express";
import { 
    acceptJobController,
    CreateOrderPaymentController,
    GetTechnicianController,
    GetTechnicianNotificationsController,
    RegisterTechnicianController, 
    VerifyOrderController,
    GetPaymentDetailController,
    ToggleOnlineStatusController,
    EditProfileController
} from "../controller/Technician.controller.js";
import { RegisterValidator } from "../validator/auth.validator.js";
import { AuthenticateTechnician, AuthenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/TechnicianRegister", RegisterValidator, RegisterTechnicianController);

router.post("/acceptJob", AuthenticateUser, AuthenticateTechnician, acceptJobController);

router.get("/getTechnician", AuthenticateUser, AuthenticateTechnician, GetTechnicianController);

router.get("/notifications", GetTechnicianNotificationsController);

// Payment endpoints - AuthenticateUser allows both customer and technician
router.post("/CreateOrderPayment", AuthenticateUser, CreateOrderPaymentController);

router.post("/VerifyOrder", AuthenticateUser, VerifyOrderController);

router.get("/payment-detail/:OrderId",AuthenticateUser,AuthenticateTechnician,GetPaymentDetailController)

router.patch("/toggle-online", AuthenticateUser, AuthenticateTechnician, ToggleOnlineStatusController);

router.put("/edit-profile", AuthenticateUser, AuthenticateTechnician, EditProfileController);

export default router;
