import axios from "axios";

const api = axios.create({
  baseURL: "https://frpf-plumbing.onrender.com/api/technician",
  withCredentials: true,
});

export async function TechRegister({
  FullName,
  email,
  contact,
  password,
  role,
  experienceYears,
  street,
  city,
  pin_code,
  longitude,
  latitude,
}) {
  const response = await api.post("/technicianRegister", {
    FullName,
    email,
    contact,
    password,
    role,
    experienceYears,
    street,
    city,
    pin_code,
    longitude,
    latitude,
  });
  return response.data;
}

export async function GetTechnician() {
  const response = await api.get("/getTechnician");
  
  return response.data;
}

export async function AcceptJob({ OrderId, technicianId }) {
  const response = await api.post("/acceptJob", { OrderId, technicianId });
  return response.data;
}


export async function   GetTechnicianNotifications() {
  const response = await api.get("/notifications");
  return response.data;
}
export async function GetIdS({OrderId}){
     const response=await api.get(`/${OrderId}`)
     return response.data   
}

export const GetPaymentDetail = async (OrderId) => {
  const response = await api.get(`/payment-detail/${OrderId}`);
  return response.data;
};

export async function VerifyPlumberWork(payload) {
  const isFormData = payload instanceof FormData;
  const response = await api.post("/verify-plumber-work", payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
}

export async function ToggleOnlineStatus({ isOnline }) {
  const response = await api.patch('/toggle-online', { isOnline });
  return response.data;
}

export async function EditTechnicianProfile(payload) {
  const response = await api.put('/edit-profile', payload);
  return response.data;
}

