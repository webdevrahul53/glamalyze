// import mongoose from "../db";
import mongoose from "mongoose";

const ServicesSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    image:{type:String},
    name:{type:String,required:true},
    assetTypeId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "AssetTypes"},
    categoryId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Categories"},
    subCategoryId:{type:mongoose.Schema.Types.ObjectId,required:false, ref: "SubCategories", default: null},
    variants: [{ serviceDuration:{type: Number, required: true}, defaultPrice:{type: Number, required: true}, }],
    description:{type:String},
    status:{type:Boolean,required:true},
},{ timestamps: true })


export const Services = mongoose.models.Services || mongoose.model("Services", ServicesSchema);