import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSocket } from "../service/socket.api";
import { setItem } from "../state/order.slice";

export function useListenPlumber({ userId }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;
    const socket = getSocket();

    socket.emit("join-my-room", userId.toString());
    console.log(`👤 Customer listening on personal room: ${userId}`);

    const handleAssigned = (updatedOrderData) => {
      console.log("⚡ Plumber assigned to order via socket:", updatedOrderData);
      dispatch(setItem(updatedOrderData));
    };

    socket.on("plumber-assigned", handleAssigned);

    return () => {
      socket.off("plumber-assigned", handleAssigned);
    };
  }, [userId, dispatch]);
}

export default useListenPlumber;
