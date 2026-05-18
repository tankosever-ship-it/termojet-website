import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { assetPath } from '../utils/assetPath'

function SceneModel() {
  const ref = useRef()
  const { scene } = useGLTF(assetPath('/scene.glb'))

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06
  })

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={0.012}
      position={[1.5, -1.2, 0]}
      rotation={[0.15, -0.4, 0]}
    />
  )
}

export default function HeroBg3D() {
  return (
    <Canvas
      camera={{ position: [0, 2, 9], fov: 50 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 8, 4]}  intensity={0.9} color="#ffffff" />
      <directionalLight position={[-6, 2, -4]} intensity={0.5} color="#2457A0" />
      <pointLight       position={[0, 4, 2]}   intensity={0.8} color="#FF5500" distance={18} />

      <Suspense fallback={null}>
        <SceneModel />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload(assetPath('/scene.glb'))
