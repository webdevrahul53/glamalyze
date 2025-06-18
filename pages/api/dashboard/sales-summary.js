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
        const matchStage = branchId
        ? { "appointment.branchId": new mongoose.Types.ObjectId(branchId) }
        : {};

        const weekNames = ["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"];

        const lookupFilter = [
          { $lookup: { from: "appointments", localField: "appointmentId", foreignField: "_id", as: "appointment", },  },
          { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true, }, },
          matchStage ? { $match: matchStage } : {}
        ]

        const totalSummaryPromise = AppointmentServices.aggregate([
          ...lookupFilter,
          {
            $group: {
              _id: null,
              grossSales: { $sum: "$price" },
              netSales: { $sum: "$subTotal" },
              discount: { $sum: "$discount" },
              voucherDiscount: { $sum: "$voucherDiscount" },
            }
          }
        ]);

        const revenueByDatePromise = AppointmentServices.aggregate([
          ...lookupFilter,
          {
            $group: {
              _id: { $dateToString: { format: "%d", date: "$appointmentDate" } },
              grossSales: { $sum: "$price" },
              netSales: { $sum: "$subTotal" },
            }
          },
          { $sort: { "_id": 1 } }
        ]);
        
        const revenueByWeekPromise = AppointmentServices.aggregate([
          ...lookupFilter,
          {
            $group: {
              _id: { $dayOfWeek: "$appointmentDate"},
              grossSales: { $sum: "$price" },
              netSales: { $sum: "$subTotal" },
            }
          },
          { $sort: { "_id": 1 } }
        ]);

        
        const revenueByHourPromise = AppointmentServices.aggregate([
          ...lookupFilter,
          {
            $group: {
              _id: { $toInt: { $substrBytes: ["$startTime", 0, 2] } },
              grossSales: { $sum: "$price" },
              netSales: { $sum: "$subTotal" },
            }
          },
          { $sort: { "_id": 1 } }
        ]);
        

        const [totalRevenueByDate, totalRevenueByWeek, totalRevenueByHour, totalSummary] = await Promise.all([ revenueByDatePromise, revenueByWeekPromise, revenueByHourPromise, totalSummaryPromise ]);

        const revenueByDate = totalRevenueByDate.map(item => ({
            name: item._id,
            sales: item.grossSales
        }));

        const revenueByWeek = totalRevenueByWeek.map(item => ({
          name: weekNames[item._id - 1],
          sales: item.grossSales
        }));

        const revenueByHour = totalRevenueByHour.map(item => ({
          name: item._id + ":00",
          sales: item.grossSales
        }));

        res.status(200).json({
            status: 1,
            data: { revenueByDate, revenueByWeek, revenueByHour, totalSummary },
        });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
