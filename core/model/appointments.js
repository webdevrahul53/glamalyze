// import mongoose from "../db";
import { randomUUID } from "crypto";
import mongoose from "mongoose";


const AppointmentsSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    bookingId: { type: String, unique: true, default: randomUUID },

    appointmentDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Branches" },
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Customers" },
    paxId: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "AppointmentPax" }],
    
    
    totalDuration: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, default: "Pending" },
    paymentMethod: { type: String, default: "Cash" },
    taskStatus: { type: String, default: "Pending" },
    note: { type: String },
    status: { type: Boolean, required: true },

}, { timestamps: true });


export const Appointments = mongoose.models.Appointments || mongoose.model("Appointments", AppointmentsSchema);