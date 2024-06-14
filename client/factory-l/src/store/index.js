import { configureStore, createReducer } from "@reduxjs/toolkit";
import cartReducer from '../features/cart/cartSlice'
import stlReducer from '../features/stl/stlSlice'
import langReducer from "../features/lang/langSlice";

const store = configureStore({
    reducer: { cart: cartReducer , stl:stlReducer, lang:langReducer},
    
  });
  
  export default store;