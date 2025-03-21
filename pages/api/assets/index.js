import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Assets } from "../../../core/model/assets";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const searchQuery = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if(!req.query.page || !req.query.limit) {
        const result = await Assets.aggregate([
          { $match: { $or: [ 
            { assetType: { $regex: searchQuery, $options: "i" } }, 
            { assetNumber: { $regex: searchQuery, $options: "i" } }, 
          ]} },
          { $project: { _id: 1, branchId: 1, assetType:1, assetNumber: 1, createdAt: 1} },
        ])
        res.status(200).json(result)
      }else {
        // Fetch total count WITHOUT lookup for performance
        const totalCountPromise = Assets.countDocuments();
        const dataPromise = Assets.aggregate([
          { $match: { $or: [ 
            { assetType: { $regex: searchQuery, $options: "i" } }, 
            { assetNumber: { $regex: searchQuery, $options: "i" } }, 
          ]} },
          { $lookup: { from: "branches", localField: "branchId", foreignField: "_id", as: "branch", },  },
          { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true, }, },
          { $project: { _id: 1, branch: 1, branchId: 1, assetType:1, assetNumber: 1, status:1, createdAt: 1, updatedAt: 1 } },
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
      }
    }catch(err) {
      res.status(500).json(err) 

    }    
  }

  if(req.method === "POST") {
    const asset = new Assets({
      _id:new mongoose.Types.ObjectId(),
      branchId:req.body.branchId,
      assetType:req.body.assetType,
      assetNumber:req.body.assetNumber,
      status:req.body.status
    })
    asset.save().then(()=>{ 
        res.status(200).json({
            message:'New asset added',
            status: 1,
            asset:{
                _id:asset._id, 
                branchId:asset.branchId,
                assetType:asset.assetType,
                assetNumber:asset.assetNumber,
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
  //   Assets.deleteMany().exec()
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