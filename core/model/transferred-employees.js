// import mongoose from "../db";
import mongoose from "mongoose";


const TransferredEmployeesSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    dateFor:{type:String,required:true},
    branchId:{type:mongoose.Schema.Types.ObjectId, ref: "Branches"},
    employeeId:{type:mongoose.Schema.Types.ObjectId, ref: "Employees"},
    openingAt:{type:String,required:true},
    closingAt:{type:String,required:true},
    status:{type:Boolean,required:true},
},{ timestamps: true })

export const TransferredEmployees = mongoose.models.TransferredEmployees || mongoose.model("TransferredEmployees", TransferredEmployeesSchema);