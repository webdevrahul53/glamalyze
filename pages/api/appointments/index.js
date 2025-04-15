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

      const dataPromise = await Appointments.aggregate([
        { $project: { _id: 1, appointmentId: 1, bookingId: 1, start: "null", customer: "null", employee: "null", asset: "null", 
          serviceName: "null", taskStatus: "null", paymentStatus: "null", paymentMethod: "null",
          duration: 1, price: 1, status: 1, createdAt: 1, updatedAt: 1 } },

        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
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
