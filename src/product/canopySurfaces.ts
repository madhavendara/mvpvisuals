import type { CanopySurfaces } from './types'

export const canopySurfaces: CanopySurfaces = {
  '5x5': {
    frontPeak: { outline: [[0.2452, 0.8726], [0.4996, 0.5265], [0.7543, 0.8724]], right: '+u', down: '+v', widthMeters: 1.528, heightMeters: 1.148 },
    backPeak: { outline: [[0.2471, 0.1299], [0.7474, 0.1274], [0.4997, 0.4728]], right: '-u', down: '-v', widthMeters: 1.513, heightMeters: 1.148 },
    leftPeak: { outline: [[0.116, 0.2508], [0.4569, 0.4996], [0.1159, 0.7469]], right: '+v', down: '-u', widthMeters: 1.514, heightMeters: 1.15 },
    rightPeak: { outline: [[0.5224, 0.4996], [0.8641, 0.2366], [0.8721, 0.7431]], right: '-v', down: '+u', widthMeters: 1.526, heightMeters: 1.157 },
    frontValance: { outline: [[0.2536, 0.8805], [0.7486, 0.8805], [0.7466, 0.9705], [0.2554, 0.9705]], right: '+u', down: '+v', widthMeters: 1.527, heightMeters: 0.332 },
    backValance: { outline: [[0.256, 0.0326], [0.7414, 0.032], [0.7433, 0.1222], [0.2541, 0.1222]], right: '-u', down: '-v', widthMeters: 1.511, heightMeters: 0.332 },
    leftValance: { outline: [[0.0196, 0.2569], [0.1092, 0.2559], [0.1092, 0.7422], [0.0195, 0.7415]], right: '+v', down: '-u', widthMeters: 1.51, heightMeters: 0.332 },
    rightValance: { outline: [[0.8759, 0.2418], [0.9668, 0.2429], [0.9654, 0.7331], [0.8756, 0.7339]], right: '-v', down: '+u', widthMeters: 1.527, heightMeters: 0.332 },
  },
  '6.5x6.5': {
    frontPeak: { outline: [[0.2601, 0.884], [0.5031, 0.5076], [0.7383, 0.8828]], right: '+u', down: '+v', widthMeters: 1.519, heightMeters: 1.2 },
    backPeak: { outline: [[0.258, 0.1214], [0.7331, 0.1174], [0.4985, 0.4921]], right: '-u', down: '-v', widthMeters: 1.521, heightMeters: 1.205 },
    leftPeak: { outline: [[0.1168, 0.2653], [0.49, 0.5023], [0.1178, 0.7406]], right: '+v', down: '-u', widthMeters: 1.52, heightMeters: 1.2 },
    rightPeak: { outline: [[0.512, 0.4987], [0.8841, 0.26], [0.8855, 0.7353]], right: '-v', down: '+u', widthMeters: 1.52, heightMeters: 1.201 },
    frontValance: { outline: [[0.2612, 0.8885], [0.7314, 0.8884], [0.7304, 0.9962], [0.2684, 0.9981]], right: '+u', down: '+v', widthMeters: 1.523, heightMeters: 0.351 },
    backValance: { outline: [[0.2631, 0.0055], [0.7251, 0.0061], [0.727, 0.1143], [0.2581, 0.1134]], right: '-u', down: '-v', widthMeters: 1.524, heightMeters: 0.352 },
    leftValance: { outline: [[0.0045, 0.2732], [0.1125, 0.2696], [0.1125, 0.7396], [0.0047, 0.7353]], right: '+v', down: '-u', widthMeters: 1.524, heightMeters: 0.35 },
    rightValance: { outline: [[0.889, 0.267], [0.9965, 0.2683], [0.9972, 0.7305], [0.8887, 0.7327]], right: '-v', down: '+u', widthMeters: 1.524, heightMeters: 0.35 },
  },
  '8x8': {
    frontPeak: { outline: [[0.4974, 0.5298], [0.7907, 0.8927], [0.204, 0.8928]], right: '+u', down: '+v', widthMeters: 2.427, heightMeters: 1.586 },
    backPeak: { outline: [[0.21, 0.1144], [0.7966, 0.1144], [0.5034, 0.4801]], right: '-u', down: '-v', widthMeters: 2.425, heightMeters: 1.598 },
    leftPeak: { outline: [[0.1029, 0.2186], [0.4664, 0.5131], [0.1031, 0.8059]], right: '+v', down: '-u', widthMeters: 2.427, heightMeters: 1.587 },
    rightPeak: { outline: [[0.523, 0.5158], [0.8863, 0.2213], [0.8861, 0.8086]], right: '-v', down: '+u', widthMeters: 2.425, heightMeters: 1.587 },
    frontValance: { outline: [[0.2095, 0.8987], [0.7862, 0.8987], [0.7838, 0.976], [0.212, 0.976]], right: '+u', down: '+v', widthMeters: 2.418, heightMeters: 0.359 },
    backValance: { outline: [[0.2169, 0.0308], [0.7902, 0.0308], [0.7912, 0.1084], [0.2158, 0.1084]], right: '-u', down: '-v', widthMeters: 2.416, heightMeters: 0.36 },
    leftValance: { outline: [[0.0125, 0.2251], [0.0895, 0.2235], [0.0896, 0.7996], [0.012, 0.7986]], right: '+v', down: '-u', widthMeters: 2.419, heightMeters: 0.359 },
    rightValance: { outline: [[0.895, 0.8013], [0.8952, 0.2251], [0.9725, 0.2268], [0.9726, 0.8003]], right: '-v', down: '+u', widthMeters: 2.419, heightMeters: 0.36 },
  },
}
