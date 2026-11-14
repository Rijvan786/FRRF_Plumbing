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
  setVerifiedTechnicians,
  setUnVerifiedTechnicians,
} from "../state/plumer_service.slice.jsx";
import {
  CreateService,
  EditService,
  GetallServices,
  GetTodayRegisterTechnicians,
  GetUnVerifiedTechnicians,
  GetVerifiedTechnicians,
  RemoveService,
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
  const verifiedTechnicians = useSelector((state) => state.plumber_services?.VerifiedTechnicians || []);
  const unVerifiedTechnicians = useSelector((state) => state.plumber_services?.UnVerifiedTechnicians || []);

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

  const handleVerifyTechnician = async ({ technicianId }) => {
    try { 
      dispatch(setLoading(true))
      const data = await VerifyTechnician({ technicianId });

      // Update verification flag directly in Redux state
      dispatch(verifyTechnicianInState(technicianId));

      return data;
    } catch (error) {
      console.error("Error in handleVerifyTechnician:", error);
      throw error;
    }
    finally{
      dispatch(setLoading(false))
    }
  };

  /**
   * handleUpdateService
   * @param {Object} updatedItem  — plain object with service fields to update
   * @param {File|File[]|null} imageFiles — optional new image(s) to upload
   *
   * If imageFiles is provided the payload is sent as multipart/form-data so the
   * backend can process the file upload (multer / cloudinary / etc.).
   * Otherwise a regular JSON PUT is sent.
   */
  const handleUpdateService = async ({ updateItem, editImageFiles }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setLoadingState(true));
      setLoadingAction(true);

      const serviceName = updateItem?.serviceName || updateItem?.name;
      const category = updateItem?.category || "General";
      const currency = updateItem?.currency || "INR";
      const amount =
        typeof updateItem?.price === "object" && updateItem?.price !== null
          ? updateItem?.price?.amount
          : updateItem?.amount || updateItem?.price || 0;
      const EstimatedTimeMinutes =
        updateItem?.EstimatedTimeMinutes || updateItem?.estimatedMinutes || 45;
      const description = updateItem?.description || "";
      const visitCharge = updateItem?.visitCharge || 0;

      const   baseJsonPayload = {
        _id: updateItem?._id || updateItem?.id,
        serviceName,
        category,
        currency,
        amount: Number(amount),
        price: { amount: Number(amount), currency },
        EstimatedTimeMinutes: Number(EstimatedTimeMinutes),
        description,
        visitCharge,
      };

      let data;

      if (editImageFiles) {
        try {
          const formdata = new FormData();
          formdata.append("serviceName", serviceName);
          formdata.append("category", category);
          formdata.append("currency", currency);
          formdata.append("amount", amount);
          formdata.append("EstimatedTimeMinutes", EstimatedTimeMinutes);
          formdata.append("description", description);
          if (visitCharge) formdata.append("visitCharge", visitCharge);
          if (updateItem?._id) formdata.append("_id", updateItem._id);

          const files = Array.isArray(editImageFiles) ? editImageFiles : [editImageFiles];
          files.forEach((file) => {
            if (file instanceof File) {
              formdata.append('Images', file);
          
            }
          });

          data = await EditService(formdata);
        } catch (imgErr) {
          console.warn("Multipart image edit failed, falling back to JSON edit:", imgErr);
          data = await EditService(baseJsonPayload);
        }
      } else {
        data = await EditService(baseJsonPayload);
      }

      // Update service in Redux
      const updatedData = data?.service || data?.data || data || baseJsonPayload;
      if (updatedData && typeof updatedData === "object") {
        dispatch(updateService(updatedData));
      }

      return data;
    } catch (error) {
      console.error("Error in handleUpdateService:", error);
      dispatch(setErrorState(error?.message || "Failed to update service"));
      throw error;
    } finally {
      dispatch(setLoading(false));
      dispatch(setLoadingState(false));
      setLoadingAction(false);
    }
  };
// Not working
  const handleRemoveService =async ({ serviceId }) => {
   try{
    dispatch(setLoading(true));
    const data=await RemoveService({ serviceId });
    dispatch(removeService(serviceId));
    return data;
   }catch(error){
    console.error("Error in handleRemoveService:", error);
    dispatch(setErrorState(error?.message || "Failed to remove service"));
    throw error;
   }finally{
    dispatch(setLoading(false));
  }
  };

  const handleGetVerifiedTechnician = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setLoadingState(true));
      setLoadingAction(true);

      const data = await GetVerifiedTechnicians();
      const list =
        data?.data ||
        data?.VerifiedTechnicians ||
        data?.VerifiedTechnician ||
        data?.verifiedTechnicians ||
        (Array.isArray(data) ? data : []);
      dispatch(setVerifiedTechnicians(list));
      return data;
    } catch (error) {
      console.error("Error in handleGetVerifiedTechnician:", error);
      dispatch(setErrorState(error?.message || "Failed to fetch verified technicians"));
      throw error;
    } finally {
      dispatch(setLoading(false));
      dispatch(setLoadingState(false));
      setLoadingAction(false);
    }
  };

  const handleGetUnVerifiedTechnician = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setLoadingState(true));
      setLoadingAction(true);

      const data = await GetUnVerifiedTechnicians();
      const list =
        data?.data ||
        data?.UnVerifiedTechnicians ||
        data?.unVerifiedTechnicians ||
        (Array.isArray(data) ? data : []);
      dispatch(setUnVerifiedTechnicians(list));
      return data;
    } catch (error) {
      console.error("Error in handleGetUnVerifiedTechnician:", error);
      dispatch(setErrorState(error?.message || "Failed to fetch unverified technicians"));
      throw error;
    } finally {
      dispatch(setLoading(false));
      dispatch(setLoadingState(false));
      setLoadingAction(false);
    }
  };

  return {
    handleCreateService,
    handleGetVerifiedTechnician,
    handleGetUnVerifiedTechnician,
    handleGetallService,
    handleUpdateService,
    handleRemoveService,
    handleVerifyTechnician,
    loadingAction,
    services: reduxServices,
    todayTechnicians: reduxTodayTechs,
    verifiedTechnicians,
    unVerifiedTechnicians,
    reduxLoading,
    reduxError,
  };
}

export const usePlumberService = usepulmberService;
export default usepulmberService;
