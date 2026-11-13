import mongoose from "mongoose";
import priceSchema from "./price.model.js";

const PaymentSchema=mongoose.Schema({
    status:{
        type:String,
        enum:["pending","paid","failed"],
        default:"pending"
    },
    totalAmount:{
        type:priceSchema,
        required:true
    },
    razorpay:{
        orderId:String,
        paymentId:String,
        signature:String
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    accordingToWork:{
        type:String,
        required:true
        
    },
    PaymentType:{
        type:String,
        enum:["cash","online"],
        default:null
    },
    Order_details:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"order"  
    }
},
{
    timestamps:true
})

PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ orderId: 1 });

const PaymentModel=mongoose.model("payment",PaymentSchema)

export default PaymentModel