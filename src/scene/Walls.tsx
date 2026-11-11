import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { wallFaces, type PanelDesign, type ProductConfiguration, type WallFace, type WallId } from '../product/types'
import { isDoubleSided, selectedWalls, wallSize, wallTextureSize } from '../product/walls'
import { unprintedFabricColor } from '../product/designs'
import { drawDesign, loadDesignImages } from './canopyTexture'
import type { ModelId } from '../product/models'
import { modelMeasurements } from '../product/modelMeasurements'

function wallFacePlacement(modelId: ModelId, wall: WallId, face: WallFace) {
  const size = wallSize(modelId, wall)
  const distance = modelMeasurements[modelId].legCenterOffset + (face === 'exterior' ? 0.002 : -0.002)
  const y = size.height / 2
  if (wall === 'backWall') {
    return { position: [0, y, -distance] as [number, number, number], rotationY: face === 'exterior' ? Math.PI : 0 }
  }
  if (wall === 'leftWall' || wall === 'leftHalfWall') {
    return { position: [-distance, y, 0] as [number, number, number], rotationY: face === 'exterior' ? -Math.PI / 2 : Math.PI / 2 }
  }
  return { position: [distance, y, 0] as [number, number, number], rotationY: face === 'exterior' ? Math.PI / 2 : -Math.PI / 2 }
}

function PrintedWallFace({ modelId, wall, face, design }: { modelId: ModelId; wall: WallId; face: WallFace; design: PanelDesign }) {
  const size = wallSize(modelId, wall)
  const textureSize = wallTextureSize(modelId, wall)
  const placement = wallFacePlacement(modelId, wall, face)
  const surface = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = textureSize.width
    canvas.height = textureSize.height
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 4
    return { canvas, texture }
  }, [textureSize.width, textureSize.height])

  useEffect(() => {
    let active = true
    let frame = 0
    loadDesignImages([design]).then((images) => {
      if (!active) return
      frame = requestAnimationFrame(() => {
        drawDesign(surface.canvas.getContext('2d')!, design, textureSize.width, textureSize.height, images)
        surface.texture.needsUpdate = true
      })
    })
    return () => {
      active = false
      cancelAnimationFrame(frame)
    }
  }, [surface, design, textureSize.width, textureSize.height])

  useEffect(() => () => surface.texture.dispose(), [surface])

  return <mesh position={placement.position} rotation-y={placement.rotationY} castShadow receiveShadow>
    <planeGeometry args={[size.width, size.height]} />
    <meshStandardMaterial map={surface.texture} roughness={0.9} />
  </mesh>
}

export function Walls({ modelId, config }: { modelId: ModelId; config: ProductConfiguration }) {
  return <>
    {selectedWalls(config.sideWalls, config.halfWalls).map((wall) => wallFaces.map((face) => {
      const printed = face === 'exterior' || isDoubleSided(config, wall)
      if (printed) return <PrintedWallFace key={`${wall}-${face}`} modelId={modelId} wall={wall} face={face} design={config.walls[wall][face]} />
      const size = wallSize(modelId, wall)
      const placement = wallFacePlacement(modelId, wall, face)
      return <mesh key={`${wall}-${face}`} position={placement.position} rotation-y={placement.rotationY} receiveShadow>
        <planeGeometry args={[size.width, size.height]} />
        <meshStandardMaterial color={unprintedFabricColor} roughness={0.9} />
      </mesh>
    }))}
  </>
}
