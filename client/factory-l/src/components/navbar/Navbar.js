import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import classes from "./Navbar.module.css";
import MuiDrawer from "../drawer/MuiDrawer";
import translate from "../translate";
import ShoppingCart from "../shoppingCart/ShoppingCart";
import { langActions } from "../../features/lang/langSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);
  const currentLang = useSelector((state) => state.lang.lang);
  const [avatarError, setAvatarError] = React.useState(false);

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

  React.useEffect(() => {
    // Reset avatar error when user changes
    setAvatarError(false);
  }, [user?.photoURL]);

  const handleLanguageChange = (lang) => {
    dispatch(langActions.changeLang(lang));
    localStorage.setItem("lang", lang);
  };

  return (
    <nav>
      <div className={classes.drawer}>
        <MuiDrawer />
      </div>
      <h1>
        <Link to="/">Makers Hub</Link>
      </h1>
      <div className={classes.navLinks}>
        <p>
          <Link to="/marketplace"> {translate("landing.marketplace")} </Link>
        </p>
        <p>
          <Link to="/blog"> {translate("landing.blog")} </Link>
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
              <Link to="/admin/orders">{translate("navbar.admin.orders")}</Link>
            </p>
            <p>
              <Link to="/admin/listings">{translate("navbar.admin.listings")}</Link>
            </p>
          </>
        )}
      </div>
      <div className={classes.rightGroup}>
        <div className={classes.languageSwitcher}>
          <button
            className={`${classes.langButton} ${currentLang === "KA" ? classes.langButtonActive : ""}`}
            onClick={() => handleLanguageChange("KA")}
            aria-label="Switch to Georgian"
          >
            KA
          </button>
          <button
            className={`${classes.langButton} ${currentLang === "EN" ? classes.langButtonActive : ""}`}
            onClick={() => handleLanguageChange("EN")}
            aria-label="Switch to English"
          >
            EN
          </button>
        </div>
        <div className={classes.shoppingCart}>
          <ShoppingCart />
        </div>
        <div className={classes.authArea}>
          {status === "authenticated" && user ? (
            <Link to="/profile" className={classes.profileShortcut}>
              {user.photoURL && !avatarError ? (
                <img 
                  src={user.photoURL} 
                  alt="" 
                  className={classes.profileAvatarImage}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className={classes.profileAvatarFallback}>{initial}</span>
              )}
              <span className={classes.profileName}>{displayName}</span>
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
