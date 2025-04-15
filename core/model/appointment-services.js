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
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employees" },
    status: { type: Boolean, required: true },
    
    // useless but need to store for edit form
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Assets" },
    duration: { type: Number, required: true },
    durationList: {type: []},
    assetTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "AssetTypes" },
    assetList: {type: []},
    price: { type: Number },
    busyEmployees: {type: []},
    employeeList: {type: []}, 

}, { timestamps: true });

export const AppointmentServices = mongoose.models.AppointmentServices || mongoose.model("AppointmentServices", AppointmentServicesSchema);