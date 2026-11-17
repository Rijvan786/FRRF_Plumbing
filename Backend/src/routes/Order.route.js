import { Router } from "express";
import { CreateOrderController,CreateOrderPaymentController,GetAllServicesController,GetIdController,GetOrderDetailController, GetPaymentDetailController, VerifyOrderController } 
from "../controller/Order.controller.js";
import { AuthenticateUser } from "../middleware/auth.middleware.js";
import multer from "multer";
import { CreateOrderValidation } from "../validator/createorder.validator.js";

const router=Router()

const upload=multer({storage:multer.memoryStorage(),
    limits:5*1024*1024
})

/* Create Order 
  /api/order/createOrder
*/
router.post("/CreateOrder",upload.array("Images",7),CreateOrderValidation,CreateOrderController)


/* GetOrderDetail 
  /api/order/GetOrderDetail
*/
router.get("/GetOrderDetail",AuthenticateUser,GetOrderDetailController)


/* CreateOrderPayment 
  /api/order/CreateOrderPayment
*/
router.post("/CreateOrderPayment", AuthenticateUser, CreateOrderPaymentController);

/* VerifyOrder 
  /api/order/VerifyOrder
*/
router.post("/VerifyOrder", AuthenticateUser, VerifyOrderController);

/* Payment-detail 
  /api/order/Payment-detail/:OrderId
*/
router.get("/payment-detail/:OrderId",AuthenticateUser,GetPaymentDetailController)

/* GetallServices 
  /api/order/GetallServices
*/
router.get("/GetallServices",GetAllServicesController)


/* GetId 
  /api/order/:OrderId
*/
router.get("/:OrderId",GetIdController)



export default router