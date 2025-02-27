// import mongoose from "../db";
import mongoose from "mongoose";


const CategoriesSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    image:{type:String,required:true},
    categoryname:{type:String,required:true},
    status:{type:Boolean,required:true},
},{ timestamps: true })

CategoriesSchema.index({ categoryname: 1 }, { unique: true });

export const Categories = mongoose.models.Categories || mongoose.model("Categories", CategoriesSchema);