import { connectDB } from "@/core/db";
import { TransferredEmployees } from "../../../core/model/transferred-employees";

export default async function handler(req, res) {
  await connectDB();
  
  if(req.method === "DELETE") {
    TransferredEmployees.deleteOne({_id:req.query['id']}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Transfer deleted",
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
    TransferredEmployees.updateOne({_id:req.query['id']},{$set:updateOps}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Transfer data updated",
            _id:req.query['id']
        }) 
    }).catch(err=>{ 
      console.log(err);
      
        res.status(500).json(err) 

    }) 
  }
  

}