import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { computeVolume } from './Volume';

function Model({ geometry: sourceGeometry, onVolumeChange, onDimensionsChange, unitMultiplier = 1, userScale = 1, color = '#2c7be5' }) {
  const geometry = useMemo(() => {
    if (!sourceGeometry) {
      return null;
    }

    if (!sourceGeometry.isBufferGeometry) {
      console.warn('Provided geometry is not a BufferGeometry instance.');
      return null;
    }

    const geom = sourceGeometry.clone();
    const scaleFactor = unitMultiplier * userScale;
    geom.computeVertexNormals();
    geom.scale(scaleFactor, scaleFactor, scaleFactor);
    geom.center();
    return geom;
  }, [sourceGeometry, unitMultiplier, userScale]);

  const { scale, size } = useMemo(() => {
    if (!geometry) {
      return { scale: 1, size: null };
    }

    geometry.computeBoundingBox();
    const dimensions = new THREE.Vector3();
    geometry.boundingBox?.getSize(dimensions);
    const maxAxis = Math.max(dimensions.x, dimensions.y, dimensions.z);

    if (!maxAxis || maxAxis === 0) {
      return { scale: 1, size: dimensions };
    }

    const targetSize = 6; // fit to viewport roughly
    return { scale: targetSize / maxAxis, size: dimensions };
  }, [geometry]);

  useEffect(() => {
    if (!geometry) {
      return;
    }

    const volume = computeVolume(geometry);
    onVolumeChange?.(volume);

    if (size) {
      onDimensionsChange?.({ x: size.x, y: size.y, z: size.z });
    }
  }, [geometry, onVolumeChange, onDimensionsChange, size]);

  if (!geometry) {
    return null;
  }

  return (
    <group scale={scale} castShadow receiveShadow>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.6} />
      </mesh>
    </group>
  );
}

export default Model;
