import type { ModelId } from './models'

export const panelIds = [
  'frontPeak', 'backPeak', 'leftPeak', 'rightPeak',
  'frontValance', 'backValance', 'leftValance', 'rightValance',
] as const

export const wallIds = ['backWall', 'leftWall', 'rightWall', 'leftHalfWall', 'rightHalfWall'] as const
export const wallFaces = ['exterior', 'interior'] as const

export type PanelId = (typeof panelIds)[number]
export type WallId = (typeof wallIds)[number]
export type WallFace = (typeof wallFaces)[number]
export type FrameOption = 'standard' | 'none' | 'lightUp'
export type SideWallsOption = 'none' | 'oneSingle' | 'threeSingle' | 'oneDouble' | 'threeDouble'
export type HalfWallsOption = 'none' | 'twoSingle' | 'twoDouble'
export type ArtworkService = 'none' | 'redraw'
export type CanopyColorTarget = 'all' | 'allValances'

type LayerBase = { id: string; x: number; y: number; scale: number; rotation: number }
export type TextLayer = LayerBase & {
  kind: 'text'
  text: string
  fontFamily: string
  fontSize: number
  color: string
  bold: boolean
  italic: boolean
}
export type ImageLayer = LayerBase & {
  kind: 'image'
  assetId: string
  url: string
  name: string
  aspect: number
}
export type ArtworkLayer = TextLayer | ImageLayer
export type PanelDesign = { color: string; layers: ArtworkLayer[] }
export type WallDesign = Record<WallFace, PanelDesign>
type UvPoint = readonly [number, number]
type UvAxis = '+u' | '-u' | '+v' | '-v'
export type CanopySurface = { outline: UvPoint[]; right: UvAxis; down: UvAxis; widthMeters: number; heightMeters: number }
export type CanopySurfaces = Record<ModelId, Record<PanelId, CanopySurface>>

export type DesignTarget =
  | { kind: 'panel'; panel: PanelId }
  | { kind: 'wall'; wall: WallId; face: WallFace }

export type ProductConfiguration = {
  version: 3
  productKey: 'logo-canopy-tent'
  modelId: ModelId
  frame: FrameOption
  sideWalls: SideWallsOption
  halfWalls: HalfWallsOption
  artworkService: ArtworkService
  quantity: number
  notes: string
  panels: Record<PanelId, PanelDesign>
  walls: Record<WallId, WallDesign>
}
