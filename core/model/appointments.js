// import mongoose from "../db";
import mongoose from "mongoose";


const AppointmentsSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    appointmentDate:{type:Date,required:true},
    startTime:{type:String,required:true},
    branchId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Branches"},
    customerId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Customers"},
    employeeId:{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Employees"},
    serviceIds:[{type:mongoose.Schema.Types.ObjectId,required:true, ref: "Services"}],
    totalAmount:{type:Number,required:true},
    totalDuration:{type:Number,required:true},
    paymentStatus:{type:String,required:true},
    taskStatus:{type:String,required:true},
    status:{type:Boolean,required:true},
},{ timestamps: true })

// AppointmentsSchema.index({ name: 1 }, { unique: true });

export const Appointments = mongoose.models.Appointments || mongoose.model("Appointments", AppointmentsSchema);