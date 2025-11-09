import { createSlice } from "@reduxjs/toolkit";



const initialState = {
  loading: false,
  cartItems: [],
  total: 0,
};

if(localStorage.getItem('cart')){
  initialState.cartItems=JSON.parse(localStorage.getItem('cart'))
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {

    addItem: (state, action) => {
      const itemInCart = state.cartItems.find(
        (item) => item._id === action.payload._id
      );
      if (itemInCart) {
        itemInCart.quantity++;
      } else {
        state.cartItems.push({ ...action.payload, quantity: 1 });
      }
      state.total+= +action.payload.price
    },
    incrementQuantity: (state, action) => {
      const item = state.cartItems.find((item) => item._id === action.payload);
      console.log(item)
      item.quantity++;
    },
    decrementQuantity: (state, action) => {
      const item = state.cartItems.find((item) => item._id === action.payload);
      if (item.quantity === 1) {
        item.quantity = 1;
      } else {
        item.quantity--;
        state.total-= +action.payload.price
      }
    },
    removeItem: (state, action) => {
      const removeItem = state.cartItems.filter(
        (item) => item._id !== action.payload
      );
      state.cartItems = removeItem;
    },
    setItemsFromCart:(state,action)=>{
      state.cartItems = action.payload;
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.total = 0;
    }
  },
});

export default cartSlice.reducer;
export const cartActions = cartSlice.actions;
