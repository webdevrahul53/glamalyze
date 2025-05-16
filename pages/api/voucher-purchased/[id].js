import { connectDB } from "@/core/db";
import { VoucherPurchased } from "../../../core/model/voucher-purchased";

export default async function handler(req, res) {
  await connectDB();
  
  if(req.method === "GET") {    
    try {
      const result = await VoucherPurchased.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.query["id"]) } },
        { $project: { _id: 1, customerId: 1, voucherId: 1, voucherBalance: 1, remainingVoucher: 1, status: 1, createdAt: 1, updatedAt: 1 } },
      ])
      res.status(200).json(result[0] || null) 
    } catch (error) {
      console.log(error)
      res.status(500).json(error) 
    } 
  }

  if(req.method === "DELETE") {
    VoucherPurchased.deleteOne({_id:req.query['id']}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Voucher Purchased deleted",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
  }

  if(req.method === "PATCH") {
    var updateOps = {};
    if (Array.isArray(req.body)) {
      for (let ops of req.body) {
          updateOps[ops.propName] = ops.value;
      }
    } else updateOps = req.body;
    VoucherPurchased.updateOne({_id:req.query['id']},{$set:updateOps}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Voucher Purchased data updated",
            _id:req.query['id']
        }) 
    }).catch(err=>{ 
      console.log(err);
      res.status(500).json(err) 

    }) 
  }
  

}