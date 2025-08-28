// import mongoose from "../db";
import mongoose from "mongoose";


const VoucherPurchasedSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    voucherId:{type:mongoose.Schema.Types.ObjectId, ref: "Vouchers", required:true},
    customerId:{type:mongoose.Schema.Types.ObjectId, ref: "Customers", required:true},
    cssId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employees" }],
    voucherBalance:{type:Number, required:true},
    remainingVoucher:{type:Number, required:true},
    paymentMethod: { type: String, default: "Cash" },
    // paymentStatus: { type: String, default: "Pending" },
    status:{type:Boolean,required:true},
},{ timestamps: true })

export const VoucherPurchased = mongoose.models.VoucherPurchased || mongoose.model("VoucherPurchased", VoucherPurchasedSchema);