import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Coupons } from "../../../core/model/coupons";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const branchId = req.query.branchId;
      const serviceId = req.query.serviceId;
      const searchQuery = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if(!req.query.page || !req.query.limit) {
        
        const result = await Coupons.aggregate([
          {
            $match: {
              branchId: { $in: [new mongoose.Types.ObjectId(branchId)] },
              serviceId: { $in: [new mongoose.Types.ObjectId(serviceId)] }
            }
          },
          { $project: { _id: 1, branchId: 1, serviceId: 2, couponName: 1, discountPercent: 1, validFrom: 1, validTo: 1, status:1, createdAt: 1, updatedAt: 1 } },
        ])
        res.status(200).json(result)
      }else {
        // Fetch total count WITHOUT lookup for performance
        const totalCountPromise = Coupons.countDocuments();
        const dataPromise = Coupons.aggregate([
          { $match: { $or: [ 
            { couponName: { $regex: searchQuery, $options: "i" } }, 
          ]} },
          { $project: { _id: 1, branchId: 1, serviceId: 2, couponName: 1, discountPercent: 1, validFrom: 1, validTo: 1, status:1, createdAt: 1, updatedAt: 1 } },
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
    const coupon = new Coupons({
      _id:new mongoose.Types.ObjectId(),
      branchId:req.body.branchId,
      serviceId:req.body.serviceId,
      couponName:req.body.couponName,
      discountPercent:Number(req.body.discountPercent),
      validFrom:req.body.validFrom,
      validTo:req.body.validTo,
      status:req.body.status
    })
    coupon.save().then(()=>{ 
        res.status(200).json({
            message:'New coupon added',
            status: 1,
            coupon:{
                _id:coupon._id, 
                branchId:coupon.branchId,
                serviceId:coupon.serviceId,
                couponName:coupon.couponName,
                discountPercent:coupon.discountPercent,
                validFrom:coupon.validFrom,
                validTo:coupon.validTo,
                status:coupon.status
            }
        })
    }).catch(err=>{
        if (err.code === 11000) {
          // Duplicate key err
          // res.status(400).json({ status: false, message: "Coupon Number already exists" });
        } else {
          res.status(500).json({ status: false, message: err.message });
        }
        res.status(500).json(err)
    }) 
  }
  
  
  // if(req.method === "DELETE") {
  //   Coupons.deleteMany().exec()
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