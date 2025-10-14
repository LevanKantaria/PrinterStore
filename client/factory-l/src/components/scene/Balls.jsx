import { useGLTF } from '@react-three/drei'
import { useFrame , useThree} from '@react-three/fiber'
import { useBox, useSphere, } from '@react-three/cannon'
import { useSpring } from '@react-three/cannon'
import THREE from './Three'


export function Balls(props) {
    const [ref] = useSphere(() => ({ mass: 0.1, position: [-5, 5, 0], ...props }))
    return (
      <mesh ref={ref} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={"#ff0000"} />
      </mesh>
    )
  }

  useGLTF.preload('link.glb')
