// import mongoose from "../db";
import mongoose from "mongoose";


const SettingsSchema = mongoose.Schema({
    _id:{type: String, default: "globalSettings"},
    rosterStartDate:{type:Date},
    rosterEndDate:{type:Date},
    status:{type:Boolean,required:true},
},{ timestamps: true })



export const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);