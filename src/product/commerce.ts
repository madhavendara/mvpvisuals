import type { ArtworkService, FrameOption, HalfWallsOption, PanelId, SideWallsOption, WallId } from './types'

export type CatalogOption<T extends string> = { id: T; label: string; detail?: string }
export type PricingCatalog = {
  productName: string
  currency: string
  mock: true
  frames: CatalogOption<FrameOption>[]
  sideWalls: CatalogOption<SideWallsOption>[]
  halfWalls: CatalogOption<HalfWallsOption>[]
  sideWallsWithoutHalfWalls: SideWallsOption[]
  artworkServices: CatalogOption<ArtworkService>[]
  panels: CatalogOption<PanelId>[]
  walls: CatalogOption<WallId>[]
  palette: { name: string; hex: string }[]
  fonts: string[]
}

type PriceLine = { label: string; variantId: string; unitPriceMinor: number; quantity: number; amountMinor: number }
export type PriceQuote = {
  currency: string
  mock: true
  lines: PriceLine[]
  totalMinor: number
}

type ShopifyCartLine = { id: string; quantity: number; properties: Record<string, string> }
export type ShopifyCartAdd = { items: ShopifyCartLine[] }
