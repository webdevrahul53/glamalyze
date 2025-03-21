import { connectDB } from "@/core/db";
import { Appointments } from "../../../core/model/appointments";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    
    try {

      const dataPromise = Appointments.aggregate([
        { $lookup: { from: "appointments", localField: "appointmentId", foreignField: "_id", as: "appointment", },  },
        { $lookup: { from: "customers", localField: "appointment.customerId", foreignField: "_id", as: "customer", },  },
        { $lookup: { from: "employees", localField: "employeeId", foreignField: "_id", as: "employee" } },
        { $lookup: { from: "services", localField: "serviceId", foreignField: "_id", as: "service" } },
        { $lookup: { from: "assets", localField: "assetId", foreignField: "_id", as: "asset" } },
        { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$service", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$asset", preserveNullAndEmptyArrays: true }, },
        { $project: { _id: 1, start: 1, customer: 1, employee: 1, asset: 1, 
          serviceName: "$service.name", taskStatus: "$appointment.taskStatus", paymentStatus: "$appointment.paymentStatus", 
          duration: 1, price: 1, status: 1, createdAt: 1, updatedAt: 1 } },
      ])
      

      res.status(200).json(dataPromise) 
    }catch(err) {
      console.log(err)
      res.status(500).json(err) 

    }    
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
