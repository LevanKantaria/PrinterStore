import { useGLTF } from '@react-three/drei'

import { useBox, } from '@react-three/cannon'

export function Linkedin(props) {
    const { nodes, materials } = useGLTF('link.glb')
    const [ref] = useBox(() => ({ mass: 1, position: [0, 5, 0], args:[2,2,2], onCollide: onCollide }))

const onCollide = () =>{
  // window.alert('message')
}
    return (
      <group ref={ref} {...props} dispose={null}>
        <mesh   geometry={nodes.text.geometry} material={materials.text} />
        <mesh   geometry={nodes.text_1.geometry} material={materials.box} />
      </group>
    )
  }

  useGLTF.preload('link.glb')
