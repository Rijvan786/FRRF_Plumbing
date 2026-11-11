import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { emitTechnicianLocation } from "../services/socket.api.jsx";
import { setMyLocation, setTrackingStatus } from "../state/technician.slice.jsx";

export function useLocationSender({ OrderId, startTracking }) {
  const dispatch = useDispatch();
  const watchIdRef = useRef(null);
  const isOnline = useSelector((state) => state.technician?.isOnline ?? true);

  useEffect(() => {
    if (!startTracking || !OrderId) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      dispatch(setTrackingStatus(false));
      return;
    }

    dispatch(setTrackingStatus(true));

    const sendCoords = (lat, lng) => {
      const latitude = Number(lat);
      const longitude = Number(lng);
      dispatch(setMyLocation({ latitude, longitude }));
      emitTechnicianLocation({
        OrderId,
        latitude,
        longitude,
        isOnline,
        status: "On-the-way",
      });
    };

    if ("geolocation" in navigator) {
      // 1. Immediate initial location push
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendCoords(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Immediate GPS note in useLocationSender:", err?.message || err);
          // Fallback simulation for local development / testing
          sendCoords(19.0820, 72.8820);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );

      // 2. Continuous real-time movement watcher
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          sendCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("GPS tracking warning in useLocationSender:", error?.message || error);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 2000 }
      );
    } else {
      // Browser does not support geolocation, fallback
      sendCoords(19.0820, 72.8820);
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      dispatch(setTrackingStatus(false));
    };
  }, [OrderId, startTracking, isOnline, dispatch]);
}

export default useLocationSender;
