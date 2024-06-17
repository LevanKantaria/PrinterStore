import React from 'react'
import { usePlane } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { MeshBasicMaterial } from 'three'

export default function Floor(props) {
    const [ref,api] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position:[0,0,0] ,...props }))

    useFrame(({mouse})=>{
        // api.rotation.set(-Math.PI / 2 + mouse.y*-0.08, -Math.PI / 2 * mouse.x*-0.08, 0)
    })
    return (
      <mesh ref={ref}>
        <planeGeometry   args={[100, 100]} />
        <meshBasicMaterial color={"#3c553f"} />
      </mesh>
    )
}