// import mongoose from "../db";
import mongoose from "mongoose";


const EmployeesSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    image:{type:String,required:true},
    firstname:{type:String,required:true},
    lastname:{type:String,required:true},
    email:{type:String,required:true},
    phonenumber:{type:String,required:true},
    gender:{type:String,required:true},
    branchId: {type: mongoose.Schema.Types.ObjectId, required:true, ref: "Branches"},
    servicesId:[{type:mongoose.Schema.Types.ObjectId, required:true, ref: "Services"}],
    aboutself:{type:String},
    expert:{type:String},
    facebook:{type:String},
    instagram:{type:String},
    twitter:{type:String},
    dribble:{type:String},
    isVisibleInCalendar:{type:Boolean},
    isManager:{type:Boolean},
    status:{type:Boolean},
},{ timestamps: true })


export const Employees = mongoose.models.Employees || mongoose.model("Employees", EmployeesSchema);