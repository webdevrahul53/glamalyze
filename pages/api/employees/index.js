import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Employees } from "../../../core/model/employees";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    
    try {
      let result = await Employees.aggregate([
        { $lookup: {
            from: "branches", // Name of the Categories collection in MongoDB
            localField: "branchId", // Field in SubCategories
            foreignField: "_id", // Matching field in Categories
            as: "branch", // Output field
          }, 
        },
        {
          $unwind: {
            path: "$branch",
            preserveNullAndEmptyArrays: true, // Keeps subcategories even if no matching category exists
          },
        },
        { $project: { _id: 1, image: 1, employeeName: {$concat: ["$firstname", " ", "$lastname"] }, firstname: 1, lastname: 1, 
          email: 1, phonenumber: 1, gender: 1, branchId: 1, branchName: "$branch.branchname", servicesId: 1, 
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
    const employee = new Employees({
      _id:new mongoose.Types.ObjectId(),
      image: req.body.image,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phonenumber: req.body.phonenumber,
      gender: req.body.gender,
      branchId: req.body.branchId,
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
                branchId: employee.branchId,
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
          res.status(400).json({ status: false, message: "Employee Name already exists" });
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