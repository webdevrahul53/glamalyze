import { connectDB } from "@/core/db";
import { Branches } from "../../../core/model/branches";

export default async function handler(req, res) {
  await connectDB();
  
  if(req.method === "DELETE") {
    try {
      await Branches.deleteOne({_id:req.query['id']})
      res.status(200).json({
          status: 1,
          message:"Branch deleted",
          _id:req.params['id']
      }) 
    } catch (error) {
      console.log(error)
      res.status(500).json(error) 
    }
  }
  
  if(req.method === "PUT") {
    let branchId = req.query["id"]
    let employeeId = req.body.employeeId
    let isManager = req.body.isManager
    console.log(isManager);
    try {
      await Branches.updateOne({ managerId: employeeId }, { managerId: null });
      await Branches.updateOne({ employees: employeeId }, { $pull: { employees: employeeId } });
      await Branches.updateOne({ _id: branchId }, { $addToSet: { employees: employeeId } });
      if(isManager) await Branches.updateOne({ _id: branchId }, { managerId: employeeId });
    
      res.status(200).json({
        status: 1,
        message: "Branch data updated",
        _id: branchId
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err) 
    }
  }

  if(req.method === "PATCH") {
    var updateOps = {};
    if (Array.isArray(req.body)) {
      for (let ops of req.body) {
          updateOps[ops.propName] = ops.value;
      }
    } else updateOps = req.body;
    Branches.updateOne({_id:req.query['id']},{$set:updateOps}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Branch data updated",
            _id:req.query['id']
        }) 
    }).catch(err=>{ 
      console.log(err);
      
        res.status(500).json(err) 

    }) 
  }
  

}