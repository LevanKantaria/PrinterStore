import { StlViewer } from "react-stl-viewer";
import classes from "./StlViewerV2.module.css";
import StlCalculator from "../StlCalculator/StlCalculator";
import DragAndDrop from "../dragAndDrop/DragAndDrop";
import { stlActions } from "../../features/stl/stlSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useState } from "react";
const url = "test.stl";

const style = {
  top: 0,
  left: 0,
  width: "100%",
  height: "50vw",
};


const floorProps = {
  gridWidth: 200,
  gridLength: 200,
};
const modelProps = {
    color: "green",
    scale: 10,
  };
function StlViewerV2() {
  const dispatch = useDispatch();
  const stlFile = useSelector((state) => state.stl.file);
  const [scaleModel, setScaleModel] = useState(10);
  const [modelDimensions, setModelDimensions] = useState({});

  const onUpdateScaleHandler = (updatedScale) => {
    modelProps.scale=updatedScale*10;
    setScaleModel(updatedScale*10);
   
  };
  console.log(modelDimensions)

  const uploadHandler = (e) => {
    dispatch(stlActions.uploadFile(e));
  };
 
  return (
    <div>
      <div className={classes.canvas}>
        <StlViewer
          style={style}
          orbitControls
          shadows
          url={stlFile}
          showAxes
          modelProps={modelProps}
          floorProps={floorProps}
          onFinishLoading={(ev) => setModelDimensions(ev)}
          
        />
      </div>
      <div className={classes.calculator}>
        {/* <StlCalculator
          file={stlFile}
          scale={scaleModel}
          onUpdateScale={onUpdateScaleHandler}
          modelDimensions={modelDimensions}
        /> */}
        <DragAndDrop
          onChange={uploadHandler}
          text="Select STL File or drag it here:"
        />
      </div>
    </div>
  );
}

export default StlViewerV2;
