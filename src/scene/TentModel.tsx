import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Mesh, type MeshStandardMaterial } from 'three'
import { outerFabricMaterialName, useCanopyTexture } from './canopyTexture'
import type { Model } from '../product/models'
import type { CanopySurface, PanelId, ProductConfiguration } from '../product/types'

export function TentModel({ model, panels, surfaces }: 
  { model: Model; panels: ProductConfiguration['panels']; surfaces: Record<PanelId, CanopySurface> }) {
  const { scene } = useGLTF(model.url)
  const canopyTexture = useCanopyTexture(scene, panels, surfaces)
  const { object, groundOffset, materials } = useMemo(() => {
    const object = scene.clone(true)
    const materials: MeshStandardMaterial[] = []
    object.traverse((child) => {
      if (!(child instanceof Mesh)) return
      child.castShadow = true
      child.receiveShadow = true
      const material = child.material as MeshStandardMaterial
      if (material.name !== outerFabricMaterialName) return
      const customized = material.clone()
      customized.map = canopyTexture
      customized.needsUpdate = true
      materials.push(customized)
      child.material = customized
    })
    const bounds = new Box3().setFromObject(object)
    return { object, groundOffset: bounds.min.y, materials }
  }, [scene, canopyTexture])
  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials])

  return <primitive object={object} position={[0, -groundOffset, 0]} />
}
