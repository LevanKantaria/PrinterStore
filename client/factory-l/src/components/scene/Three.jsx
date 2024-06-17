import React from "react";
import { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Linkedin } from "./Linkedin.jsx";
import { Linkedin2 } from "./Linkedin2.jsx";
import { Balls } from "./Balls.jsx";
import { Clump } from "./Clump.jsx";
import Floor from "./floor.jsx";
import Wall1 from "./Wall1.jsx";
import { Physics, Debug } from "@react-three/cannon";

function CameraControls() {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    camera.position.set(0, 2, 5);
    controlsRef.current.update();
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 0, 0]}
      maxPolarAngle={1.3}
      minPolarAngle={0.4}
    />
  );
}

const Three = () => {
  return (
    <div style={{ width: "100vw", height: "500px" }} id="canvas-container">
      <Canvas>
        <CameraControls />
        <ambientLight intensity={0.5} />
        <directionalLight color="white" position={[0, 5, 5]} />`
        <Physics>
        <Wall1/>
          <Linkedin />
          <Linkedin2 />
          <Floor />
          <Balls />
        </Physics>
      </Canvas>
    </div>
  );
};

export default Three;
