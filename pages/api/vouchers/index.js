import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Vouchers } from "../../../core/model/vourchers";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const searchQuery = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if(!req.query.page || !req.query.limit) {      
        const result = await Vouchers.aggregate([
          { $lookup: { from: "services", localField: "services.serviceId", foreignField: "_id", as: "serviceId", },  },
          { $project: { _id: 1, voucherName: 1, voucherBalance: 1, voucherCommission: 1, quantity: 1, defaultPrice: 1, amountToPay: 1, services: 1, serviceId: 1, status:1, createdAt: 1, updatedAt: 1 } },
        ])
        res.status(200).json(result)
      }else {
        // Fetch total count WITHOUT lookup for performance
        const totalCountPromise = Vouchers.countDocuments();
        const dataPromise = Vouchers.aggregate([
          { $match: { $or: [ 
            { voucherName: { $regex: searchQuery, $options: "i" } }, 
          ]} },
          { $lookup: { from: "services", localField: "services.serviceId", foreignField: "_id", as: "serviceId", },  },
          { $project: { _id: 1, voucherName: 1, voucherBalance: 1, voucherCommission: 1, quantity: 1, defaultPrice: 1, amountToPay: 1, services: 1, serviceId: 1, status:1, createdAt: 1, updatedAt: 1 } },
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
    const voucher = new Vouchers({
      _id:new mongoose.Types.ObjectId(),
      voucherName:req.body.voucherName,
      voucherBalance:Number(req.body.voucherBalance),
      voucherCommission:Number(req.body.voucherCommission),
      quantity:Number(req.body.quantity),
      defaultPrice:Number(req.body.defaultPrice),
      amountToPay:Number(req.body.amountToPay),
      services:req.body.services,
      status:req.body.status
    })
    voucher.save().then(()=>{ 
        res.status(200).json({
            message:'New voucher added',
            status: 1,
            voucher:{
                _id:voucher._id, 
                voucherName:voucher.voucherName,
                voucherBalance:Number(voucher.voucherBalance),
                voucherCommission:Number(voucher.voucherCommission),
                quantity:Number(voucher.quantity),
                defaultPrice:Number(voucher.defaultPrice),
                amountToPay:Number(voucher.amountToPay),
                services:voucher.services,
                status:voucher.status
            }
        })
    }).catch(err=>{
        if (err.code === 11000) {
          // Duplicate key err
          // res.status(400).json({ status: false, message: "Voucher Number already exists" });
        } else {
          res.status(500).json({ status: false, message: err.message });
        }
        res.status(500).json(err)
    }) 
  }
 
  
}