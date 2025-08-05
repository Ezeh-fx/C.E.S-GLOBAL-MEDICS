import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Admin {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
}

interface AdminState {
  admin: Admin | null;
}

const initialState: AdminState = {
  admin: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<Admin | null>) => {
      state.admin = action.payload;
    },
    logout: (state) => {
      state.admin = null;
    },
  },
});

export const { setAdmin, logout } = adminSlice.actions;
export default adminSlice.reducer;
