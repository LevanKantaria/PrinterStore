import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useBox, } from '@react-three/cannon'
import { useSpring } from '@react-three/cannon'


export function Linkedin2(props) {
    const { nodes, materials } = useGLTF('link.glb')
    const [ref,api] = useBox(() => ({ mass: 1, position: [5, 5, 0], args:[2,2,2], onCollide: onCollide }))

const onCollide = () =>{
  // window.alert('message')
}

useFrame(({mouse})=>{
  // api.rotation.set([0,0,0])
})

const onUpdate = (e)=>{
  console.log(e)
}

const onClick = () =>{
  console.log('clicked')
  // api.applyTorque([100,100,100])
  // api.applyForce([50,50,50],[10,10,10])
  // api.rotation.set(1,0,0)
}


  
    return (
      <group ref={ref} {...props} dispose={null}>
        <mesh   geometry={nodes.text_1.geometry} 
          onClick={onClick}
          onUpdate={(e)=>onUpdate(e)}
        >
          <meshStandardMaterial color={'red'} />
        </mesh>
      </group>
    )
  }

  useGLTF.preload('link.glb')
