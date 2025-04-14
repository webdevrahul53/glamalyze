// import mongoose from "../db";
import mongoose from "mongoose";


const CategoriesSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    image:{type:String},
    categoryname:{type:String,required:true},
    status:{type:Boolean,required:true},
},{ timestamps: true })

export const Categories = mongoose.models.Categories || mongoose.model("Categories", CategoriesSchema);