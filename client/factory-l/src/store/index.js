import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/cart/cartSlice";
import stlReducer from "../features/stl/stlSlice";
import langReducer from "../features/lang/langSlice";
import authReducer from "../features/auth/authSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    stl: stlReducer,
    lang: langReducer,
    auth: authReducer,
  },
});

export default store;