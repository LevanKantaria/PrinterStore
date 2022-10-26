import React from "react";
import classes from "./CustomButton.module.css";

const CustomButton = (props) => {
  return (
    <div>
      <button
        name={props.name}
        onClick={props.onClick}
        className={classes.button}
        style={{width:`${props.width}`, height:`${props.height}`, fontSize:`${props.fontSize}`}}
        
        
      >
        {props.text}
      </button>
    </div>
  );
};

export default CustomButton;
