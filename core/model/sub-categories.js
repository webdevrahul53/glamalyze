// import mongoose from "../db";
import mongoose from "mongoose";


const SubCategoriesSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    image:{type:String,required:true},
    categoryId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Categories"},
    subcategoryname:{type:String,required:true},
    status:{type:Boolean,required:true},
},{ timestamps: true })

SubCategoriesSchema.index({ subcategoryname: 1 }, { unique: true });

export const SubCategories = mongoose.models.SubCategories || mongoose.model("SubCategories", SubCategoriesSchema);