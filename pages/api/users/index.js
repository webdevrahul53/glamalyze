import { connectDB } from "@/core/db";
import { Users } from "@/core/model/users";

export default async function handler(req, res) {
    await connectDB();
    
    if (req.method === "GET") {
      try {
        let result = await Users.aggregate([
            { $project: { _id: 1, name: 1, email: 1, avatar: 1 } }
        ])
        res.status(200).json(result) 
      }catch(err) {
        res.status(500).json(err) 
  
      }    
    }
}