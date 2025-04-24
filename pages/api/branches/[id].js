import { connectDB } from "@/core/db";
import { Branches } from "../../../core/model/branches";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();
  
  console.log(req.method, req.query);
  if(req.method === "GET") {
    
    try {
      const result = await Branches.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.query["id"]) } },
        { $lookup: { from: "employees", localField: "managerId", foreignField: "_id", as: "manager", },  },
        { $unwind: { path: "$manager", preserveNullAndEmptyArrays: true, }, },
        { $project: { _id: 1, image: 1, branchname:1, gender: 1, manager: 1,
          managerId: 1,servicesId: 1, contactnumber: 1, email: 1, address: 1, landmark: 1, country: 1, city: 1, state: 1, 
          postalcode:1, latitude: 1, longitude: 1, openingAt: 1, closingAt: 1, colorcode: 1, paymentmethods: 1, description: 1, status: 1, createdAt: 1, updatedAt: 1 } },
      ])
      res.status(200).json(result[0] || null) 
    } catch (error) {
      console.log(error)
      res.status(500).json(error) 
    } 
  }

  if(req.method === "DELETE") {
    try {
      await Branches.deleteOne({_id:req.query['id']})
      res.status(200).json({
          status: 1,
          message:"Branch deleted",
          _id:req.params['id']
      }) 
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
    Branches.updateOne({_id:req.query['id']},{$set:updateOps}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Branch data updated",
            _id:req.query['id']
        }) 
    }).catch(err=>{ 
      console.log(err);
      
        res.status(500).json(err) 

    }) 
  }
  

}