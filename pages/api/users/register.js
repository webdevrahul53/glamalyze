import { connectDB } from "@/core/db";
import { Users } from "@/core/model/users";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";


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
        
      Users.find({email:req.body.email}).exec().then(docs=>{ 
        if(docs.length == 0){
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    res.status(500).json(err)
                }else{ 
                    const user = new Users({
                        _id:new mongoose.Types.ObjectId(),
                        name:req.body.name,
                        email:req.body.email,
                        password:hash
                    })
                    user.save().then(result=>{ 
                        res.status(200).json({
                            status: 1,
                            message:'New user added',
                            user:{
                                _id:user._id,
                                name:user.name,
                                email:user.email,
                            }
                        })
                    }).catch(err=>{
                        res.status(500).json(err)
                    })
                }
            })
            
        }else{
            res.status(500).json({
                status: 0,
                message:"Emaill Address is already taken by a user. Please assign another one."
            })
        }
      })
    }
}