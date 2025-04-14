import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { Branches } from "../../../core/model/branches";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    try {
      const searchQuery = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if(!req.query.page || !req.query.limit) {
        const result = await Branches.aggregate([
          { $project: { _id: 1, image: 1, branchname: 1} }
        ])
        res.status(200).json(result)
      }else {
        const totalCountPromise = Branches.countDocuments();
        const dataPromise = Branches.aggregate([
          { 
            $match: { $or: [
              { branchname: { $regex: searchQuery, $options: "i" } },
              { city: { $regex: searchQuery, $options: "i" } }
            ]}
          },
          { $lookup: { from: "employees", localField: "managerId", foreignField: "_id", as: "manager", },  },
          { $lookup: { from: "groups", localField: "groups", foreignField: "_id", as: "groups", },  },
          { $lookup: { from: "employees", localField: "groups.employeesId", foreignField: "_id", as: "groupEmployees" } },
          { $unwind: { path: "$manager", preserveNullAndEmptyArrays: true, }, },
          { $project: { _id: 1, image: 1, branchname:1, gender: 1, manager: 1, groupEmployees: 1,
            managerId: 1,servicesId: 1, contactnumber: 1, email: 1, address: 1, landmark: 1, country: 1, city: 1, state: 1, 
            postalcode:1, latitude: 1, longitude: 1, openingAt: 1, closingAt: 1, colorcode: 1, paymentmethods: 1, description: 1, status: 1, createdAt: 1, updatedAt: 1 } },
            
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
  
  // if(req.method === "PUT"){
  //   const serviceIds = req.body.serviceIds.map(id => new mongoose.Types.ObjectId(id)) || [];
  //   try {
  //     let result = await Branches.aggregate([
  //       { $lookup: { from: "groups", localField: "groups", foreignField: "_id", as: "groups", },  },
  //       { $lookup: { from: "employees", localField: "groups.employeesId", foreignField: "_id", as: "groupEmployees" } },
  //       { $lookup: { from: "appointments", localField: "groupEmployees._id", foreignField: "employeeId", as: "appointments" } },
  //       { $match: { "groupEmployees": { $elemMatch: { servicesId: { $all: serviceIds } } } } },
  //       {
  //         $addFields: {
  //           groupEmployees: {
  //             $filter: { input: "$groupEmployees", as: "employee", cond: { $setIsSubset: [serviceIds, "$$employee.servicesId"] } }
  //           }
  //         }
  //       },
  //       {
  //         $addFields: { groupEmployees: { $map: {
  //           input: "$groupEmployees",
  //           as: "employee", in: { $mergeObjects: [ "$$employee", { appointments: { $filter: {
  //               input: "$appointments", as: "appointment", cond: { $eq: ["$$appointment.employeeId", "$$employee._id"] }
  //             }}}]
  //           }
  //         }}}
  //       },
  //       { $project: {  _id: 1, branchname: 1, image: 1, groupEmployees: 1, status: 1, createdAt: 1, updatedAt: 1 } },
  //     ])
  //     res.status(200).json(result) 
  //   }catch(err) {
  //     console.log(err)
  //     res.status(500).json(err) 

  //   }  
  // }

  if(req.method === "POST") {
    const branch = new Branches({
      _id:new mongoose.Types.ObjectId(),
      image: req.body.image,
      branchname: req.body.branchname,
      gender: req.body.gender,
      managerId: req.body.managerId,
      servicesId: req.body.servicesId,
      contactnumber: req.body.contactnumber,
      email: req.body.email,
      address: req.body.address,
      landmark: req.body.landmark,
      country: req.body.country,
      city: req.body.city,
      state: req.body.state,
      postalcode: req.body.postalcode,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      openingAt: req.body.openingAt,
      closingAt: req.body.closingAt,
      colorcode: req.body.colorcode,
      paymentmethods: req.body.paymentmethods,
      description: req.body.description,
      status: req.body.status
    })
    branch.save().then(()=>{ 
        res.status(200).json({
            message:'New branch added',
            status: 1,
            branch:{
                _id:branch._id, 
                image: branch.image,
                branchname: branch.branchname,
                gender: branch.gender,
                managerId: branch.managerId,
                servicesId: branch.servicesId,
                contactnumber: branch.contactnumber,
                email: branch.email,
                address: branch.address,
                landmark: branch.landmark,
                country: branch.country,
                city: branch.city,
                state: branch.state,
                postalcode: branch.postalcode,
                latitude: branch.latitude,
                longitude: branch.longitude,
                openingAt: branch.openingAt,
                closingAt: branch.closingAt,
                colorcode: branch.colorcode,
                paymentmethods: branch.paymentmethods,
                description: branch.description,
                status: branch.status
            }
        })
    }).catch(err=>{
        if (err.code === 11000) {
          // Duplicate key err
          res.status(400).json({ status: false, message: "Branch Name already exists" });
        } else {
          res.status(500).json({ status: false, message: err.message });
        }
        res.status(500).json(err)
    }) 
  }
  
  
  // if(req.method === "DELETE") {
  //   Branches.deleteMany().exec()
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