import type { CanopySurface, DesignTarget, PanelDesign, ProductConfiguration, TextLayer } from './types'

export const defaultFabricColor = '#f1b241'
export const unprintedFabricColor = '#ece9e1'
export const designWidth = 512
export const canopyTextureSize = 2048

export function designAt(config: ProductConfiguration, target: DesignTarget): PanelDesign {
  if (target.kind === 'panel') return config.panels[target.panel]
  return config.walls[target.wall][target.face]
}

export function canopyPanelSize(surface: CanopySurface) {
  return { width: designWidth, height: Math.round(designWidth * surface.heightMeters / surface.widthMeters) }
}

export function panelTransform(surface: CanopySurface): [number, number, number, number, number, number] {
  const panel = canopyPanelSize(surface)
  const xs = surface.outline.map(([u]) => u * canopyTextureSize)
  const ys = surface.outline.map(([, v]) => v * canopyTextureSize)
  const left = Math.min(...xs)
  const right = Math.max(...xs)
  const top = Math.min(...ys)
  const bottom = Math.max(...ys)
  const width = right - left
  const height = bottom - top
  const axisVectors = { '+u': [width, 0], '-u': [-width, 0], '+v': [0, height], '-v': [0, -height] }
  const rightVector = axisVectors[surface.right]
  const downVector = axisVectors[surface.down]
  const originX = surface.right === '-u' || surface.down === '-u' ? right : left
  const originY = surface.right === '-v' || surface.down === '-v' ? bottom : top
  return [rightVector[0] / panel.width, rightVector[1] / panel.width, downVector[0] / panel.height, downVector[1] / panel.height, originX, originY]
}

export function textFont(layer: TextLayer) {
  return `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${Math.max(12, layer.fontSize * layer.scale)}px ${layer.fontFamily}`
}
