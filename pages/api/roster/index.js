import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Roster } from "../../../core/model/roster";
import moment from "moment";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try{
      const startDate = moment(req.query.startDate).format("YYYY-MM-DD");
      const endDate = moment(req.query.endDate).format("YYYY-MM-DD");
      console.log(startDate, endDate)
      const branchId = req.query.branchId;
      const matchStage = branchId
      ? { branchId: new mongoose.Types.ObjectId(branchId) }
      : {};
      const result = await Roster.aggregate([
        {
          $match: {
            ...matchStage,
            dateFor: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
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
            shiftId: { $first: "$shiftId" },
            dateFor: { $first: "$dateFor" },
            status: { $first: "$status" },
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
        {
          $addFields: {
            groups: {
              $sortArray: {
                input: "$groups",
                sortBy: { createdAt: 1 }
              }
            }
          }
        },
      
        // Final projection
        { $project: { _id: 1, branchId: 1, shiftId: 1, dateFor: 1, groups: 1, status: 1 } },
        { $sort: {createdAt: 1} }
      ]);

      
      res.status(200).json(result)

    
    }catch(err) {
      res.status(500).json(err) 

    }    
  }

  if (req.method === "POST") {
    const { branchId, shiftId, groupId, dateFor, status, type } = req.body;
  
    try {
      if (type === "delete") {
        await Roster.updateOne(
          { shiftId, dateFor },
          { $pull: { groups: groupId } }
        );
        
        // Check if any document still has the same shiftId/dateFor and empty groups
        const doc = await Roster.findOne({ shiftId, dateFor });
        if (doc && (!doc.groups || doc.groups.length === 0)) {
          await Roster.deleteOne({ _id: doc._id });
        }

        return res.status(200).json({
          status: 1,
          message: "Roster removed",
        });
      } else {
        // Remove groupId from other branches
        await Roster.updateMany(
          { groups: groupId, dateFor, branchId: { $ne: branchId } },
          { $pull: { groups: groupId } }
        );
  
        // Add groupId to the correct shift and branch
        const result = await Roster.updateOne(
          { shiftId, dateFor },
          { 
            $addToSet: { groups: groupId }, 
            $setOnInsert: { status, branchId, _id: new mongoose.Types.ObjectId() } 
          },
          { upsert: true }
        );
  
        if (result.upserted) {
          // New document inserted
          return res.status(200).json({
            message: 'New roster added',
            status: 1,
            roster: {
              _id: result.upserted[0]._id,
              shiftId,
              groups: [groupId],
              dateFor,
              status
            }
          });
        } else {
          // Existing document updated
          return res.status(200).json({
            message: 'Roster updated',
            status: 1
          });
        }
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: 'An error occurred',
        status: 0,
        error: err.message
      });
    }
  }
  
  
  
  // if(req.method === "DELETE") {
  //   Roster.deleteMany().exec()
  //   .then(docs=>{ 
  //       res.status(200).json({
  //           message:"Category data updated",
  //           _id:req.params['id']
  //       }) 
  //   }).catch(err=>{ 
  //       res.status(500).json(err) 

  //   }) 
  // }

}