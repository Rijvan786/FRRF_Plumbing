import UserModel from "../models/auth.model.js"
import ServiceModel from "../models/Service.model.js"
import TechnicianProfileModel from "../models/Technicianprofile.model.js"
import { uploadFile } from "../service/storage.service.js"



export async function   CreateServiceController(req,res){
    const {serviceName,category,currency,amount,EstimatedTimeMinutes} = req.body
   

    
          const images=await Promise.all(req.files.map(async(file)=>{
            return await uploadFile({
                buffer:file.buffer,
                fileName:file.originalname
            })
          }))
          console.log("Data of Services",serviceName,category,currency,amount,EstimatedTimeMinutes,images);
             
    const services=await ServiceModel.create({
       
            serviceName,
            category,
            price:{
                amount,
                currency        
            },
            serviceImg:images,
            EstimatedTimeMinutes:EstimatedTimeMinutes,
            
        }
)
console.log(services);

    res.status(201).json({
        message:"Service is created Successfully",
        services,
        visitCharge:services.visitCharge
    })
}

export async function  GetAllServicesController(req,res) {
     const services=await ServiceModel.find()

     res.status(200).json({
      message:"get All services Successfully",
      services
     })
}

export async function getTodaysRegisteredPlumbers (req, res) {  
  try {
    // 1. आज के दिन की शुरुआत का समय निकालें (Start of Today - 00:00:00)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 2. आज के दिन के ख़त्म होने का समय निकालें (End of Today - 23:59:59)
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 3. MongoDB Query: रेंज के अंदर खोजें
    const todaysPlumbers = await TechnicianProfileModel.find({
      createdAt: {
        $gte: startOfToday, // $gte = Greater Than or Equal To (इसके बराबर या इसके बाद)
        $lte: endOfToday    // $lte = Less Than or Equal To (इसके बराबर या इससे पहले)
      }
    }).populate('userId');

    res.status(200).json({
      success: true,
      count: todaysPlumbers.length,
      data: todaysPlumbers
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export async function  VerifyTechnicianController(req,res){
   const {email}=req.body
   const  user =await UserModel.find()

   if(user.role==="Technician"){
    await UserModel.findOneAndUpdate({email:email},
        {isVerifiedTech:true})
   }

    
}


