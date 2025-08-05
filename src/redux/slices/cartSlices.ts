import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sessionId: string;
}

interface CartState {
  items: CartItem[];
  sessionId: string;
  totalAmount: number;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  sessionId: undefined,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalAmount += action.payload.price * action.payload.quantity;
      state.sessionId = action.payload.sessionId;
    },
    updateItemQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);

      if (item) {
        // Subtract the old total for this item
        state.totalAmount -= item.price * item.quantity;

        // Update quantity
        item.quantity = quantity;

        // Add the new total for this item
        state.totalAmount += item.price * item.quantity;

        // Optionally remove if quantity is zero
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== id);
        }
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const itemIndex = state.items.findIndex(
        (item) => item.id === action.payload
      );
      if (itemIndex >= 0) {
        const item = state.items[itemIndex];
        state.totalAmount -= item.price * item.quantity;
        state.items.splice(itemIndex, 1);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
    getAllCartItems: (state) => {
      return state; // or console.log(state.items) if you just want to log
    },
  },
});

export const {
  addItemToCart,
  removeItemFromCart,
  clearCart,
  updateItemQuantity,
  getAllCartItems,
} = cartSlice.actions;
export default cartSlice.reducer;
