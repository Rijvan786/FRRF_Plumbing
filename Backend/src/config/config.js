import dotenv from "dotenv"
dotenv.config()


const {MONGO_URI,JWT_SECRET, NODE_ENV,GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,GOOGLE_REFRESH_TOKEN,
    EMAIL_USER,GOOGLE_CLIENT_ID2,GOOGLE_CLIENT_SECRET2,
    EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,EMAILJS_PUBLIC_KEY,EMAILJS_PRIVATE_KEY,
    IMAGE_KIT_API_KEY,FRONTEND_URL , RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
} = process.env

if(!MONGO_URI){
    throw new Error("MONGO_URI is not defined in the environment variables")
}

if(!JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in the environment variables")
}

if(!GOOGLE_CLIENT_ID){
    throw new Error("GOOGLE_CLIENT_ID is not defined in environment variable")
}

if(!GOOGLE_CLIENT_SECRET){
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in environment variable")
}

if(!GOOGLE_REFRESH_TOKEN){
    throw new Error("GOOGLE_REFRESH_TOKEN is not defined in environment variable")
}

if(!EMAIL_USER){
    throw new Error("EMAIL_USER Token is not defined in environment variable")
}

if(!GOOGLE_CLIENT_ID2){
    throw new Error ("EMAIL_USER Token is not define in environment variable")
}
if(!GOOGLE_CLIENT_ID2){
    throw new Error ("GOOGLE_CLIENT_ID2 Token is not define in environment variable")
}

if(!GOOGLE_CLIENT_SECRET2){
    throw new Error ("GOOGLE_CLIENT_SECRET2 Token is not define in environment variable")
}

if(!NODE_ENV){
    throw new Error ("NODE_ENV Token is not define in environment variable")
}
if(!EMAILJS_SERVICE_ID){
    throw new Error ("EMAILJS_SERVICE_ID Token is not define in environment variable")
}

if(!EMAILJS_TEMPLATE_ID){
    throw new Error ("EMAILJS_TEMPLATE_ID Token is not define in environment variable")
}
if(!EMAILJS_PUBLIC_KEY){
    throw new Error ("EMAILJS_PUBLIC_KEY Token is not define in environment variable")
}
if(!EMAILJS_PRIVATE_KEY){
    throw new Error ("EMAILJS_PRIVATE_KEY Token is not define in environment variable")
}

if(!IMAGE_KIT_API_KEY){
    throw new Error ("NODE_ENV Token is not define in environment variable")
}
if(!FRONTEND_URL){
    throw new Error ("FRONTEND_URL Token is not define in environment variable")
}
if(!RAZORPAY_KEY_ID){
     throw new Error ("RAZORPAY_KEY_ID Token is not define in environment variable")
}

if(!RAZORPAY_KEY_SECRET){
     throw new Error ("RAZORPAY_KEY_SECRET Token is not define in environment variable")
}

export const  Config ={
    MONGO_URI:MONGO_URI,

    JWT_SECRET:JWT_SECRET,

    NODE_ENV:NODE_ENV,

    GOOGLE_CLIENT_ID:GOOGLE_CLIENT_ID,

    GOOGLE_CLIENT_SECRET:GOOGLE_CLIENT_SECRET,

    GOOGLE_REFRESH_TOKEN:GOOGLE_REFRESH_TOKEN,

    EMAIL_USER:EMAIL_USER,
    
    GOOGLE_CLIENT_ID2:GOOGLE_CLIENT_ID2,

    GOOGLE_CLIENT_SECRET2:GOOGLE_CLIENT_SECRET2,

    EMAILJS_SERVICE_ID:EMAILJS_SERVICE_ID,

    EMAILJS_TEMPLATE_ID:EMAILJS_TEMPLATE_ID,
    
    EMAILJS_PUBLIC_KEY:EMAILJS_PUBLIC_KEY,

    EMAILJS_PRIVATE_KEY:EMAILJS_PRIVATE_KEY,

    IMAGE_KIT_API_KEY:IMAGE_KIT_API_KEY,

    FRONTEND_URL:FRONTEND_URL,

    RAZORPAY_KEY_ID:RAZORPAY_KEY_ID,

    RAZORPAY_KEY_SECRET:RAZORPAY_KEY_SECRET
}