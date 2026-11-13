import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket, joinTrackingRoom, leaveTrackingRoom } from "../service/track_socketio.api.js";
import {
  setTechnicianLocation,
  setCustomerLocation,
  setIsTechnicianOnline,
  setOrderStatus,
  setDistanceKm,
  setOrderData,
  setTrackLoading,
  setTrackError,
} from "../state/track.slice.jsx";
import { GetIdS } from "../../order/service/order.api.jsx";

// Standard Haversine distance calculator in KM
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  const numLat1 = Number(lat1);
  const numLon1 = Number(lon1);
  const numLat2 = Number(lat2);
  const numLon2 = Number(lon2);
  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null;

  const R = 6371; // Earth's radius in KM
  const dLat = ((numLat2 - numLat1) * Math.PI) / 180;
  const dLon = ((numLon2 - numLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((numLat1 * Math.PI) / 180) *
      Math.cos((numLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(2));
}

export const useTrackSocket = ({ OrderId }) => {
  const dispatch = useDispatch();
  const customerLocation = useSelector((state) => state.trackUser?.customerLocation);
  const customerLocationRef = useRef(customerLocation);

  useEffect(() => {
    customerLocationRef.current = customerLocation;
  },[customerLocation]);

  // 1. Fetch Order details from backend on mount & extract customer & technician location
  useEffect(() => {
    if (!OrderId) return;
    let isMounted = true;

    const fetchOrderDetails = async () => {
      try {
        dispatch(setTrackLoading(true));
        const res = await GetIdS({ OrderId });
        console.log("GetIdS response for tracking:", res);
        const order = res?.order || (res?._id ? res : null);
        const techProfile = res?.technicianProfile;

        if (order && isMounted) {
          dispatch(
            setOrderData({
              ...order,
              technicianProfile: techProfile || order?.technicianProfile,
            })
          );
          if (order.status) {
            dispatch(setOrderStatus(order.status));
          }

          // Extract Customer coordinates [longitude, latitude] from order.address.location
          const coords = order?.address?.location?.coordinates;
          if (Array.isArray(coords) && coords.length >= 2) {
            const custLoc = {
              longitude: Number(coords[0]),
              latitude: Number(coords[1]),
            };
            console.log(customerLocation,"");
            dispatch(setCustomerLocation(custLoc));
            customerLocationRef.current = custLoc;
          } else if (order?.address?.latitude && order?.address?.longitude) {
            const custLoc = {
              latitude: Number(order.address.latitude),
              longitude: Number(order.address.longitude),
            };
            console.log(customerLocation)
            dispatch(setCustomerLocation(custLoc));
            customerLocationRef.current = custLoc;
          }

          // Extract Technician coordinates if present in technicianProfile
          const tCoords = techProfile?.liveLocation?.coordinates;
          if (
            Array.isArray(tCoords) &&
            tCoords.length >= 2 &&
            (Number(tCoords[0]) !== 0 || Number(tCoords[1]) !== 0)
          ) {
            dispatch(
              setTechnicianLocation({
                longitude: Number(tCoords[0]),
                latitude: Number(tCoords[1]),
              })
            );
          }
        }
      } catch (err) {
        console.warn("fetchOrderDetails note in useTrackSocket:", err?.message || err);
        if (isMounted) {
          dispatch(setTrackError(err?.message || "Failed to load order for tracking"));
        }
      } finally {
        if (isMounted) {
          dispatch(setTrackLoading(false));
        }
      }
    };

    fetchOrderDetails();

    return () => {
      isMounted = false;
    };
  }, [OrderId, dispatch]);

  // 2. Real-time Live Tracking Socket Connection
  useEffect(() => {
    if (!OrderId) return;

    const socket = getSocket();
    joinTrackingRoom(OrderId);

    // Handler when technician transmits GPS location
    const handleReceiveLocation = (data) => {
      console.log("✅ Plumber location received via socket", data);
      if (data && data.latitude !== undefined && data.longitude !== undefined) {
        const techLoc = {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        };
        dispatch(setTechnicianLocation(techLoc));

        if (data.isOnline !== undefined) {
          dispatch(setIsTechnicianOnline(Boolean(data.isOnline)));
        }
        if (data.status) {
          dispatch(setOrderStatus(data.status));
        }

        // Calculate live KM distance if customer location is available
        const currentCust = customerLocationRef.current;
        if (currentCust?.latitude && currentCust?.longitude) {
          const dist = calculateDistanceKm(
            techLoc.latitude,
            techLoc.longitude,
            currentCust.latitude,
            currentCust.longitude
          );
          if (dist !== null) {
            dispatch(setDistanceKm(dist));
          }
        }
      }
    };

    // Handler for status updates
    const handleReceiveStatus = (data) => {
      console.log("⚡ Order status updated via socket:", data);
      if (data?.status) {
        dispatch(setOrderStatus(data.status));
      }
    };

    // Handler when plumber gets assigned to this order
    const handlePlumberAssigned = (updatedOrder) => {
      console.log("⚡ Plumber assigned on tracking room:", updatedOrder);
      if (updatedOrder) {
        dispatch(setOrderData(updatedOrder));
        if (updatedOrder.status) {
          dispatch(setOrderStatus(updatedOrder.status));
        }
      }
    };

    socket.on("receive-location", handleReceiveLocation);
    socket.on("receive-status", handleReceiveStatus);
    socket.on("plumber-assigned", handlePlumberAssigned);

    return () => {
      socket.off("receive-location", handleReceiveLocation);
      socket.off("receive-status", handleReceiveStatus);
      socket.off("plumber-assigned", handlePlumberAssigned);
      leaveTrackingRoom(OrderId);
    };
  }, [OrderId, dispatch]);
};

export default useTrackSocket;
