import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthStatus(state, action) {
      state.status = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
      state.error = null;
    },
    clearUser(state) {
      state.user = null;
      state.error = null;
    },
    setAuthError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setAuthStatus, setUser, clearUser, setAuthError } = authSlice.actions;

export default authSlice.reducer;

