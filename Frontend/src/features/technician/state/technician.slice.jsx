import { createSlice } from "@reduxjs/toolkit";

const TechnicianSlice = createSlice({
  name: "technician",
  initialState: {
    tech: null,
    technician: null,
    profile: null,
    loading: false,
    error: null,
    isOnline: true,
    isAvailable: true,
    MyLocation: null,
    newJobOrderId: null,
    isTrackingActive: false,
    notifications: [],
  },
  reducers: {
    setTechnician: (state, action) => {
      state.tech = action.payload;
      state.technician = action.payload;
    },
    setTechnicianProfile: (state, action) => {
      state.profile = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setIsOnline: (state, action) => {
      state.isOnline = action.payload;
    },
    setIsAvailable: (state, action) => {
      state.isAvailable = action.payload;
    },
    setNewJobOrderId: (state, action) => {
      state.newJobOrderId = action.payload;
    },
    setMyLocation: (state, action) => {
      state.MyLocation = action.payload;
    },
    setTrackingStatus: (state, action) => {
      state.isTrackingActive = action.payload;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      // Avoid duplicate notifications by orderId or id
      const exists = state.notifications.some(
        (n) =>
          (n.orderId && n.orderId === action.payload.orderId) ||
          (n.id && n.id === action.payload.id)
      );
      console.log(state.notifications,"In Slice");
      if (!exists) {
        state.notifications.unshift(action.payload);
      }
    },
    markNotificationRead: (state, action) => {
      const id = action.payload;
      const target = state.notifications.find((n) => n.id === id || n.orderId === id);
      if (target) {
        target.unread = false;
      }
    },
    dismissNotification: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.filter(
        (n) => n.id !== id && n.orderId !== id
      );
    },
    clearTechError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setTechnician,
  setTechnicianProfile,
  setLoading,
  setError,
  setIsOnline,
  setIsAvailable,
  setMyLocation,
  setTrackingStatus,
  setNewJobOrderId,
  setNotifications,
  addNotification,
  markNotificationRead,
  dismissNotification,
  clearTechError,
} = TechnicianSlice.actions;

export default TechnicianSlice.reducer;
