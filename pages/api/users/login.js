import { connectDB } from "@/core/db";
import { Users } from "@/core/model/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Employees } from "../../../core/model/employees";


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
        
        try {
            const { email, password } = req.body;

            // Check if the user exists in Users or Employees collection
            let user = await Users.findOne({ email }).exec();
            let isEmployee = false;

            if (!user) {
                user = await Employees.findOne({ email }).exec();
                if (user) isEmployee = true;
            }

            // If no user or employee is found
            if (!user) {
                return res.status(401).json({
                    status: 0,
                    message: "Authentication Failed",
                });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    status: 0,
                    message: "Authentication Failed",
                });
            }

            // Generate JWT Token
            const token = jwt.sign({ email: user.email, id: user._id, role: isEmployee ? "employee" : "user" },
            process.env.NEXT_PUBLIC_JWT_SECRET, { expiresIn: "24h" } );

            res.status(200).json({
                status: 1,
                message: "Authentication Successful",
                token,
                data: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: isEmployee ? "employee" : "user",
                    token,
                },
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ status: 0, message: "Server Error", error });
        }


    }
    
}