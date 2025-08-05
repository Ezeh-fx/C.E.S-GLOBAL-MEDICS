// redux/slices/customerSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Customer {
  _id: string;
  fullName?: string;
  email?: string;
}

interface CustomerState {
  customer: Customer | null;
}

const initialState: CustomerState = {
  customer: null,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.customer = action.payload;
    },
    logout: (state) => {
      state.customer = null;
    },
  },
});

export const { setCustomer, logout } = customerSlice.actions;
export default customerSlice.reducer;
