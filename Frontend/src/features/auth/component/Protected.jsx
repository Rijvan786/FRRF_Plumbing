import React, { useEffect } from 'react'
import { useAuth } from '../hook/useAuth'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Protected = ({children}) => {
const {handleGetME} =useAuth()
const navigate=useNavigate()
const user=useSelector(state=>state.auth.User)

    useEffect(()=>{
       async function fetch(){

        const User=await handleGetME()

       if(User?.role ==="technician"){
        // navigate("/technician/TechnicianNotification")
        
       }

       if(User?.role ==="admin"){
        navigate("/admin/Admin-Dashboard")
        return;
       }

      if(!User){
        navigate("/customer/login")
       }
        }
       
        fetch()

    },[])
  return  children
}

export default Protected
