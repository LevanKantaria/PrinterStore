import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import classes from './Slider.module.css'
import { useState } from "react";

export default function SliderScale(props) {
    const [scale,setScale] = useState(1);
    const scaleUpdateHandler = (e) =>{
        setScale(e.target.value)
        props.onScaleUpdate(e.target.value)
    }
  return (
    <Box width={200} className={classes.box} >
      <span className={classes.scale} >Scale</span>
      <Slider min={0.1} defaultValue={1} aria-label="Default" valueLabelDisplay="auto" onChange={scaleUpdateHandler} />
    </Box>
  );
}
