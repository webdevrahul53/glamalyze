import { connectDB } from "@/core/db";
import { VoucherPurchased } from "../../../core/model/voucher-purchased";
import { Appointments } from "../../../core/model/appointments";
import { AppointmentServices } from "../../../core/model/appointment-services";
import { Users } from "../../../core/model/users";
import { Employees } from "../../../core/model/employees";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
        const branchId = req.query.branchId;
        const matchStage = branchId
        ? { branchId: new mongoose.Types.ObjectId(branchId) }
        : {};

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const voucherCount = VoucherPurchased.countDocuments();
        const appointmentCount = Appointments.countDocuments(matchStage);
        const userCount = Users.countDocuments();
        const employeeCount = Employees.countDocuments();

        const monthlyAppointmentCount = AppointmentServices.aggregate([
            { $lookup: { from: "appointments", localField: "appointmentId", foreignField: "_id", as: "appointment", },  },
            { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true, }, },
            {
            $match: branchId
                ? { "appointment.branchId": new mongoose.Types.ObjectId(branchId) }
                : {} // fallback to no filtering
            },
            {
            $group: {
                _id: { $month: "$appointmentDate" },
                totalAppointments: { $sum: 1 }
            }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        const [voucher, users, employees, appointment, monthlyAppointment] = await Promise.all([
            voucherCount,
            userCount,
            employeeCount,
            appointmentCount,
            monthlyAppointmentCount
        ]);

        const monthWiseAppointmentData = monthlyAppointment.map(item => ({
          name: monthNames[item._id - 1],
          appointment: item.totalAppointments
        }));
        

        res.status(200).json({
            status: 1,
            data: { voucher, users, employees, appointment, monthWiseAppointmentData }
        });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
