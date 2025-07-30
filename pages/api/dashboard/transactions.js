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
        const paymentMethod = req.query.paymentMethod;
        const taskStatus = req.query.status;

        const matchStage = {
          ...(branchId && { "appointment.branchId": new mongoose.Types.ObjectId(branchId) }),
          ...(paymentMethod && { "appointment.paymentMethod": paymentMethod }),
          ...(taskStatus && { "appointment.taskStatus": taskStatus }),
          ...(startDate && endDate && { 
            "appointment.appointmentDate": { 
              $gte: startDate, 
              $lte: endDate 
            } 
          })
        };
        
        const revenuePromise = AppointmentServices.aggregate([
            { $lookup: { from: "appointments", localField: "appointmentId", foreignField: "_id", as: "appointment", },  },
            { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true, }, },
            { $lookup: { from: "branches", localField: "appointment.branchId", foreignField: "_id", as: "branch", },  },
            { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true, }, },
            { $lookup: { from: "services", localField: "serviceId", foreignField: "_id", as: "service", },  },
            { $unwind: { path: "$service", preserveNullAndEmptyArrays: true, }, },
            { $lookup: { from: "categories", localField: "service.categoryId", foreignField: "_id", as: "category", },  },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true, }, },
            { $match: matchStage },
            { $project: { 
                _id: 1,
                category: 1,
                branch: 1,
                service: 1,
                startTime: 1,
                appointmentDate: "$appointment.appointmentDate",
                paymentMethod: "$appointment.paymentMethod",
                taskStatus: "$appointment.taskStatus",
                duration: 1,
                price: 1,
                staffCommission: 1,
                subTotal: 1,
                discount: 1,
                voucherDiscount: 1,
             } },
        ]);

        const [transactionsList] = await Promise.all([
            revenuePromise,
        ]);

        const grossSales = transactionsList.reduce((acc, item) => acc + item.price, 0);
        const netSales = transactionsList.reduce((acc, item) => acc + (item?.subTotal || 0), 0);
        const transactions = transactionsList.length;


        res.status(200).json({
            status: 1,
            data: {transactionsList, grossSales, netSales, transactions},
        });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
