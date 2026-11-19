import { useDispatch } from "react-redux";
import { setLoading as setAuthLoading, setUser } from "../../auth/state/auth.slice.jsx";
import { GetTechnician, TechRegister, AcceptJob, GetTechnicianNotifications, ToggleOnlineStatus, EditTechnicianProfile,
   VerifyPlumberWork,
   GetPaymentDetail,
   GetIdS,
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
  dismissNotification,
  setLoading,
  setPaymentDetail,
  setError,
  setCurrentOrder,
  setVerifiedWork,
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
      const data = await AcceptJob({ OrderId, technicianId });
      return data;
    } catch (error) {
      console.error("Error in handleAcceptJob in useTechnician:", error);
      const errMsg = error?.response?.data?.message || error?.message || "";
      const isAlreadyAccepted =
        Boolean(error?.response?.data?.alreadyAccepted) ||
        errMsg.toLowerCase().includes("already") ||
        errMsg.toLowerCase().includes("taken");

      if (isAlreadyAccepted && OrderId) {
        // 🚀 If already accepted by another technician, remove it so it does not show for this technician!
        dispatch(dismissNotification(OrderId.toString()));
      }

      dispatch(setTechError(errMsg));
      const enrichedErr = new Error(errMsg);
      enrichedErr.alreadyAccepted = isAlreadyAccepted;
      enrichedErr.response = error?.response;
      throw enrichedErr;
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

  const handleGetIdS = async ({ OrderId }) => {
    try {
      dispatch(setTechLoading(true));
      const data = await GetIdS({ OrderId });
      if (data?.order) {
        dispatch(setCurrentOrder(data.order));
      } else if (data) {
        dispatch(setCurrentOrder(data));
      }
      return data;
    } catch (error) {
      console.error("Error in handleGetIdS in useTechnician:", error);
      const msg = error?.response?.data?.message || error?.message || "Failed to fetch order by ID";
      dispatch(setTechError(msg));
      throw error;
    } finally {
      dispatch(setTechLoading(false));
    }
  };
  
  const handleGetPaymentDetail = async (OrderId) => {
    try {
      dispatch(setTechLoading(true));
      const data = await GetPaymentDetail(OrderId);
      console.log("handleGetPaymentDetail data:", data);
      if (data?.payment) {
        dispatch(setPaymentDetail(data.payment));
      } else if (data) {
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

  const handleVerifiedPlumberWork = async (formData) => {
    try {
      dispatch(setTechLoading(true));
      const data = await VerifyPlumberWork(formData);
      if (data) {
        dispatch(setVerifiedWork(data));
        if (data?.order) {
          dispatch(setCurrentOrder(data.order));
        }
      }
      return data;
    } catch (error) {
      console.error("Error in handleVerifiedPlumberWork in useTechnician:", error);
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
    handleEditProfile,
     handleGetIdS, 
     handleGetPaymentDetail,
   handleVerifiedPlumberWork
  };
}

export default useTechnician;
