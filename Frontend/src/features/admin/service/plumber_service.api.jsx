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

export async function VerifyTechnician({ email }) {
  const response = await api.post("/verifyTechnician", { email });
  return response.data;
}

export default api;
