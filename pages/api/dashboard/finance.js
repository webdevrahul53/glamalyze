import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";
import { Customers } from "../../../core/model/customers";
import mongoose from "mongoose";
import { Appointments } from "../../../core/model/appointments";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
        const branchId = req.query.branchId;
        // const matchStage = branchId
        // ? { branchId: new mongoose.Types.ObjectId(branchId) }
        // : {};

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const customerCount = Customers.countDocuments();
        
        const returningCustomerPromise = Appointments.aggregate([
          {
            $group: {
              _id: "$customerId",
              appointmentCount: { $sum: 1 }
            }
          },
          {
            $match: {
              appointmentCount: { $gt: 1 }
            }
          },
          {
            $count: "returningCustomers"
          }
        ]).then(result => (result.length > 0 ? result[0].returningCustomers : 0));

        const revenuePromise = AppointmentServices.aggregate([
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
                totalSales: { $sum: "$price" }
            }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        const [customers, returningCustomerCount, totalRevenue] = await Promise.all([
            customerCount,
            returningCustomerPromise,
            revenuePromise,
        ]);

        const revenue = totalRevenue.reduce((acc, item) => acc + item.totalSales, 0);
        const revenueBarData = totalRevenue.map(item => ({
            name: monthNames[item._id - 1],
            sales: item.totalSales
        }));

        res.status(200).json({
            status: 1,
            data: { customers, returningCustomerCount, revenueBarData, revenue }
        });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
