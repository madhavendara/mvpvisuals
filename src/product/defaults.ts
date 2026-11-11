import type { PanelDesign, ProductConfiguration, WallDesign } from './types'
import { defaultFabricColor } from './designs'

function blankDesign(): PanelDesign {
  return { color: defaultFabricColor, layers: [] }
}

function blankWall(): WallDesign {
  return { exterior: blankDesign(), interior: blankDesign() }
}

export const initialConfiguration: ProductConfiguration = {
  version: 3,
  productKey: 'logo-canopy-tent',
  modelId: '5x5',
  frame: 'none',
  sideWalls: 'none',
  halfWalls: 'none',
  artworkService: 'none',
  quantity: 1,
  notes: '',
  panels: {
    frontPeak: blankDesign(),
    backPeak: blankDesign(),
    leftPeak: blankDesign(),
    rightPeak: blankDesign(),
    frontValance: blankDesign(),
    backValance: blankDesign(),
    leftValance: blankDesign(),
    rightValance: blankDesign(),
  },
  walls: {
    backWall: blankWall(),
    leftWall: blankWall(),
    rightWall: blankWall(),
    leftHalfWall: blankWall(),
    rightHalfWall: blankWall(),
  },
}
