import { Drawer, Box, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import classes from "./MuiDrawer.module.css";
import translate from "../translate";
import { langActions } from "../../features/lang/langSlice";

const MuiDrawer = () => {
  const dispatch = useDispatch();
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { user, status } = useSelector((state) => state.auth);
  // Subscribe to language changes to trigger re-render
  const currentLang = useSelector((state) => state.lang.lang);

  const handleLanguageChange = (lang) => {
    dispatch(langActions.changeLang(lang));
    localStorage.setItem("lang", lang);
  };

  useEffect(() => {
    // Reset avatar error when user changes
    setAvatarError(false);
  }, [user?.photoURL]);

  const displayName = useMemo(() => {
    if (!user) return "";
    if (user.displayName) {
      return user.displayName.split(" ")[0];
    }
    return user.email ? user.email.split("@")[0] : "";
  }, [user]);

  const initial = useMemo(() => {
    if (!user) return "";
    const source = user.displayName || user.email || "";
    return source.charAt(0).toUpperCase();
  }, [user]);

  const closeDrawer = () => setDrawerIsOpen(false);

  return (
    <>
      <div className={classes.iconButton}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          onClick={() => {
            setDrawerIsOpen(true);
          }}
        >
          <MenuIcon />
        </IconButton>
      </div>
      <div className={classes.drawer}>
        <Drawer anchor="left" open={drawerIsOpen} onClose={closeDrawer}>
          <Box p={0} width="85vw" maxWidth="360px" textAlign="center" role="presentation">
            <Typography variant="h6" component="div">
              <div className={classes.header} onClick={closeDrawer}>
                Makers Hub
              </div>
            </Typography>
            <div className={classes.links}>
              <p onClick={closeDrawer}>
                <Link to="/"> {translate("drawer.home")} </Link>
              </p>
              <p onClick={closeDrawer}>
                <Link to="/marketplace"> {translate("landing.marketplace")} </Link>
              </p>
              <p onClick={closeDrawer}>
                <Link to="/about"> {translate("landing.about")} </Link>
              </p>
              <p onClick={closeDrawer}>
                <Link to="/materials"> {translate("landing.materials")} </Link>
              </p>
              <p onClick={closeDrawer}>
                <Link to="/blog">{translate("landing.blog")}</Link>
              </p>
              {status === "authenticated" && user?.isAdmin && (
                <>
                  <p onClick={closeDrawer}>
                    <Link to="/admin">{translate("drawer.admin")}</Link>
                  </p>
              
                </>
              )}
            </div>

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

            <div className={classes.accountArea}>
              {status === "authenticated" && user ? (
                <Link to="/profile" className={classes.profileLink} onClick={closeDrawer}>
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
                  <div className={classes.profileCopy}>
                    <span className={classes.profileGreeting}>{translate("drawer.welcome")}</span>
                    <span className={classes.profileName}>{displayName}</span>
                  </div>
                </Link>
              ) : (
                <div className={classes.authButtons}>
                  <Link to="/sign-in" className={classes.signInLink} onClick={closeDrawer}>
                    {translate("drawer.signIn")}
                  </Link>
                  <Link to="/sign-up" className={classes.signUpLink} onClick={closeDrawer}>
                    {translate("drawer.createAccount")}
                  </Link>
                </div>
              )}
            </div>

            <div className={classes.close}>
              <IconButton onClick={closeDrawer} className={classes.closeButton} aria-label="Close menu" size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </Box>
        </Drawer>
      </div>
    </>
  );
};

export default MuiDrawer;
