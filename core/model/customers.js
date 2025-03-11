// import mongoose from "../db";
import mongoose from "mongoose";


const CustomersSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    image:{type:String,required:true},
    firstname:{type:String,required:true},
    lastname:{type:String,required:true},
    gender:{type:String,required:true},
    email:{
        type:String, required:true, unique:true,
        match:/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    phonenumber:{type:String,required:true},
    status:{type:Boolean,required:true},
},{ timestamps: true })

CustomersSchema.index({ email: 1 }, { unique: true });

export const Customers = mongoose.models.Customers || mongoose.model("Customers", CustomersSchema);