import mongoose from "mongoose";
import { connectDB } from "@/core/db";
import { GlobalSettings } from "../../../core/model/global-settings";

export default async function handler(req, res) {
  await connectDB();
  
  if (req.method === "GET") {
    let settingType = req.query.settingType
    try {
      const result = await GlobalSettings.aggregate([
        { $match: {settingType} },
        { $project: { _id: 1, transferCommission: 1, personalBookingCommission: 1, seniorPremiumCommission: 1, createdAt: 1} },
      ])
      res.status(200).json(result)
      
    }catch(err) {
      res.status(500).json(err) 

    }    
  }

  if(req.method === "POST") {

    const {
      settingType,
      transferCommission,
      personalBookingCommission,
      seniorPremiumCommission
    } = req.body;
    
    let isExist = await GlobalSettings.findOne({ settingType }).exec();
    if (isExist) {
      // Update all matching entries
      const updateResult = await GlobalSettings.updateMany(
        { settingType },
        {
          transferCommission,
          personalBookingCommission,
          seniorPremiumCommission,
          updatedAt: new Date(),
        }
      );

      return res.status(200).json({
        message: `Updated ${updateResult.modifiedCount} setting(s) for type: ${settingType}`
      });
    }else {
      
      // Create new entry
      const newSetting = new GlobalSettings({
        _id: new mongoose.Types.ObjectId(),
        settingType,
        transferCommission,
        personalBookingCommission,
        seniorPremiumCommission,
      });

      await newSetting.save();
      return res.status(201).json({ message: "New setting created", data: newSetting });
    }

  }
  
  
  // if(req.method === "DELETE") {
  //   GlobalSettings.deleteMany().exec()
  //   .then(docs=>{ 
  //       res.status(200).json({
  //           message:"Category data updated",
  //           _id:req.params['id']
  //       }) 
  //   }).catch(err=>{ 
  //       res.status(500).json(err) 

  //   }) 
  // }

}