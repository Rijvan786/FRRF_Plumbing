import { Router } from "express";
import { AuthenticateAdmin, AuthenticateUser } from "../middleware/auth.middleware.js";
import { CreateServiceController, EditServiceController, GetAllServicesController, GetVerifiedTechniciansController,GetUnVerifiedTechniciansController, VerifyTechnicianController, RemoveServiceController } from "../controller/admin.controller.js";
import multer from "multer" 
import { CreateServiceValidation } from "../validator/createservice.validator.js";
const router= Router()

const upload=multer({storage:multer.memoryStorage(),
    limits:5*1024*1024
})

router.post("/createService",AuthenticateAdmin, AuthenticateUser,upload.array("Images",7),CreateServiceValidation,CreateServiceController)

router.get("/GetallServices", AuthenticateUser,GetAllServicesController)

router.patch("/verifyTechnician",AuthenticateUser,AuthenticateAdmin,VerifyTechnicianController)

router.get("/getVerifiedTechnicians",AuthenticateUser,AuthenticateAdmin,GetVerifiedTechniciansController)

router.get("/getUnVerifiedTechnicians",AuthenticateUser,AuthenticateAdmin,GetUnVerifiedTechniciansController)

router.put("/EditService",AuthenticateAdmin,AuthenticateUser,upload.array("Images",7),EditServiceController)

router.delete("/RemoveService",AuthenticateAdmin,AuthenticateUser,RemoveServiceController)
export default router 

                                                