import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Roster } from "../../../core/model/roster";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try{
      const dateFor = req.query.dateFor;
      const branchId = req.query.branchId;
      const matchStage = branchId
      ? { branchId: new mongoose.Types.ObjectId(branchId) }
      : {};
      const result = await Roster.aggregate([
        { $match: { ...matchStage, dateFor } },
        { $lookup: { from: "branches", localField: "branchId", foreignField: "_id", as: "branch", },  },
        { $lookup: { from: "shifts", localField: "shiftId", foreignField: "_id", as: "shift", },  },
        { $lookup: { from: "groups", localField: "groups", foreignField: "_id", as: "groups", },  },
        { $lookup: { from: "employees", localField: "groups.employeesId", foreignField: "_id", as: "groupEmployees" } },
        { $lookup: { from: "services", localField: "groupEmployees.servicesId", foreignField: "_id", as: "employeeServices" } },
        { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true, }, },
        { $unwind: { path: "$shift", preserveNullAndEmptyArrays: true, }, },
        { $project: { _id: 1, branch: 1, branchId: 1, timing: { $concat: ["$shift.openingAt", " - ", "$shift.closingAt"] }, openingAt: "$shift.openingAt", closingAt: "$shift.closingAt", employeeServices: 1, groupEmployees: 1, status:1, createdAt: 1, updatedAt: 1 } },
      ])
      
      res.status(200).json(result)

    
    }catch(err) {
      res.status(500).json(err) 

    }    
  }

  

}