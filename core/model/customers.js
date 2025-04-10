// import mongoose from "../db";
import mongoose from "mongoose";


const CustomersSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    image:{type:String},
    firstname:{type:String,required:true},
    lastname:{type:String},
    gender:{type:String,required:true},
    email:{
        type:String, unique:true,
        match:/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    phonenumber:{
        type: String,
        required: true,
        unique: true,
        match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Invalid phone number"], 
    },
    status:{type:Boolean,required:true,default:true},
},{ timestamps: true })

export const Customers = mongoose.models.Customers || mongoose.model("Customers", CustomersSchema);