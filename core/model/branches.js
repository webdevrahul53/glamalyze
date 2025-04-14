// import mongoose from "../db";
import mongoose from "mongoose";


const BranchesSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    image:{type:String,required:true},
    branchname:{type:String,required:true},
    gender:{type:String,required:true},
    managerId:{type:mongoose.Schema.Types.ObjectId, ref: "Employees"},
    groups:[{type:mongoose.Schema.Types.ObjectId, ref: "Groups"}],
    servicesId:[{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Services"}],
    contactnumber:{type:String,required:true},
    email:{type:String,required:true},
    address:{type:String,required:true},
    landmark:{type:String},
    country:{type:String,required:true},
    city:{type:String,required:true},
    state:{type:String,required:true},
    postalcode:{type:String,required:true},
    latitude:{type:String,required:true},
    longitude:{type:String,required:true},
    openingAt:{type:String,required:true, default: "10"},
    closingAt:{type:String,required:true, default: "18"},
    colorcode:{type:String,required:true, default: "#000000"},
    paymentmethods:[{type:String}],
    description:{type:String},
    status:{type:Boolean,required:true},
},{ timestamps: true })

export const Branches = mongoose.models.Branches || mongoose.model("Branches", BranchesSchema);