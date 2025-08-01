// import mongoose from "../db";
import mongoose from "mongoose";


const RolesSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    color:{type:String,required:true, default: "#000000"}, // Default color set to black
    rolesName:{type:String,required:true, unique: true},
    status:{type:Boolean,required:true, default: true},
},{ timestamps: true })



export const Roles = mongoose.models.Roles || mongoose.model("Roles", RolesSchema);