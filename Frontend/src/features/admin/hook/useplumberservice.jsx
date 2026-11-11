import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../auth/state/auth.slice";
import {
  setServices,
  addService,
  updateService,
  removeService,
  setTodayTechnicians,
  addTodayTechnician,
  verifyTechnicianInState,
  setLoadingState,
  setErrorState,
} from "../state/plumer_service.slice.jsx";
import {
  CreateService,
  GetallServices,
  GetTodayRegisterTechnicians,
  VerifyTechnician,
} from "../service/plumber_service.api.jsx";

export function usepulmberService() {
  const dispatch = useDispatch();
  const [loadingAction, setLoadingAction] = useState(false);

  // Redux Selectors: Read stored data from Redux state
  const reduxServices = useSelector((state) => state.plumber_services?.services || []);
  const reduxTodayTechs = useSelector((state) => state.plumber_services?.todayTechnicians || []);
  const reduxLoading = useSelector((state) => state.plumber_services?.loading || false);
  const reduxError = useSelector((state) => state.plumber_services?.error || null);

  const handleCreateService = async (formData) => {
    try {
      dispatch(setLoading(true));
      dispatch(setLoadingState(true));
      setLoadingAction(true);

      const data = await CreateService(formData);

      // Store newly created service into Redux state
      const createdItem = data?.services || data?.service || data;
      if (createdItem && typeof createdItem === "object") {
        dispatch(addService(createdItem));
      }

      return data;
    } catch (error) {
      console.error("Error in handleCreateService:", error);
      dispatch(setErrorState(error?.message || "Failed to create service"));
      throw error;
    } finally {
      dispatch(setLoading(false));
      dispatch(setLoadingState(false));
      setLoadingAction(false);
    }
  };

  const handleGetallService = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setLoadingState(true));
      setLoadingAction(true);

      const data = await GetallServices();
      const rawList =
        data?.services || (Array.isArray(data) ? data : data?.data?.services || []);

      // Store all fetched services into Redux state
      if (Array.isArray(rawList)) {
        dispatch(setServices(rawList));
      }

      return data;
    } catch (error) {
      console.error("Error in handleGetallService:", error);
      dispatch(setErrorState(error?.message || "Failed to fetch services"));
      throw error;
    } finally {
      dispatch(setLoading(false));
      dispatch(setLoadingState(false));
      setLoadingAction(false);
    }
  };

  const handleGetTodayTechnicians = async () => {
    try {
      dispatch(setLoadingState(true));
      const data = await GetTodayRegisterTechnicians();
      const list =
        data?.data ||
        data?.todaysPlumbers ||
        data?.technicians ||
        (Array.isArray(data) ? data : []);

      // Store fetched technicians into Redux state
      if (Array.isArray(list)) {
        dispatch(setTodayTechnicians(list));
      }

      return data;
    } catch (error) {
      console.error("Error in handleGetTodayTechnicians:", error);
      return null;
    } finally {
      dispatch(setLoadingState(false));
    }
  };

  const handleVerifyTechnician = async ({ email }) => {
    try {
      const data = await VerifyTechnician({ email });

      // Update verification flag directly in Redux state
      dispatch(verifyTechnicianInState(email));

      return data;
    } catch (error) {
      console.error("Error in handleVerifyTechnician:", error);
      throw error;
    }
  };

  const handleUpdateService = (updatedItem) => {
    dispatch(updateService(updatedItem));
  };

  const handleRemoveService = (serviceId) => {
    dispatch(removeService(serviceId));
  };

  const handleAddTodayTechnician = (newTech) => {
    dispatch(addTodayTechnician(newTech));
  };

  return {
    handleCreateService,
    handleGetTodayTechnicians,
    handleVerifyTechnician,
    handleGetallService,
    handleUpdateService,
    handleRemoveService,
    handleAddTodayTechnician,
    loadingAction,
    services: reduxServices,
    todayTechnicians: reduxTodayTechs,
    reduxLoading,
    reduxError,
  };
}

export const usePlumberService = usepulmberService;
export default usepulmberService;
