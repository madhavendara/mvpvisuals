import { useEffect, useMemo } from 'react'
import { CanvasTexture, Mesh, SRGBColorSpace, type MeshStandardMaterial, type Object3D } from 'three'
import { panelIds, type CanopySurface, type PanelDesign, type PanelId, type ProductConfiguration } from '../product/types'
import { canopyPanelSize, canopyTextureSize, defaultFabricColor, panelTransform, textFont } from '../product/designs'

export const outerFabricMaterialName = 'fabric_Mat'

const decodedImages = new Map<string, Promise<HTMLImageElement>>()

function loadImage(url: string) {
  if (!decodedImages.has(url)) {
    const image = new Image()
    image.src = url
    decodedImages.set(url, image.decode().then(() => image))
  }
  return decodedImages.get(url)!
}

export async function loadDesignImages(designs: PanelDesign[]) {
  const urls = designs.flatMap((design) => design.layers.flatMap((layer) => layer.kind === 'image' ? [layer.url] : []))
  const images = await Promise.all(urls.map(loadImage))
  return new Map(urls.map((url, index) => [url, images[index]]))
}

function sourceFabricImage(scene: Object3D): CanvasImageSource {
  const meshes: Mesh[] = []
  scene.traverse((child) => {
    if (child instanceof Mesh) meshes.push(child)
  })
  const fabric = meshes.find((mesh) => (mesh.material as MeshStandardMaterial).name === outerFabricMaterialName)!
  return (fabric.material as MeshStandardMaterial).map!.image
}

export function drawDesign(context: CanvasRenderingContext2D, design: PanelDesign, width: number, height: number, images: Map<string, HTMLImageElement>) {
  context.fillStyle = design.color
  context.fillRect(0, 0, width, height)
  for (const layer of design.layers) {
    context.save()
    context.translate(layer.x * width, layer.y * height)
    context.rotate(layer.rotation * Math.PI / 180)
    if (layer.kind === 'text') {
      context.fillStyle = layer.color
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.font = textFont(layer)
      context.fillText(layer.text, 0, 0)
    } else {
      const imageWidth = 180 * layer.scale
      const imageHeight = imageWidth / layer.aspect
      context.drawImage(images.get(layer.url)!, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight)
    }
    context.restore()
  }
}

function paintCanopy(canvas: HTMLCanvasElement, sourceImage: CanvasImageSource, panels: ProductConfiguration['panels'], surfaces: Record<PanelId, CanopySurface>, images: Map<string, HTMLImageElement>) {
  const context = canvas.getContext('2d')!
  context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height)
  for (const id of panelIds) {
    const design = panels[id]
    if (design.color.toLowerCase() === defaultFabricColor && design.layers.length === 0) continue
    const size = canopyPanelSize(surfaces[id])
    const outline = surfaces[id].outline
    context.save()
    context.beginPath()
    context.moveTo(outline[0][0] * canopyTextureSize, outline[0][1] * canopyTextureSize)
    for (const [u, v] of outline.slice(1)) context.lineTo(u * canopyTextureSize, v * canopyTextureSize)
    context.closePath()
    context.clip()
    context.setTransform(...panelTransform(surfaces[id]))
    drawDesign(context, design, size.width, size.height, images)
    context.restore()
  }
}

export function useCanopyTexture(scene: Object3D, panels: ProductConfiguration['panels'], surfaces: Record<PanelId, CanopySurface>) {
  const sourceImage = useMemo(() => sourceFabricImage(scene), [scene])
  const surface = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canopyTextureSize
    canvas.height = canopyTextureSize
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.flipY = false
    texture.anisotropy = 4
    return { canvas, texture }
  }, [scene])

  useEffect(() => {
    let active = true
    let frame = 0
    loadDesignImages(panelIds.map((id) => panels[id])).then((images) => {
      if (!active) return
      frame = requestAnimationFrame(() => {
        paintCanopy(surface.canvas, sourceImage, panels, surfaces, images)
        surface.texture.needsUpdate = true
      })
    })
    return () => {
      active = false
      cancelAnimationFrame(frame)
    }
  }, [surface, sourceImage, panels, surfaces])

  useEffect(() => () => surface.texture.dispose(), [surface])
  return surface.texture
}
