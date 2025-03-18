import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Appointments } from "../../../core/model/appointments";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    
    try {

      const result = await Appointments.aggregate([
        { $lookup: { from: "branches", localField: "branchId", foreignField: "_id", as: "branch", },  },
        { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer", },  },
        { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true }, },
        { $unwind: "$pax" }, // Flatten the pax array (each array inside pax represents one person)
        {
          $addFields: {
            totalDuration: { $sum: "$pax.duration" },
            totalPrice: { $sum: "$pax.price" }
          }
        },
        {
            $addFields: {
              parsedTime: {
                $regexFind: { input: "$startTime", regex: "^(\\d{1,2}):(\\d{2}) (AM|PM)$" }
              }
            }
          },
          {
            $addFields: {
              hour: { $toInt: { $arrayElemAt: ["$parsedTime.captures", 0] } },
              minute: { $toInt: { $arrayElemAt: ["$parsedTime.captures", 1] } },
              period: { $arrayElemAt: ["$parsedTime.captures", 2] }
            }
          },
          {
            $addFields: {
              adjustedHour: {
                $switch: {
                  branches: [
                    { case: { $and: [{ $eq: ["$period", "PM"] }, { $ne: ["$hour", 12] }] }, then: { $add: ["$hour", 12] } },
                    { case: { $and: [{ $eq: ["$period", "AM"] }, { $eq: ["$hour", 12] }] }, then: 0 }
                  ],
                  default: "$hour"
                }
              }
            }
          },
          {
            $addFields: {
              start: {
                $dateFromParts: {
                  year: { $year: "$appointmentDate" },
                  month: { $month: "$appointmentDate" },
                  day: { $dayOfMonth: "$appointmentDate" },
                  hour: "$adjustedHour",
                  minute: "$minute"
                }
              }
            }
          },
          {
            $addFields: {
              // Calculate end time by adding totalDuration
              end: {
                $dateAdd: { startDate: "$start", unit: "minute", amount: "$totalDuration" }
              }
            }
          },
        { $lookup: { from: "employees", localField: "pax.employeeId", foreignField: "_id", as: "employeeId" } },
        { $lookup: { from: "services", localField: "pax.serviceId", foreignField: "_id", as: "serviceId" } },
        { $project: { _id: 1, appointmentDate: 1, startTime: 1, branch: 1, customer: 1, pax: 1, totalDuration: 1, totalPrice: 1, start: 1, end: 1,
          totalAmount: 1, taskStatus: 1, paymentStatus: 1, employeeId: 1, serviceId: 1, status: 1, createdAt: 1, updatedAt: 1 } },
      ]);
      
      
      
      

      res.status(200).json(result) 
    }catch(err) {
      console.log(err)
      res.status(500).json(err) 

    }    
  }

  

}




// {
//     $addFields: {
//       parsedTime: {
//         $regexFind: { input: "$startTime", regex: "^(\\d{1,2}):(\\d{2}) (AM|PM)$" }
//       }
//     }
//   },
//   {
//     $addFields: {
//       hour: { $toInt: { $arrayElemAt: ["$parsedTime.captures", 0] } },
//       minute: { $toInt: { $arrayElemAt: ["$parsedTime.captures", 1] } },
//       period: { $arrayElemAt: ["$parsedTime.captures", 2] }
//     }
//   },
//   {
//     $addFields: {
//       adjustedHour: {
//         $switch: {
//           branches: [
//             { case: { $and: [{ $eq: ["$period", "PM"] }, { $ne: ["$hour", 12] }] }, then: { $add: ["$hour", 12] } },
//             { case: { $and: [{ $eq: ["$period", "AM"] }, { $eq: ["$hour", 12] }] }, then: 0 }
//           ],
//           default: "$hour"
//         }
//       }
//     }
//   },
//   {
//     $addFields: {
//       start: {
//         $dateFromParts: {
//           year: { $year: "$appointmentDate" },
//           month: { $month: "$appointmentDate" },
//           day: { $dayOfMonth: "$appointmentDate" },
//           hour: "$adjustedHour",
//           minute: "$minute"
//         }
//       }
//     }
//   },
//   {
//     $addFields: {
//       // Calculate end time by adding totalDuration
//       end: {
//         $dateAdd: { startDate: "$start", unit: "minute", amount: "$totalDuration" }
//       }
//     }
//   },