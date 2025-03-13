import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Categories } from "@/core/model/categories";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const searchQuery = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if(!req.query.page || !req.query.limit) {
        const result = await Categories.aggregate([
          { $project: { _id: 1, categoryname: 1, image: 1 } }
        ])
        res.status(200).json(result)
      }else {
        // Fetch total count WITHOUT lookup for performance
        const totalCountPromise = Categories.countDocuments();
        const dataPromise = Categories.aggregate([
          { $match: { $or: [ { categoryname: { $regex: searchQuery, $options: "i" } }, ]} },
          { $project: { _id: 1, categoryname: 1, image: 1, status: 1, createdAt: 1, updatedAt: 1 } },
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
    const category = new Categories({
      _id:new mongoose.Types.ObjectId(),
      image:req.body.image,
      categoryname:req.body.categoryname,
      status:req.body.status
    })
    category.save().then(()=>{ 
        res.status(200).json({
            message:'New category added',
            status: 1,
            category:{
                _id:category._id, 
                image: category.image,
                categoryname:category.categoryname,
            }
        })
    }).catch(err=>{
        if (err.code === 11000) {
          // Duplicate key err
          res.status(400).json({ status: false, message: "Category name already exists" });
        } else {
          res.status(500).json({ status: false, message: err.message });
        }
        res.status(500).json(err)
    }) 
  }
  
  
  // if(req.method === "DELETE") {
  //   Categories.deleteMany().exec()
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