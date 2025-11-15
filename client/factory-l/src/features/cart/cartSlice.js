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

// Optimize item data - only keep essential fields, not full product objects
const optimizeCartItem = (item) => {
  return {
    _id: item._id || item.id,
    id: item.id || item._id,
    name: item.name,
    price: item.price,
    quantity: Number(item.quantity || 1),
    color: item.color || "",
    makerId: item.makerId,
    makerName: item.makerName,
    // Only store first image URL, not the entire array
    image: Array.isArray(item.images) ? item.images[0] : (item.images || item.image || ""),
    // Remove all other fields (description, full images array, etc.)
  };
};

// Load cart from localStorage with error handling
try {
  const cartData = localStorage.getItem("cart");
  if (cartData) {
    const parsedCart = JSON.parse(cartData);
    // Optimize loaded items - remove any full images arrays or extra data
    initialState.cartItems = parsedCart.map((item) => {
      const optimized = optimizeCartItem(item);
      return {
        ...optimized,
        quantity: Number(optimized.quantity || 1),
        color: optimized.color || "",
      };
    });
    initialState.total = initialState.cartItems.reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }
} catch (error) {
  console.error("Error loading cart from localStorage:", error);
  // Clear corrupted cart data
  try {
    localStorage.removeItem("cart");
  } catch (clearError) {
    console.error("Error clearing corrupted cart:", clearError);
  }
  initialState.cartItems = [];
  initialState.total = 0;
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
        // Keep full data in Redux for display (images, etc.)
        // Optimization happens when saving to localStorage, not in Redux
        state.cartItems.push({
          _id: action.payload._id || action.payload.id,
          id: action.payload.id || action.payload._id,
          name: action.payload.name,
          price: action.payload.price,
          quantity: quantityToAdd,
          color: color,
          makerId: action.payload.makerId,
          makerName: action.payload.makerName,
          // Keep images array in Redux for display
          images: Array.isArray(action.payload.images) ? action.payload.images : (action.payload.image ? [action.payload.image] : []),
          image: Array.isArray(action.payload.images) ? action.payload.images[0] : (action.payload.images || action.payload.image || ""),
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
      // Update cart items (keep images in Redux for display, optimization happens on localStorage save)
      state.cartItems = (action.payload || []).map((item) => ({
        ...item,
        quantity: Number(item.quantity || 1),
        color: item.color || "",
        // Keep images array in Redux for display purposes
        // It will be optimized when saving to localStorage
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
