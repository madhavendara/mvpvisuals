import { Suspense } from 'react'
import { Canvas, type RootState } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { TentModel } from './TentModel'
import { Walls } from './Walls'
import { models } from '../product/models'
import { modelMeasurements } from '../product/modelMeasurements'
import type { ProductConfiguration } from '../product/types'
import { canopySurfaces } from '../product/canopySurfaces'

export const orbitView = { position: [3.4, 2.8, 5.4], target: [0, 0.7, 0] } as const

type SceneProps = { config: ProductConfiguration; onCreated?: (state: RootState) => void }

export default function Scene({ config, onCreated }: SceneProps) {
  const model = models.find((item) => item.id === config.modelId)!
  const scale = model.sizeFeet * 0.3048 / modelMeasurements[model.id].footprintWidth
  return <Canvas shadows camera={{ fov: 42, near: 0.1, far: 2000, position: [...orbitView.position] }} dpr={[1, 2]} onCreated={onCreated}>
    {/* Background */}
    <color attach="background" args={['#f7f7f5']} />
    
    {/* Lighting: soft fill light plus a sun that casts shadows */}
    <ambientLight intensity={1} />
    <directionalLight position={[5, 9, 4]} intensity={2.2} castShadow
      shadow-intensity={0.35} shadow-radius={4} shadow-mapSize={[2048, 2048]} shadow-bias={-0.0002}
      shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
    
    {/* Ground */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial color="#ffffff" roughness={1} toneMapped={false} />
    </mesh>


    {/* Main model: the tent and its walls, scaled to the real size in feet */}
    <Suspense fallback={null}>
      <group scale={scale}>
        <TentModel key={model.id} model={model} panels={config.panels} surfaces={canopySurfaces[model.id]} />
        <Walls modelId={model.id} config={config} />
      </group>
    </Suspense>

    
    {/* Camera controls: drag to orbit, scroll to zoom */}
    <OrbitControls makeDefault target={[...orbitView.target]} enablePan={false} minDistance={5} maxDistance={22} maxPolarAngle={Math.PI / 2.03} />
  </Canvas>
}
