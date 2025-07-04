import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";
import mongoose from "mongoose";
import { Appointments } from "../../../core/model/appointments";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
        const branchId = req.query.branchId;
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
        
        const matchStageRange = {
          ...(branchId && { "appointment.branchId": new mongoose.Types.ObjectId(branchId) }),
          ...(startDate && endDate && { 
            "appointment.appointmentDate": { 
              $gte: startDate, 
              $lte: endDate 
            } 
          })
        };
        
        const dateFilter = {};
        if (startDate) dateFilter.$gte = startDate;
        if (endDate) dateFilter.$lte = endDate;

        const appointmentMatchStage = {
          ...branchId ? { branchId: new mongoose.Types.ObjectId(branchId) } : {},
          ...Object.keys(dateFilter).length ? { appointmentDate: dateFilter } : {}
        };

        const weekNames = ["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"];

        const lookupFilter = [
          { $lookup: { from: "appointments", localField: "appointmentId", foreignField: "_id", as: "appointment", },  },
          { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true, }, },
          matchStageRange ? { $match: matchStageRange } : {}
        ]

        const paymentMethodCountPromise = Appointments.aggregate([
          { $match: appointmentMatchStage },
          {
            $group: {
              _id: "$paymentMethod",
              count: { $sum: "$totalAmount" }
            }
          }
        ]).then(result => {
            const paymentMethods = result.reduce((acc, item) => {
            const method = item._id?.toLowerCase();
            if (method) acc[method] = item.count || 0;
            return acc;
            }, { cash: 0, card: 0, transfer: 0 });

            return paymentMethods
        });

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
        

        const [totalRevenueByDate, totalRevenueByWeek, totalRevenueByHour, totalSummary, paymentMethods] = await Promise.all([ revenueByDatePromise, revenueByWeekPromise, revenueByHourPromise, totalSummaryPromise, paymentMethodCountPromise ]);

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
            data: { revenueByDate, revenueByWeek, revenueByHour, totalSummary, paymentMethods },
        });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
