import type { HalfWallsOption, ProductConfiguration, SideWallsOption, WallId } from './types'
import type { ModelId } from './models'
import { modelMeasurements } from './modelMeasurements'
import { designWidth } from './designs'

export function selectedWalls(sideWalls: SideWallsOption, halfWalls: HalfWallsOption): WallId[] {
  const walls: WallId[] = []
  if (sideWalls === 'oneSingle' || sideWalls === 'oneDouble') walls.push('backWall')
  if (sideWalls === 'threeSingle' || sideWalls === 'threeDouble') walls.push('backWall', 'leftWall', 'rightWall')
  if (halfWalls !== 'none') walls.push('leftHalfWall', 'rightHalfWall')
  return walls
}

function isHalfWall(wall: WallId) {
  return wall === 'leftHalfWall' || wall === 'rightHalfWall'
}

export function isDoubleSided(config: ProductConfiguration, wall: WallId) {
  if (isHalfWall(wall)) return config.halfWalls === 'twoDouble'
  return config.sideWalls === 'oneDouble' || config.sideWalls === 'threeDouble'
}

export function wallSize(modelId: ModelId, wall: WallId) {
  const layout = modelMeasurements[modelId]
  const fullHeight = layout.eaveHeight
  return { width: layout.legCenterOffset * 2, height: isHalfWall(wall) ? fullHeight * 0.45 : fullHeight }
}

export function wallTextureSize(modelId: ModelId, wall: WallId) {
  const size = wallSize(modelId, wall)
  return { width: designWidth, height: Math.round(designWidth * size.height / size.width) }
}
