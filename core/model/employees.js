// import mongoose from "../db";
import mongoose from "mongoose";


const EmployeesSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    image:{type:String},
    firstname:{type:String,required:true},
    lastname:{type:String},
    phonenumber:{
        type: String,
        required: true,
        unique: true,
        match: [/^\+\d{1,3}[- ]?\d{7,12}$/, "Invalid international phone number"], 
    },
    email:{
        type:String, unique:true,
        match:/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    password:{type:String},
    gender:{type:String,required:true},
    servicesId:[{type:mongoose.Schema.Types.ObjectId, required:true, ref: "Services"}],
    defaultBranch:{type:mongoose.Schema.Types.ObjectId, required:true, ref: "Branches"},
    roleId:{type:mongoose.Schema.Types.ObjectId, required:true, ref: "Roles"},
    // aboutself:{type:String},
    // expert:{type:String},
    // facebook:{type:String},
    // instagram:{type:String},
    // twitter:{type:String},
    // dribble:{type:String},
    isVisibleInCalendar:{type:Boolean},
    isManager:{type:Boolean},
    status:{type:Boolean},
},{ timestamps: true })

export const Employees = mongoose.models.Employees || mongoose.model("Employees", EmployeesSchema);