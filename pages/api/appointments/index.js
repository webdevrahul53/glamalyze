import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Appointments } from "../../../core/model/appointments";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Fetch total count WITHOUT lookup for performance
      const totalCountPromise = Appointments.countDocuments();

      const dataPromise = Appointments.aggregate([
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
        { $lookup: { from: "employees", localField: "pax.employeeId", foreignField: "_id", as: "employeeId" } },
        { $lookup: { from: "services", localField: "pax.serviceId", foreignField: "_id", as: "serviceId" } },
        { $project: { _id: 1, appointmentDate: 1, startTime: 1, start: 1, branch: 1, customer: 1, pax: 1, totalDuration: 1, totalPrice: 1, 
          totalAmount: 1, taskStatus: 1, paymentStatus: 1, employeeId: 1, serviceId: 1, status: 1, createdAt: 1, updatedAt: 1 } },
          
        { $skip: skip },
        { $limit: limit }
      ])
      
      // Execute both queries in parallel
      const [totalCount, data] = await Promise.all([totalCountPromise, dataPromise]);

      res.status(200).json({
        data,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalRecords: totalCount
      }) 
    }catch(err) {
      console.log(err)
      res.status(500).json(err) 

    }    
  }

  if(req.method === "POST") {
    const appointment = new Appointments({
      _id:new mongoose.Types.ObjectId(),
      appointmentDate:req.body.appointmentDate,
      startTime:req.body.startTime,
      branchId:req.body.branchId,
      customerId:req.body.customerId,
      pax:req.body.pax,
      totalAmount:req.body.totalAmount,
      paymentStatus:req.body.paymentStatus,
      taskStatus:req.body.taskStatus,
      status:req.body.status,
    })
    appointment.save().then(()=>{ 
        res.status(200).json({
            message:'New appointment added',
            status: 1,
            appointment:{
                _id:appointment._id, 
                appointmentDate:appointment.appointmentDate,
                startTime:appointment.startTime,
                branchId:appointment.branchId,
                customerId:appointment.customerId,
                totalAmount:appointment.totalAmount,
                pax:appointment.pax,
                paymentStatus:appointment.paymentStatus,
                taskStatus:appointment.taskStatus,
                status:appointment.status,
            }
        })
    }).catch(err=>{
        res.status(500).json(err)
    }) 
  }
  
  
  // if(req.method === "DELETE") {
  //   Appointments.deleteMany().exec()
  //   .then(docs=>{ 
  //       res.status(200).json({
  //           message:"Sub Category data updated",
  //           _id:req.params['id']
  //       }) 
  //   }).catch(err=>{ 
  //       res.status(500).json(err) 

  //   }) 
  // }

}




// {
//   $addFields: {
//     parsedTime: {
//       $regexFind: { input: "$startTime", regex: "^(\\d{1,2}):(\\d{2}) (AM|PM)$" }
//     }
//   }
// },
// {
//   $addFields: {
//     hour: { $toInt: { $arrayElemAt: ["$parsedTime.captures", 0] } },
//     minute: { $toInt: { $arrayElemAt: ["$parsedTime.captures", 1] } },
//     period: { $arrayElemAt: ["$parsedTime.captures", 2] }
//   }
// },
// {
//   $addFields: {
//     adjustedHour: {
//       $switch: {
//         branches: [
//           { case: { $and: [{ $eq: ["$period", "PM"] }, { $ne: ["$hour", 12] }] }, then: { $add: ["$hour", 12] } },
//           { case: { $and: [{ $eq: ["$period", "AM"] }, { $eq: ["$hour", 12] }] }, then: 0 }
//         ],
//         default: "$hour"
//       }
//     }
//   }
// },
// {
//   $addFields: {
//     start: {
//       $dateFromParts: {
//         year: { $year: "$appointmentDate" },
//         month: { $month: "$appointmentDate" },
//         day: { $dayOfMonth: "$appointmentDate" },
//         hour: "$adjustedHour",
//         minute: "$minute"
//       }
//     }
//   }
// },
// {
//   $addFields: {
//     // Calculate end time by adding totalDuration
//     end: {
//       $dateAdd: { startDate: "$start", unit: "minute", amount: "$totalDuration" }
//     }
//   }
// },