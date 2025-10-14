import React from 'react'
import { usePlane } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { MeshBasicMaterial } from 'three'

export default function Wall1(props) {
    const [ref1,api1] = usePlane(() => ({ rotation: [ 0,0, -Math.PI / 2], position:[0,20,-20] ,...props }))
    const [ref2,api2] = usePlane(() => ({ rotation: [ 0,-Math.PI / 2 , 0 ], position:[20,20,0] ,...props }))
    const [ref3,api3] = usePlane(() => ({ rotation: [ 0, Math.PI / 2,0], position:[-25,20,0] ,...props }))


    return (
      <>
      <mesh ref={ref1}>
        <planeGeometry   args={[50, 100]} />
        <meshBasicMaterial color={"#618f66"} />
      </mesh>
      <mesh ref={ref2}>
        <planeGeometry   args={[100, 50]} />
        <meshBasicMaterial color={"#658669"} />
      </mesh>
      <mesh ref={ref3}>
        <planeGeometry   args={[100, 50]} />
        <meshBasicMaterial color={"#658669"} />
      </mesh>
    
      </>
      
    )
}