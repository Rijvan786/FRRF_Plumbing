import { configureStore } from "@reduxjs/toolkit";
import trackUser from "../features/socketio/state/track.slice.jsx";
import authReducer from "../features/auth/state/auth.slice.jsx";
import orderReducer from "../features/order/state/order.slice.jsx";
import plumberServiceReducer from "../features/admin/state/plumer_service.slice.jsx";
import technician from "../features/technician/state/technician.slice.jsx"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    order: orderReducer,
    plumber_services: plumberServiceReducer,
    trackUser: trackUser,
    technician:technician
  },
});
