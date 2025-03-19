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

  if(req.method === "PATCH") {
    var updateOps = {};
    if (Array.isArray(req.body)) {
      for (let ops of req.body) {
          updateOps[ops.propName] = ops.value;
      }
    } else updateOps = req.body;
    Appointments.updateOne({_id:req.query['id']},{$set:updateOps}).exec()
    .then(()=>{ 
        res.status(200).json({
            status: 1,
            message:"Appointment data updated",
            _id:req.query['id']
        }) 
    }).catch(err=>{ 
      console.log(err);
      
        res.status(500).json(err) 

    }) 
  }
  

}