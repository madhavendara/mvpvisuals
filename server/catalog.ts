import type { ModelId } from '../src/product/models'
import { panelIds, wallFaces, wallIds, type FrameOption, type HalfWallsOption, type PanelDesign, type ProductConfiguration, type SideWallsOption } from '../src/product/types'
import type { PriceQuote, PricingCatalog } from '../src/product/commerce'

export const catalog: PricingCatalog = {
  productName: 'Logo Canopy Tent',
  currency: 'INR',
  mock: true,
  frames: [
    { id: 'standard', label: 'Canopy with Frame', detail: 'Printed top with the standard 40 mm hex aluminum frame, roller bag, ropes, and stakes.' },
    { id: 'none', label: 'Canopy Only (No Frame)', detail: 'Printed top and walls only. The frame in the preview shows the assembled look and is not supplied.' },
    { id: 'lightUp', label: 'Canopy with Light Up Frame', detail: 'Printed top with the illuminated frame. The 3D preview shows the standard frame.' },
  ],
  sideWalls: [
    { id: 'none', label: 'None' },
    { id: 'oneSingle', label: '(1) Side Wall: Single Sided Print' },
    { id: 'oneDouble', label: '(1) Side Wall: Double Sided Print' },
    { id: 'threeSingle', label: '(3) Side Walls: Single Sided Print' },
    { id: 'threeDouble', label: '(3) Side Walls: Double Sided Print' },
  ],
  halfWalls: [
    { id: 'none', label: 'None' },
    { id: 'twoSingle', label: 'Half Walls (Set of 2): Single Sided Print' },
    { id: 'twoDouble', label: 'Half Walls (Set of 2): Double Sided Print' },
  ],
  sideWallsWithoutHalfWalls: ['threeSingle', 'threeDouble'],
  artworkServices: [
    { id: 'none', label: 'Use supplied artwork', detail: 'Included in the reference product' },
    { id: 'redraw', label: 'Artwork recreation', detail: 'One-time mock fee per order, added to the cart as its own line' },
  ],
  panels: [
    { id: 'frontPeak', label: 'Front peak' },
    { id: 'backPeak', label: 'Back peak' },
    { id: 'leftPeak', label: 'Left peak' },
    { id: 'rightPeak', label: 'Right peak' },
    { id: 'frontValance', label: 'Front valance' },
    { id: 'backValance', label: 'Back valance' },
    { id: 'leftValance', label: 'Left valance' },
    { id: 'rightValance', label: 'Right valance' },
  ],
  walls: [
    { id: 'backWall', label: 'Back wall' },
    { id: 'leftWall', label: 'Left wall' },
    { id: 'rightWall', label: 'Right wall' },
    { id: 'leftHalfWall', label: 'Left half wall' },
    { id: 'rightHalfWall', label: 'Right half wall' },
  ],
  palette: [
    { name: 'MVP Gold', hex: '#f1b241' }, { name: 'White', hex: '#ffffff' },
    { name: 'Royal Blue', hex: '#2056c8' }, { name: 'Forest Green', hex: '#16804d' },
    { name: 'Red Shift', hex: '#d91c30' }, { name: 'Pitch Black', hex: '#18181b' },
    { name: 'Vibrant Orange', hex: '#f15a24' }, { name: 'Bright Yellow', hex: '#f4c332' },
    { name: 'Hot Pink', hex: '#d92074' },
  ],
  fonts: ['Arial', 'Inter', 'Montserrat', 'Georgia', 'Impact', 'Courier New'],
}

type Variant = { sideWalls: SideWallsOption; halfWalls: HalfWallsOption; frame: FrameOption; priceMinor: number; id: string }

const tenByTenVariants: Variant[] = [
  { sideWalls: 'none', halfWalls: 'none', frame: 'standard', priceMinor: 8070000, id: '48270445478136' },
  { sideWalls: 'none', halfWalls: 'none', frame: 'none', priceMinor: 5220000, id: '48270445838584' },
  { sideWalls: 'none', halfWalls: 'none', frame: 'lightUp', priceMinor: 11860000, id: '68043193352440' },
  { sideWalls: 'none', halfWalls: 'twoSingle', frame: 'standard', priceMinor: 11290000, id: '48270445510904' },
  { sideWalls: 'none', halfWalls: 'twoSingle', frame: 'none', priceMinor: 8450000, id: '48270445871352' },
  { sideWalls: 'none', halfWalls: 'twoSingle', frame: 'lightUp', priceMinor: 15090000, id: '68043193385208' },
  { sideWalls: 'none', halfWalls: 'twoDouble', frame: 'standard', priceMinor: 12200000, id: '48270445543672' },
  { sideWalls: 'none', halfWalls: 'twoDouble', frame: 'none', priceMinor: 9360000, id: '48270445904120' },
  { sideWalls: 'none', halfWalls: 'twoDouble', frame: 'lightUp', priceMinor: 16000000, id: '68043193417976' },
  { sideWalls: 'oneSingle', halfWalls: 'none', frame: 'standard', priceMinor: 9930000, id: '48270445576440' },
  { sideWalls: 'oneSingle', halfWalls: 'none', frame: 'none', priceMinor: 7080000, id: '48270445936888' },
  { sideWalls: 'oneSingle', halfWalls: 'none', frame: 'lightUp', priceMinor: 13720000, id: '68043193450744' },
  { sideWalls: 'oneSingle', halfWalls: 'twoSingle', frame: 'standard', priceMinor: 13150000, id: '48270445609208' },
  { sideWalls: 'oneSingle', halfWalls: 'twoSingle', frame: 'none', priceMinor: 10310000, id: '48270445969656' },
  { sideWalls: 'oneSingle', halfWalls: 'twoSingle', frame: 'lightUp', priceMinor: 16950000, id: '68043193483512' },
  { sideWalls: 'oneSingle', halfWalls: 'twoDouble', frame: 'standard', priceMinor: 14050000, id: '48270445641976' },
  { sideWalls: 'oneSingle', halfWalls: 'twoDouble', frame: 'none', priceMinor: 11200000, id: '48270446002424' },
  { sideWalls: 'oneSingle', halfWalls: 'twoDouble', frame: 'lightUp', priceMinor: 17840000, id: '68043193516280' },
  { sideWalls: 'oneDouble', halfWalls: 'none', frame: 'standard', priceMinor: 11070000, id: '48270445707512' },
  { sideWalls: 'oneDouble', halfWalls: 'none', frame: 'none', priceMinor: 8220000, id: '48270446067960' },
  { sideWalls: 'oneDouble', halfWalls: 'none', frame: 'lightUp', priceMinor: 14860000, id: '68043193581816' },
  { sideWalls: 'oneDouble', halfWalls: 'twoSingle', frame: 'standard', priceMinor: 13930000, id: '48270445740280' },
  { sideWalls: 'oneDouble', halfWalls: 'twoSingle', frame: 'none', priceMinor: 10420000, id: '48270446100728' },
  { sideWalls: 'oneDouble', halfWalls: 'twoSingle', frame: 'lightUp', priceMinor: 17730000, id: '68043193614584' },
  { sideWalls: 'oneDouble', halfWalls: 'twoDouble', frame: 'standard', priceMinor: 14880000, id: '48270445773048' },
  { sideWalls: 'oneDouble', halfWalls: 'twoDouble', frame: 'none', priceMinor: 11370000, id: '48270446133496' },
  { sideWalls: 'oneDouble', halfWalls: 'twoDouble', frame: 'lightUp', priceMinor: 18680000, id: '68043193647352' },
  { sideWalls: 'threeSingle', halfWalls: 'none', frame: 'standard', priceMinor: 13630000, id: '48270445674744' },
  { sideWalls: 'threeSingle', halfWalls: 'none', frame: 'none', priceMinor: 10780000, id: '48270446035192' },
  { sideWalls: 'threeSingle', halfWalls: 'none', frame: 'lightUp', priceMinor: 17430000, id: '68043193549048' },
  { sideWalls: 'threeDouble', halfWalls: 'none', frame: 'standard', priceMinor: 17050000, id: '48270445805816' },
  { sideWalls: 'threeDouble', halfWalls: 'none', frame: 'none', priceMinor: 14200000, id: '48270446166264' },
  { sideWalls: 'threeDouble', halfWalls: 'none', frame: 'lightUp', priceMinor: 20840000, id: '68043193680120' },
]

const tentAreaSquareFeet: Record<ModelId, number> = { '5x5': 25, '6.5x6.5': 42.25, '8x8': 64 }

const tentVariants = (Object.keys(tentAreaSquareFeet) as ModelId[]).flatMap((modelId) => tenByTenVariants.map((variant) => {
  const sizeFactor = 0.4 + 0.6 * tentAreaSquareFeet[modelId] / 100
  return { ...variant, modelId, id: `mock-${modelId}-${variant.id}`, priceMinor: Math.round(variant.priceMinor * sizeFactor / 10000) * 10000 }
}))

const artworkRecreation = { variantId: 'mock-artwork-recreation', priceMinor: 250000 }

function findTentVariant(config: ProductConfiguration) {
  return tentVariants.find((item) => item.modelId === config.modelId && item.frame === config.frame && item.sideWalls === config.sideWalls && item.halfWalls === config.halfWalls)
}

const hexColor = /^#[0-9a-f]{6}$/i

function validateDesign(design: PanelDesign, label: string) {
  if (!design) throw new Error(`Missing ${label} design`)
  if (!hexColor.test(design.color)) throw new Error(`Invalid ${label} color`)
  if (!Array.isArray(design.layers) || design.layers.length > 20) throw new Error(`${label} must have at most 20 artwork layers`)
  for (const layer of design.layers) {
    if (!layer || typeof layer.id !== 'string') throw new Error(`Invalid artwork layer on ${label}`)
    if (!Number.isFinite(layer.x) || layer.x < 0 || layer.x > 1) throw new Error(`Invalid artwork x position on ${label}`)
    if (!Number.isFinite(layer.y) || layer.y < 0 || layer.y > 1) throw new Error(`Invalid artwork y position on ${label}`)
    if (!Number.isFinite(layer.scale) || layer.scale < 0.05 || layer.scale > 10) throw new Error(`Invalid artwork scale on ${label}`)
    if (!Number.isFinite(layer.rotation) || Math.abs(layer.rotation) > 180) throw new Error(`Invalid artwork rotation on ${label}`)

    if (layer.kind === 'text') {
      if (typeof layer.text !== 'string' || layer.text.length > 200) throw new Error(`Invalid text on ${label}`)
      if (typeof layer.fontFamily !== 'string') throw new Error(`Invalid font on ${label}`)
      if (!Number.isFinite(layer.fontSize) || layer.fontSize < 12 || layer.fontSize > 120) throw new Error(`Invalid font size on ${label}`)
      if (!hexColor.test(layer.color)) throw new Error(`Invalid text color on ${label}`)
      if (typeof layer.bold !== 'boolean' || typeof layer.italic !== 'boolean') throw new Error(`Invalid text style on ${label}`)
    } else if (layer.kind === 'image') {
      if (typeof layer.assetId !== 'string' || layer.url !== `/api/uploads/${layer.assetId}`) throw new Error(`Invalid image upload on ${label}`)
      if (typeof layer.name !== 'string') throw new Error(`Invalid image name on ${label}`)
      if (!Number.isFinite(layer.aspect) || layer.aspect <= 0) throw new Error(`Invalid image aspect on ${label}`)
    } else {
      throw new Error(`Invalid artwork type on ${label}`)
    }
  }
}

export function validateConfiguration(value: unknown): ProductConfiguration {
  if (!value || typeof value !== 'object') throw new Error('Configuration is required')
  const config = value as ProductConfiguration
  if (config.version !== 3 || config.productKey !== 'logo-canopy-tent') throw new Error('Unsupported product configuration')
  if (!['5x5', '6.5x6.5', '8x8'].includes(config.modelId)) throw new Error('Invalid preview model')
  if (!findTentVariant(config)) throw new Error('This frame and wall combination is not available')
  if (!catalog.artworkServices.some((option) => option.id === config.artworkService)) throw new Error('Invalid artwork service')
  if (!Number.isInteger(config.quantity) || config.quantity < 1 || config.quantity > 100) throw new Error('Quantity must be between 1 and 100')
  if (typeof config.notes !== 'string' || config.notes.length > 2000) throw new Error('Design notes must be under 2000 characters')
  if (!config.panels || typeof config.panels !== 'object') throw new Error('Panel designs are required')
  if (!config.walls || typeof config.walls !== 'object') throw new Error('Wall designs are required')

  for (const panel of panelIds) validateDesign(config.panels[panel], catalog.panels.find((item) => item.id === panel)!.label)
  for (const wall of wallIds) {
    if (!config.walls[wall]) throw new Error(`Missing ${wall} design`)
    for (const face of wallFaces) validateDesign(config.walls[wall][face], `${catalog.walls.find((item) => item.id === wall)!.label} ${face}`)
  }
  return config
}

export function calculateQuote(config: ProductConfiguration): PriceQuote {
  const variant = findTentVariant(config)!
  const frameLabel = catalog.frames.find((option) => option.id === config.frame)!.label
  const sideWallsLabel = catalog.sideWalls.find((option) => option.id === config.sideWalls)!.label
  const halfWallsLabel = catalog.halfWalls.find((option) => option.id === config.halfWalls)!.label
  const lines = [{
    label: `${config.modelId} ${frameLabel} · Side walls: ${sideWallsLabel} · Half walls: ${halfWallsLabel}`,
    variantId: variant.id,
    unitPriceMinor: variant.priceMinor,
    quantity: config.quantity,
    amountMinor: variant.priceMinor * config.quantity,
  }]
  if (config.artworkService === 'redraw') {
    lines.push({ label: 'Artwork recreation (one-time)', variantId: artworkRecreation.variantId, unitPriceMinor: artworkRecreation.priceMinor, quantity: 1, amountMinor: artworkRecreation.priceMinor })
  }
  return {
    currency: catalog.currency,
    mock: true,
    lines,
    totalMinor: lines.reduce((sum, line) => sum + line.amountMinor, 0),
  }
}
