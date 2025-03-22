import { connectDB } from "@/core/db";
import { Employees } from "../../../core/model/employees";
import { Branches } from "../../../core/model/branches";
import { Users } from "@/core/model/users";

export default async function handler(req, res) {
  await connectDB();
  
  if(req.method === "DELETE") {
    let employeeId = req.query['id'];
    await Branches.updateOne({ managerId: employeeId }, { managerId: null });
    // await Branches.updateOne({ employees: employeeId }, { $pull: { employees: employeeId } });
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
    const existingUser = await Users.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ status: 0, message: "Email address is already taken. Please use another one.", });
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
      if (err.code === 11000) {
        // Duplicate key err
        res.status(400).json({ status: false, message: "Duplicate Email or Phone Number" });
      }
      res.status(500).json(err) 

    }) 
  }
  

}