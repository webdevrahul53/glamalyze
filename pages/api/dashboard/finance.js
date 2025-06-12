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
        
        const paymentMethodCountPromise = Appointments.aggregate([
          {
            $group: {
              _id: "$paymentMethod",
              count: { $sum: 1 }
            }
          }
        ]).then(result => {
            const paymentMethods = result.reduce((acc, item) => {
            const method = item._id?.toLowerCase();
            if (method) acc[method] = item.count || 0;
            return acc;
            }, { cash: 0, card: 0, transfer: 0 });

            return Object.entries(paymentMethods).map(([key, value]) => ({
              name: key.charAt(0).toUpperCase() + key.slice(1),
              value,
            }));
        });

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
                transactions: { $sum: { $cond: [{ $ifNull: ["$appointment.bookingId", false] }, 1, 0] } },
                grossSales: { $sum: "$price" },
                netSales: { $sum: "$subTotal" },
            }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        const [customers, returningCustomerCount, paymentMethods, totalRevenue] = await Promise.all([
            customerCount,
            returningCustomerPromise,
            paymentMethodCountPromise,
            revenuePromise,
        ]);

        const transactions = totalRevenue.reduce((acc, item) => acc + item.transactions, 0);
        const grossSales = totalRevenue.reduce((acc, item) => acc + item.grossSales, 0);
        const netSales = totalRevenue.reduce((acc, item) => acc + item.netSales, 0);
        const revenueBarData = totalRevenue.map(item => ({
            name: monthNames[item._id - 1],
            sales: item.grossSales
        }));

        res.status(200).json({
            status: 1,
            data: { customers, returningCustomerCount, paymentMethods, revenueBarData, transactions, grossSales, netSales },
        });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
