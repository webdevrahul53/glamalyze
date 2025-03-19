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
                $regexFind: { input: "$startTime", regex: "^(\\d{1,2}):(\\d{2}) (AM|PM)$" }
              }
            }
          },
          {
            $addFields: {
              hour: { $toInt: { $arrayElemAt: ["$parsedTime.captures", 0] } },
              minute: { $toInt: { $arrayElemAt: ["$parsedTime.captures", 1] } },
              period: { $arrayElemAt: ["$parsedTime.captures", 2] }
            }
          },
          {
            $addFields: {
              adjustedHour: {
                $switch: {
                  branches: [
                    { case: { $and: [{ $eq: ["$period", "PM"] }, { $ne: ["$hour", 12] }] }, then: { $add: ["$hour", 12] } },
                    { case: { $and: [{ $eq: ["$period", "AM"] }, { $eq: ["$hour", 12] }] }, then: 0 }
                  ],
                  default: "$hour"
                }
              }
            }
          },
          {
            $addFields: {
              start: {
                $dateFromParts: {
                  year: { $year: "$appointmentDate" },
                  month: { $month: "$appointmentDate" },
                  day: { $dayOfMonth: "$appointmentDate" },
                  hour: "$adjustedHour",
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
