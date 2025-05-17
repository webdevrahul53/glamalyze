// import mongoose from "../db";
import mongoose from "mongoose";


const CouponsSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    couponName:{type:String,required:true},
    branchId:[{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Branches"}],
    serviceId:[{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Services"}],
    discountPercent:{type:Number},
    discountAmount:{type:Number},
    validFrom:{type:Date,required:true},
    validTo:{type:Date,required:true},
    status:{type:Boolean,required:true},
},{ timestamps: true })



export const Coupons = mongoose.models.Coupons || mongoose.model("Coupons", CouponsSchema);