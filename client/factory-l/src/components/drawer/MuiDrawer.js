import { Drawer, Box, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import classes from "./MuiDrawer.module.css";
import translate from "../translate";

const MuiDrawer = () => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const { user, status } = useSelector((state) => state.auth);

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
                Factory L
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
                <Link to="/blog"> ბლოგი </Link>
              </p>
              {status === "authenticated" && user?.isAdmin && (
                <>
                  <p onClick={closeDrawer}>
                    <Link to="/admin/orders">Admin orders</Link>
                  </p>
                  <p onClick={closeDrawer}>
                    <Link to="/admin/listings">Admin listings</Link>
                  </p>
                </>
              )}
            </div>

            <div className={classes.accountArea}>
              {status === "authenticated" && user ? (
                <Link to="/profile" className={classes.profileLink} onClick={closeDrawer}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={displayName} className={classes.profileAvatarImage} />
                  ) : (
                    <span className={classes.profileAvatarFallback}>{initial}</span>
                  )}
                  <div className={classes.profileCopy}>
                    <span className={classes.profileGreeting}>Welcome back</span>
                    <span className={classes.profileName}>{displayName}</span>
                  </div>
                </Link>
              ) : (
                <div className={classes.authButtons}>
                  <Link to="/sign-in" className={classes.signInLink} onClick={closeDrawer}>
                    Sign in
                  </Link>
                  <Link to="/sign-up" className={classes.signUpLink} onClick={closeDrawer}>
                    Create account
                  </Link>
                </div>
              )}
            </div>

            <div className={classes.close}>
              <button onClick={closeDrawer}>x</button>
            </div>
          </Box>
        </Drawer>
      </div>
    </>
  );
};

export default MuiDrawer;
