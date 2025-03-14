import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  tokens: string | null;
  groups: string | null;
}

const initialState: AuthState = {
  tokens: null,
  groups: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<{ tokens: string; groups: string }>) => {
      state.tokens = action.payload.tokens;
      state.groups = action.payload.groups;
    },
    clearAuthData: (state) => {
      state.tokens = null;
      state.groups = null;
    },
  },
});

export const { setAuthData, clearAuthData } = authSlice.actions;

export default authSlice.reducer;
