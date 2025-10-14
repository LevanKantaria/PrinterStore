import React from "react";
import classes from "./MarketplaceItem.module.css";
import { useNavigate } from "react-router";

const MarketplaceItem = (props) => {
  const navigate = useNavigate();
  let id = props.id;
  const clickHandler = (e) => {
    e.preventDefault();
    navigate("/products/" + id);
  };
  return (
    <div className={classes.itemCard} onClick={clickHandler}>
      <div className={classes.imgWrapper}>
        <img className={classes.image} src={props.images[0]} width="100%" alt={props.name} />
      </div>
      <div className={classes.infoWrapper}>
        <span className={classes.itemName}>{props.name}</span>
        <div>
          <span className={classes.price}>${props.price}</span> {" "}
          <span className={classes.creator}>{props.creator}</span>
        </div>
      </div>
    </div>

    //     <div className={classes.container}>
    //     <div className={classes.card}>
    //       <div className={classes.image}>
    //         <img src={props.image} />
    //       </div>
    //       <div class src={props.content}>
    //         <h3>   <span className={classes.itemName}>{props.name}</span>
    // </h3>
    // <span className={classes.price}>${props.price}</span> by{" "}
    //     <span className={classes.creator}>{props.creator}</span>      </div>
    //     </div>
    //   </div>
  );
};

export default MarketplaceItem;
