import type { ModelId } from './models'

export const modelMeasurements: Record<ModelId, { footprintWidth: number; legCenterOffset: number; eaveHeight: number }> = {
  '5x5': { footprintWidth: 1.5284, legCenterOffset: 0.718, eaveHeight: 0.9456 },
  '6.5x6.5': { footprintWidth: 1.5312, legCenterOffset: 0.718, eaveHeight: 0.8735 },
  '8x8': { footprintWidth: 2.4426, legCenterOffset: 1.1711, eaveHeight: 1.2005 },
}
