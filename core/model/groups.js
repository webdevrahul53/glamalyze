// import mongoose from "../db";
import mongoose from "mongoose";


const GroupsSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    groupname:{type:String,required:true, unique: true},
    branchId: {type: mongoose.Schema.Types.ObjectId, ref: "Branches"},
    employeesId:[{type:mongoose.Schema.Types.ObjectId, ref: "Employees"}],
    status:{type:Boolean,required:true},
},{ timestamps: true })

GroupsSchema.index({ groupname: 1 }, { unique: true });

export const Groups = mongoose.models.Groups || mongoose.model("Groups", GroupsSchema);