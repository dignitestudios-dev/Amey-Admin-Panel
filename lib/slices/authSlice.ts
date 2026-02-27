import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        token: string;
        email: string;
      }>,
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = {
        id: 1,
        name: "Amey Admin",
        email: action.payload.email,
      };
      state.isHydrated = true;
    },
    hydrateAuth: (state, action: PayloadAction<{ token: string | null }>) => {
      state.token = action.payload.token;
      state.isAuthenticated = Boolean(action.payload.token);
      if (!action.payload.token) {
        state.user = null;
      }
      state.isHydrated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isHydrated = true;
    },
  },
});

export const { login, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
