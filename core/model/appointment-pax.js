// import mongoose from "../db";
import { randomUUID } from "crypto";
import mongoose from "mongoose";


const AppointmentPaxSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    bookingId: { type: String, default: randomUUID },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointments" },
    appointmentServiceId: [{ type: mongoose.Schema.Types.ObjectId, ref: "AppointmentServices" }],
    status: { type: Boolean, required: true },

}, { timestamps: true });

// AppointmentPaxSchema.index({ name: 1 }, { unique: true });

export const AppointmentPax = mongoose.models.AppointmentPax || mongoose.model("AppointmentPax", AppointmentPaxSchema);