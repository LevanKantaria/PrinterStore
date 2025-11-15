import React, { useState } from "react";
import classes from "./ShoppingCart.module.css";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useEffect } from "react";

// Optimize cart data for localStorage - only store essential fields
const optimizeCartForStorage = (cartItems) => {
  return cartItems.map(item => ({
    _id: item._id || item.id,
    id: item.id || item._id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    color: item.color || "",
    makerId: item.makerId,
    makerName: item.makerName,
    // Only store first image URL, not the entire array
    image: Array.isArray(item.images) ? item.images[0] : (item.images || item.image || ""),
  }));
};

const saveCartToStorage = (cartItems) => {
  try {
    const optimizedCart = optimizeCartForStorage(cartItems);
    const cartString = JSON.stringify(optimizedCart);
    
    // Check if data is too large (localStorage limit is typically 5-10MB)
    // Use 1MB threshold to catch issues early
    if (cartString.length > 1 * 1024 * 1024) { // 1MB threshold
      console.warn(`Cart data is too large (${(cartString.length / 1024).toFixed(2)}KB), limiting to last 20 items`);
      localStorage.removeItem("cart");
      // Try saving a smaller subset (keep only last 20 items)
      const limitedCart = optimizedCart.slice(-20);
      localStorage.setItem("cart", JSON.stringify(limitedCart));
      return;
    }
    
    localStorage.setItem("cart", JSON.stringify(optimizedCart));
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn("localStorage quota exceeded, clearing old cart data");
      try {
        // Clear old cart and try saving again with limited items
        localStorage.removeItem("cart");
        const optimizedCart = optimizeCartForStorage(cartItems);
        const limitedCart = optimizedCart.slice(-20); // Keep only last 20 items
        localStorage.setItem("cart", JSON.stringify(limitedCart));
      } catch (retryError) {
        console.error("Failed to save cart to localStorage:", retryError);
      }
    } else {
      console.error("Error saving cart to localStorage:", error);
    }
  }
};

const ShoppingCart = () => {
  const navigate = useNavigate();
  const [cartClass, setCartClass] = useState(classes.shoppingCart);

  const cartItems = useSelector((state) => state.cart.cartItems) || [];
  const itemCount = cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0);
  useEffect(() => {
    saveCartToStorage(cartItems);

    setCartClass(classes.shoppingCartAnimated);
    const timer = setTimeout(() => {
      setCartClass(classes.shoppingCart);
    }, 900);

    return () => clearTimeout(timer);
  }, [cartItems]);

  return (
    <div
      className={cartClass}
      onClick={() => {
        navigate("/cart");
      }}
    >
      <ShoppingCartOutlinedIcon color="inherit" fontSize="medium" />

     {cartItems && <sup>{itemCount}</sup>}
    </div>
  );
};

export default ShoppingCart;
