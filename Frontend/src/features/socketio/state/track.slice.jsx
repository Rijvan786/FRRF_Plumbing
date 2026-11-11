import { createSlice } from "@reduxjs/toolkit";

const trackSlice = createSlice({
  name: "trackUser",
  initialState: {
    technicianLocation: null, // { latitude, longitude }
    customerLocation: null,   // { latitude, longitude }
      isTechnicianOnline: true,
    orderStatus: "On-the-way",
    distanceKm: null,
    orderData: null,
    loading: false,
    error: null,
  },
  reducers: {
    setTechnicianLocation: (state, action) => {
      state.technicianLocation = action.payload;
    },
    setCustomerLocation: (state, action) => {
      state.customerLocation = action.payload;
    },
    setIsTechnicianOnline: (state, action) => {
      state.isTechnicianOnline = action.payload;
    },
    setOrderStatus: (state, action) => {
      state.orderStatus = action.payload;
    },
    setDistanceKm: (state, action) => {
      state.distanceKm = action.payload;
    },
    setOrderData: (state, action) => {
      state.orderData = action.payload;
    },
    setTrackLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTrackError: (state, action) => {
      state.error = action.payload;
    },
    resetTrackState: (state) => {
      state.technicianLocation = null;
      state.customerLocation = null;
      state.isTechnicianOnline = true;
      state.distanceKm = null;
      state.orderData = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setTechnicianLocation,
  setCustomerLocation,
  setIsTechnicianOnline,
  setOrderStatus,
  setDistanceKm,
  setOrderData,
  setTrackLoading,
  setTrackError,
  resetTrackState,
} = trackSlice.actions;

export default trackSlice.reducer;
