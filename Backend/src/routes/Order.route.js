import { Router } from "express";
import { CreateOrderController,GetAllServicesController,GetIdController,GetOrderDetailController } 
from "../controller/Order.controller.js";
import { AuthenticateUser } from "../middleware/auth.middleware.js";
import multer from "multer";
import { CreateOrderValidation } from "../validator/createorder.validator.js";

const router=Router()

const upload=multer({storage:multer.memoryStorage(),
    limits:5*1024*1024
})

router.post("/CreateOrder",upload.array("Images",7),CreateOrderValidation,CreateOrderController)


router.get("/GetOrderDetail",AuthenticateUser,GetOrderDetailController)



router.get("/GetallServices",GetAllServicesController)

router.get("/:OrderId",GetIdController)



export default router