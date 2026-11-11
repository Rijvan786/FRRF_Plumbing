
import {useDispatch}  from "react-redux"
import { setError, setLoading, setUser } from "../state/auth.slice"
import { ForgetMail, ForgetPassword, GetMe, Login, Logout, Register, ResendMail } from "../service/auth.api.jsx"
import { useEffect } from "react"

export  function useAuth(){

    const dispatch=useDispatch()

const handleRegister=async({FullName,email,contact, isVerifiedTech,experienceYears,
     role,password,OrderId,AddressId})=>{


    try {

        dispatch(setLoading(true))

        const data=await Register({FullName,email,contact,isVerifiedTech,
            experienceYears,role,password,OrderId,AddressId})
        console.log(data);
        dispatch(setUser(data.user))

        
        return data;
    } catch (error) {
          console.log(`Error in handleRegister in useAuth, ${error}`);
       
        throw error;
    }
    finally{
        dispatch(setLoading(false))
    }

}


const handleLogin=async({FullName,email,password,OrderId,AddressId})=>{


    try {

        dispatch(setLoading(true))

        const data=await Login({FullName,email,password,OrderId,AddressId})
        console.log(data);
        dispatch(setUser(data.user))
        return data;
    } catch (error) {
          console.log(`Error in handleLogin in useAuth, ${error}`);
     
        throw error;
    }
finally{
    dispatch(setLoading(false))
}
}


const handleResendMail=async({email})=>{


    try {

        dispatch(setLoading(true))

        const data=await ResendMail({email})
        console.log(data);
        dispatch(setUser(data.user))
    } catch (error) {
          console.log(`Error in handleResendMail in useAuth, ${error}`);
     
    }
finally{
    dispatch(setLoading(false))
}
}


const handleForgetMail=async({email})=>{


    try {

        dispatch(setLoading(true))

        const data=await ForgetMail({email})
        console.log(data);
        dispatch(setUser(data.user))
    } catch (error) {
          console.log(`Error in handleForgetMail in useAuth, ${error}`);
       
    }
finally{
    dispatch(setLoading(false))
}
}


const handleForgetPassword=async function ({email,NewPassword}){
    
    try {
        dispatch(setLoading(true))
        
        const data=await ForgetPassword({email,NewPassword})

        dispatch(setUser(data.user))
    } catch (error) {
        
        console.log(`Error in handleForgetPassword ${error}`);
    
    }finally{
        dispatch(setLoading(false))
    }
}

const handleLogout=async()=>{


    try {

        dispatch(setLoading(true))
           const data =await Logout()
 
       dispatch(setUser(null))

    
    } catch (error) {
        
        console.log(`Error in handleLogout in useAuth ${error}`);
    }
finally{
    dispatch(setLoading(false))
}

}

const handleGetME=async ()=>{

    try {
        dispatch(setLoading(true))
        const data=await GetMe() 
          dispatch(setUser(data.user))
          return data.user
      
    } catch (error) {
        
        console.log(`Error in handleGetMe in useAuth ${error}`);


           
    }
    finally{
    dispatch(setLoading(false))
    }
}


return   {
           handleRegister,
          handleLogin,
          handleResendMail,
          handleForgetMail,
          handleForgetPassword,
          handleLogout,
          handleGetME

}
}