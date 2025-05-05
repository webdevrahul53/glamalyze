import { connectDB } from "@/core/db";
import { Roster } from "../../../core/model/roster";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try{
      const result = await Roster.findOne().sort({ dateFor: -1 });
      res.status(200).json(result)
    }catch(err) {
      res.status(500).json(err) 

    }    
  }
  

}