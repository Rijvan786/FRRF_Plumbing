import axios from "axios"
const api=axios.create({

baseURL: "https://frpf-plumbing.onrender.com/api/auth",
withCredentials:true
})

      
export async function Register({FullName,email,contact,city,
      isVerifiedTech,
      experienceYears,
      role,
      password,OrderId,AddressId}){
        
        const response=await api.post("/register",{
            FullName,email,contact,city,isVerifiedTech,experienceYears,role,password,OrderId,AddressId
        })

        return response.data
      }


export async function Login({FullName,email,  password,OrderId,AddressId}){
  
    const  response=await api.post("/login",{email, FullName, password,OrderId,AddressId})

    return response.data
}


export async function ResendMail({email}){
    
    const response=await api.post("/resend-verification",{email})

    return response.data
}

export async function ForgetMail({email}){

    const response=await api.post("/reset-password-mail",email)
     return response.data
}

export async function ForgetPassword({email,NewPassword}){
    
    const response=await api.patch("/reset-password",
        {email,NewPassword}
    )
   return response.data
}

export async function Logout(){
    const response=await api.get("/logout")

    return response
}

export async function GetMe(){
    const response=await api.get("/get-me")

    return response.data
}

export async function EditCustomerProfile(payload) {
    const response = await api.put("/edit-profile", payload);
    return response.data;
}

