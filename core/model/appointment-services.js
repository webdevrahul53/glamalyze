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
    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Services" },
    employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Employees" },
    assetId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Assets" },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { type: Boolean, required: true },

}, { timestamps: true });

// AppointmentServicesSchema.index({ name: 1 }, { unique: true });

export const AppointmentServices = mongoose.models.AppointmentServices || mongoose.model("AppointmentServices", AppointmentServicesSchema);