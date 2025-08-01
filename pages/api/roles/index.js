import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Roles } from "../../../core/model/roles";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const result = await Roles.aggregate([
        { $project: { _id: 1, rolesName:1, color: 1, createdAt: 1} },
      ])
      res.status(200).json(result)
      
    }catch(err) {
      res.status(500).json(err) 

    }    
  }

  if(req.method === "POST") {

    let rolesName = req.body.rolesName;
    let isExist = await Roles.findOne({ rolesName: rolesName }).exec();
    if (isExist) {
      return res.status(400).json({ status: false, message: "Role already exists" });
    }


    const role = new Roles({
      _id:new mongoose.Types.ObjectId(),
      color:req.body.color,
      rolesName:req.body.rolesName,
      status:req.body.status
    })
    role.save().then(()=>{ 
        res.status(200).json({
            message:'New role added',
            status: 1,
            role:{
                _id:role._id,
                color:role.color,
                rolesName:role.rolesName,
                status:role.status
            }
        })
    }).catch(err=>{
        if (err.code === 11000) {
          // Duplicate key err
          res.status(400).json({ status: false, message: "Role already exists" });
        } else {
          res.status(500).json({ status: false, message: err.message });
        }
        res.status(500).json(err)
    }) 
  }
  
  
  // if(req.method === "DELETE") {
  //   Roles.deleteMany().exec()
  //   .then(docs=>{ 
  //       res.status(200).json({
  //           message:"Category data updated",
  //           _id:req.params['id']
  //       }) 
  //   }).catch(err=>{ 
  //       res.status(500).json(err) 

  //   }) 
  // }

}