// import mongoose from "../db";
import mongoose from "mongoose";


const AssetsSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    branchId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Branches"},
    assetType:{type:String,required:true},
    assetNumber:{type:String,required:true, unique: true},
    status:{type:Boolean,required:true},
},{ timestamps: true })



export const Assets = mongoose.models.Assets || mongoose.model("Assets", AssetsSchema);