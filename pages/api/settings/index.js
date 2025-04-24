import { connectDB } from "@/core/db";
import { Settings } from "../../../core/model/settings";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const result = await Settings.find()
      console.log(result)
      res.status(200).json(result)
      
    }catch(err) {
      res.status(500).json(err) 

    }    
  }


}