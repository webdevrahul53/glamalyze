// import mongoose from "../db";
import mongoose from "mongoose";


const ServicesSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    image:{type:String,required:true},
    name:{type:String,required:true},
    categoryId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Categories"},
    subCategoryId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "SubCategories"},
    serviceDuration:{type:Number,required:true},
    defaultPrice:{type:Number,required:true},
    description:{type:String},
    status:{type:Boolean,required:true},
},{ timestamps: true })

ServicesSchema.index({ name: 1 }, { unique: true });

export const Services = mongoose.models.Services || mongoose.model("Services", ServicesSchema);