import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { TransferredEmployees } from "../../../core/model/transferred-employees";


// Utility to check if time ranges overlap
function isOverlap(open1, close1, open2, close2) {
  return !(close1 <= open2 || open1 >= close2);
}

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const dateFor = req.query.dateFor;
      const branchId = req.query.branchId;
      const matchStage = branchId
      ? { branchId: new mongoose.Types.ObjectId(branchId) }
      : {};
      const result = await TransferredEmployees.aggregate([
        { $match: { ...matchStage, dateFor } },
        { $lookup: { from: "employees", localField: "employeeId", foreignField: "_id", as: "groupEmployees" } },
        { $lookup: { from: "services", localField: "groupEmployees.servicesId", foreignField: "_id", as: "employeeServices" } },
        // { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, branchId: 1, groupEmployees: 1, employeeServices: 1, employeeId: 1, dateFor: 1, openingAt: 1, closingAt: 1 } },
      ])
      res.status(200).json(result)
      
    }catch(err) {
      res.status(500).json(err) 

    }    
  }

  if(req.method === "POST") {
    const dateFor = req.body.dateFor;
    const employeeId = req.body.employeeId;
    const transfers = req.body.transfers;
    console.log(dateFor);
    

    try {
  
      for (const transfer of transfers) {
        const { branchId, openingAt, closingAt } = transfer;
  
        // Check for overlap with existing transfers on the same date
        const existingTransfers = await TransferredEmployees.find({ dateFor, employeeId: new mongoose.Types.ObjectId(employeeId) });
        console.log(existingTransfers);
        
  
        const overlap = existingTransfers.some((t) =>
          isOverlap(openingAt, closingAt, t.openingAt, t.closingAt)
        );
  
        if (overlap) {
          res.status(500).json({status: 500, message: "Time overlap detected with existing transfers"})
        }else {

          // Save the new transfer
          const newTransfer = new TransferredEmployees({
            _id: new mongoose.Types.ObjectId(),
            dateFor,
            branchId,
            employeeId,
            openingAt,
            closingAt,
            status: true
          });
    
          await newTransfer.save();
        }
  
      }
  
      res.status(200).json({
        message:'All transeferred successfully',
        status: 1
      })
    } catch (error) {
      console.log("Error saving transfers:", error);
      res.status(500).json(error)
      return { success: false, message: error.message };
    }



  }

}