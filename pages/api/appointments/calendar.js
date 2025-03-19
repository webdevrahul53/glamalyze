import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    
    try {

      const result = await AppointmentServices.aggregate([
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
        {
            $addFields: {
                // Calculate end time by adding totalDuration
                end: {
                $dateAdd: { startDate: "$start", unit: "minute", amount: "$duration" }
                }
            }
        },
        { $project: { _id: 1, appointmentDate: 1, startTime: 1, start: 1, end: 1, employeeId: 1, serviceId: 1, duration: 1, price: 1, 
            status: 1, createdAt: 1, updatedAt: 1 } },
      ]);
      
      
      
      

      res.status(200).json(result) 
    }catch(err) {
      console.log(err)
      res.status(500).json(err) 

    }    
  }

  

}
