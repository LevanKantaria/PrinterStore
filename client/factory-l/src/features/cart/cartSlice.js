import { createSlice } from "@reduxjs/toolkit";



const initialState = {
  loading: false,
  cartItems: [],
  total: 0,
};

const findCartItem = (items, id, color) =>
  items.find(
    (item) =>
      (item._id || item.id) === id &&
      (item.color || "") === (color || "")
  );

if (localStorage.getItem("cart")) {
  initialState.cartItems = JSON.parse(localStorage.getItem("cart")).map((item) => ({
    ...item,
    quantity: Number(item.quantity || 1),
    color: item.color || "",
  }));
  initialState.total = initialState.cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {

    addItem: (state, action) => {
      const quantityToAdd = Number(action.payload.quantity) || 1;
      const price = Number(action.payload.price) || 0;
      const color = action.payload.color || "";
      const id = action.payload._id || action.payload.id;

      const itemInCart = findCartItem(state.cartItems, id, color);
      if (itemInCart) {
        itemInCart.quantity += quantityToAdd;
      } else {
        state.cartItems.push({
          ...action.payload,
          quantity: quantityToAdd,
          color,
        });
      }
      state.total += price * quantityToAdd;
    },
    incrementQuantity: (state, action) => {
      const { id, color = "" } = action.payload;
      const item = findCartItem(state.cartItems, id, color);
      if (!item) return;
      item.quantity += 1;
      state.total += Number(item.price) || 0;
    },
    decrementQuantity: (state, action) => {
      const { id, color = "" } = action.payload;
      const item = findCartItem(state.cartItems, id, color);
      if (!item || item.quantity <= 1) {
        if (item) {
          item.quantity = 1;
        }
        return;
      }
      item.quantity -= 1;
      state.total -= Number(item.price) || 0;
    },
    removeItem: (state, action) => {
      const { id, color = "" } = action.payload;
      const item = findCartItem(state.cartItems, id, color);
      if (item) {
        state.total -= (Number(item.price) || 0) * Number(item.quantity || 0);
      }
      state.cartItems = state.cartItems.filter(
        (cartItem) =>
          (cartItem._id || cartItem.id) !== id ||
          (cartItem.color || "") !== color
      );
    },
    setItemsFromCart: (state, action) => {
      state.cartItems = (action.payload || []).map((item) => ({
        ...item,
        quantity: Number(item.quantity || 1),
        color: item.color || "",
      }));
      state.total = state.cartItems.reduce(
        (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.total = 0;
    }
  },
});

export default cartSlice.reducer;
export const cartActions = cartSlice.actions;
