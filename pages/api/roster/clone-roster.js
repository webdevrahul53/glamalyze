import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Roster } from "../../../core/model/roster";
import moment from "moment";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const { startDate, endDate } = req.body;

    try {
      const start = moment(startDate, "YYYY-MM-DD");
      const end = moment(endDate, "YYYY-MM-DD");
      const daysToClone = end.diff(start, 'days') + 1;

      // Step 1: Fetch rosters from startDate to endDate
      const originalRosters = await Roster.find({
        dateFor: {
          $gte: start.format("YYYY-MM-DD"),
          $lte: end.format("YYYY-MM-DD")
        }
      });

      if (!originalRosters.length) {
        return res.status(404).json({
          status: 0,
          message: "No rosters found in the selected date range"
        });
      }

      const clonedRosters = [];

      for (let i = 0; i < daysToClone; i++) {
        const sourceDate = moment(start).add(i, 'days');
        const targetDate = moment(end).add(i + 1, 'days'); // shifted dates

        const rostersForDay = originalRosters.filter(r =>
          moment(r.dateFor).isSame(sourceDate, 'day')
        );

        for (const roster of rostersForDay) {
          clonedRosters.push({
            _id: new mongoose.Types.ObjectId(),
            shiftId: roster.shiftId,
            branchId: roster.branchId,
            status: roster.status || true,
            groups: roster.groups,
            dateFor: targetDate.format("YYYY-MM-DD")
          });
        }
      }

      // Step 2: Insert cloned rosters
      await Roster.insertMany(clonedRosters);

      return res.status(200).json({
        status: 1,
        message: `Successfully cloned ${clonedRosters.length} rosters from ${start.format("YYYY-MM-DD")} to ${end.format("YYYY-MM-DD")}`
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: 0,
        message: "Clone operation failed",
        error: err.message
      });
    }
  }

  
  
  

}