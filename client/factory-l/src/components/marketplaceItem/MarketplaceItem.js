import React from "react";
import classes from "./MarketplaceItem.module.css";
import { useNavigate } from "react-router";
import translate from "../translate";

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
        {props.images?.[0] ? (
          <img className={classes.image} src={props.images[0]} width="100%" alt={props.name} />
        ) : (
          <div className={classes.placeholder}>No image</div>
        )}
      </div>
      <div className={classes.infoWrapper}>
        <span className={classes.itemName}>{props.name}</span>
        {(props.category || props.subCategory) && (
          <div className={classes.metaRow}>
            {props.category && (
              <span className={classes.metaLabel}>
                {translate(`categories.${props.category}`) || props.category}
              </span>
            )}
            {props.subCategory && (
              <span className={classes.metaSub}>
                {translate(`categories.${props.subCategory}`) || props.subCategory}
              </span>
            )}
          </div>
        )}
        {props.colors?.length ? (
          <div className={classes.colorsRow}>
            {props.colors.slice(0, 5).map((color, index) => (
              <span
                key={`${props.id || props._id || props.name}-color-${color}-${index}`}
                className={classes.colorDot}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {props.colors.length > 5 && (
              <span className={classes.moreColors}>+{props.colors.length - 5}</span>
            )}
          </div>
        ) : null}
        <div className={classes.priceRow}>
          <span className={classes.price}>${props.price}</span>{" "}
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
