// import mongoose from "../db";
import mongoose from "mongoose";


const RosterSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    branchId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Branches"},
    shiftId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Shifts"},
    groups:[{type:mongoose.Schema.Types.ObjectId, ref: "Groups"}],
    dateFor:{type:String,required:true},
    status:{type:Boolean,required:true},
},{ timestamps: true })



export const Roster = mongoose.models.Roster || mongoose.model("Roster", RosterSchema);