import { useState, type ChangeEvent } from 'react'
import { canopySurfaces } from '../product/canopySurfaces'
import { configuratorApi } from '../api/client'
import { useConfigurator } from '../store'
import { canopyPanelSize, canopyTextureSize, designAt, panelTransform } from '../product/designs'
import { isDoubleSided, selectedWalls, wallTextureSize } from '../product/walls'
import { panelIds, wallFaces, type ArtworkLayer, type DesignTarget } from '../product/types'
import type { PricingCatalog } from '../product/commerce'
import LayoutEditor, { canApplyTextChange, type LayoutSurface } from './LayoutEditor'
import ScenePanel from './ScenePanel'

const wallFaceGap = 64
const wallCaptionSpace = 40
const wallBoardPadding = 48

const styles = {
  dialog: { base: "fixed inset-0 z-50 flex flex-col bg-[#ede8e7] font-['Overpass',sans-serif] text-[#1d1d1d] max-[900px]:overflow-y-auto" },
  topBar: { base: 'flex shrink-0 items-center justify-between gap-4 bg-white px-6 py-3 shadow-[0_1px_0_#e2dcda] max-[700px]:flex-wrap max-[700px]:px-4' },
  topTabs: { base: 'flex gap-1  bg-[#ede8e7] p-1' },
  topTab: {
    base: "px-5 py-2 font-['Encode_Sans_Expanded',sans-serif] text-[13px] font-semibold uppercase tracking-[.06em]",
    variants: { active: 'bg-[#1d1d1d] text-white', idle: 'text-[#444] hover:bg-white', disabled: 'cursor-not-allowed text-[#b9b4b2]' },
  },
  title: { base: "font-['Encode_Sans_Expanded',sans-serif] text-[18px] font-normal text-[#8a8584] max-[1100px]:hidden" },
  exitActions: { base: 'flex items-center gap-2' },
  cancelButton: { base: " bg-white px-5 py-3 font-['Encode_Sans_Expanded',sans-serif] text-[13px] font-semibold text-[#1d1d1d] shadow-[0_0_0_1px_#e2dcda] hover:shadow-[0_0_0_1px_#1d1d1d]" },
  exitButton: { base: " bg-[#1d1d1d] px-5 py-3 font-['Encode_Sans_Expanded',sans-serif] text-[13px] font-semibold text-white hover:bg-[#3a3a3a]" },
  subBar: { base: 'flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 bg-white px-6 py-3 shadow-[0_1px_0_#e2dcda] max-[700px]:px-4' },
  subLabel: { base: 'text-[12px] uppercase tracking-[.08em] text-[#8a8584]' },
  pill: {
    base: "flex items-center gap-2 bg-white px-[15px] py-[7px] font-['Arimo',sans-serif] text-[14px]",
    variants: { active: 'shadow-[0_0_0_2px_#1d1d1d]', idle: 'shadow-[0_0_0_1px_#e2dcda] hover:shadow-[0_0_0_1px_#1d1d1d]', disabled: 'cursor-not-allowed text-[#b9b4b2] shadow-[0_0_0_1px_#ede8e7]' },
  },
  colorDot: { base: 'h-[12px] w-[12px] shrink-0 rounded-full border border-black/10' },
  divider: { base: 'mx-2 h-6 w-px bg-[#e2dcda]' },
  note: { base: 'text-[12px] text-[#8a8584]' },
  body: { base: 'grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_minmax(0,1fr)] gap-4 p-4 max-[1100px]:grid-cols-[280px_minmax(0,1fr)] max-[900px]:flex max-[900px]:flex-col' },
  tools: { base: 'relative min-h-0 overflow-hidden  bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,.25)] max-[1100px]:row-span-2 max-[900px]:overflow-visible' },
  toolsScroll: { base: 'h-full overflow-y-auto max-[900px]:h-auto max-[900px]:overflow-visible' },
  editor: { base: 'min-h-0 overflow-hidden  bg-white max-[900px]:h-[460px]' },
  preview: { base: 'min-h-0 overflow-hidden  bg-white max-[1100px]:min-h-[380px] max-[900px]:h-[420px]' },
  section: { base: 'border-b border-[#ede8e7] px-5 py-5' },
  sectionTitle: { base: "mb-3 font-['Encode_Sans_Expanded',sans-serif] text-[13px] font-semibold uppercase tracking-[.06em]" },
  sectionDetail: { base: 'text-[13px] leading-[1.4] text-[#444]' },
  palette: { base: 'flex flex-wrap gap-2' },
  swatch: { base: 'h-[28px] w-[28px] rounded-full border border-black/10 ring-offset-2 hover:ring-2 hover:ring-[#1d1d1d]' },
  colorRow: { base: 'mt-4 flex items-center gap-3' },
  colorInput: { base: 'h-[36px] w-[45px] cursor-pointer rounded border-0 bg-transparent p-0' },
  actionRow: { base: 'mt-3 flex flex-wrap gap-2' },
  smallButton: { base: "bg-white px-3 py-2 font-['Arimo',sans-serif] text-[13px] shadow-[0_0_0_1px_#e2dcda] hover:shadow-[0_0_0_1px_#1d1d1d]" },
  fieldLabel: { base: 'mb-2 mt-3 block text-[13px] font-semibold text-[#444]' },
  field: { base: 'w-full  border border-[#e2dcda] bg-white px-[10px] py-[8px] text-[14px] outline-none focus:border-[#1d1d1d]' },
  upload: { base: 'block w-full cursor-pointer  border border-dashed border-[#cfc8c6] bg-[#faf8f7] p-3 text-[13px] text-[#444] file:mr-3 file: file:border-0 file:bg-[#1d1d1d] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-white' },
  notice: { base: 'mt-2 text-[12px] leading-[1.5] text-[#8a8584]' },
  error: { base: 'mt-3  bg-[#fff0ed] p-3 text-[13px] text-[#a13f2b]' },
  layerSheet: { base: 'absolute inset-x-0 bottom-0 z-10 max-h-[75%] overflow-y-auto rounded-t-[10px] bg-white px-5 pb-5 pt-4 shadow-[0_-14px_30px_-12px_rgba(0,0,0,.35)] transition-transform duration-200 ease-out starting:translate-y-full max-[900px]:fixed max-[900px]:z-[60] max-[900px]:max-h-[70svh]' },
  sheetHeader: { base: 'flex items-center justify-between gap-3' },
  sheetTitle: { base: "min-w-0 truncate font-['Encode_Sans_Expanded',sans-serif] text-[13px] font-semibold uppercase tracking-[.06em]" },
  sheetActions: { base: 'flex shrink-0 items-center gap-2' },
  closeButton: { base: 'grid h-8 w-8 place-items-center rounded-full text-[#444] hover:bg-[#ede8e7]' },
  closeIcon: { base: 'h-4 w-4' },
  layerFields: { base: 'grid grid-cols-2 gap-x-3' },
  range: { base: 'w-full accent-[#1d1d1d]' },
  toggle: {
    base: "px-3 py-1.5 font-['Arimo',sans-serif] text-[13px]",
    variants: { active: 'shadow-[0_0_0_2px_#1d1d1d]', idle: 'shadow-[0_0_0_1px_#e2dcda]' },
  },
}

export default function DesignDialog({ catalog, onSave, onCancel }: { catalog: PricingCatalog; onSave: () => void; onCancel: () => void }) {
  const config = useConfigurator((state) => state.config)
  const editorTab = useConfigurator((state) => state.editorTab)
  const activePanel = useConfigurator((state) => state.activePanel)
  const activeWall = useConfigurator((state) => state.activeWall)
  const activeFace = useConfigurator((state) => state.activeFace)
  const selectedLayerId = useConfigurator((state) => state.selectedLayerId)
  const setEditorTab = useConfigurator((state) => state.setEditorTab)
  const setActivePanel = useConfigurator((state) => state.setActivePanel)
  const setActiveWall = useConfigurator((state) => state.setActiveWall)
  const setActiveFace = useConfigurator((state) => state.setActiveFace)
  const setDesignColor = useConfigurator((state) => state.setDesignColor)
  const applyCanopyColor = useConfigurator((state) => state.applyCanopyColor)
  const addText = useConfigurator((state) => state.addText)
  const addImage = useConfigurator((state) => state.addImage)
  const updateLayer = useConfigurator((state) => state.updateLayer)
  const removeLayer = useConfigurator((state) => state.removeLayer)
  const selectLayer = useConfigurator((state) => state.selectLayer)
  const showErrorToast = useConfigurator((state) => state.showErrorToast)
  const [fitWarningLayerId, setFitWarningLayerId] = useState<string | null>(null)
  const walls = selectedWalls(config.sideWalls, config.halfWalls)
  const target: DesignTarget = editorTab === 'canopy'
    ? { kind: 'panel', panel: activePanel }
    : { kind: 'wall', wall: activeWall, face: activeFace }
  const design = designAt(config, target)
  const layer = design.layers.find((item) => item.id === selectedLayerId)

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0]
    try {
      const objectUrl = URL.createObjectURL(file)
      const probe = new Image()
      probe.src = objectUrl
      await probe.decode()
      const aspect = probe.naturalWidth / probe.naturalHeight
      URL.revokeObjectURL(objectUrl)
      const image = await configuratorApi.upload(file)
      addImage(target, { ...image, aspect })
    } catch {
      showErrorToast()
    }
    event.target.value = ''
  }


  const surfaces = canopySurfaces[config.modelId]
  const canopyLayoutSurfaces: LayoutSurface[] = panelIds.map((id) => {
    const size = canopyPanelSize(surfaces[id])
    return {
      key: id,
      target: { kind: 'panel', panel: id },
      outline: surfaces[id].outline.map(([u, v]) => [u * canopyTextureSize, v * canopyTextureSize]),
      transform: panelTransform(surfaces[id]),
      width: size.width,
      height: size.height,
      design: config.panels[id],
      printed: true,
    }
  })

  const wallFaceSize = wallTextureSize(config.modelId, activeWall)
  const wallSurfaces: LayoutSurface[] = wallFaces.map((face, index) => {
    const x = wallBoardPadding + index * (wallFaceSize.width + wallFaceGap)
    const y = wallBoardPadding + wallCaptionSpace
    const printed = face === 'exterior' || isDoubleSided(config, activeWall)
    const captionText = face === 'exterior' ? 'Exterior (outside)' : printed ? 'Interior (inside)' : 'Interior · not printed (single-sided)'
    return {
      key: `${activeWall}-${face}`,
      target: { kind: 'wall', wall: activeWall, face },
      outline: [[x, y], [x + wallFaceSize.width, y], [x + wallFaceSize.width, y + wallFaceSize.height], [x, y + wallFaceSize.height]],
      transform: [1, 0, 0, 1, x, y],
      width: wallFaceSize.width,
      height: wallFaceSize.height,
      design: config.walls[activeWall][face],
      printed,
      caption: { x, y: y - 14, text: captionText },
    }
  })

  const activeSurface = editorTab === 'canopy'
    ? canopyLayoutSurfaces.find((surface) => surface.key === activePanel)!
    : wallSurfaces.find((surface) => surface.key === `${activeWall}-${activeFace}`)!

  const changeLayer = (patch: Partial<ArtworkLayer>) => {
    const current = layer!
    const next = { ...current, ...patch } as ArtworkLayer
    if ('text' in patch && !canApplyTextChange(activeSurface, current, next)) {
      setFitWarningLayerId(current.id)
      return
    }
    setFitWarningLayerId(null)
    updateLayer(target, current.id, patch)
  }

  return <div className={styles.dialog.base} role="dialog" aria-modal="true" aria-label="Design editor">
    <div className={styles.topBar.base}>
      <div className={styles.topTabs.base}>
        <button type="button" className={`${styles.topTab.base} ${styles.topTab.variants[editorTab === 'canopy' ? 'active' : 'idle']}`}
          onClick={() => setEditorTab('canopy')} aria-pressed={editorTab === 'canopy'}>Canopy</button>
        <button type="button" disabled={walls.length === 0}
          className={`${styles.topTab.base} ${styles.topTab.variants[walls.length === 0 ? 'disabled' : editorTab === 'walls' ? 'active' : 'idle']}`}
          onClick={() => setEditorTab('walls')} aria-pressed={editorTab === 'walls'}>Walls</button>
      </div>
      <span className={styles.title.base}>Customize in 2D | Preview in 3D</span>
      <div className={styles.exitActions.base}>
        <button type="button" className={styles.cancelButton.base} onClick={onCancel}>Cancel</button>
        <button type="button" className={styles.exitButton.base} onClick={onSave}>Save & Exit</button>
      </div>
    </div>

    <div className={styles.subBar.base}>
      {editorTab === 'canopy' && <>
        <span className={styles.subLabel.base}>Section</span>
        {catalog.panels.map((panel) => <button key={panel.id} type="button"
          className={`${styles.pill.base} ${styles.pill.variants[panel.id === activePanel ? 'active' : 'idle']}`}
          onClick={() => setActivePanel(panel.id)} aria-pressed={panel.id === activePanel}>
          <span className={styles.colorDot.base} style={{ backgroundColor: config.panels[panel.id].color }} />{panel.label}
        </button>)}
      </>}
      {editorTab === 'walls' && <>
        <span className={styles.subLabel.base}>Wall</span>
        {catalog.walls.filter((wall) => walls.includes(wall.id)).map((wall) => <button key={wall.id} type="button"
          className={`${styles.pill.base} ${styles.pill.variants[wall.id === activeWall ? 'active' : 'idle']}`}
          onClick={() => setActiveWall(wall.id)} aria-pressed={wall.id === activeWall}>
          <span className={styles.colorDot.base} style={{ backgroundColor: config.walls[wall.id].exterior.color }} />{wall.label}
        </button>)}
        <span className={styles.divider.base} />
        <span className={styles.subLabel.base}>Face</span>
        {wallFaces.map((face) => {
          const available = face === 'exterior' || isDoubleSided(config, activeWall)
          const state = !available ? 'disabled' : face === activeFace ? 'active' : 'idle'
          return <button key={face} type="button" disabled={!available}
            className={`${styles.pill.base} ${styles.pill.variants[state]}`}
            onClick={() => setActiveFace(face)} aria-pressed={face === activeFace}>
            {face === 'exterior' ? 'Exterior (outside)' : 'Interior (inside)'}
          </button>
        })}
        {!isDoubleSided(config, activeWall) && <span className={styles.note.base}>Single-sided print: only the exterior is printed.</span>}
      </>}
    </div>

    <div className={styles.body.base}>
      <aside className={styles.tools.base}>
        <div className={styles.toolsScroll.base}>
        <section className={styles.section.base}>
          <h2 className={styles.sectionTitle.base}>Background</h2>
          <div className={styles.palette.base}>{catalog.palette.map((color) => <button key={color.name} type="button"
            className={styles.swatch.base} style={{ backgroundColor: color.hex }} title={color.name}
            onClick={() => setDesignColor(target, color.hex)} aria-label={`Set background to ${color.name}`} />)}</div>
          <div className={styles.colorRow.base}>
            <input className={styles.colorInput.base} type="color" aria-label="Custom background color" value={design.color} onChange={(event) => setDesignColor(target, event.target.value)} />
            <span className={styles.sectionDetail.base}>{design.color.toUpperCase()}</span>
          </div>
          {target.kind === 'panel' && <div className={styles.actionRow.base}>
            <button className={styles.smallButton.base} type="button" onClick={() => applyCanopyColor('all', design.color)}>Apply to entire canopy</button>
            <button className={styles.smallButton.base} type="button" onClick={() => applyCanopyColor('allValances', design.color)}>Apply to all valances</button>
          </div>}
        </section>
        <section className={styles.section.base}>
          <h2 className={styles.sectionTitle.base}>Text & images</h2>
          <button className={styles.smallButton.base} type="button" onClick={() => addText(target)}>+ Add text</button>
          <label className={styles.fieldLabel.base} htmlFor="artwork-upload">Artwork upload</label>
          <input className={styles.upload.base} id="artwork-upload" type="file" accept="image/jpeg,image/png,image/svg+xml" onChange={upload} />
          <p className={styles.notice.base}>JPG, PNG, or SVG · maximum 10 MB</p>
        </section>
        </div>
        {layer && <div key={layer.id} className={styles.layerSheet.base} role="region" aria-label="Layer settings">
            <div className={styles.sheetHeader.base}>
              <span className={styles.sheetTitle.base}>{layer.kind === 'text' ? 'Text layer' : `Image: ${layer.name}`}</span>
              <div className={styles.sheetActions.base}>
                <button className={styles.smallButton.base} type="button" onClick={() => removeLayer(target, layer.id)}>Remove</button>
                <button className={styles.closeButton.base} type="button" onClick={() => selectLayer(null)} aria-label="Close layer settings">
                  <svg className={styles.closeIcon.base} viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </button>
              </div>
            </div>
            {layer.kind === 'text' && <>
              <label className={styles.fieldLabel.base}>Text</label>
              <input className={styles.field.base} value={layer.text} onChange={(event) => changeLayer({ text: event.target.value })} />
              <div className={styles.layerFields.base}>
                <div><label className={styles.fieldLabel.base}>Font</label><select className={styles.field.base} value={layer.fontFamily} onChange={(event) => changeLayer({ fontFamily: event.target.value })}>{catalog.fonts.map((font) => <option key={font}>{font}</option>)}</select></div>
                <div><label className={styles.fieldLabel.base}>Size</label><input className={styles.field.base} type="number" min="12" max="120" value={layer.fontSize} onChange={(event) => changeLayer({ fontSize: Number(event.target.value) })} /></div>
              </div>
              <div className={styles.colorRow.base}>
                <input className={styles.colorInput.base} type="color" aria-label="Text color" value={layer.color} onChange={(event) => changeLayer({ color: event.target.value })} />
                <button className={`${styles.toggle.base} ${styles.toggle.variants[layer.bold ? 'active' : 'idle']}`} type="button" onClick={() => changeLayer({ bold: !layer.bold })}>Bold</button>
                <button className={`${styles.toggle.base} ${styles.toggle.variants[layer.italic ? 'active' : 'idle']}`} type="button" onClick={() => changeLayer({ italic: !layer.italic })}>Italic</button>
              </div>
            </>}
            <div className={styles.layerFields.base}>
              <div><label className={styles.fieldLabel.base}>X position</label><input className={styles.range.base} type="range" min="0" max="1" step="0.01" value={layer.x} onChange={(event) => changeLayer({ x: Number(event.target.value) })} /></div>
              <div><label className={styles.fieldLabel.base}>Y position</label><input className={styles.range.base} type="range" min="0" max="1" step="0.01" value={layer.y} onChange={(event) => changeLayer({ y: Number(event.target.value) })} /></div>
              <div><label className={styles.fieldLabel.base}>Scale</label><input className={styles.range.base} type="range" min="0.05" max="10" step="0.05" value={layer.scale} onChange={(event) => changeLayer({ scale: Number(event.target.value) })} /></div>
              <div><label className={styles.fieldLabel.base}>Rotation</label><input className={styles.range.base} type="range" min="-180" max="180" step="1" value={layer.rotation} onChange={(event) => changeLayer({ rotation: Number(event.target.value) })} /></div>
            </div>
            {fitWarningLayerId === layer.id && <p className={styles.error.base}>This text no longer fits inside the section. Remove some characters to keep typing.</p>}
          </div>}
      </aside>
      <section className={styles.editor.base} aria-label="2D design">
        {editorTab === 'canopy' && <LayoutEditor viewBox={{ width: canopyTextureSize, height: canopyTextureSize }}
          surfaces={canopyLayoutSurfaces} activeKey={activePanel}
          help="Click a section, then drag its text or images."
          onSelectSurface={(surface) => { if (surface.target.kind === 'panel') setActivePanel(surface.target.panel) }} />}
        {editorTab === 'walls' && <LayoutEditor
          viewBox={{ width: wallFaceSize.width * 2 + wallFaceGap + wallBoardPadding * 2, height: wallFaceSize.height + wallCaptionSpace + wallBoardPadding * 2 }}
          surfaces={wallSurfaces} activeKey={`${activeWall}-${activeFace}`}
          help="Both faces of the selected wall, each seen from its own side. Click a face to edit it."
          onSelectSurface={(surface) => { if (surface.target.kind === 'wall') setActiveFace(surface.target.face) }} />}
      </section>
      <section className={styles.preview.base} aria-label="3D preview">
        <ScenePanel />
      </section>
    </div>
  </div>
}
