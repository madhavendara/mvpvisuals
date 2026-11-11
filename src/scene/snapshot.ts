import type { PerspectiveCamera } from 'three'
import type { RootState } from '@react-three/fiber'
import { orbitView } from './Scene'

export function captureSnapshot({ gl, scene, camera: liveCamera, size, viewport }: RootState) {
  const camera = (liveCamera as PerspectiveCamera).clone()
  camera.aspect = 1200 / 800
  camera.updateProjectionMatrix()
  camera.position.set(orbitView.position[0], orbitView.position[1], orbitView.position[2])
  camera.lookAt(orbitView.target[0], orbitView.target[1], orbitView.target[2])
  gl.setPixelRatio(1)
  gl.setSize(1200, 800, false)
  gl.render(scene, camera)
  const preview = gl.domElement.toDataURL('image/jpeg', 0.9)
  gl.setPixelRatio(viewport.dpr)
  gl.setSize(size.width, size.height, false)
  return preview
}
