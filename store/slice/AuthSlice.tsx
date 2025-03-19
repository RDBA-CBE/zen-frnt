import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  tokens: string | null;
  groups: string | null;
  userId: number | null
}

const initialState: AuthState = {
  tokens: null,
  groups: null,
  userId: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<{ tokens: string; groups: string; userId: number }>) => {
      state.tokens = action.payload.tokens;
      state.groups = action.payload.groups;
      state.userId = action.payload.userId;
    },
    clearAuthData: (state) => {
      state.tokens = null;
      state.groups = null;
      state.userId = null
    },
  },
});

export const { setAuthData, clearAuthData } = authSlice.actions;

export default authSlice.reducer;
