import React, { useState, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { computeVolume } from './Volume.js';

function Model({ file, onVolumeChange }) {
  const [geometry, setGeometry] = useState(null);
  const [volume, setVolume] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedGeometry = await new Promise((resolve, reject) => {
          const loader = new STLLoader();
          loader.load(file, resolve, undefined, reject);
        });

        // Compute the volume
        const vol = computeVolume(loadedGeometry);
        setVolume(vol);

        // Adjust scale based on volume
        if (vol < 1) {
          loadedGeometry.scale(10, 10, 10); // Scale up by 10 times
        }

        // Set the geometry state
        setGeometry(loadedGeometry);
      } catch (error) {
        console.error('Error loading STL file:', error);
      }
    };

    if (file) {
      loadModel();
    }
  }, [file]);

  useEffect(() => {
    if (geometry) {
      const vol = computeVolume(geometry);
      setVolume(vol);
      if (onVolumeChange) {
        onVolumeChange(vol); // Notify parent component about the volume
      }
    }
  }, [geometry]);

  return (
    <>
      {geometry && (
        <mesh geometry={geometry}>
          <meshStandardMaterial color="green" />
        </mesh>
      )}
    </>
  );
}

export default Model;
