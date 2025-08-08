// import mongoose from "../db";
import { randomUUID } from "crypto";
import mongoose from "mongoose";


const GlobalSettingsSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    settingType: { type: String },

    // commissions
    transferCommission: { type: Number, required: true },
    personalBookingCommission: { type: Number, required: true },
    seniorPremiumCommission: { type: Number, required: true },
    

}, { timestamps: true });

export const GlobalSettings = mongoose.models.GlobalSettings || mongoose.model("GlobalSettings", GlobalSettingsSchema);