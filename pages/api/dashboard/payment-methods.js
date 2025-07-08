import { connectDB } from "@/core/db";
import mongoose from "mongoose";
import { Appointments } from "../../../core/model/appointments";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const branchId = req.query.branchId;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

      const dateFilter = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;

      const matchStage = {
        ...(branchId ? { branchId: new mongoose.Types.ObjectId(branchId) } : {}),
        ...(Object.keys(dateFilter).length ? { appointmentDate: dateFilter } : {}),
      };

      const paymentAggregation = await Appointments.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$paymentMethod",
            totalPayment: { $sum: "$totalAmount" }  
          }
        }
      ]);

      const resultMap = {
        cash: 0,
        card: 0,
        transfer: 0,
      };
      let totalCollected = 0;
      paymentAggregation.forEach(item => {
        totalCollected += item.totalPayment || 0;
        const method = item._id?.toLowerCase();
        if (resultMap.hasOwnProperty(method)) {
          resultMap[method] = item.totalPayment;
        }
      });

      const finalResult = [
        { method: "Cash", payment: resultMap.cash, refund: 0.0, fees: 0.0 },
        { method: "Card", payment: resultMap.card, refund: 0.0, fees: 0.0 },
        { method: "Transfer", payment: resultMap.transfer, refund: 0.0, fees: 0.0 },
      ];

      res.status(200).json({
        status: 1,
        data: { paymentMethods: finalResult, totalCollected },
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
