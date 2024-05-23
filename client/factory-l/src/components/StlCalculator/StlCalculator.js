// import React, { useEffect, useState } from "react";
// import classes from "./StlCalculator.module.css";
// import CustomButton from "../customButton/CustomButton";
// import SliderScale from "../slider/Slider";
// import { StlViewer } from "react-stl-file-viewer";


// let calculatedVolume  = 1;


// const StlCalculator = (props) => {
//   const [volume, setvolume] = useState(0);
//   const [updatedScale, setUpdatedScale] = useState(1);
//   const [bigScaleHelper, setBigScaleHelper] = useState(1);
//   let volumeToBoundingBoxRatio;
//   let originalBoundingBoxVolume;
//   let boundingBoxVolume;
  
  
  
//   if (props.modelDimensions.length > 0.01 ) {
//     console.log(calculatedVolume)
//     originalBoundingBoxVolume =
//       props.modelDimensions.height  *
//       props.modelDimensions.width *
//       props.modelDimensions.length ;
//       boundingBoxVolume=originalBoundingBoxVolume*(updatedScale **3)
//       volumeToBoundingBoxRatio = volume / originalBoundingBoxVolume;
//       console.log(volumeToBoundingBoxRatio)
//     calculatedVolume = boundingBoxVolume * volumeToBoundingBoxRatio;
//   }



//   let itemCost = {
//     silkPla: 33,
//     resin: 55,
//     nylon: 45,
//   };

//   const [selectedMaterial, setSelectedMaterial] = useState("silkPla");
//   const changeHandler = (e) => {
//     setSelectedMaterial(e.target.value);
//     console.log(e.target.value);
//     console.log(itemCost[selectedMaterial]);
//   };

//   const onScaleUpdateHandler = (val) => {
//     props.onUpdateScale(val * bigScaleHelper);
//     setUpdatedScale(val * bigScaleHelper);
//   };

//   return (
//     <div>
//       <StlViewer url={props.file} volume={setvolume} />
//       <div className={classes.main}>
//         <div className={classes.volume__scale}>
//           <span>
//             {`Volume: ${calculatedVolume.toFixed(2)} `}cm
//             <sup style={{ fontSize: "16px" }}>3</sup>
//           </span>
//           {props.modelDimensions.length > 0 && (
//             <span>
//               Dimensions (cm) : W-L-H:
//               {(+props.modelDimensions.width*updatedScale).toFixed(1)}x{" "}
//               {(+props.modelDimensions.length*updatedScale).toFixed(1)}x{" "}
//               {(+props.modelDimensions.height*updatedScale).toFixed(1)}
//             </span>
//           )}
//           <SliderScale onScaleUpdate={onScaleUpdateHandler} />
//         </div>
//         <div className={classes.materials}>
//           <span>Select Material:</span>
//           <span className={classes.materialList}>
//             <input
//               defaultChecked
//               type="radio"
//               value="silkPla"
//               id="1"
//               name="material"
//               onChange={changeHandler}
//             />
//             Slik PLA
//             <input
//               type="radio"
//               value="resin"
//               id="2"
//               name="material"
//               onChange={changeHandler}
//             />
//             Resin
//             <input
//               type="radio"
//               value="nylon"
//               id="3"
//               name="material"
//               onChange={changeHandler}
//             />
//             Nylon
//           </span>
//         </div>

//         <span>
//           Estimated Cost: $
//           {(
//             ((calculatedVolume / 370).toFixed(2) * itemCost[selectedMaterial]/2)
            
//           ).toFixed(2)}{" "}
//         </span>
//       </div>
//       <div className={classes.orderButton}>
//         <CustomButton text="Proceed with the Order" width="100%" />
//       </div>
//     </div>
//   );
// };

// export default StlCalculator;
