// import mongoose from "../db";
import mongoose from "mongoose";


const AppointmentsSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    appointmentDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Branches" },
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Customers" },
    totalAmount: { type: Number, required: true },
    pax: [[{
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Services" },
        durationList: { type: [] }, // Should be an array of numbers
        duration: { type: mongoose.Schema.Types.Mixed }, // Supports both String and Number
        price: { type: Number },
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employees" }, // Fix ref placement
    }]],
    paymentStatus: { type: String, required: true },
    taskStatus: { type: String, required: true },
    status: { type: Boolean, required: true },

}, { timestamps: true });

// AppointmentsSchema.index({ name: 1 }, { unique: true });

export const Appointments = mongoose.models.Appointments || mongoose.model("Appointments", AppointmentsSchema);