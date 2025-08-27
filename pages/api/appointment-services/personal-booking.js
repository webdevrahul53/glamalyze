import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";
import { Groups } from "../../../core/model/groups";
import { Roster } from "../../../core/model/roster";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const groupId = req.query["groupId"];
    const dateFor = req.query["dateFor"];

    if (!groupId || !dateFor) {
      return res.status(400).json({
        status: 0,
        message: "groupId and dateFor are required",
      });
    }

    try {
      const date = new Date(dateFor);

      // Step 1: get employees in this group
      const group = await Groups.findById(groupId).select("employeesId");
      if (!group) {
        return res.status(404).json({
          status: 0,
          message: "Group not found",
        });
      }
      const employeeIds = group.employeesId;

      // Step 2: check if roster exists for this group/date
      const roster = await Roster.findOne({
        dateFor: date,
        groups: groupId,
      });

      if (!roster) {
        return res.status(200).json({
          status: 1,
          employees: [],
        });
      }

      // Step 3: aggregate counts of personal bookings per employee
      const employees = await AppointmentServices.aggregate([
        {
          $match: {
            appointmentDate: {
              $gte: new Date(date.setHours(0, 0, 0, 0)),
              $lt: new Date(date.setHours(23, 59, 59, 999)),
            },
            personalBookingCommission: { $gt: 0 },
            employeeId: { $in: employeeIds },
          },
        },
        { $unwind: "$employeeId" },
        {
          $match: {
            employeeId: { $in: employeeIds },
          },
        },
        {
          $group: {
            _id: "$employeeId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "_id",
            foreignField: "_id",
            as: "employee",
          },
        },
        { $unwind: "$employee" },
        {
          $project: {
            _id: "$employee._id",
            firstname: "$employee.firstname",
            lastname: "$employee.lastname",
            count: 1,
          },
        },
      ]);

      res.status(200).json({
        status: 1,
        employees,
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({
        status: 0,
        message: "Error fetching employees",
        error: error.message,
      });
    }
  } else {
    res.status(405).json({
      status: 0,
      message: "Method not allowed",
    });
  }
}
