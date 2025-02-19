// import mongoose from "../db";
import mongoose from "mongoose";


const UserSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    avatar:{type:String},
    name:{type:String,required:true},
    email:{
        type:String,
        required:true,
        unique:true,
        match:/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    password:{type:String,required:true},
},{ timestamps: true })

export const Users = mongoose.models.User || mongoose.model("User", UserSchema);