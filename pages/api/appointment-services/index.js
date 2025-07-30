import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Appointments } from "../../../core/model/appointments";
import { AppointmentServices } from "../../../core/model/appointment-services";
import { AppointmentPax } from "../../../core/model/appointment-pax";
import { randomUUID } from "crypto";
import { VoucherPurchased } from "../../../core/model/voucher-purchased";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Fetch total count WITHOUT lookup for performance
      const totalCountPromise = AppointmentServices.countDocuments();

      const dataPromise = AppointmentServices.aggregate([
        { $lookup: { from: "appointments", localField: "appointmentId", foreignField: "_id", as: "appointment", },  },
        { $lookup: { from: "customers", localField: "appointment.customerId", foreignField: "_id", as: "customer", },  },
        { $lookup: { from: "employees", localField: "employeeId", foreignField: "_id", as: "employee" } },
        { $lookup: { from: "services", localField: "serviceId", foreignField: "_id", as: "service" } },
        { $lookup: { from: "assets", localField: "assetId", foreignField: "_id", as: "asset" } },
        { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true }, },
        // { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$service", preserveNullAndEmptyArrays: true }, },
        { $unwind: { path: "$asset", preserveNullAndEmptyArrays: true }, },
        {
          $addFields: {
            parsedTime: {
              $split: ["$startTime", ":"]
            }
          }
        },
        {
          $addFields: {
            hour: { $toInt: { $arrayElemAt: ["$parsedTime", 0] } },
            minute: { $toInt: { $arrayElemAt: ["$parsedTime", 1] } }
          }
        },
        {
          $addFields: {
            start: {
              $dateFromParts: {
                year: { $year: "$appointmentDate" },
                month: { $month: "$appointmentDate" },
                day: { $dayOfMonth: "$appointmentDate" },
                hour: "$hour",
                minute: "$minute"
              }
            }
          }
        },
        { $project: { _id: 1, appointmentId: 1, bookingId: 1, start: 1, customer: 1, employee: 1, asset: 1, 
          serviceName: "$service.name", taskStatus: "$appointment.taskStatus", paymentStatus: "$appointment.paymentStatus", paymentMethod: "$appointment.paymentMethod",
          duration: 1, price: 1, staffCommission: 1, voucherDiscount: 1, discount: 1, subTotal: 1, status: 1, createdAt: 1, updatedAt: 1 } },
          
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ])
      
      // Execute both queries in parallel
      const [totalCount, data] = await Promise.all([totalCountPromise, dataPromise]);

      res.status(200).json({
        data,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalRecords: totalCount
      }) 
    }catch(err) {
      console.log(err)
      res.status(500).json(err) 

    }    
  }

  if(req.method === "POST") {

    const appointmentData = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // 1. Create Appointment
        const bookingId = randomUUID(); // Generate a unique booking ID
        const appointment = new Appointments({
            _id: new mongoose.Types.ObjectId(),
            bookingId,
            appointmentDate: appointmentData.appointmentDate,
            startTime: appointmentData.startTime,
            branchId: appointmentData.branchId,
            customerId: appointmentData.customerId,
            totalDuration: appointmentData.pax.flat().reduce((acc, pax) => acc + Number(pax.duration), 0),
            totalAmount: appointmentData.totalAmount,
            paymentStatus: appointmentData.paymentStatus,
            paymentMethod: appointmentData.paymentMethod,
            taskStatus: appointmentData.taskStatus,
            note: appointmentData.note,
            status: appointmentData.status
        });

        await appointment.save({ session });

        // Store Pax IDs
        const paxIds = [];

        // 2. Insert Pax and Services
        for (const pax of appointmentData.pax) {
            const paxId = new mongoose.Types.ObjectId();
            paxIds.push(paxId);

            // Store AppointmentService IDs
            const appointmentServiceIds = [];

            for (const service of pax) {
              if(service.serviceId){
                try {
                  if (service.voucherUsed && appointment.taskStatus === "Completed") {
                    const voucher = await VoucherPurchased.findOneAndUpdate(
                      { voucherId: service.voucherUsed, remainingVoucher: { $gt: 0 } },
                      { $inc: { remainingVoucher: -1 } },
                      { new: true, session }
                    ).exec();

                    if (!voucher) {
                        res.status(500).json({ message: "Voucher is either invalid or has no remaining uses." });
                        await session.abortTransaction();
                        session.endSession();
                        return;
                    }
                  }
                } catch (error) {
                  res.status(500).json({ message: "Voucher is either invalid or has no remaining uses.", error });
                  await session.abortTransaction();
                  session.endSession();
                  return;
                }
                const appointmentService = new AppointmentServices({
                    _id: new mongoose.Types.ObjectId(),
                    bookingId,
                    appointmentId: appointment._id,
                    paxId: paxId,
                    appointmentDate: appointment.appointmentDate,
                    startTime: service.startTime,
                    serviceId: service.serviceId,
                    employeeId: service.employeeId,
                    assetId: service.assetId,
                    duration: Number(service.duration),
                    couponUsed: service.couponUsed ? service.couponUsed : null,
                    voucherUsed: service.voucherUsed ? service.voucherUsed : null,
                    price: service.price,
                    staffCommission: service.staffCommission,
                    voucherDiscount: service.voucherDiscount,
                    discount: service.discount,
                    subTotal: service.subTotal,
                    status: true,

                    // useless but need to keep for edit form
                    durationList: service.durationList,
                    couponList: service.couponList,
                    assetTypeId: service.assetTypeId,
                    assetList: service.assetList,
                    busyEmployees: service.busyEmployees,
                    employeeList: service.employeeList,
                });

                await appointmentService.save({ session });
                appointmentServiceIds.push(appointmentService._id);
              }
            }

            // 3. Create AppointmentPax Entry
            const appointmentPax = new AppointmentPax({
                _id: paxId,
                bookingId,
                appointmentId: appointment._id,
                appointmentServiceId: appointmentServiceIds,
                status: true
            });

            await appointmentPax.save({ session });
        }

        // 4. Update Appointment with Pax IDs
        appointment.paxId = paxIds;
        await appointment.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
          message:'New branch added',
          status: 1,
          appointment:{
              _id:appointment._id,
              bookingId, 
          }
      })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json(error) 
    }

  }
  
  
  // if(req.method === "DELETE") {
  //   Appointments.deleteMany().exec()
  //   .then(docs=>{ 
  //       res.status(200).json({
  //           message:"Sub Category data updated",
  //           _id:req.params['id']
  //       }) 
  //   }).catch(err=>{ 
  //       res.status(500).json(err) 

  //   }) 
  // }

}
