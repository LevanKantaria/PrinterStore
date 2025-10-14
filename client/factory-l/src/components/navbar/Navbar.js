import React from "react";
import classes from "./Navbar.module.css";
import { Link } from "react-router-dom";
import MuiDrawer from "../drawer/MuiDrawer";
import translate from "../translate";
import ShoppingCart from "../shoppingCart/ShoppingCart";

const Navbar = () => {
  return (
    <nav>
      <div className={classes.drawer}>
        <MuiDrawer />
      </div>
      <h1>
        <Link to="/">PrintHub</Link>
      </h1>
      <div className={classes.navLinks}>
        <p>
          
          <Link to="marketplace"> {translate('landing.marketplace')} </Link>
        </p>
        <p>
         
          <Link to="about"> {translate('landing.about')} </Link>
        </p>
        <p>
       
          <Link to="materials"> {translate('landing.materials')} </Link>

          <Link to="account/login"> {translate('landing.login')} </Link>
        </p>
      </div>
      <div className={classes.shoppingCart}>
        <ShoppingCart />
      </div>
    </nav>
  );
};

export default Navbar;
