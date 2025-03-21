import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Appointments } from "../../../core/model/appointments";
import { AppointmentServices } from "../../../core/model/appointment-services";
import { AppointmentPax } from "../../../core/model/appointment-pax";

export default async function handler(req, res) {
  await connectDB();
  
  if(req.method === "DELETE") {
    const appointmentServiceId = req.query["id"]
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      // Delete the AppointmentService
      const deletedService = await AppointmentServices.findByIdAndDelete(appointmentServiceId).session(session);
      if (!deletedService) throw new Error("AppointmentService not found");
  
      // Remove the deleted service reference from AppointmentPax
      await AppointmentPax.updateMany(
        { appointmentServiceId: appointmentServiceId },
        { $pull: { appointmentServiceId: appointmentServiceId } },
        { session }
      );
  
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
  
      res.status(200).json({
          status: 1,
          message: "AppointmentService deleted successfully" ,
          _id:req.query['id']
      }) 
    } catch (error) {
      console.error("Error deleting AppointmentService:", error);
      res.status(500).json(err) 
    }
  }

  if (req.method === "PUT") {
    const { appointmentId, appointmentData } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // 1. Update Appointment
      const appointment = await Appointments.findByIdAndUpdate(
        appointmentId,
        {
          appointmentDate: appointmentData.appointmentDate,
          startTime: appointmentData.startTime,
          branchId: appointmentData.branchId,
          customerId: appointmentData.customerId,
          totalDuration: appointmentData.pax.flat().reduce((acc, pax) => acc + Number(pax.duration), 0),
          totalAmount: appointmentData.totalAmount,
          paymentStatus: appointmentData.paymentStatus,
          taskStatus: appointmentData.taskStatus,
          status: appointmentData.status
        },
        { new: true, session }
      );

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      // 2. Delete Existing Pax & Services (Optional: You can modify this based on business logic)
      await AppointmentPax.deleteMany({ appointmentId }, { session });
      await AppointmentServices.deleteMany({ appointmentId }, { session });

      // Store Pax IDs
      const paxIds = [];

      // 3. Reinsert Pax and Services
      for (const pax of appointmentData.pax) {
        const paxId = new mongoose.Types.ObjectId();
        paxIds.push(paxId);

        // Store AppointmentService IDs
        const appointmentServiceIds = [];

        for (const service of pax) {
          const appointmentService = new AppointmentServices({
            _id: new mongoose.Types.ObjectId(),
            bookingId: appointment.bookingId,
            appointmentId: appointment._id,
            paxId: paxId,
            appointmentDate: appointment.appointmentDate,
            startTime: service.startTime,
            serviceId: service.serviceId,
            employeeId: service.employeeId,
            assetId: service.assetId,
            duration: Number(service.duration),
            price: service.price,
            status: true,

            // Additional fields
            durationList: service.durationList,
            assetType: service.assetType,
            selectedAsset: service.selectedAsset,
            busyEmployees: service.busyEmployees,
            employeeList: service.employeeList,
          });

          await appointmentService.save({ session });
          appointmentServiceIds.push(appointmentService._id);
        }

        // 4. Create AppointmentPax Entry
        const appointmentPax = new AppointmentPax({
          _id: paxId,
          bookingId: appointment.bookingId,
          appointmentId: appointment._id,
          appointmentServiceId: appointmentServiceIds,
          status: true
        });

        await appointmentPax.save({ session });
      }

      // 5. Update Appointment with Pax IDs
      appointment.paxId = paxIds;
      await appointment.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: "Appointment updated successfully",
        status: 1,
        appointment: {
            _id: appointment._id,
            bookingId: appointment.bookingId
        }
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: error.message });
    }
  }

  

}