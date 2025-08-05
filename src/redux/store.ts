import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartReducer from "./slices/cartSlices";
import adminReducer from "./slices/adminSlices";
import productReducer from "./slices/productSlices";
import customerReducer from "./slices/customer";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "admin", "product", "customer"],
};

const rootReducer = combineReducers({
  cart: cartReducer,
  admin: adminReducer,
  product: productReducer,
  customer: customerReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
