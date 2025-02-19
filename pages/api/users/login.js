import { connectDB } from "@/core/db";
import { Users } from "@/core/model/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


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

    if (req.method === "POST") {
        
      Users.findOne({email:req.body.email})
      .exec()
      .then(user=>{
          console.log(user)
          if(user){ 
              bcrypt.compare(req.body.password,user.password,(err,result)=>{

                  if(result){
                      var token = jwt.sign({email:user.email,id:user._id},process.env.NEXT_PUBLIC_JWT_SECRET,{expiresIn:"24h"});
                      res.status(200).json({
                          status: 1,
                          message:"Auth Successfull",
                          token:token,
                          data: {_id: user._id, email: user.email, name: user.name, token}
                      })
                  }else{
                      res.status(500).json({
                          status: 0,
                          message:"Auth Failed",
                          error:err
                      })
                  }

              })
          }else{
              res.status(500).json({
                  message:"Auth Failed"
              })
          }

      })
      .catch((err)=>{
          return res.status(500).json(err)
      })

    }
}