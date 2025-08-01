import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { VoucherPurchased } from "../../../core/model/voucher-purchased";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const searchQuery = req.query.search || "";
      const customerId = req.query.customerId || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const matchStage = customerId
        ? { $match: { customerId: new mongoose.Types.ObjectId(customerId) } }
        : { $match: {} };

      if(!req.query.page || !req.query.limit) {
        const result = await VoucherPurchased.aggregate([
          matchStage,
          { $lookup: { from: "vouchers", localField: "voucherId", foreignField: "_id", as: "voucher", }, },
          { $unwind: { path: "$voucher", preserveNullAndEmptyArrays: true }, },
          { $project: { _id: 1, voucher: 1, voucherId: 1, customerId: 1, voucherBalance: 1, remainingVoucher: 1, paymentMethod: 1, status: 1 } },
        ]);
        res.status(200).json(result)
      }else {
        // Fetch total count WITHOUT lookup for performance
        const totalCountPromise = VoucherPurchased.countDocuments();
        const dataPromise = VoucherPurchased.aggregate([
          { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer", },  },
          { $lookup: { from: "vouchers", localField: "voucherId", foreignField: "_id", as: "voucher", },  },
          { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true }, },
          { $unwind: { path: "$voucher", preserveNullAndEmptyArrays: true }, },
          { $match: { $or: [ 
            { "voucher.voucherName": { $regex: searchQuery, $options: "i" } },
            { "customer.firstname": { $regex: searchQuery, $options: "i" } },
            { "paymentMethod": { $regex: searchQuery, $options: "i" } },
          ]} },
          { $project: { _id: 1, customer: 1, voucherName: "$voucher.voucherName", voucherId: 1, customerId: 1, voucherBalance: 1, remainingVoucher: 1, paymentMethod: 1, status:1, createdAt: 1, updatedAt: 1 } },
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
    const voucherPurchased = new VoucherPurchased({
      _id:new mongoose.Types.ObjectId(),
      voucherId: req.body.voucherId,
      customerId: req.body.customerId,
      voucherBalance: req.body.voucherBalance,
      remainingVoucher: req.body.remainingVoucher,
      paymentMethod: req.body.paymentMethod,
      status:req.body.status,
    })
    voucherPurchased.save().then(()=>{ 
        res.status(200).json({
            message:'New voucherPurchased added',
            status: 1,
            _id:voucherPurchased._id, 
            voucherPurchased:{
              voucherId: voucherPurchased.voucherId,
              customerId: voucherPurchased.customerId,
              voucherBalance: voucherPurchased.voucherBalance,
              remainingVoucher: voucherPurchased.remainingVoucher,
              paymentMethod: voucherPurchased.paymentMethod,
              status:voucherPurchased.status,
            }
        })
    }).catch(err=>{
      console.log(err)
        if (err.code === 11000) {
          // Duplicate key err
          res.status(400).json({ status: false, message: "Voucher Purchased Name already exists" });
        } else {
          res.status(500).json({ status: false, message: err.message });
        }
        res.status(500).json(err)
    }) 
  }


}