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
        const startDate2 = req.query.startDate2 ? new Date(req.query.startDate2) : null;
        const endDate2 = req.query.endDate2 ? new Date(req.query.endDate2) : null;

        const matchStageRange1 = {
          ...(branchId && { "appointment.branchId": new mongoose.Types.ObjectId(branchId) }),
          ...(startDate && endDate && { 
            "appointment.appointmentDate": { 
              $gte: startDate, 
              $lte: endDate 
            } 
          })
        };

        const matchStageRange2 = {
          ...(branchId && { "appointment.branchId": new mongoose.Types.ObjectId(branchId) }),
          ...(startDate2 && endDate2 && { 
            "appointment.appointmentDate": { 
              $gte: startDate2, 
              $lte: endDate2 
            } 
          })
        };

        const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const lookupFilter = [
          { $lookup: { from: "appointments", localField: "appointmentId", foreignField: "_id", as: "appointment" } },
          { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true } },
          matchStageRange1 ? { $match: matchStageRange1 } : {}
        ];

        const revenueByDateRange1Promise = AppointmentServices.aggregate([
          ...lookupFilter,
          {
            $group: {
              _id: { $dateToString: { format: "%d", date: "$appointment.appointmentDate" } },
              grossSales: { $sum: "$price" },
              netSales: { $sum: "$subTotal" }
            }
          },
          { $sort: { "_id": 1 } }
        ]);
        
        const revenueByMonthRange1Promise = AppointmentServices.aggregate([
          ...lookupFilter,
          {
            $group: {
              _id: { $month: "$appointment.appointmentDate" },
              grossSales: { $sum: "$price" },
            }
          },
          { $sort: { "_id": 1 } }
        ]);

        const lookupFilterRange2 = [
          { $lookup: { from: "appointments", localField: "appointmentId", foreignField: "_id", as: "appointment" } },
          { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true } },
          matchStageRange2 ? { $match: matchStageRange2 } : {}
        ];

        const revenueByDateRange2Promise = AppointmentServices.aggregate([
          ...lookupFilterRange2,
          {
            $group: {
              _id: { $dateToString: { format: "%d", date: "$appointment.appointmentDate" } },
              grossSales: { $sum: "$price" },
              netSales: { $sum: "$subTotal" }
            }
          },
          { $sort: { "_id": 1 } }
        ]);

        const revenueByMonthRange2Promise = AppointmentServices.aggregate([
          ...lookupFilterRange2,
          {
            $group: {
              _id: { $month: "$appointment.appointmentDate" },
              grossSales: { $sum: "$price" },
            }
          },
          { $sort: { "_id": 1 } }
        ]);

        const [totalRevenueByDateRange1, totalRevenueByDateRange2, totalRevenueByMonthRange1, totalRevenueByMonthRange2] = await Promise.all([
          revenueByDateRange1Promise,
          revenueByDateRange2Promise,
          revenueByMonthRange1Promise,
          revenueByMonthRange2Promise
        ]);

        const grossSalesByDateRange1 = totalRevenueByDateRange1.map(item => ({
          name: item._id,
          sales: item.grossSales
        }));

        const grossSalesByDateRange2 = totalRevenueByDateRange2.map(item => ({
          name: item._id,
          sales: item.grossSales
        }));
        
        const netSalesByDateRange1 = totalRevenueByDateRange1.map(item => ({
          name: item._id,
          sales: item.netSales
        }));

        const netSalesByDateRange2 = totalRevenueByDateRange2.map(item => ({
          name: item._id,
          sales: item.netSales
        }));

        const grossSalesByMonthRange1 = totalRevenueByMonthRange1.map(item => ({
          name: monthName[item._id - 1],
          sales: item.grossSales
        }));

        const grossSalesByMonthRange2 = totalRevenueByMonthRange2.map(item => ({
          name: monthName[item._id - 1],
          sales: item.grossSales
        }));

        const grossSalesByDate = {
          range1: grossSalesByDateRange1,
          range2: grossSalesByDateRange2
        };
        
        const netSalesByDate = {
          range1: netSalesByDateRange1,
          range2: netSalesByDateRange2
        };

        const grossSalesByMonth = {
          range1: grossSalesByMonthRange1,
          range2: grossSalesByMonthRange2
        };

        res.status(200).json({
            status: 1,
            data: { grossSalesByDate, netSalesByDate, grossSalesByMonth },
        });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
