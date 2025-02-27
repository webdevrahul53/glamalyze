import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Services } from "../../../core/model/services";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    
    try {
      let result = await Services.aggregate([
        { $lookup: {
            from: "categories", // Name of the Categories collection in MongoDB
            localField: "categoryId", // Field in Services
            foreignField: "_id", // Matching field in Categories
            as: "category", // Output field
          }, 
        },
        { $lookup: {
            from: "subcategories", // Name of the Categories collection in MongoDB
            localField: "subCategoryId", // Field in Services
            foreignField: "_id", // Matching field in Categories
            as: "subCategory", // Output field
          }
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true }, },
        { $project: { _id: 1, categoryId: 1, subCategoryId: 1, categoryName: {$concat: ["$category.categoryname", " > ", "$subCategory.subcategoryname"]}, name: 1, defaultPrice: 1, serviceDuration: 1, image: 1, status: 1, createdAt: 1, updatedAt: 1 } },
      ])
      res.status(200).json(result) 
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
      serviceDuration:req.body.serviceDuration,
      defaultPrice:req.body.defaultPrice,
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
                serviceDuration:service.serviceDuration,
                defaultPrice:service.defaultPrice,
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