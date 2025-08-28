import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Employees } from "../../../core/model/employees";
import { Users } from "@/core/model/users";
import bcrypt from "bcryptjs";
import { Roles } from "../../../core/model/roles";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const searchQuery = req.query.search || "";
      const role = req.query.role || null;
      const roleId = req.query.roleId || null;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      

      const roles = roleId ? roleId : role ? await Roles.findOne({ rolesName: role }).select('_id').exec() : null;
      
      if(!req.query.page || !req.query.limit) {
        const result = await Employees.aggregate([
          ...(roles ? [ {$match: { roleId: new mongoose.Types.ObjectId(roles) }} ] : []),
          { $addFields: { employeeName: { $concat: ["$firstname", " ", "$lastname"] } } },
          { $project: { _id: 1, employeeName: 1, firstname: 1, lastname: 1, email: 1, phonenumber: 1, image: 1, status: 1, createdAt: 1, updatedAt: 1 } }
        ])
        res.status(200).json(result)
      }else {
        // Fetch total count WITHOUT lookup for performance
        const totalCountPromise = Employees.countDocuments();
        const dataPromise = Employees.aggregate([
        { $addFields: { employeeName: { $concat: [
          { $ifNull: ["$firstname", ""] },
          " ",
          { $ifNull: ["$lastname", ""] }
        ] } } },
        {
          $match: {
            $and: [
              { status: true }, // Ensure we only get active employees
              ...(roles ? [ { roleId: new mongoose.Types.ObjectId(roles) } ] : []),
            ],
            $or: [
              { employeeName: { $regex: searchQuery, $options: "i" } },
              { gender: { $regex: searchQuery, $options: "i" } },
              { email: { $regex: searchQuery, $options: "i" } },
              { phonenumber: { $regex: searchQuery, $options: "i" } },
            ]
          }
        },
        { $lookup: { from: "roles", localField: "roleId", foreignField: "_id", as: "roles" } },
        { $unwind: { path: "$roles", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, image: 1, employeeName: 1, firstname: 1, lastname: 1, 
          email: 1, password: 1, phonenumber: 1, gender: 1, servicesId: 1, defaultBranch: 1, 
          totalServices: {$size: "$servicesId"}, 
          // aboutself: 1, expert: 1, facebook: 1, instagram: 1, twitter: 1, dribble: 1, 
          isVisibleInCalendar: 1, isManager: 1, isSenior: 1, roleId: 1, role: "$roles.rolesName", 
          status: 1, createdAt: 1, updatedAt: 1 } },
          { $skip: skip },
          { $limit: limit }
        ])
        // Execute both queries in parallel
        const [totalCount, data] = await Promise.all([totalCountPromise, dataPromise]);
  
        res.status(200).json({
          data,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalRecords: totalCount
        }) 
      } 
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
      defaultBranch: req.body.defaultBranch,
      roleId: req.body.roleId,
      // aboutself: req.body.aboutself,
      // expert: req.body.expert,
      // facebook: req.body.facebook,
      // instagram: req.body.instagram,
      // twitter: req.body.twitter,
      // dribble: req.body.dribble,
      isVisibleInCalendar: req.body.isVisibleInCalendar,
      isManager: req.body.isManager,
      isSenior: req.body.isSenior,
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
                defaultBranch: employee.defaultBranch,
                // aboutself: employee.aboutself,
                // expert: employee.expert,
                // facebook: employee.facebook,
                // instagram: employee.instagram,
                // twitter: employee.twitter,
                // dribble: employee.dribble,
                isVisibleInCalendar: employee.isVisibleInCalendar,
                isManager: employee.isManager,
                isSenior: employee.isSenior,
                status: employee.status,
            }
        })
    }).catch(err=>{
        if (err.code === 11000) {
          // Duplicate key err
          res.status(400).json({ status: false, message: "Duplicate Email or Phone Number" });
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