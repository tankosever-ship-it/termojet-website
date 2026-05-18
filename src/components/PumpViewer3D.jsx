import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { assetPath } from '../utils/assetPath'

function PumpModel() {
  const ref = useRef()
  const { scene } = useGLTF(assetPath('/pump.glb'))

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.25
  })

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={0.018}
      position={[0, -0.5, 0]}
    />
  )
}

export default function PumpViewer3D() {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)' }}>

      {/* Dark gradient bg */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1B3F6B 60%, #0a1628 100%)' }} />
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-30" />

      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 2, -5]} intensity={0.4} color="#4477ff" />
        <pointLight position={[0, 5, 0]} intensity={0.6} color="#FF5500" />

        <Suspense fallback={null}>
          <PumpModel />
          <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={8} blur={2} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={10}
          autoRotate={false}
        />
      </Canvas>

      {/* Overlay label */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
        <div>
          <div className="eyebrow-white mb-0.5">Інтерактивна 3D модель</div>
          <div className="text-white font-semibold text-sm">Насос APM50-10F-280 · Перетягни для огляду</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/15 border border-white/25 backdrop-blur-sm pointer-events-auto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

useGLTF.preload(assetPath('/pump.glb'))
