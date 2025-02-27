import { connectDB } from "@/core/db";
import { Employees } from "../../../core/model/employees";
import { Branches } from "../../../core/model/branches";

export default async function handler(req, res) {
  await connectDB();
  
  if(req.method === "DELETE") {
    let employeeId = req.query['id'];
    await Branches.updateOne({ managerId: employeeId }, { managerId: null });
    await Branches.updateOne({ employees: employeeId }, { $pull: { employees: employeeId } });
    Employees.deleteOne({_id:employeeId}).exec()
    .then(()=>{ 
        res.status(200).json({
          status: 1,
          message:"Employee deleted"
        }) 
    }).catch(err=>{ 
      console.log(err);
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
    Employees.updateOne({_id:req.query['id']},{$set:updateOps}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Employee data updated",
            _id:req.query['id']
        }) 
    }).catch(err=>{ 
      console.log(err);
      
        res.status(500).json(err) 

    }) 
  }
  

}