import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { AssetTypes } from "../../../core/model/asset-types";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const result = await AssetTypes.aggregate([
        { $project: { _id: 1, assetTypeName:1, image: 1, createdAt: 1} },
      ])
      res.status(200).json(result)
      
    }catch(err) {
      res.status(500).json(err) 

    }    
  }

  if(req.method === "POST") {
    const asset = new AssetTypes({
      _id:new mongoose.Types.ObjectId(),
      image:req.body.image,
      assetTypeName:req.body.assetTypeName,
      status:req.body.status
    })
    asset.save().then(()=>{ 
        res.status(200).json({
            message:'New asset added',
            status: 1,
            asset:{
                _id:asset._id, 
                branchId:asset.branchId,
                image:asset.image,
                assetTypeName:asset.assetTypeName,
                status:asset.status
            }
        })
    }).catch(err=>{
        if (err.code === 11000) {
          // Duplicate key err
          res.status(400).json({ status: false, message: "Asset Number already exists" });
        } else {
          res.status(500).json({ status: false, message: err.message });
        }
        res.status(500).json(err)
    }) 
  }
  
  
  // if(req.method === "DELETE") {
  //   AssetTypes.deleteMany().exec()
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