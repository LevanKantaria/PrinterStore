import { useDispatch, useSelector } from "react-redux";
import ShoppingCartItem from "../shoppingCartItem/ShoppingCartItem";
import CustomButton from "../customButton/CustomButton";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import classes from "./ShoppingCartExpanded.module.css";
import translate from "../translate";
import { useState } from "react";
import CheckoutModal from "../checkout/CheckoutModal";
import { cartActions } from "../../features/cart/cartSlice";

// const API_URL = 'http://localhost:5000/';

const ShoppingCartExpanded = () => {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id;
  const cartItems = useSelector((state) => state.cart.cartItems);
  const authStatus = useSelector((state) => state.auth.status);
  const dispatch = useDispatch();
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const sum = cartItems.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  let cartItemsExpanded = cartItems.map((item) => {
    return (
      <ShoppingCartItem
        id={item._id}
        color={item.color}
        image={item.images?.[0]}
        name={item.name}
        quantity={item.quantity}
        price={item.price}
        key={`${item._id}-${item.color || "default"}`}
      />
    );
  });

  let newItem = "";
  if (params.id && cartItems.length > 0) {
    const lastItem = cartItems[cartItems.length - 1];
    const linkToCategory = lastItem?.category ? `/marketplace/${lastItem.category}` : null;
    const linkToSubCategory =
      lastItem?.category && lastItem?.subCategory ? `/marketplace/${lastItem.category}/${lastItem.subCategory}` : null;

    if (lastItem) {
      newItem = (
        <div className={classes.newItem}>
          <div className={classes.newItemContent}>
            <h3>Recently Added:</h3>
            <div className={classes.breadCrumbs}>
              <Link to='/marketplace'>{translate('landing.marketplace')}</Link>
              {linkToCategory && (
                <Link to={linkToCategory}>{translate(`categories.${lastItem.category}`)}</Link>
              )}
              {linkToSubCategory && (
                <Link to={linkToSubCategory}>{translate(`categories.${lastItem.subCategory}`)}</Link>
              )}
            </div>
          </div>
          <ShoppingCartItem
            id={lastItem._id}
            color={lastItem.color}
            image={lastItem.images?.[0]}
            name={lastItem.name}
            quantity={lastItem.quantity}
            price={lastItem.price}
            key={`${lastItem._id}-${lastItem.color || "default"}-recent`}
          />
        </div>
      );
    }
  }

  const checkoutHandler = () =>{
    if (authStatus !== "authenticated") {
      navigate("/sign-in");
      return;
    }
    setCheckoutOpen(true);
  };

  const handleOrderPlaced = () => {
    dispatch(cartActions.clearCart());
  };

  const handleModalClose = () => {
    setCheckoutOpen(false);
  };

  const continueShoppingHandler = () => {
    navigate('/marketplace');
  }

  if (cartItems.length === 0) {
    return (
      <div className={classes.emptyCart}>
        <div className={classes.emptyCartContent}>
          <div className={classes.emptyCartIcon}>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <CustomButton 
            text="Continue Shopping" 
            width="250px" 
            onClick={continueShoppingHandler} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.main}>
      <div className={classes.items}>
        {id && newItem}
        <div className={classes.cartHeader}>
          <h1>My Cart</h1>
          <p className={classes.itemCount}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
        </div>
        <div className={classes.cartItemsList}>
          {cartItemsExpanded}
        </div>
        <div className={classes.continueShopping}>
          <Link to="/marketplace" className={classes.continueShoppingLink}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
      <div className={classes.checkout}>
        <div className={classes.checkoutContent}>
          <h3 className={classes.checkoutTitle}>Order Summary</h3>
          <div className={classes.summaryRow}>
            <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
            <span>${sum.toFixed(2)}</span>
          </div>
          <div className={classes.summaryRow}>
            <span>Estimated Shipping</span>
            <span>Free</span>
          </div>
          <div className={classes.summaryDivider}></div>
          <div className={classes.summaryRow}>
            <span className={classes.totalLabel}>Total</span>
            <span className={classes.totalAmount}>${sum.toFixed(2)}</span>
          </div>
          <CustomButton text="Proceed to Checkout" width="100%" onClick={checkoutHandler} />
          <p className={classes.shippingNote}>Free shipping on orders over $50</p>
        </div>
      </div>
      <CheckoutModal
        open={isCheckoutOpen}
        onClose={handleModalClose}
        cartItems={cartItems}
        onOrderPlaced={handleOrderPlaced}
      />
    </div>
  );
};

export default ShoppingCartExpanded;
