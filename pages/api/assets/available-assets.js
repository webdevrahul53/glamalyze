import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";
import { Assets } from "../../../core/model/assets";  // Import Assets Model
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const appointmentDate = req.query["appointmentDate"]
    const startTime = req.query["startTime"];
    const duration = req.query["duration"];
    const assetTypeIds = req.query["assetTypeId"].split(","); // now an array
    const branchId = req.query["branchId"];
    const obj = { branchId: new mongoose.Types.ObjectId(branchId) };
    
    // if assetTypeIds array is provided
    if (assetTypeIds && assetTypeIds.length > 0) {
      obj.assetTypeId = {
        $in: assetTypeIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    
    try {
      // Step 1: Get all assets
      // const allAssets = await Assets.find(obj, { _id: 1, assetTypeId: 1, assetNumber: 1 }).populate("assetTypeId");
      
      const allAssets = await Assets.aggregate([
        { $match: obj },
        { $lookup: { from: "assettypes", localField: "assetTypeId", foreignField: "_id", as: "assetTypeId" } },
        { $unwind: { path: "$assetTypeId", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, assetTypeId: 1, assetType:"$assetTypeId.assetTypeName", assetNumber: 1 } },
      ]);

      // Step 2: Find busy assets using AppointmentServices
      const busyAssets = await AppointmentServices.aggregate([
        {
          $match: {
            $expr: {
              $eq: [
                { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
                appointmentDate
              ]
            }
          }
        },
        {
          $addFields: {
            startDateTime: {
              $dateFromString: {
                dateString: { $concat: ["2023-01-01T", "$startTime", ":00.000Z"] },
                format: "%Y-%m-%dT%H:%M:%S.%LZ"
              }
            }
          }
        },
        {
          $match: {
            $or: [
              {
                startDateTime: { $lte: new Date(`2023-01-01T${startTime}:00.000Z`) },
                $expr: { $gt: [{ $dateAdd: { startDate: "$startDateTime", unit: "minute", amount: { $toInt: "$duration" } } }, new Date(`2023-01-01T${startTime}:00.000Z`)] }
              },
              {
                startDateTime: {
                  $gt: new Date(`2023-01-01T${startTime}:00.000Z`),
                  $lt: new Date(`2023-01-01T${getNextTimeSlot(startTime, parseInt(duration))}:00.000Z`)
                }
              }
            ]
          }
        },
        { $group: { _id: "$assetId" } } // Get busy asset IDs
      ]);

      // Step 3: Extract IDs of busy assets
      const busyAssetIds = new Set(busyAssets.map(asset => asset?._id?.toString()));

      // Step 4: Filter available assets (assets NOT in busyAssetIds)
      const availableAssets = allAssets.filter(asset => !busyAssetIds.has(asset?._id?.toString()));

      res.status(200).json({
        status: 1,
        availableAssets
      });
    } catch (error) {
      console.error("Error fetching available assets:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

// Function to calculate the next available time slot
const getNextTimeSlot = (startTime, duration) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
};
