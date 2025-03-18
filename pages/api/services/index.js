import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Services } from "../../../core/model/services";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    
    try {
      const searchQuery = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if(!req.query.page || !req.query.limit) {
        const result = await Services.aggregate([
          { $project: { _id: 1, image: 1, name: 1, variants: 1, assetType: 1} }
        ])
        res.status(200).json(result)
      }else {
        // Fetch total count WITHOUT lookup for performance
        const totalCountPromise = Services.countDocuments();
        const dataPromise = Services.aggregate([
          { 
            $match: { $or: [
              { name: { $regex: searchQuery, $options: "i" } },
            ]}
          },
          { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "category", },  },
          { $lookup: { from: "subcategories", localField: "subCategoryId", foreignField: "_id", as: "subCategory", } },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true }, },
          { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true }, },
          { $project: { _id: 1, categoryId: 1, subCategoryId: 1, categoryName: {$concat: ["$category.categoryname", " > ", "$subCategory.subcategoryname"]}, name: 1, variants: 1, assetType: 1, image: 1, status: 1, createdAt: 1, updatedAt: 1 } },
          
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
      console.log(err)
      res.status(500).json(err) 

    }    
  }

  if(req.method === "POST") {
    const service = new Services({
      _id:new mongoose.Types.ObjectId(),
      image:req.body.image,
      name:req.body.name,
      assetType:req.body.assetType,
      variants:req.body.variants,
      categoryId:req.body.categoryId,
      subCategoryId:req.body.subCategoryId,
      descripiton:req.body.descripiton,
      status:req.body.status
    })
    service.save().then(()=>{ 
        res.status(200).json({
            message:'New service added',
            status: 1,
            service:{
                _id:service._id, 
                image:service.image,
                name:service.name,
                assetType:service.assetType,
                variants:service.variants,
                categoryId:service.categoryId,
                subCategoryId:service.subCategoryId,
                descripiton:service.descripiton,
                status:service.status
            }
        })
    }).catch(err=>{
        if (err.code === 11000) {
          // Duplicate key err
          res.status(400).json({ status: false, message: "Name already exists" });
        } else {
          res.status(500).json({ status: false, message: err.message });
        }
        res.status(500).json(err)
    }) 
  }
  
  
  // if(req.method === "DELETE") {
  //   Services.deleteMany().exec()
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