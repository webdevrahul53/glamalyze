import { connectDB } from "@/core/db";
import { Shifts } from "../../../core/model/shifts";

export default async function handler(req, res) {
  await connectDB();
  
  if(req.method === "GET") {    
    try {
      const result = await Shifts.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.query["id"]) } },
        { $lookup: { from: "branches", localField: "branchId", foreignField: "_id", as: "branch", },  },
        { $lookup: { from: "groups", localField: "groups", foreignField: "_id", as: "groups", },  },
        { $lookup: { from: "employees", localField: "groups.employeesId", foreignField: "_id", as: "groupEmployees" } },
        { $lookup: { from: "services", localField: "groupEmployees.servicesId", foreignField: "_id", as: "employeeServices" } },
        { $unwind: { path: "$manager", preserveNullAndEmptyArrays: true, }, },
        { $project: { _id: 1, branch:1, shiftname: 1, groupEmployees: 1, employeeServices: 1, openingAt: 1, closingAt: 1, status: 1, createdAt: 1, updatedAt: 1 } },
      ])
      res.status(200).json(result[0] || null) 
    } catch (error) {
      console.log(error)
      res.status(500).json(error) 
    } 
  }

  if(req.method === "DELETE") {
    Shifts.deleteOne({_id:req.query['id']}).exec()
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

  if(req.method === "PUT") {
    let shiftId = req.query["id"]
    let groupId = req.body.groupId
    let type = req.query.type;
    try {
      // await Shifts.updateOne({ managerId: employeeId }, { managerId: null });
      await Shifts.updateOne({ groups: groupId }, { $pull: { groups: groupId } });
      if(type !== "delete") await Shifts.updateOne({ _id: shiftId }, { $addToSet: { groups: groupId } });
      // if(isManager) await Shifts.updateOne({ _id: shiftId }, { managerId: employeeId });
    
      res.status(200).json({
        status: 1,
        message: "Shift data updated",
        _id: shiftId
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
    Shifts.updateOne({_id:req.query['id']},{$set:updateOps}).exec()
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