import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, Center } from '@react-three/drei'
import { assetPath } from '../utils/assetPath'

function SceneModel() {
  const spinRef = useRef()
  const { scene } = useGLTF(assetPath('/scene.glb'))

  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += delta * 0.06
  })

  return (
    <group ref={spinRef} position={[3.5, 1.2, 0]}>
      <Center>
        <primitive
          object={scene}
          scale={0.002}
          rotation={[Math.PI / 2, 0, Math.PI / 2]}
        />
      </Center>
    </group>
  )
}

export default function HeroBg3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 11], fov: 52 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 4]}  intensity={1.1} color="#ffffff" />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#4477cc" />

      <Suspense fallback={null}>
        <SceneModel />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload(assetPath('/scene.glb'))
