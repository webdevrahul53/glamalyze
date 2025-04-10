import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    
    try {

      const branchId = req.query.branchId
      const appointmentDate = req.query.appointmentDate
      const result = await AppointmentServices.aggregate([
        { $lookup: { from: "appointments", localField: "appointmentId", foreignField: "_id", as: "appointment", },  },
        { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true }, },
        {
          $match: {
            $expr: {
              $eq: [
                { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
                appointmentDate
              ]
            },
            $or: [ { "appointment.branchId": new mongoose.Types.ObjectId(branchId) } ]
          }
        },
        { $lookup: { from: "employees", localField: "employeeId", foreignField: "_id", as: "employee" } },
        { $lookup: { from: "services", localField: "serviceId", foreignField: "_id", as: "service" } },
        { $lookup: { from: "customers", localField: "appointment.customerId", foreignField: "_id", as: "customer" } },
        { $lookup: { from: "assets", localField: "assetId", foreignField: "_id", as: "asset" } },
        { $lookup: { from: "assettypes", localField: "asset.assetTypeId", foreignField: "_id", as: "assetType" } },
        { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$service", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$asset", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$assetType", preserveNullAndEmptyArrays: true }, },
        {
          $addFields: {
            parsedTime: {
              $split: ["$startTime", ":"]
            }
          }
        },
        {
          $addFields: {
            hour: { $toInt: { $arrayElemAt: ["$parsedTime", 0] } },
            minute: { $toInt: { $arrayElemAt: ["$parsedTime", 1] } }
          }
        },
        {
          $addFields: {
            start: {
              $dateFromParts: {
                year: { $year: "$appointmentDate" },
                month: { $month: "$appointmentDate" },
                day: { $dayOfMonth: "$appointmentDate" },
                hour: "$hour",
                minute: "$minute"
              }
            }
          }
        },
        {
            $addFields: {
                // Calculate end time by adding totalDuration
                end: {
                $dateAdd: { startDate: "$start", unit: "minute", amount: "$duration" }
                }
            }
        },
        { $project: { _id: 1, appointmentId: 1, customer: 1, bookingId: 1, assetType: 1, assetNumber: "$asset.assetNumber", 
          taskStatus: "$appointment.taskStatus", paymentStatus: "$appointment.paymentStatus",
          startTime: 1, start: 1, end: 1, employee: 1, service: 1, duration: 1, price: 1, 
            status: 1 } },
        { $sort: { assetNumber: 1 } },
      ]);
      
      
      
      

      res.status(200).json(result) 
    }catch(err) {
      console.log(err)
      res.status(500).json(err) 

    }    
  }

  

}
