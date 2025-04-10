import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Appointments } from "../../../core/model/appointments";

export default async function handler(req, res) {
  await connectDB();
  
  if(req.method === "GET") {
    
    try {
      const result = await Appointments.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.query["id"]) } },
        // { $lookup: { from: "branches", localField: "branchId", foreignField: "_id", as: "branch", },  },
        // { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer", },  },
        { $lookup: { from: "appointmentpaxes", localField: "paxId", foreignField: "_id", as: "pax", },  },
        { $lookup: { from: "appointmentservices", localField: "pax.appointmentServiceId", foreignField: "_id", as: "pax", },  },
        // { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true, }, },
        // { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true, }, },
        { $project: { _id: 1, appointmentDate: 1, startTime: 1, pax: 1, branchId: 1, customerId: 1, totalDuration: 1, totalAmount: 1, 
          paymentStatus: 1, taskStatus: 1, note: 1, status: 1 } 
        },
      ])
      res.status(200).json(result[0] || null) 
    } catch (error) {
      console.log(error)
      res.status(500).json(error) 
    } 
  }

  if(req.method === "PATCH") {
    var updateOps = {};
    if (Array.isArray(req.body)) {
      for (let ops of req.body) {
          updateOps[ops.propName] = ops.value;
      }
    } else updateOps = req.body;
    Appointments.updateOne({_id:req.query['id']},{$set:updateOps}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Appointment data updated",
            _id:req.query['id']
        }) 
    }).catch(err=>{ 
      console.log(err);
      
        res.status(500).json(err) 

    }) 
  }
  

}