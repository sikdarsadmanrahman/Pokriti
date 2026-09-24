import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'organic-store-admin-auth-v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: null, admin: null };
  } catch {
    return { token: null, admin: null };
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: load(),
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.admin = action.payload.admin;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    logout(state) {
      state.token = null;
      state.admin = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectToken = (state) => state.auth.token;
export const selectAdmin = (state) => state.auth.admin;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
