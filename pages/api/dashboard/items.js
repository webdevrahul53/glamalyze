import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      
        const branchId = req.query.branchId;
        const categoryId = req.query.categoryId;
        const searchText = req.query.searchText || "";

        const matchStage = {
            ...(branchId && { "branch._id": new mongoose.Types.ObjectId(branchId) }),
            ...(categoryId && { "category._id": new mongoose.Types.ObjectId(categoryId) }),
            ...(searchText && { "service.name": { $regex: searchText, $options: "i" } })
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
            
            // Group by category + duration
            {
              $group: {
                _id: {
                  categoryId: "$category._id",
                  duration: "$duration"
                },
                totalPrice: { $sum: "$price" },
                firstRecord: { $first: "$$ROOT" }
              }
            },

            // Reshape to original format + summed price
            {
              $project: {
                _id: "$firstRecord._id",
                category: "$firstRecord.category",
                branch: "$firstRecord.branch",
                service: "$firstRecord.service",
                appointmentDate: "$firstRecord.appointment.appointmentDate",
                duration: "$_id.duration",
                price: "$totalPrice", // summed price
                subTotal: "$firstRecord.subTotal",
                discount: "$firstRecord.discount",
                voucherDiscount: "$firstRecord.voucherDiscount"
              }
            }
        ]);

        const [totalRevenue] = await Promise.all([
            revenuePromise,
        ]);


        res.status(200).json({
            status: 1,
            data: totalRevenue,
        });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
