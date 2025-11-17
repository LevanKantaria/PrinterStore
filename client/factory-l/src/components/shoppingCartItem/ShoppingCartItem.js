import React from "react";
import classes from "./ShoppingCartItem.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { cartActions } from "../../features/cart/cartSlice";
import translate from "../translate";

// Color name to hex mapping
const COLOR_HEX_MAP = {
  'white': '#FFFFFF',
  'red': '#FF0000',
  'green': '#00FF00',
  'yellow': '#FFFF00',
  'purple': '#800080',
  'orange': '#FFA500',
  'brown': '#A52A2A',
  'blue': '#0000FF',
  'pink': '#FFC0CB',
  'violet': '#8A2BE2',
};

const getColorHex = (colorName) => {
  return COLOR_HEX_MAP[colorName] || colorName; // Return hex if found, otherwise assume it's already a hex code
};

const ShoppingCartItem = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Subscribe to language changes to trigger re-render
  const currentLang = useSelector((state) => state.lang.lang);

  const onClickHandler = () => {
    dispatch(cartActions.removeItem({ id: props.id, color: props.color || "" }));
    navigate("/cart");
  };

  return (
    <div className={classes.wrapper} >

      <div className={classes.itemDetails}>
        <section className={classes.imageSection}>
          {props.image ? (
            <img src={props.image} height="100px" alt={props.name} />
          ) : (
            <div className={classes.imagePlaceholder} aria-hidden="true">
              🧩
            </div>
          )}
        </section>
        <div className={classes.name}>
          <h3>{props.name}</h3>
        </div>
        <div>
          <p className={classes.quantity}>{translate('cart.quantity')}: {props.quantity}</p>
          {props.color && (
            <p className={classes.color}>
              <span
                className={classes.colorDot}
                style={{ backgroundColor: getColorHex(props.color) }}
              />
              {translate(`colors.${props.color}`) || props.color}
            </p>
          )}
          <div className={classes.incrementDecrement}>
            <button
              onClick={() => {
                dispatch(cartActions.decrementQuantity({ id: props.id, color: props.color || "" }));
              }}
            >
              -
            </button>
            <button
              onClick={() => {
                dispatch(cartActions.incrementQuantity({ id: props.id, color: props.color || "" }));
              }}
            >
              +
            </button>
          </div>
        </div>
        <div className={classes.price}>
          <p className={classes.priceTotal}>
             ₾{(props.price * props.quantity).toFixed(2)}
          </p>
          <p className={classes.priceSmall}>₾{props.price} {translate('cart.each')}</p>
        </div>
      </div>
      <div className={classes.removeButton}>
        <button
          onClick={onClickHandler}>{translate('cart.remove')}</button>
      </div>
    </div>
  );
};

export default ShoppingCartItem;
