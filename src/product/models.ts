export const models = [
  { id: '5x5', size: '5 × 5', sizeFeet: 5, url: new URL('../../glb/Tent_5_5.glb', import.meta.url).href },
  { id: '6.5x6.5', size: '6.5 × 6.5', sizeFeet: 6.5, url: new URL('../../glb/Tent 6.5_6.5.glb', import.meta.url).href },
  { id: '8x8', size: '8 × 8', sizeFeet: 8, url: new URL('../../glb/Tent_8_8.glb', import.meta.url).href },
] as const

export type Model = (typeof models)[number]
export type ModelId = Model['id']
