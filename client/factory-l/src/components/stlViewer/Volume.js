import * as THREE from 'three';

export const computeVolume = (geometry) => {
  let volume = 0.0;
  const positions = geometry.attributes.position.array;
  const n = positions.length;

  for (let i = 0; i < n; i += 9) {
    const p1 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
    const p2 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
    const p3 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);

    volume += signedVolumeOfTriangle(p1, p2, p3);
  }

  return Math.abs(volume);
};

const signedVolumeOfTriangle = (p1, p2, p3) => {
  return p1.dot(p2.cross(p3)) / 6.0;
};
