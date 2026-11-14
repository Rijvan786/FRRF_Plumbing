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

export async function GetVerifiedTechniciansController(req, res) {  
  try {
   
    const VerifiedTechnician = await TechnicianProfileModel.find({
       isVerifiedTech: true
    }).populate('userId');

    res.status(200).json({
      success: true,
      count: VerifiedTechnician.length,
      data: VerifiedTechnician
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export async function GetUnVerifiedTechniciansController(req, res) {  
  try {
   
    const UnVerifiedTechnicians = await TechnicianProfileModel.find({
       isVerifiedTech: false
    }).populate('userId');

    res.status(200).json({
      success: true,
      count: UnVerifiedTechnicians.length,
      data: UnVerifiedTechnicians
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export async function EditServiceController(req,res){
  try{
      const {serviceName,category,currency,amount,EstimatedTimeMinutes,visitCharge} = req.body
    
   const serviceUpdate = {};
    
    // सिर्फ वही फील्ड्स अपडेट करें जो यूज़र ने भेजी हैं (Dynamic Update)
    if (serviceName) serviceUpdate.serviceName = serviceName;
    if (category) serviceUpdate.category = category;
    if (visitCharge) serviceUpdate.visitCharge = visitCharge;
    if (EstimatedTimeMinutes) serviceUpdate.EstimatedTimeMinutes = EstimatedTimeMinutes;
    
    // अगर amount या currency आई है, तो price अपडेट करें
    if (amount || currency) {
        serviceUpdate.price = {};
        if (amount) serviceUpdate.price.amount = amount;
        if (currency) serviceUpdate.price.currency = currency;
    }
      console.log(req.files);
    // 📸 Images को सुरक्षित तरीके से हैंडल करना
    // चेक करें कि req.files मौजूद है और उसमें कोई फाइल है या नहीं
    if (req.files && req.files.length > 0) {

        const images = await Promise.all(
            req.files.map(async (file) => {
                
              return await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
                });
                
                // डेटाबेस में सिर्फ URL सेव करें (या आपकी ज़रूरत के हिसाब से)
                
            }));
        
        serviceUpdate.serviceImg = images; // नई इमेजेज़ डेटाबेस में सेट कर दें
    }

    // डेटाबेस में अपडेट करना
    const service = await ServiceModel.findOneAndUpdate(
        { serviceName: serviceName }, 
        { $set: serviceUpdate },
        { new: true }
    );

    if (!service) {
        return res.status(404).json({ message: "Service not found!" });
    }
  res.status(200).json({
      message:"Service is updated Successfully",
      service
    })

  }
  catch(error){
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function  VerifyTechnicianController(req,res){
 try{
    const {technicianId}=req.body
 
   const updatedTechnician = await TechnicianProfileModel.findOneAndUpdate({_id:technicianId},
        {isVerifiedTech:true},
      {returnDocument:'after'})
   
   res.status(200).json({
    message:"Technician is verified Successfully",
    technician: updatedTechnician
   })
 }
 catch(error){
  res.status(500).json({ success: false, error: error.message });
 }
    
}

export async function  RemoveServiceController(req,res){
  try{
    const {serviceId}=req.body
    const removedService = await ServiceModel.findByIdAndDelete(serviceId);
    res.status(200).json({
      message:"Service is removed Successfully",
      service: removedService
    })
  }
  catch(error){
    clg("Error in RemoveServiceController:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

