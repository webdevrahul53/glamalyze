import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Shifts } from "../../../core/model/shifts";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const branchId = req.query.branchId;
      const matchStage = branchId
      ? { branchId: new mongoose.Types.ObjectId(branchId) }
      : {};
      const result = await Shifts.aggregate([
        { $match: matchStage },
        { $lookup: { from: "branches", localField: "branchId", foreignField: "_id", as: "branch", } },
        { $lookup: { from: "groups", localField: "groups", foreignField: "_id", as: "groups", } },
        { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true, } },
        {
          $addFields: {
            groups: {
              $map: {
                input: "$groups",
                as: "grp",
                in: {
                  $mergeObjects: [
                    "$$grp",
                    {
                      employeesData: {
                        $filter: {
                          input: {
                            $let: {
                              vars: {
                                employeeIds: "$$grp.employeesId"
                              },
                              in: "$$employeeIds"
                            }
                          },
                          as: "eid",
                          cond: { $ne: ["$$eid", null] }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
      
        // Add actual employee objects from 'employees' collection
        { $unwind: { path: "$groups", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "employees", localField: "groups.employeesId", foreignField: "_id", as: "groups.employeesData" } },
        {
          $group: {
            _id: "$_id",
            shiftname: { $first: "$shiftname" },
            openingAt: { $first: "$openingAt" },
            closingAt: { $first: "$closingAt" },
            status: { $first: "$status" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            branch: { $first: "$branch" },
            branchId: { $first: "$branchId" },
            groups: {
              $push: {
                $cond: [
                  { $gt: [{ $size: "$groups.employeesData" }, 0] },
                  "$groups",
                  "$$REMOVE"
                ]
              }
            }
          }
        },
      
        // Final projection
        { $project: { _id: 1, branch: 1, branchId: 1, shiftname: 1, openingAt: 1, closingAt: 1, groups: 1, status: 1, createdAt: 1, updatedAt: 1 } },
        { $sort: {createdAt: 1} }
      ]);
      

      
      res.status(200).json(result)
       

    }catch(err) {
      res.status(500).json(err) 

    }    
  }


}