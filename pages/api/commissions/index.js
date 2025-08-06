import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const { startDate, endDate } = req.query;

      const matchStage =
        startDate && endDate
          ? {
              appointmentDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
            }
          : null;

      const staffCommissions = await AppointmentServices.aggregate([
        // Conditionally include $match stage
        ...(matchStage ? [{ $match: matchStage }] : []),

        { $unwind: "$employeeId" },

        {
          $group: {
            _id: {
              employeeId: "$employeeId",
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$appointmentDate",
                },
              },
            },
            totalCommission: { $sum: "$staffCommission" },
          },
        },

        {
          $lookup: {
            from: "employees",
            localField: "_id.employeeId",
            foreignField: "_id",
            as: "employee",
          },
        },
        { $unwind: "$employee" },

        {
          $project: {
            _id: 0,
            employee: 1,
            // employeeId: "$_id.employeeId",
            date: "$_id.date",
            totalCommission: 1,
          },
        },

        { $sort: { date: 1, employeeName: 1 } },
      ]);

      res.status(200).json(staffCommissions);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Internal Server Error",
        error: err.message,
      });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
