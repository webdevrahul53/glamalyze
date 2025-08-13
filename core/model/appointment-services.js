// import mongoose from "../db";
import { randomUUID } from "crypto";
import mongoose from "mongoose";


const AppointmentServicesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    bookingId: { type: String, default: randomUUID },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointments" },
    paxId: { type: mongoose.Schema.Types.ObjectId, ref: "AppointmentPax" },
    
    appointmentDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Services" },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Assets" },
    employeeId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employees" }],
    couponUsed: { type: mongoose.Schema.Types.ObjectId, ref: "Coupons" },
    voucherUsed: { type: mongoose.Schema.Types.ObjectId, ref: "Vouchers" },
    voucherDiscount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    subTotal: { type: Number, required: true },
    status: { type: Boolean, required: true },
    
    // commissions
    staffCommission: { type: Number },
    transferCommission: { type: Number },
    personalBookingCommission: { type: Number },
    
    // useless but need to store for edit form
    durationList: {type: []},
    couponList: {type: []},
    assetTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "AssetTypes" },
    assetList: {type: []},
    busyEmployees: {type: []},
    employeeList: {type: []}, 

}, { timestamps: true });

export const AppointmentServices = mongoose.models.AppointmentServices || mongoose.model("AppointmentServices", AppointmentServicesSchema);