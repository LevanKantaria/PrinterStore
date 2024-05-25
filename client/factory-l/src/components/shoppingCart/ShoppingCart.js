import React, { useState } from "react";
import classes from "./ShoppingCart.module.css";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useSelector ,useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { cartActions } from "../../features/cart/cartSlice";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cartClass, setCartClass] = useState(classes.shoppingCart);

  const cartItems = useSelector((state) => state.cart.cartItems);
  useEffect(() => {
    if (cartItems ) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
    let cartItem = JSON.parse(localStorage.getItem("cart"));
    if(cartItems==null){
      dispatch(cartActions.setItemsFromCart(cartItem))
      console.log('storage supplied from local')
    }
    console.log(cartItems);

    setCartClass(classes.shoppingCartAnimated);
    setTimeout(() => {
      setCartClass(classes.shoppingCart);
    }, 900);
  }, [cartItems]);

  return (
    <div
      className={cartClass}
      onClick={() => {
        navigate("/cart");
      }}
    >
      <ShoppingCartOutlinedIcon color="inherit" fontSize="medium" />

     {cartItems&&<sup>{cartItems.length}</sup>}
    </div>
  );
};

export default ShoppingCart;
