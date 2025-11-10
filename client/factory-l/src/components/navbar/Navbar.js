import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import classes from "./Navbar.module.css";
import MuiDrawer from "../drawer/MuiDrawer";
import translate from "../translate";
import ShoppingCart from "../shoppingCart/ShoppingCart";

const Navbar = () => {
  const { user, status } = useSelector((state) => state.auth);

  const displayName = React.useMemo(() => {
    if (!user) return "";
    if (user.displayName) {
      return user.displayName.split(" ")[0];
    }
    return user.email ? user.email.split("@")[0] : "Profile";
  }, [user]);

  const initial = React.useMemo(() => {
    if (!user) return "";
    const source = user.displayName || user.email || "";
    return source.charAt(0).toUpperCase();
  }, [user]);

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
          <Link to="/marketplace"> {translate("landing.marketplace")} </Link>
        </p>
        <p>
          <Link to="/blog"> ბლოგი </Link>
        </p>
        <p>
          <Link to="/about"> {translate("landing.about")} </Link>
        </p>
        <p>
          <Link to="/materials"> {translate("landing.materials")} </Link>
        </p>
        {status === "authenticated" && user?.isAdmin && (
          <>
            <p>
              <Link to="/admin/orders">Admin orders</Link>
            </p>
            <p>
              <Link to="/admin/listings">Admin listings</Link>
            </p>
          </>
        )}
      </div>
      <div className={classes.rightGroup}>
        <div className={classes.shoppingCart}>
          <ShoppingCart />
        </div>
        <div className={classes.authArea}>
          {status === "authenticated" && user ? (
            <Link to="/profile" className={classes.profileShortcut}>
              {user.photoURL ? (
                <img src={user.photoURL} alt={displayName} className={classes.profileAvatarImage} />
              ) : (
                <span className={classes.profileAvatarFallback}>{initial}</span>
              )}
              <span className={classes.profileName}>Hi, {displayName}</span>
            </Link>
          ) : (
            <Link to="/sign-in" className={classes.signInLink}>
              {translate("landing.login")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
