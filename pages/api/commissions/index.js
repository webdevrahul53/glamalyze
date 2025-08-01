import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const { employeeId } = req.query;

      // const matchStage = {
      //   ...(startDate && endDate && {
      //     appointmentDate: {
      //       $gte: new Date(startDate),
      //       $lte: new Date(endDate)
      //     }
      //   })
      // };

      const pipeline = [
        // { $match: matchStage },

        // Unwind employeeId array so we can group per person
        { $unwind: "$employeeId" },

        // Optional: filter for a specific employee
        ...(employeeId
          ? [{ $match: { employeeId: new mongoose.Types.ObjectId(employeeId) } }]
          : []),

        // Group by employeeId and date (converted to YYYY-MM-DD)
        {
          $group: {
            _id: {
              employeeId: "$employeeId",
              date: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } }
            },
            totalCommission: { $sum: "$staffCommission" }
          }
        },

        // Join employee details
        {
          $lookup: {
            from: "employees",
            localField: "_id.employeeId",
            foreignField: "_id",
            as: "employee"
          }
        },
        { $unwind: "$employee" },

        // Final structure
        {
          $project: {
            _id: 0,
            employeeId: "$_id.employeeId",
            employeeName: {
              $concat: ["$employee.firstname", " ", "$employee.lastname"]
            },
            date: "$_id.date",
            totalCommission: 1
          }
        },

        { $sort: { date: 1, employeeName: 1 } }
      ];

      const staffCommissions = await AppointmentServices.aggregate(pipeline);

      res.status(200).json(staffCommissions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
