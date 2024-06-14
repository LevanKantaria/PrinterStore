import { Drawer, Box, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import { useState } from "react";
import classes from "./MuiDrawer.module.css";
import translate from "../translate";

const MuiDrawer = () => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  return (
    <>
      <div className={classes.iconButton}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          // aria-label="logo"
          onClick={() => {
            setDrawerIsOpen(true);
          }}
        >
          <MenuIcon />
        </IconButton>
      </div>
      <div className={classes.drawer}>
        <Drawer
          anchor="left"
          open={drawerIsOpen}
          onClose={() => setDrawerIsOpen(false)}
        >
          <Box p={0} width="100vw" textAlign="center" role="presentation">
            <Typography variant="h6" component="div">
              <div
                className={classes.header}
                onClick={() => setDrawerIsOpen(false)}
              >
                Factory L
              </div>
            </Typography>
            <div className={classes.links}>
              <p
                onClick={() => {
                  setDrawerIsOpen(false);
                }}
              >
                <Link to="/"> {translate('drawer.home')} </Link>{" "}
              </p>
              <p
                onClick={() => {
                  setDrawerIsOpen(false);
                }}
              >
                <Link to="marketplace"> {translate('landing.marketplace')} </Link>{" "}
              </p>
              <p
                onClick={() => {
                  setDrawerIsOpen(false);
                }}
              >
                {" "}
                <Link to="about"> {translate('landing.about')} </Link>
              </p>
              <p
                onClick={() => {
                  setDrawerIsOpen(false);
                }}
              >
                {" "}
                <Link to="materials"> {translate('landing.materials')} </Link>
              </p>
            </div>
            <div className={classes.close}>
              <button
                onClick={() => {
                  setDrawerIsOpen(false);
                }}
              >
                x
              </button>
            </div>
          </Box>
        </Drawer>
      </div>
    </>
  );
};

export default MuiDrawer;
