import { connectDB } from "@/core/db";
import { Settings } from "../../../core/model/settings";

export default async function handler(req, res) {
  await connectDB();
  
  if(req.method === "GET") {    
    try {
      const result = await Settings.aggregate([
        { $match: { _id: req.query["id"] } },
        { $project: { _id: 1, rosterStartDate: 1, rosterEndDate: 1 } },
      ])
      res.status(200).json(result[0] || null) 
    } catch (error) {
      console.log(error)
      res.status(500).json(error) 
    } 
  }

  if(req.method === "DELETE") {
    Settings.deleteOne({_id:req.query['id']}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Shift deleted",
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
    Settings.updateOne({_id:req.query['id']},{$set:updateOps}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Shift data updated",
            _id:req.query['id']
        }) 
    }).catch(err=>{ 
      console.log(err);
      res.status(500).json(err) 

    }) 
  }
  

}