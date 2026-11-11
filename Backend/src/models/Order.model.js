import mongoose from "mongoose";
import  priceSchema  from "./price.model.js";
import {AddressSchema} from "./address.model.js";
import {ServiceSchema} from "./Service.model.js";

const OrderSchema=mongoose.Schema({
   
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        default:null
    },
    technicianId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        default:null
    },
     ServiceDetails:{
        type:ServiceSchema
         
    },
     issuedDescription:{  
      type: String,
 
    },
    address:{
        type:AddressSchema,
         },
     issueImageUrl:[
      {
        url:{
          type:String,
          required:true
        }
      }
     ],
   
 
 // 5. बुकिंग का स्टेटस (Live Tracking के लिए)
    status: {
      type: String,
      enum: ["Pending", "Assigned", "On-the-way", "Working", "Completed", "Cancelled","Accepted"],
      default: "Pending"
    },
    scheduleDate:{type:Date,required:true},
    total_Amount:{type:priceSchema},
    isArchived:{type:Boolean, default:false}
},
  {
    timestamps:true,optimisticConcurrency:true
  }
)
OrderSchema.index({ scheduledDate: 1 }, { partialFilterExpression: { status: 'Pending' } });
OrderSchema.index({ userId: 1, createdAt: -1 }, { partialFilterExpression: { isArchived: false } });



const OrderModel=mongoose.model("order",OrderSchema)
export default OrderModel