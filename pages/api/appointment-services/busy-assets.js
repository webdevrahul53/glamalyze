import { connectDB } from "@/core/db";
import { AppointmentServices } from "../../../core/model/appointment-services";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    const startTime = req.query["startTime"];
    const duration = req.query["duration"];
    try {
      // Find busy assets with their latest booking time
      const busyAssets = await AppointmentServices.aggregate([
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
            _id: "$assetId",  // Grouping by asset ID
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
      const busyAssetsWithSlots = busyAssets.map(asset => ({
        assetId: asset._id,
        nextAvailableTime: formatTime(asset.lastBookingEndTime)
      }));
      
      res.status(200).json({
        status: 1,
        busyAssetsWithSlots
      });
    } catch (error) {
      console.error("Error fetching busy assets:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

// Function to calculate the next available time slot
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
