import React, { useState } from "react";
import classes from "./ShoppingCart.module.css";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useEffect } from "react";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const [cartClass, setCartClass] = useState(classes.shoppingCart);

  const cartItems = useSelector((state) => state.cart.cartItems) || [];
  const itemCount = cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0);
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));

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
