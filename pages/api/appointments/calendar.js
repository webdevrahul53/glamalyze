import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    
    try {

      const result = await AppointmentServices.aggregate([
        { $lookup: { from: "appointments", localField: "appointmentId", foreignField: "_id", as: "appointment", },  },
        { $lookup: { from: "employees", localField: "employeeId", foreignField: "_id", as: "employee" } },
        { $lookup: { from: "services", localField: "serviceId", foreignField: "_id", as: "service" } },
        { $lookup: { from: "customers", localField: "appointment.customerId", foreignField: "_id", as: "customer" } },
        { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$service", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true }, },
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
        { $project: { _id: 1, customer: 1, bookingId: 1, startTime: 1, start: 1, end: 1, employee: 1, service: 1, duration: 1, price: 1, 
            status: 1 } },
      ]);
      
      
      
      

      res.status(200).json(result) 
    }catch(err) {
      console.log(err)
      res.status(500).json(err) 

    }    
  }

  

}
