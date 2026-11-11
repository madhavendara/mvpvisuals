import { useRef, type PointerEvent } from 'react'
import { useConfigurator } from '../store'
import { textFont, unprintedFabricColor } from '../product/designs'
import type { ArtworkLayer, DesignTarget, PanelDesign } from '../product/types'

export type LayoutSurface = {
  key: string
  target: DesignTarget
  outline: [number, number][]
  transform: [number, number, number, number, number, number]
  width: number
  height: number
  design: PanelDesign
  printed: boolean
  caption?: { x: number; y: number; text: string }
}

const measureContext = document.createElement('canvas').getContext('2d')!

function layerSize(layer: ArtworkLayer) {
  if (layer.kind === 'text') {
    measureContext.font = textFont(layer)
    return { width: measureContext.measureText(layer.text).width, height: Math.max(12, layer.fontSize * layer.scale) }
  }
  const width = 180 * layer.scale
  return { width, height: width / layer.aspect }
}

function layerFits(layer: ArtworkLayer, surface: LayoutSurface) {
  const size = layerSize(layer)
  const [a, b, c, d, e, f] = surface.transform
  const determinant = a * d - b * c
  const polygon = surface.outline.map(([x, y]) => [(d * (x - e) - c * (y - f)) / determinant, (a * (y - f) - b * (x - e)) / determinant])
  const centerX = layer.x * surface.width
  const centerY = layer.y * surface.height
  const cos = Math.cos(layer.rotation * Math.PI / 180)
  const sin = Math.sin(layer.rotation * Math.PI / 180)
  for (const [signX, signY] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const localX = signX * size.width / 2
    const localY = signY * size.height / 2
    const cornerX = centerX + localX * cos - localY * sin
    const cornerY = centerY + localX * sin + localY * cos
    let side = 0
    for (let index = 0; index < polygon.length; index += 1) {
      const start = polygon[index]
      const end = polygon[(index + 1) % polygon.length]
      const cross = (end[0] - start[0]) * (cornerY - start[1]) - (end[1] - start[1]) * (cornerX - start[0])
      if (cross === 0) continue
      if (side === 0) side = Math.sign(cross)
      else if (Math.sign(cross) !== side) return false
    }
  }
  return true
}

export function canApplyTextChange(surface: LayoutSurface, current: ArtworkLayer, next: ArtworkLayer) {
  return !layerFits(current, surface) || layerFits(next, surface)
}

const styles = {
  wrapper: { base: 'flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden p-4' },
  board: { base: 'min-h-0 w-full flex-1 touch-none select-none rounded-[3px] bg-[#ede8e7]' },
  surface: {
    base: 'outline-none',
    variants: { printed: 'cursor-pointer', unprinted: 'cursor-not-allowed' },
  },
  layer: { base: 'cursor-move' },
  rotateCorner: { base: 'cursor-[url(/cursors/rotate.svg)_12_12,_grab]' },
  resizeCorner: {
    base: 'touch-none',
    variants: { falling: 'cursor-nwse-resize', rising: 'cursor-nesw-resize' },
  },
  help: { base: 'max-w-[560px] text-center text-[15px] leading-relaxed text-[#8a8584]' },
}

function SvgLayer({ layer, width, height, selected, onPick, onMove, onRotateStart, onRotate, onResizeStart, onResize }: {
  layer: ArtworkLayer
  width: number
  height: number
  selected: boolean
  onPick: () => void
  onMove: (event: PointerEvent<SVGGElement>) => void
  onRotateStart: (event: PointerEvent<SVGGElement>) => void
  onRotate: (event: PointerEvent<SVGGElement>) => void
  onResizeStart: (event: PointerEvent<SVGGElement>) => void
  onResize: (event: PointerEvent<SVGGElement>) => void
}) {
  const size = layerSize(layer)
  const handleSize = width * 0.025
  const rotateSize = width * 0.05
  const boxLeft = -size.width / 2 - 4
  const boxTop = -size.height / 2 - 4
  const boxRight = size.width / 2 + 4
  const boxBottom = size.height / 2 + 4
  const corners = [
    { key: 'top-left', x: boxLeft, y: boxTop, signX: -1, signY: -1, cursor: 'falling' as const },
    { key: 'top-right', x: boxRight, y: boxTop, signX: 1, signY: -1, cursor: 'rising' as const },
    { key: 'bottom-right', x: boxRight, y: boxBottom, signX: 1, signY: 1, cursor: 'falling' as const },
    { key: 'bottom-left', x: boxLeft, y: boxBottom, signX: -1, signY: 1, cursor: 'rising' as const },
  ]

  return <g className={styles.layer.base}
    transform={`translate(${layer.x * width} ${layer.y * height}) rotate(${layer.rotation})`}
    onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); onPick() }}
    onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) onMove(event) }}>
    {layer.kind === 'text' && <text textAnchor="middle" dominantBaseline="middle" fontSize={size.height} fontFamily={layer.fontFamily}
      fontWeight={layer.bold ? 700 : 400} fontStyle={layer.italic ? 'italic' : 'normal'} fill={layer.color}>{layer.text}</text>}
    {layer.kind === 'image' && <image href={layer.url} x={-size.width / 2} y={-size.height / 2} width={size.width} height={size.height} />}
    {selected && <rect x={boxLeft} y={boxTop} width={boxRight - boxLeft} height={boxBottom - boxTop}
      fill="none" stroke="#242722" strokeWidth={2} strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />}
    {selected && corners.map((corner) => <g key={`rotate-${corner.key}`} className={styles.rotateCorner.base}
      onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); onRotateStart(event) }}
      onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) onRotate(event) }}>
      <rect x={corner.signX < 0 ? corner.x - handleSize / 2 - rotateSize : corner.x + handleSize / 2}
        y={corner.signY < 0 ? corner.y - handleSize / 2 - rotateSize : corner.y + handleSize / 2}
        width={rotateSize} height={rotateSize} fill="transparent" />
    </g>)}
    {selected && corners.map((corner) => <g key={`resize-${corner.key}`} className={`${styles.resizeCorner.base} ${styles.resizeCorner.variants[corner.cursor]}`}
      onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); onResizeStart(event) }}
      onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) onResize(event) }}>
      <rect x={corner.x - handleSize / 2} y={corner.y - handleSize / 2} width={handleSize} height={handleSize}
        fill="#ffffff" stroke="#242722" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </g>)}
  </g>
}

export default function LayoutEditor({ viewBox, surfaces, activeKey, help, onSelectSurface }: {
  viewBox: { width: number; height: number }
  surfaces: LayoutSurface[]
  activeKey: string
  help: string
  onSelectSurface: (surface: LayoutSurface) => void
}) {
  const selectedLayerId = useConfigurator((state) => state.selectedLayerId)
  const selectLayer = useConfigurator((state) => state.selectLayer)
  const updateLayer = useConfigurator((state) => state.updateLayer)
  const rotationStart = useRef({ pointerAngle: 0, rotation: 0 })
  const resizeStart = useRef({ distance: 1, scale: 1 })

  const pointInPanel = (event: PointerEvent<SVGGElement>) => {
    const panelGroup = event.currentTarget.closest('[data-panel-space]') as SVGGElement
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(panelGroup.getScreenCTM()!.inverse())
  }

  const moveLayer = (surface: LayoutSurface, layer: ArtworkLayer, event: PointerEvent<SVGGElement>) => {
    const point = pointInPanel(event)
    const x = Math.max(0, Math.min(1, point.x / surface.width))
    const y = Math.max(0, Math.min(1, point.y / surface.height))
    updateLayer(surface.target, layer.id, { x, y })
  }

  const pointerAngle = (surface: LayoutSurface, layer: ArtworkLayer, event: PointerEvent<SVGGElement>) => {
    const point = pointInPanel(event)
    return Math.atan2(point.y - layer.y * surface.height, point.x - layer.x * surface.width) * 180 / Math.PI
  }

  const startRotation = (surface: LayoutSurface, layer: ArtworkLayer, event: PointerEvent<SVGGElement>) => {
    rotationStart.current = { pointerAngle: pointerAngle(surface, layer, event), rotation: layer.rotation }
  }

  const rotateLayer = (surface: LayoutSurface, layer: ArtworkLayer, event: PointerEvent<SVGGElement>) => {
    let rotation = rotationStart.current.rotation + pointerAngle(surface, layer, event) - rotationStart.current.pointerAngle
    while (rotation > 180) rotation -= 360
    while (rotation < -180) rotation += 360
    updateLayer(surface.target, layer.id, { rotation: Math.round(rotation) })
  }

  const pointerDistance = (surface: LayoutSurface, layer: ArtworkLayer, event: PointerEvent<SVGGElement>) => {
    const point = pointInPanel(event)
    return Math.hypot(point.x - layer.x * surface.width, point.y - layer.y * surface.height)
  }

  const startResize = (surface: LayoutSurface, layer: ArtworkLayer, event: PointerEvent<SVGGElement>) => {
    resizeStart.current = { distance: pointerDistance(surface, layer, event), scale: layer.scale }
  }

  const resizeLayer = (surface: LayoutSurface, layer: ArtworkLayer, event: PointerEvent<SVGGElement>) => {
    const scale = resizeStart.current.scale * pointerDistance(surface, layer, event) / resizeStart.current.distance
    updateLayer(surface.target, layer.id, { scale: Math.round(Math.max(0.05, Math.min(10, scale)) * 100) / 100 })
  }

  return <div className={styles.wrapper.base}>
    <svg className={styles.board.base} viewBox={`0 0 ${viewBox.width} ${viewBox.height}`} preserveAspectRatio="xMidYMid meet">
      {surfaces.map((surface) => {
        const active = surface.key === activeKey
        return <g key={surface.key}>
          <clipPath id={`clip-${surface.key}`}><polygon points={surface.outline.map((point) => point.join(',')).join(' ')} /></clipPath>
          <g className={`${styles.surface.base} ${styles.surface.variants[surface.printed ? 'printed' : 'unprinted']}`} clipPath={`url(#clip-${surface.key})`}
            onPointerDown={() => { if (surface.printed) { onSelectSurface(surface); selectLayer(null) } }}>
            <g data-panel-space transform={`matrix(${surface.transform.join(' ')})`}>
              <rect width={surface.width} height={surface.height} fill={surface.printed ? surface.design.color : unprintedFabricColor} />
              {surface.printed && surface.design.layers.map((layer) => <SvgLayer key={layer.id} layer={layer} width={surface.width} height={surface.height}
                selected={active && selectedLayerId === layer.id}
                onPick={() => { onSelectSurface(surface); selectLayer(layer.id) }}
                onMove={(event) => moveLayer(surface, layer, event)}
                onRotateStart={(event) => startRotation(surface, layer, event)}
                onRotate={(event) => rotateLayer(surface, layer, event)}
                onResizeStart={(event) => startResize(surface, layer, event)}
                onResize={(event) => resizeLayer(surface, layer, event)} />)}
            </g>
          </g>
          <polygon points={surface.outline.map((point) => point.join(',')).join(' ')} fill="none" pointerEvents="none" vectorEffect="non-scaling-stroke"
            stroke={active ? '#b87649' : '#8f9389'} strokeWidth={active ? 2.5 : 1.2} strokeDasharray={active ? undefined : '5 4'} />
          {surface.caption && <text x={surface.caption.x} y={surface.caption.y} fontSize={18} fontWeight={700} fill="#62665d"
            fontFamily="Arial, Helvetica, sans-serif">{surface.caption.text}</text>}
        </g>
      })}
    </svg>
    <p className={styles.help.base}>{help}</p>
  </div>
}
