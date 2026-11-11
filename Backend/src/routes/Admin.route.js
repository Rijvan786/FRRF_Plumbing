import { Router } from "express";
import { AuthenticateAdmin, AuthenticateUser } from "../middleware/auth.middleware.js";
import { CreateServiceController, GetAllServicesController, getTodaysRegisteredPlumbers } from "../controller/admin.controller.js";
import multer from "multer" 
import { CreateServiceValidation } from "../validator/createservice.validator.js";
const router= Router()

const upload=multer({storage:multer.memoryStorage(),
    limits:5*1024*1024
})

router.post("/createService",AuthenticateAdmin, AuthenticateUser,upload.array("Images",7),CreateServiceValidation,CreateServiceController)

router.get("/GetallServices", AuthenticateUser,GetAllServicesController)

router.get("/getTodayRegisterTechnicians",AuthenticateUser,AuthenticateAdmin,getTodaysRegisteredPlumbers)


      
export default router 

                                  