import { connectDB } from "@/core/db";
import { Roster } from "../../../core/model/roster";

export default async function handler(req, res) {
  await connectDB();
  
  if(req.method === "GET") {    
    try {
      const result = await Roster.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.query["id"]) } },
        { $lookup: { from: "shifts", localField: "shiftId", foreignField: "_id", as: "shift", },  },
        { $lookup: { from: "groups", localField: "groups", foreignField: "_id", as: "groups", },  },
        { $lookup: { from: "employees", localField: "groups.employeesId", foreignField: "_id", as: "groupEmployees" } },
        { $lookup: { from: "services", localField: "groupEmployees.servicesId", foreignField: "_id", as: "employeeServices" } },
        { $unwind: { path: "$shift", preserveNullAndEmptyArrays: true, }, },
        { $project: { _id: 1, shift:1, groupEmployees: 1, employeeServices: 1, dateFor: 1, status: 1, createdAt: 1, updatedAt: 1 } },
      ])
      res.status(200).json(result[0] || null) 
    } catch (error) {
      console.log(error)
      res.status(500).json(error) 
    } 
  }

  if(req.method === "DELETE") {
    Roster.deleteOne({_id:req.query['id']}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Roster deleted",
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
    Roster.updateOne({_id:req.query['id']},{$set:updateOps}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Roster data updated",
            _id:req.query['id']
        }) 
    }).catch(err=>{ 
      console.log(err);
      res.status(500).json(err) 

    }) 
  }
  

}