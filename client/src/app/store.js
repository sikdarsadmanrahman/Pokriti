import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from '../api/apiSlice.js';
import cartReducer from './cartSlice.js';
import authReducer from './authSlice.js';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    cart: cartReducer,
    auth: authReducer,
  },
  middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
});

// Enables refetchOnFocus / refetchOnReconnect for RTK Query.
setupListeners(store.dispatch);
