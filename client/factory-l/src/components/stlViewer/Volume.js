import * as THREE from 'three';

export const computeVolume = (geometry) => {
  if (!geometry || !geometry.attributes?.position) {
    return 0;
  }

  let volume = 0;
  const positions = geometry.attributes.position.array;
  const vectorPool = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

  for (let i = 0; i < positions.length; i += 9) {
    vectorPool[0].set(positions[i], positions[i + 1], positions[i + 2]);
    vectorPool[1].set(positions[i + 3], positions[i + 4], positions[i + 5]);
    vectorPool[2].set(positions[i + 6], positions[i + 7], positions[i + 8]);

    volume += signedVolumeOfTriangle(vectorPool[0], vectorPool[1], vectorPool[2]);
  }

  return Math.abs(volume);
};

const signedVolumeOfTriangle = (p1, p2, p3) => {
  return p1.dot(p2.cross(p3)) / 6.0;
};
