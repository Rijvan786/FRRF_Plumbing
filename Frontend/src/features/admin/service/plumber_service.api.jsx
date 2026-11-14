import axios from "axios";

const API_URL = "https://frpf-plumbing.onrender.com/api/admin";
const api=axios.create({
    baseURL:API_URL,
    withCredentials:true
})  

export async function CreateService(formData) {
  // If payload is FormData, axios handles multipart headers
  console.log(formData);
  const response = await api.post("/createService", formData);
  return response.data;
}

export async function GetallServices(){
  const response = await api.get("/GetallServices");
  return response.data || response;
}
export async function GetTodayRegisterTechnicians() {
  const response = await api.get("/getTodayRegisterTechnicians");
  return response.data;
}

export async function VerifyTechnician({ technicianId }) {
  const response = await api.patch("/verifyTechnician", { technicianId });
  return response.data;
}

export async function GetVerifiedTechnicians(){
  const response=await api.get("/getVerifiedTechnicians");
  return response.data
}

export async function GetUnVerifiedTechnicians(){
  const response=await api.get("/getUnVerifiedTechnicians");
  return response.data
}

export async function   EditService(payload) {
  // Backend route is PUT /EditService (without /:id in the URL)
  const isFormData = payload instanceof FormData;
  const response = await api.put("/EditService", payload, {
    headers: isFormData
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" },
  });
  return response.data;
}
export async function RemoveService({ serviceId }) {
  const response = await api.delete("/RemoveService", { data: { serviceId } });
  return response.data;
}


export default api;
