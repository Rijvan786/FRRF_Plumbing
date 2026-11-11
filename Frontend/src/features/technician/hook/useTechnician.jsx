import { useDispatch } from "react-redux";
import { setLoading as setAuthLoading, setUser } from "../../auth/state/auth.slice.jsx";
import { GetTechnician, TechRegister, AcceptJob, GetTechnicianNotifications } from "../services/technician.api.jsx";
import {
  setTechnician,
  setTechnicianProfile,
  setLoading as setTechLoading,
  setError as setTechError,
  setIsOnline,
  setIsAvailable,
  setNotifications,
  setNewJobOrderId,
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

  const handleToggleOnline = (status) => {
    dispatch(setIsOnline(status));
  };

  const handleToggleAvailability = (status) => {
    dispatch(setIsAvailable(status));
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

  return {
    handleTechRegister,
    handleGetTechnician,
    handleAcceptJob,
    handleToggleOnline,
    handleToggleAvailability,
    handleGetNotifications,
  };
}

export default useTechnician;
