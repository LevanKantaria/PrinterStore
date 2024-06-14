import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Model from './Model';
import * as THREE from 'three'; // Importing THREE from three

import { GridHelper, Color, DirectionalLight, AmbientLight } from 'three';

function STLViewer() {
  const fileInputRef = useRef();
  const [file, setFile] = useState(null);
  const [volume, setVolume] = useState(null); // State to hold volume

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFile(url);
      setVolume(null); // Reset volume when file changes
    }
  };

  const handleVolumeChange = (vol) => {
    setVolume(vol); // Update volume state
  };

  return (
    <div style={{ height: '100vh' }}>
      <input type="file" accept=".stl" onChange={handleFileChange} ref={fileInputRef} />
      <div>{volume !== null && `Volume: ${volume.toFixed(2)} cubic units`}</div>
      {file && (
        <Canvas
          shadowmap='true'
          camera={{ position: [0, 0, 10] }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >          <gridHelper args={[10, 10]} />

          {/* Lights */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          
          {/* Model */}
          <Model file={file} onVolumeChange={handleVolumeChange} />
          
          {/* Controls */}
          <OrbitControls />
        </Canvas>
      )}
    </div>
  );
}

export default STLViewer;
