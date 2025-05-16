// import mongoose from "../db";
import mongoose from "mongoose";


const VouchersSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    voucherName:{type:String,required:true},
    voucherBalance: {type:Number,required:true},
    quantity: {type:Number,required:true},
    defaultPrice: {type:Number,required:true},
    amountToPay: {type:Number,required:true},
    services: [{ 
        serviceId: {type:mongoose.Schema.Types.ObjectId,required:true, ref: "Services"}, 
        duration: {type:Number,required:true}
    }],
    status:{type:Boolean,required:true},
},{ timestamps: true })



export const Vouchers = mongoose.models.Vouchers || mongoose.model("Vouchers", VouchersSchema);