import React from "react";
import classes from "./ShoppingCartItem.module.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { cartActions } from "../../features/cart/cartSlice";

const ShoppingCartItem = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onClickHandler = () =>{

    dispatch(cartActions.removeItem(props.id))
    navigate("/cart")
  }

  return (
    <div className={classes.wrapper} >

      <div className={classes.itemDetails}>
        <section>
          <img src={props.image} height="100px" />
        </section>
        <div className={classes.name}>
          <h3>{props.name}</h3>
        </div>
        <div  >
          <p className={classes.quantity}>Quantity:{props.quantity}</p>
          <div className={classes.incrementDecrement}>
            <button
              onClick={() => {
                dispatch(cartActions.decrementQuantity(props.id))}}> -</button>
            <button onClick={() => {dispatch(cartActions.incrementQuantity(props.id))}}>+</button>
          </div>
        </div>
        <div className={classes.price}>
          <p className={classes.price}>
             ${(props.price * props.quantity).toFixed(2)}
          </p>
          <p className={classes.priceSmall}>${props.price}  each</p>
        </div>
      </div>
      <div className={classes.removeButton}>
        <button
          onClick={onClickHandler}>Remove</button>
      </div>
    </div>
  );
};

export default ShoppingCartItem;
