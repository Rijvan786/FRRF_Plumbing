import { useDispatch } from "react-redux";
import { setLoading as setAuthLoading } from "../../auth/state/auth.slice";
import { CreateOrder, GetallServices, GetIdS, GetOrderDetail } from "../service/order.api";
import {
  setItem,
  setOrders,
  addOrder,
  setServices,
  setSelectedService,
  setLoading as setOrderLoading,
  setError as setOrderError,
  clearOrderError,
} from "../state/order.slice.jsx";

export function useOrder() {
  const dispatch = useDispatch();

  const handleGetOrder = async () => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(setOrderLoading(true));
      dispatch(clearOrderError());

      // Layer 4: Data Access via order.api.jsx
      const data = await GetOrderDetail();
      console.log("handleGetOrder response data:", data);

      const rawOrders =
        data?.order || data?.data?.order || (Array.isArray(data) ? data : []);
      if (Array.isArray(rawOrders)) {
        dispatch(setOrders(rawOrders));
      } else if (rawOrders) {
        dispatch(setOrders([rawOrders]));
      }

      return data;
    } catch (error) {
      console.error("Error in handleGetOrder in useOrder:", error);
      const msg =
        error?.response?.data?.message || error?.message || "Failed to fetch orders";
      dispatch(setOrderError(msg));
      throw error;
    } finally {
      dispatch(setAuthLoading(false));
      dispatch(setOrderLoading(false));
    }
  };

  const handleCreateOrder = async (formdata) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(setOrderLoading(true));
      dispatch(clearOrderError());

      const data = await CreateOrder(formdata);
      console.log("handleCreateOrder response:", data);

      const createdOrder =
        data?.order || data?.data?.order || (data?._id ? data : null);
      if (createdOrder) {
        dispatch(addOrder(createdOrder));
        dispatch(setItem(createdOrder));
      }

      return data;
    } catch (error) {
      console.error("Error in create order:", error);
      const msg =
        error?.response?.data?.message || error?.message || "Failed to create order";
      dispatch(setOrderError(msg));
      throw error;
    } finally {
      dispatch(setAuthLoading(false));
      dispatch(setOrderLoading(false));
    }
  };

  const handleGetallService = async () => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(setOrderLoading(true));
      dispatch(clearOrderError());

      const data = await GetallServices();
      const rawList =
        data?.services || (Array.isArray(data) ? data : data?.data?.services || []);

      if (Array.isArray(rawList)) {
        dispatch(setServices(rawList));
      }

      return data;
    } catch (error) {
      console.error("Error in handleGetallService in useOrder:", error);
      const msg =
        error?.response?.data?.message || error?.message || "Failed to fetch services";
      dispatch(setOrderError(msg));
      throw error;
    } finally {
      dispatch(setAuthLoading(false));
      dispatch(setOrderLoading(false));
    }
  };

  const handleGetIdS = async ({ OrderId }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(setOrderLoading(true));
      dispatch(clearOrderError());

      const data = await GetIdS({ OrderId });
      return data;
    } catch (error) {
      console.error("Error in handleGetIdS in useOrder:", error);
      const msg =
        error?.response?.data?.message || error?.message || "Failed to fetch order by ID";
      dispatch(setOrderError(msg));
      throw error;
    } finally {
      dispatch(setAuthLoading(false));
      dispatch(setOrderLoading(false));
    }
  };

  const handleSetSelectedService = (service) => {
    dispatch(setSelectedService(service));
  };

  return {
    handleGetOrder,
    handleCreateOrder,
    handleGetallService,
    handleSetSelectedService,
    handleGetIdS,
  };
}

export default useOrder;
        