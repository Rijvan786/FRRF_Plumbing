import { useDispatch } from "react-redux";
import { setLoading as setAuthLoading, setUser } from "../../auth/state/auth.slice.jsx";
import { GetTechnician, TechRegister, AcceptJob, GetTechnicianNotifications,
   CreateOrderPayment, VerifyOrder, GetPaymentDetail, ToggleOnlineStatus, EditTechnicianProfile,
 } from "../services/technician.api.jsx";
import {
  setTechnician,
  setTechnicianProfile,
  setLoading as setTechLoading,
  setError as setTechError,
  setIsOnline,
  setIsAvailable,
  setNotifications,
  setNewJobOrderId,
  setPaymentDetail,
} from "../state/technician.slice.jsx";
export function useTechnician() {
  const dispatch = useDispatch();

  const handleTechRegister = async ({
    FullName,
    email,
    contact,
    password,
    role = "technician",
    experienceYears,
    street,
    city,
    pin_code,
    longitude,
    latitude,
  }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(setTechLoading(true));

      const data = await TechRegister({
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

      console.log("Technician registered successfully:", data);

      if (data?.user) {
        dispatch(setUser(data.user));
        dispatch(setTechnician(data.user));
      }
      if (data?.TechnicianProfile) {
        dispatch(setTechnicianProfile(data.TechnicianProfile));
      }

      return data;
    } catch (error) {
      console.error("Error in handleTechRegister in useTechnician:", error);
      dispatch(setTechError(error?.response?.data?.message || error?.message));
      throw error;
    } finally {
      dispatch(setAuthLoading(false));
      dispatch(setTechLoading(false));
    }
  };

  const handleGetTechnician = async () => {
    try {
      dispatch(setTechLoading(true));

      const data = await GetTechnician();
      const techData = data?.TechnicianData;

      if (techData) {
        dispatch(setTechnician(techData));
        dispatch(setTechnicianProfile(techData));
        if (techData.isOnline !== undefined) {
          dispatch(setIsOnline(techData.isOnline));
        }
        if (techData.isAvailable !== undefined) {
          dispatch(setIsAvailable(techData.isAvailable));
        }
        if (techData.userId && typeof techData.userId === "object") {
          dispatch(setUser(techData.userId));
        }
      }

      return techData;
    } catch (error) {
      console.error("Error in handleGetTechnician in useTechnician:", error);
      dispatch(setTechError(error?.response?.data?.message || error?.message));
      return null;
    } finally {
      dispatch(setTechLoading(false));
    }
  };

  const handleAcceptJob = async ({ OrderId, technicianId }) => {
    try {
      dispatch(setTechLoading(true));
      const result = await AcceptJob({ OrderId, technicianId });
      return result;
    } catch (error) {
      console.error("Error in handleAcceptJob in useTechnician:", error);
      dispatch(setTechError(error?.response?.data?.message || error?.message));
      throw error;
    } finally {
      dispatch(setTechLoading(false));
    }
  };


   const handleGetNotifications = async () => {
    try {
      const data = await GetTechnicianNotifications();
      if (data?.notifications && Array.isArray(data.notifications)) {
        dispatch(setNotifications(data.notifications));
        if (data.notifications[0]?.orderId) {
          dispatch(setNewJobOrderId(data.notifications[0].orderId));
        }
        return data.notifications;
      }
      return [];
    } catch (error) {
      console.warn("handleGetNotifications note:", error?.message || error);
      return [];
    }
  };

  const handleCreateOrderPayment=async({accordingToWork,amount,PaymentType,currency,OrderId})=>{
      try{
        const data=await CreateOrderPayment({accordingToWork,amount,PaymentType,currency,OrderId})
        return data
      }
      catch(error){
        console.error("Error in handleCreateOrderPayment in useTechnician:", error);
        throw error;
      }
  }
  const handleVerifyOrder = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, OrderId }) => {
    try {
      const data = await VerifyOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature, OrderId });
      return data;
    } catch (error) {
      console.error("Error in handleVerifyOrder in useTechnician:", error);
      throw error;
    }
  };

  const handleGetPaymentDetail = async (OrderId) => {
    try {
      dispatch(setTechLoading(true));
      const data = await GetPaymentDetail(OrderId);
      if (data) {
        dispatch(setPaymentDetail(data));
      }
      return data;
    } catch (error) {
      console.error("Error in handleGetPaymentDetail in useTechnician:", error);
      dispatch(setTechError(error?.response?.data?.message || error?.message));
      throw error;
    } finally {
      dispatch(setTechLoading(false));
    }
  };

  const handleToggleOnline = async (status) => {
    try {
      dispatch(setTechLoading(true));
      const data = await ToggleOnlineStatus({ isOnline: status });
      if (data?.isOnline !== undefined) {
        dispatch(setIsOnline(data.isOnline));
      }
      if (data?.technician) {
        dispatch(setTechnicianProfile(data.technician));
        dispatch(setTechnician(data.technician));
      }
      return data;
    } catch (error) {
      console.error('Error in handleToggleOnline in useTechnician:', error);
      dispatch(setTechError(error?.response?.data?.message || error?.message));
      throw error;
    } finally {
      dispatch(setTechLoading(false));
    }
  };

  const handleToggleAvailability = (status) => {
    dispatch(setIsAvailable(status));
  };

  // Edit Technician Profile (API call)
  const handleEditProfile = async (payload) => {
    try {
      dispatch(setTechLoading(true));
      const data = await EditTechnicianProfile(payload);
      // Update Redux with new profile data
      if (data?.technician) {
        dispatch(setTechnician(data.technician));
        dispatch(setTechnicianProfile(data.technician));
        if (data.technician.userId && typeof data.technician.userId === 'object') {
          dispatch(setUser(data.technician.userId));
        }
      }
      return data;
    } catch (error) {
      console.error('Error in handleEditProfile in useTechnician:', error);
      dispatch(setTechError(error?.response?.data?.message || error?.message));
      throw error;
    } finally {
      dispatch(setTechLoading(false));
    }
  };

  return {
    handleTechRegister,
    handleGetTechnician,
    handleAcceptJob,
    handleToggleOnline,
    handleToggleAvailability,
    handleGetNotifications,
    handleCreateOrderPayment,
    handleVerifyOrder,
    handleGetPaymentDetail,
    handleEditProfile,
  };
}

export default useTechnician;
