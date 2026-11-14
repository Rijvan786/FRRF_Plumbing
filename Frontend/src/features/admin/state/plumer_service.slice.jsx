import { createSlice } from "@reduxjs/toolkit";

const plumberServiceSlice = createSlice({
  name: "plumber_service",
  initialState: {
    services: [],
    todayTechnicians: [],
    selectedService: null,
    images: [],
    loading: false,
    error: null,
    VerifiedTechnicians: [],
    UnVerifiedTechnicians: [],
    
  },
  reducers: {
    setServices: (state, action) => {
      state.services = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    addService: (state, action) => {
      if (action.payload) {
        state.services.unshift(action.payload);
      }
    },
    updateService: (state, action) => {
      const updated = action.payload;
      if (!updated) return;
      state.services = state.services.map((item) =>
        item._id === updated._id || item.id === updated.id
          ? { ...item, ...updated }
          : item
      );
    },
    removeService: (state, action) => {
      const idToRemove = action.payload;
      state.services = state.services.filter(
        (item) => item._id !== idToRemove && item.id !== idToRemove
      );
    },
    setTodayTechnicians: (state, action) => {
      state.todayTechnicians = Array.isArray(action.payload) ? action.payload : [];
    },
    addTodayTechnician: (state, action) => {
      if (action.payload) {
        state.todayTechnicians.unshift(action.payload);
      }
    },
    verifyTechnicianInState: (state, action) => {
      const email = action.payload;
      state.todayTechnicians = state.todayTechnicians.map((tech) => {
        const techEmail = tech.userId?.email || tech.email;
        if (techEmail === email || tech.id === email || tech._id === email) {
          return {
            ...tech,
            isVerifiedTech: true,
            userId: tech.userId ? { ...tech.userId, isVerifiedTech: true } : tech.userId,
          };
        }
        return tech;
      });
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    setImages: (state, action) => {
      state.images = Array.isArray(action.payload) ? action.payload : [];
    },
    setLoadingState: (state, action) => {
      state.loading = action.payload;
    },
    setErrorState: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setVerifiedTechnicians: (state, action) => {
      state.VerifiedTechnicians = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    setUnVerifiedTechnicians: (state, action) => {
      state.UnVerifiedTechnicians = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setServices,
  addService,
  updateService,
  removeService,
  setTodayTechnicians,
  addTodayTechnician,
  verifyTechnicianInState,
  setSelectedService,
  setImages,
  setLoadingState,
  setErrorState,
  setVerifiedTechnicians,
  setUnVerifiedTechnicians,
} = plumberServiceSlice.actions;

export default plumberServiceSlice.reducer;
