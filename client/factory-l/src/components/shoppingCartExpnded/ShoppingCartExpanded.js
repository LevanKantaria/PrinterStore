import { useSelector } from "react-redux";
import ShoppingCartItem from "../shoppingCartItem/ShoppingCartItem";
import CustomButton from "../customButton/CustomButton";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import classes from "./ShoppingCartExpanded.module.css";
import { API_URL } from "../../API_URL";
import axios from "axios";
import translate from "../translate";

// const API_URL = 'http://localhost:5000/';

const ShoppingCartExpanded = () => {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id;
  const cartItems = useSelector((state) => state.cart.cartItems);

  const sum = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  let cartItemsExpanded = cartItems.map((item) => {
    return (
      <ShoppingCartItem
        id={item._id}
        image={item.images[0]}
        name={item.name}
        quantity={item.quantity}
        price={item.price}
        key={Math.random()}
      />
    );
  });

  let newItem = "";
  if (params.id) {
    const lastItem = cartItems[cartItems.length - 1];
    let linkToCategory = `/marketplace/${lastItem.category}`;
    let linkToSubCategory = `/marketplace/${lastItem.category}/${lastItem.subCategory}`;

    newItem = (
      <div className={classes.newItem}>
        <div className={classes.newItemContent}>
          <h3>Recently Added:</h3>
          <div className={classes.breadCrumbs}>
            <Link to='/marketplace'>{translate('landing.marketplace')}</Link>
            {lastItem.category && <Link to={linkToCategory}>{translate(`categories.${lastItem.category}`)}</Link>}
            {lastItem.subCategory && <Link to={linkToSubCategory}>{translate(`categories.${lastItem.subCategory}`)}</Link>}
          </div>
        </div>
        <ShoppingCartItem
          id={cartItems[cartItems.length - 1]._id}
          image={cartItems[cartItems.length - 1].images[0]}
          name={cartItems[cartItems.length - 1].name}
          quantity={cartItems[cartItems.length - 1].quantity}
          price={cartItems[cartItems.length - 1].price}
          key={Math.random()}
        />
      </div>
    );
  }

  const checkoutHandler = () =>{
console.log(cartItems)
axios.post(`${API_URL}checkout`, cartItems).then(res =>{
  console.log(res.data.url)
  if(res.data.url){
    window.location.assign(res.data.url)
  }
  
})
  }

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
    </div>
  );
};

export default ShoppingCartExpanded;
