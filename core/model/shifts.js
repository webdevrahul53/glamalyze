// import mongoose from "../db";
import mongoose from "mongoose";


const ShiftsSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    branchId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Branches"},
    groups:[{type:mongoose.Schema.Types.ObjectId, ref: "Groups"}],
    shiftname:{type:String,required:true},
    openingAt:{type:String,required:true},
    closingAt:{type:String,required:true},
    status:{type:Boolean,required:true},
},{ timestamps: true })



export const Shifts = mongoose.models.Shifts || mongoose.model("Shifts", ShiftsSchema);