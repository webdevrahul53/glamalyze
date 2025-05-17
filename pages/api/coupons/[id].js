import { connectDB } from "@/core/db";
import { Coupons } from "../../../core/model/coupons";

export default async function handler(req, res) {
  await connectDB();
  
  if(req.method === "GET") {    
    try {
      const result = await Coupons.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.query["id"]) } },
        { $project: { _id: 1, branch:1, serviceId: 1, couponName: 1, discountPercent: 1, discountAmount: 1, validFrom: 1, validTo: 1, status: 1, createdAt: 1, updatedAt: 1 } },
      ])
      res.status(200).json(result[0] || null) 
    } catch (error) {
      console.log(error)
      res.status(500).json(error) 
    } 
  }

  if(req.method === "DELETE") {
    Coupons.deleteOne({_id:req.query['id']}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Coupon deleted",
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
    Coupons.updateOne({_id:req.query['id']},{$set:updateOps}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Coupon data updated",
            _id:req.query['id']
        }) 
    }).catch(err=>{ 
      console.log(err);
      res.status(500).json(err) 

    }) 
  }
  

}