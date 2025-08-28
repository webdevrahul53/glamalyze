import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Customers } from "../../../core/model/customers";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const searchQuery = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if(!req.query.page || !req.query.limit) {
        const result = await Customers.aggregate([
          { $addFields: { name: { $concat: ["$firstname", " ", "$lastname"] } } },
          { $project: { _id: 1, image:1, name: 1, firstname:1, lastname:1, gender: 1, email:1, phonenumber:1, note: 1, createdAt: 1} },
        ])
        res.status(200).json(result)
      }else {
        // Fetch total count WITHOUT lookup for performance
        const totalCountPromise = Customers.countDocuments();
        const dataPromise = Customers.aggregate([
          { $addFields: { name: { $concat: ["$firstname", " ", "$lastname"] } } },
          { $match: { $or: [ 
            { name: { $regex: searchQuery, $options: "i" } }, 
            { phonenumber: { $regex: searchQuery, $options: "i" } }, 
          ]} },
          { $project: { _id: 1, image:1, name: 1, firstname:1, lastname:1, gender: 1, email:1, phonenumber:1, note: 1, status:1, createdAt: 1, updatedAt: 1 } },
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
    const customer = new Customers({
      _id:new mongoose.Types.ObjectId(),
      image:req.body.image,
      firstname:req.body.firstname,
      lastname:req.body.lastname,
      gender:req.body.gender,
      email:req.body.email,
      phonenumber:req.body.phonenumber,
      note:req.body.note,
      status:req.body.status
    })
    customer.save().then(()=>{ 
        res.status(200).json({
            message:'New customer added',
            status: 1,
            customer:{
                _id:customer._id, 
                image:customer.image,
                firstname:customer.firstname,
                lastname:customer.lastname,
                gender:customer.gender,
                email:customer.email,
                phonenumber:customer.phonenumber,
                note:customer.note,
                status:customer.status
            }
        })
    }).catch(err=>{
        if (err.code === 11000) {
          // Duplicate key err
          res.status(400).json({ status: false, message: "Email already exists" });
        } else {
          res.status(500).json({ status: false, message: err.message });
        }
        res.status(500).json(err)
    }) 
  }
  
  
  // if(req.method === "DELETE") {
  //   Customers.deleteMany().exec()
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