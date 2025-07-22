import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const branchId = req.query.branchId;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

      const matchStage = {
        ...(branchId && { "appointment.branchId": new mongoose.Types.ObjectId(branchId) }),
        ...(startDate && endDate && {
          "appointment.appointmentDate": {
            $gte: startDate,
            $lte: endDate
          }
        })
      };

      const revenueData = await AppointmentServices.aggregate([
        // Join with appointments
        {
          $lookup: {
            from: "appointments",
            localField: "appointmentId",
            foreignField: "_id",
            as: "appointment"
          }
        },
        { $unwind: "$appointment" },

        // Join with services
        {
          $lookup: {
            from: "services",
            localField: "serviceId",
            foreignField: "_id",
            as: "service"
          }
        },
        { $unwind: "$service" },

        // Apply filters
        { $match: matchStage },

        // Group by date + serviceName
        {
          $group: {
            _id: {
              // date: {
              //   $dateToString: { format: "%Y-%m-%d", date: "$appointment.appointmentDate" }
              // },
              date: { $substrBytes: ["$startTime", 0, 2] },
              serviceName: "$service.name"
            },
            sales: { $sum: "$price" },
            itemSold: { $sum: 1 } // Count the number of services sold
          }
        },

        // Flatten the result
        {
          $project: {
            name: "$_id.date",
            serviceName: "$_id.serviceName",
            sales: 1,
            itemSold: 1,
            _id: 0
          }
        },

        // Optional: sort by date
        { $sort: { name: 1 } }
      ]);

      res.status(200).json({
        status: 1,
        data: { revenueBarData: revenueData }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Internal Server Error",
        error: err.message
      });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
