import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";


export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    const startTime = req.query["startTime"]
    const duration = req.query["duration"]
    try {
        // Find busy employees with their latest booking time
        const busyEmployees = await AppointmentServices.aggregate([
            {
              $addFields: {
                startDateTime: {
                  $dateFromString: {
                    dateString: { $concat: ["2023-01-01T", "$startTime", ":00.000Z"] },
                    format: "%Y-%m-%dT%H:%M:%S.%LZ"
                  }
                }
              }
            },
            {
              $match: {
                $or: [
                  {
                    startDateTime: { $lte: new Date(`2023-01-01T${startTime}:00.000Z`) },
                    $expr: { $gte: [{ $dateAdd: { startDate: "$startDateTime", unit: "minute", amount: { $toInt: "$duration" } } }, new Date(`2023-01-01T${startTime}:00.000Z`)] }
                  },
                  {
                    startDateTime: {
                      $gte: new Date(`2023-01-01T${startTime}:00.000Z`),
                      $lt: new Date(`2023-01-01T${getNextTimeSlot(startTime, parseInt(duration))}:00.000Z`)
                    }
                  }
                ]
              }
            },
            {
              $group: {
                _id: "$employeeId",
                lastBookingEndTime: {
                  $max: {
                    $dateAdd: {
                      startDate: "$startDateTime",
                      unit: "minute",
                      amount: { $toInt: "$duration" }
                    }
                  }
                }
              }
            }
          ]);
          
    
        // Format the output
        const busyEmployeesWithSlots = busyEmployees.map(emp => ({
          employeeId: emp._id,
          nextAvailableTime: formatTime(emp.lastBookingEndTime)
        }));
        
        res.status(200).json({
            status: 1,
            busyEmployeesWithSlots
        })
      } catch (error) {
        console.error("Error fetching busy employees:", error);
        res.status(500).json(err) 
      }
        
  }

  

}


const getNextTimeSlot = (startTime, duration) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
  };
  
  // Convert ISO Date to "HH:mm" format
  const formatTime = (isoDate) => {
    const date = new Date(isoDate);
    return date.toISOString().split("T")[1].slice(0, 5);
  };
  