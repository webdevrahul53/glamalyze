import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Groups } from "../../../core/model/groups";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const searchQuery = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if(!req.query.page || !req.query.limit) {
        const result = await Groups.aggregate([
          { $addFields: { name: { $concat: ["$firstname", " ", "$lastname"] } } },
          { $project: { _id: 1, groupname: 1, branchId: 1, employeesId: 1 } },
        ])
        res.status(200).json(result)
      }else {
        // Fetch total count WITHOUT lookup for performance
        const totalCountPromise = Groups.countDocuments();
        const dataPromise = Groups.aggregate([
          { $match: { $or: [ 
            { groupname: { $regex: searchQuery, $options: "i" } }, 
          ]} },
          { $lookup: { from: "employees", localField: "employeesId", foreignField: "_id", as: "employee", },  },
          { $project: { _id: 1, groupname: 1, branch: 1, employee: 1, branchId: 1, status:1, createdAt: 1, updatedAt: 1 } },
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
    const group = new Groups({
      _id:new mongoose.Types.ObjectId(),
      groupname:req.body.groupname,
      branchId:req.body.branchId,
      employeesId:req.body.employeesId,
      status:req.body.status,
    })
    group.save().then(()=>{ 
        res.status(200).json({
            message:'New group added',
            status: 1,
            _id:group._id, 
            group:{
                groupname:group.groupname,
                branchId:group.branchId,
                employeesId:group.employeesId,
                status:group.status,
            }
        })
    }).catch(err=>{
      console.log(err)
        if (err.code === 11000) {
          // Duplicate key err
          res.status(400).json({ status: false, message: "Group Name already exists" });
        } else {
          res.status(500).json({ status: false, message: err.message });
        }
        res.status(500).json(err)
    }) 
  }
  
  
  // if(req.method === "DELETE") {
  //   Groups.deleteMany().exec()
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