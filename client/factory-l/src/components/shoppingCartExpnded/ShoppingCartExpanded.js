import { useSelector } from "react-redux";
import ShoppingCartItem from "../shoppingCartItem/ShoppingCartItem";
import CustomButton from "../customButton/CustomButton";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import classes from "./ShoppingCartExpanded.module.css";
import { API_URL } from "../../API_URL";
import axios from "axios";


let total = 0;
// const API_URL = 'http://localhost:5000/';

const ShoppingCartExpanded = () => {
  const params = useParams();
  const id = params.id;
  const cartItems = useSelector((state) => state.cart.cartItems);

  let priceSums = [];
  const initialValue = 0;

  cartItems.map((item) => {
    priceSums.push(item.price * item.quantity);
    console.log(priceSums);
  });

  const sum = priceSums.reduce((a, b) => a + b, initialValue);
  console.log(sum.toFixed(2));

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

    let linkToCategory = `/marketplace/${cartItems[cartItems.length - 1].category} `
    let linkToSubCategory = `/marketplace/${cartItems[cartItems.length - 1].category}/${cartItems[cartItems.length - 1].subCategory} `

    newItem = (
      <div className={classes.newItem}>
        <div className={classes.newItemContent}>
          <h3>Recently Added:</h3>
          <span><Link to='/marketplace'>Marketplace</Link> <Link to={linkToCategory}>{cartItems[cartItems.length - 1].category}</Link>  <Link to={linkToCategory}> {cartItems[cartItems.length - 1].subCategory}</Link>   </span>
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
  return (
    <div className={classes.main}>
      <div className={classes.items}>
        {id && newItem}
        <h1> My Cart</h1>
        {cartItemsExpanded}
      </div>
      <div className={classes.checkout}>
        <h2>Subtotal:${sum.toFixed(2)}</h2>
        <CustomButton text="Checkout" width="90%" onClick={checkoutHandler} />
      </div>
    </div>
  );
};

export default ShoppingCartExpanded;
