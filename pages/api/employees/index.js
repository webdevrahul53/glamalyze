import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Employees } from "../../../core/model/employees";
import { Users } from "@/core/model/users";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    const searchQuery = req.query.search || "";
    try {
      let result = await Employees.aggregate([
        { $addFields: { employeeName: { $concat: ["$firstname", " ", "$lastname"] } } },
        {
          $match: {
            $or: [
              { employeeName: { $regex: searchQuery, $options: "i" } },
              { email: { $regex: searchQuery, $options: "i" } },
              { phonenumber: { $regex: searchQuery, $options: "i" } },
            ]
          }
        },
        { $project: { _id: 1, image: 1, employeeName: 1, firstname: 1, lastname: 1, 
          email: 1, password: 1, phonenumber: 1, gender: 1, servicesId: 1, 
          totalServices: {$size: "$servicesId"}, aboutself: 1, expert: 1, facebook: 1, instagram: 1, twitter: 1, 
          dribble: 1, isVisibleInCalendar: 1, isManager: 1, role: { $cond: { if: "$isManager", then: "Manager", else: "Staff" } }, 
          status: 1, createdAt: 1, updatedAt: 1 } },
      ])
      res.status(200).json(result) 
    }catch(err) {
      console.log(err)
      res.status(500).json(err) 

    }    
  }

  if(req.method === "POST") {
    // Check if the email is already registered
    const existingUser = await Users.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ status: 0, message: "Email address is already taken. Please use another one.", });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const employee = new Employees({
      _id:new mongoose.Types.ObjectId(),
      image: req.body.image,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phonenumber: req.body.phonenumber,
      email: req.body.email,
      password: hashedPassword,
      gender: req.body.gender,
      servicesId: req.body.servicesId,
      aboutself: req.body.aboutself,
      expert: req.body.expert,
      facebook: req.body.facebook,
      instagram: req.body.instagram,
      twitter: req.body.twitter,
      dribble: req.body.dribble,
      isVisibleInCalendar: req.body.isVisibleInCalendar,
      isManager: req.body.isManager,
      status: req.body.status,
    })
    employee.save().then(()=>{ 
        res.status(200).json({
            message:'New employee added',
            status: 1,
            _id:employee._id, 
            employee:{
                image: employee.image,
                firstname: employee.firstname,
                lastname: employee.lastname,
                email: employee.email,
                phonenumber: employee.phonenumber,
                gender: employee.gender,
                servicesId: employee.servicesId,
                aboutself: employee.aboutself,
                expert: employee.expert,
                facebook: employee.facebook,
                instagram: employee.instagram,
                twitter: employee.twitter,
                dribble: employee.dribble,
                isVisibleInCalendar: employee.isVisibleInCalendar,
                isManager: employee.isManager,
                status: employee.status,
            }
        })
    }).catch(err=>{
        if (err.code === 11000) {
          // Duplicate key err
          res.status(400).json({ status: false, message: "Email already exists" });
        } else {
          res.status(500).json({ status: false, message: err.message });
        }
        res.status(500).json(err)
    }) 
  }
  
  
  // if(req.method === "DELETE") {
  //   Employees.deleteMany().exec()
  //   .then(docs=>{ 
  //       res.status(200).json({
  //           message:"Sub Category data updated",
  //           _id:req.params['id']
  //       }) 
  //   }).catch(err=>{ 
  //       res.status(500).json(err) 

  //   }) 
  // }

}