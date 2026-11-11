import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "order",
  initialState: {
    images: [],
    item: [],
    orders: [],
    services: [],
    selectedService: null,
    loading: false,
    error: null,
  },
  reducers: {
    setImages: (state, action) => {
      state.images = action.payload;
    },
    setItem: (state, action) => {
      state.item = action.payload;
      if (Array.isArray(action.payload)) {
        state.orders = action.payload;
      } else if (action.payload && typeof action.payload === "object") {
        const exists = state.orders.some((o) => o._id === action.payload._id);
        if (exists) {
          state.orders = state.orders.map((o) =>
            o._id === action.payload._id ? { ...o, ...action.payload } : o
          );
        } else {
          state.orders = [action.payload, ...state.orders];
        }
      }
    },
    setOrders: (state, action) => {
      state.orders = Array.isArray(action.payload)
        ? action.payload
        : action.payload
        ? [action.payload]
        : [];
      state.item = state.orders;
      state.loading = false;
      state.error = null;
    },
    addOrder: (state, action) => {
      if (action.payload) {
        state.orders = [
          action.payload,
          ...state.orders.filter((o) => o._id !== action.payload._id),
        ];
        state.item = state.orders;
      }
    },
    setServices: (state, action) => {
      state.services = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearOrderError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setImages,
  setItem,
  setOrders,
  addOrder,
  setServices,
  setSelectedService,
  setLoading,
  setError,
  clearOrderError,
} = orderSlice.actions;

export default orderSlice.reducer;
