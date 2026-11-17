import axios from "axios";

const api = axios.create({
    baseURL: "https://frpf-plumbing.onrender.com/api/order",
    withCredentials: true
});

export async function CreateOrder(payload) {
    const formData = payload instanceof FormData 
        ? payload 
        : (payload?.formdata || payload?.formData || payload);

    const response = await api.post("/CreateOrder", formData,       {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
}

export async function GetOrderDetail() {
    const response = await api.get("/GetOrderDetail");
    return response.data;
}
export async function GetallServices(){
  const response = await api.get("/GetallServices");
 
  return response.data || response;
}

export async function GetIdS({OrderId}){
     const response=await api.get(`/${OrderId}`)
     return response.data   
}

export async function CreateOrderPayment({ accordingToWork, amount, PaymentType, currency, OrderId }) {
  const response = await api.post("/CreateOrderPayment", {
    accordingToWork,
    amount,
    PaymentType,
    currency,
    OrderId,
  });
  return response.data;
}

export const VerifyOrder = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, OrderId }) => {
  const response = await api.post("/VerifyOrder", {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    OrderId,
  });
  return response.data;
};

export const GetPaymentDetail = async (OrderId) => {
  const response = await api.get(`/payment-detail/${OrderId}`);
  return response.data;
};