// import mongoose from "../db";
import mongoose from "mongoose";


const AssetTypesSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    image:{type:String,required:true},
    assetTypeName:{type:String,required:true, unique: true},
    status:{type:Boolean,required:true, default: true},
},{ timestamps: true })



export const AssetTypes = mongoose.models.AssetTypes || mongoose.model("AssetTypes", AssetTypesSchema);