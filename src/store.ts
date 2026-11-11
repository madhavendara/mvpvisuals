import { create } from 'zustand'
import type { ModelId } from './product/models'
import { initialConfiguration } from './product/defaults'
import { designAt } from './product/designs'
import { isDoubleSided, selectedWalls } from './product/walls'
import { panelIds, type ArtworkLayer, type ArtworkService, type CanopyColorTarget, type DesignTarget, type FrameOption, type HalfWallsOption, type ImageLayer, type PanelDesign, type PanelId, type ProductConfiguration, type SideWallsOption, type TextLayer, type WallFace, type WallId } from './product/types'

type EditorTab = 'canopy' | 'walls'

type ConfiguratorState = {
  config: ProductConfiguration
  designBackup: ProductConfiguration | null
  designSaved: boolean
  editorTab: EditorTab
  activePanel: PanelId
  activeWall: WallId
  activeFace: WallFace
  selectedLayerId: string | null
  errorToastVisible: boolean
  selectModel: (id: ModelId) => void
  setFrame: (value: FrameOption) => void
  setSideWalls: (value: SideWallsOption) => void
  setHalfWalls: (value: HalfWallsOption) => void
  setArtworkService: (value: ArtworkService) => void
  setQuantity: (value: number) => void
  setNotes: (value: string) => void
  setEditorTab: (tab: EditorTab) => void
  setActivePanel: (id: PanelId) => void
  setActiveWall: (id: WallId) => void
  setActiveFace: (face: WallFace) => void
  setDesignColor: (target: DesignTarget, color: string) => void
  applyCanopyColor: (target: CanopyColorTarget, color: string) => void
  addText: (target: DesignTarget) => void
  addImage: (target: DesignTarget, image: Pick<ImageLayer, 'assetId' | 'url' | 'name' | 'aspect'>) => void
  updateLayer: (target: DesignTarget, id: string, patch: Partial<ArtworkLayer>) => void
  removeLayer: (target: DesignTarget, id: string) => void
  selectLayer: (id: string | null) => void
  beginDesign: () => void
  saveDesign: () => void
  cancelDesign: () => void
  showErrorToast: () => void
  hideErrorToast: () => void
}

function createLayerId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function withDesign(config: ProductConfiguration, target: DesignTarget, design: PanelDesign): ProductConfiguration {
  if (target.kind === 'panel') return { ...config, panels: { ...config.panels, [target.panel]: design } }
  return { ...config, walls: { ...config.walls, [target.wall]: { ...config.walls[target.wall], [target.face]: design } } }
}

function withLayers(config: ProductConfiguration, target: DesignTarget, layers: ArtworkLayer[]): ProductConfiguration {
  return withDesign(config, target, { ...designAt(config, target), layers })
}

function wallSelection(state: ConfiguratorState, config: ProductConfiguration) {
  const walls = selectedWalls(config.sideWalls, config.halfWalls)
  const activeWall = walls.includes(state.activeWall) || walls.length === 0 ? state.activeWall : walls[0]
  const editorTab: EditorTab = walls.length === 0 ? 'canopy' : state.editorTab
  const activeFace: WallFace = walls.length > 0 && !isDoubleSided(config, activeWall) ? 'exterior' : state.activeFace
  return { config, activeWall, editorTab, activeFace, selectedLayerId: null }
}

export const useConfigurator = create<ConfiguratorState>()((set) => ({
  config: initialConfiguration,
  designBackup: null,
  designSaved: false,
  editorTab: 'canopy',
  activePanel: 'frontValance',
  activeWall: 'backWall',
  activeFace: 'exterior',
  selectedLayerId: null,
  errorToastVisible: false,
  selectModel: (modelId) => set((state) => ({ config: { ...state.config, modelId } })),
  setFrame: (frame) => set((state) => ({ config: { ...state.config, frame } })),
  setSideWalls: (sideWalls) => set((state) => {
    const halfWalls = sideWalls === 'threeSingle' || sideWalls === 'threeDouble' ? 'none' : state.config.halfWalls
    return wallSelection(state, { ...state.config, sideWalls, halfWalls })
  }),
  setHalfWalls: (halfWalls) => set((state) => wallSelection(state, { ...state.config, halfWalls })),
  setArtworkService: (artworkService) => set((state) => ({ config: { ...state.config, artworkService } })),
  setQuantity: (quantity) => set((state) => ({ config: { ...state.config, quantity } })),
  setNotes: (notes) => set((state) => ({ config: { ...state.config, notes } })),
  setEditorTab: (editorTab) => set({ editorTab, selectedLayerId: null }),
  setActivePanel: (activePanel) => set({ activePanel, selectedLayerId: null }),
  setActiveWall: (activeWall) => set((state) => ({
    activeWall,
    activeFace: isDoubleSided(state.config, activeWall) ? state.activeFace : 'exterior',
    selectedLayerId: null,
  })),
  setActiveFace: (activeFace) => set({ activeFace, selectedLayerId: null }),
  setDesignColor: (target, color) => set((state) => ({ config: withDesign(state.config, target, { ...designAt(state.config, target), color }) })),
  applyCanopyColor: (target, color) => set((state) => {
    const targets = target === 'all' ? panelIds : panelIds.filter((id) => id.endsWith('Valance'))
    const panels = { ...state.config.panels }
    for (const id of targets) panels[id] = { ...panels[id], color }
    return { config: { ...state.config, panels } }
  }),
  addText: (target) => set((state) => {
    const layer: TextLayer = { id: createLayerId(), kind: 'text', text: 'Your text', x: 0.5, y: 0.5, scale: 1, rotation: 0, fontFamily: 'Arial', fontSize: 40, color: '#18181b', bold: true, italic: false }
    return { selectedLayerId: layer.id, config: withLayers(state.config, target, [...designAt(state.config, target).layers, layer]) }
  }),
  addImage: (target, image) => set((state) => {
    const layer: ImageLayer = { id: createLayerId(), kind: 'image', ...image, x: 0.5, y: 0.5, scale: 1, rotation: 0 }
    return { selectedLayerId: layer.id, config: withLayers(state.config, target, [...designAt(state.config, target).layers, layer]) }
  }),
  updateLayer: (target, id, patch) => set((state) => {
    const layers = designAt(state.config, target).layers.map((layer) => layer.id === id ? { ...layer, ...patch } as ArtworkLayer : layer)
    return { config: withLayers(state.config, target, layers) }
  }),
  removeLayer: (target, id) => set((state) => {
    const layers = designAt(state.config, target).layers.filter((layer) => layer.id !== id)
    const selectedLayerId = state.selectedLayerId === id ? null : state.selectedLayerId
    return { selectedLayerId, config: withLayers(state.config, target, layers) }
  }),
  selectLayer: (selectedLayerId) => set({ selectedLayerId }),
  beginDesign: () => set((state) => ({ designBackup: state.config, selectedLayerId: null })),
  saveDesign: () => set({ designBackup: null, designSaved: true, selectedLayerId: null }),
  cancelDesign: () => set((state) => ({ config: state.designBackup!, designBackup: null, selectedLayerId: null })),
  showErrorToast: () => set({ errorToastVisible: true }),
  hideErrorToast: () => set({ errorToastVisible: false }),
}))
