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
        { $lookup: { from: "employees", localField: "employeeId", foreignField: "_id", as: "employee", },  },
        { $lookup: { from: "services", localField: "serviceIds", foreignField: "_id", as: "service", },  },
        { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true }, },
        // { $unwind: { path: "$service", preserveNullAndEmptyArrays: true }, },
        { $project: { _id: 1, appointmentDate: 1, startTime: 1, branch: 1, customer: 1, employee: 1, service: 1, totalAmount: 1, totalDuration: 1, 
          taskStatus: 1, paymentStatus: 1, status: 1, createdAt: 1, updatedAt: 1 } },
          
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
      employeeId:req.body.employeeId,
      serviceIds:req.body.serviceIds,
      totalAmount:req.body.totalAmount,
      totalDuration:req.body.totalDuration,
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
                employeeId:appointment.employeeId,
                serviceIds:appointment.serviceIds,
                totalAmount:appointment.totalAmount,
                totalDuration:appointment.totalDuration,
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