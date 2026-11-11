import jwt from "jsonwebtoken";
import BlackListModel from "../models/Blacklist.model.js";
import { Config } from "../config/config.js";


// Authenticate User
export async function AuthenticateUser(req,res,next){
    try {
        const token= req.cookies.token
        
        if(!token){
            return res.status(404).json({
                message:"User is not provided token"
            })
        }
            const BlacklistModel=await BlackListModel.findOne({token:token})

            if(BlacklistModel){
                return res.status(401).json({
                    message:"Token is Blacklisted"
                })
            }

            const decoded=jwt.verify(token,Config.JWT_SECRET)
            req.user=decoded
           next()
        


    } catch (err) {
 console.log(err);
        return res.status(401).json({
            message:"Invalid Token",err
        })

        
    }
}


// Authenticate Technician
export async function AuthenticateTechnician(req,res,next){
        try {
        const token= req.cookies.token
     
        if(!token){
            return res.status(404).json({
                message:"User is not provided token"
            })
        }
        

            const decoded=jwt.verify(token,Config.JWT_SECRET)
            req.user=decoded
          if(req.user.role !== "technician"){
            return res.status(400).json({
                  message:"Access Denied Bad Request"
            })
          }
    
        
   next()

    } catch (err) {
 
        return res.status(401).json({
            message:"Invalid Token",err
        })

        
    }
}


// Authenticate Admin
export async function AuthenticateAdmin(req,res,next){
         try {
        const token= req.cookies.token
       
        if(!token){
            return res.status(404).json({
                message:"User is not provided token"
            })
        }
            

            const decoded=jwt.verify(token,Config.JWT_SECRET)
            req.user=decoded
            console.log(req.user,"Hey");
       
       if(req.user.role !== "admin"){
        return res.status(400).json({
            message:"Bad request Access denied"
        })
       }
       
            next()
        


    } catch (err) {
 
        return res.status(401).json({
            message:"Invalid Token",
            error:err.message
        })

        
    } 
}



