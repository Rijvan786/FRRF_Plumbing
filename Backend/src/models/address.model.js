import mongoose from "mongoose";

export const AddressSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",  
      default:null
    },
    label: {
      type: String,
      enum: ["Home", "office", "Shop", "apartment","Other"],
      default: "Home",
    },
    street: { type: String, required: true },
    city: { type: String, required: true },
    pin_code: { type: String, required:true },

    // GeoJSON
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

AddressSchema.index({ location: "2dsphere" });

AddressSchema.index(
  { userId: 1 },
  { partialFilterExpression: { isActive: true } },
);


const AddressModel=mongoose.model("Address",AddressSchema)

export default AddressModel