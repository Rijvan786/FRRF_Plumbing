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

export async function GetTechnicianNotifications() {
  const response = await api.get("/notifications");
  return response.data;
}
