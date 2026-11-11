import mongoose from "mongoose"

const   TechnicianProfileSchema=mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, 
    ref: "user", required: true },

    experienceYears:{
      type: Number,
      required: true
    },
    isVerifiedTech:{
      type: Boolean,
      default: false,
    },
  // 2. Permanent Address (KYC / पुलिस वेरिफिकेशन के लिए)
  permanentAddress: {
    street: { type: String },
    city: { type: String },
pin_code: { type: String }
  },

  // 3. 🚀 LIVE LOCATION (The Real Magic - GeoJSON)
  // यह वो लोकेशन है जिससे पता चलेगा कि प्लंबर अभी शहर में कहाँ खड़ा है
  liveLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },

  // 4. प्लंबर ड्यूटी पर है या नहीं?
  isOnline: { type: Boolean, default: false }, 
  
  // 5. प्लंबर खाली है या किसी के घर काम कर रहा है?
  isAvailable: { type: Boolean, default: true },

  // 6. उसकी स्किल्स और रेटिंग (ऑप्शनल)
  skills: { type: [String], default: ["Plumbing"] },
  rating: { type: Number, default: 5.0 }

}, { timestamps:true}     
)

TechnicianProfileSchema.index({ liveLocation: '2dsphere' });
const TechnicianProfileModel=mongoose.model("TechnicianProfile",TechnicianProfileSchema)

export default TechnicianProfileModel