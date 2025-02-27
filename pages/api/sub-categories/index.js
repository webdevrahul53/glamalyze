import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { SubCategories } from "../../../core/model/sub-categories";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    
    // SubCategories.find().select('categoryId subcategoryname image status createdAt updatedAt')
    // .sort({created_at: -1}).populate('categoryId').exec().then(docs => {
    //     res.status(200).json(docs)
    // }).catch(err => {
    //   console.log(err)
    //     res.status(500).json(err)
    // })
    try {
      const { categoryId } = req.query; // Get categoryId from request query params
      let matchStage = {}; // Default empty match stage
      if (categoryId) matchStage = { categoryId: new mongoose.Types.ObjectId(categoryId) }

      let result = await SubCategories.aggregate([
        { $match: matchStage },
        { $lookup: {
            from: "categories", // Name of the Categories collection in MongoDB
            localField: "categoryId", // Field in SubCategories
            foreignField: "_id", // Matching field in Categories
            as: "category", // Output field
          }, 
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true, // Keeps subcategories even if no matching category exists
          },
        },
        { $project: { _id: 1, categoryId: 1, categoryName: "$category.categoryname", subcategoryname: 1, image: 1, status: 1, createdAt: 1, updatedAt: 1 } },
      ])
      res.status(200).json(result) 
    }catch(err) {
      console.log(err)
      res.status(500).json(err) 

    }    
  }

  if(req.method === "POST") {
    const subcategory = new SubCategories({
      _id:new mongoose.Types.ObjectId(),
      image:req.body.image,
      categoryId:req.body.categoryId,
      subcategoryname:req.body.subcategoryname,
      status:req.body.status
    })
    subcategory.save().then(()=>{ 
        res.status(200).json({
            message:'New sub category added',
            status: 1,
            subcategory:{
                _id:subcategory._id, 
                image: subcategory.image,
                categoryId: subcategory.categoryId,
                subcategoryname:subcategory.subcategoryname,
            }
        })
    }).catch(err=>{
        if (err.code === 11000) {
          // Duplicate key err
          res.status(400).json({ status: false, message: "Sub Category name already exists" });
        } else {
          res.status(500).json({ status: false, message: err.message });
        }
        res.status(500).json(err)
    }) 
  }
  
  
  // if(req.method === "DELETE") {
  //   SubCategories.deleteMany().exec()
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