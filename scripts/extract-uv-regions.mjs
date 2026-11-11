import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const models = [
  { id: '5x5', path: 'glb/Tent_5_5.glb' },
  { id: '6.5x6.5', path: 'glb/Tent 6.5_6.5.glb' },
  { id: '8x8', path: 'glb/Tent_8_8.glb' },
]

const panelOrder = ['frontPeak', 'backPeak', 'leftPeak', 'rightPeak', 'frontValance', 'backValance', 'leftValance', 'rightValance']

function readFabric(path) {
  const bytes = readFileSync(resolve(path))
  const jsonLength = bytes.readUInt32LE(12)
  const document = JSON.parse(bytes.toString('utf8', 20, 20 + jsonLength))
  const binaryStart = 20 + jsonLength + 8

  function readAccessor(accessorIndex) {
    const accessor = document.accessors[accessorIndex]
    const view = document.bufferViews[accessor.bufferView]
    const componentCount = { SCALAR: 1, VEC2: 2, VEC3: 3 }[accessor.type]
    const componentSize = { 5123: 2, 5125: 4, 5126: 4 }[accessor.componentType]
    const stride = view.byteStride || componentCount * componentSize
    const start = binaryStart + (view.byteOffset || 0) + (accessor.byteOffset || 0)
    const rows = []
    for (let index = 0; index < accessor.count; index += 1) {
      const row = []
      for (let component = 0; component < componentCount; component += 1) {
        const position = start + index * stride + component * componentSize
        if (accessor.componentType === 5126) row.push(bytes.readFloatLE(position))
        else if (accessor.componentType === 5123) row.push(bytes.readUInt16LE(position))
        else row.push(bytes.readUInt32LE(position))
      }
      rows.push(row)
    }
    return rows
  }

  const fabricNode = document.nodes.find((node) => node.name === 'fabric' && Number.isInteger(node.mesh))
  const primitive = document.meshes[fabricNode.mesh].primitives.find((item) => document.materials[item.material].name === 'fabric_Mat')
  const legNode = document.nodes.find((node) => node.name.startsWith('leg') && Number.isInteger(node.mesh))
  const legAccessor = document.meshes[legNode.mesh].primitives[0].attributes.POSITION
  const fabricPositions = document.accessors[primitive.attributes.POSITION]
  const oneLeg = readAccessor(legAccessor).filter(([x, , z]) => x > 0 && z > 0)
  const legXs = oneLeg.map(([x]) => x)
  const legZs = oneLeg.map(([, , z]) => z)
  const legCenterX = (Math.min(...legXs) + Math.max(...legXs)) / 2
  const legCenterZ = (Math.min(...legZs) + Math.max(...legZs)) / 2
  return {
    positions: readAccessor(primitive.attributes.POSITION),
    uvs: readAccessor(primitive.attributes.TEXCOORD_0),
    indices: readAccessor(primitive.indices).map((row) => row[0]),
    legCenterOffset: (legCenterX + legCenterZ) / 2,
    eaveHeight: fabricPositions.min[1] - document.accessors[legAccessor].min[1],
    footprintWidth: fabricPositions.max[0] - fabricPositions.min[0],
  }
}

function findIslands(fabric) {
  const parent = fabric.uvs.map((_, index) => index)
  function root(index) {
    while (parent[index] !== index) {
      parent[index] = parent[parent[index]]
      index = parent[index]
    }
    return index
  }
  function join(a, b) {
    parent[root(a)] = root(b)
  }

  const firstIndexByUv = new Map()
  fabric.uvs.forEach((uv, index) => {
    const key = `${uv[0].toFixed(5)},${uv[1].toFixed(5)}`
    if (firstIndexByUv.has(key)) join(index, firstIndexByUv.get(key))
    else firstIndexByUv.set(key, index)
  })
  for (let triangle = 0; triangle < fabric.indices.length; triangle += 3) {
    join(fabric.indices[triangle + 1], fabric.indices[triangle])
    join(fabric.indices[triangle + 2], fabric.indices[triangle])
  }

  const islands = new Map()
  for (const vertex of fabric.indices) {
    const islandRoot = root(vertex)
    if (!islands.has(islandRoot)) islands.set(islandRoot, new Set())
    islands.get(islandRoot).add(vertex)
  }
  return [...islands.values()].map((vertexSet) => [...vertexSet])
}

function convexHull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  function cross(origin, a, b) {
    return (a[0] - origin[0]) * (b[1] - origin[1]) - (a[1] - origin[1]) * (b[0] - origin[0])
  }
  const lower = []
  for (const point of sorted) {
    while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop()
    lower.push(point)
  }
  const upper = []
  for (const point of [...sorted].reverse()) {
    while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop()
    upper.push(point)
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1))
}

function polygonArea(points) {
  let sum = 0
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]
    const next = points[(index + 1) % points.length]
    sum += current[0] * next[1] - next[0] * current[1]
  }
  return Math.abs(sum) / 2
}

function largestCornerPolygon(hull, cornerCount) {
  let best = null
  let bestArea = -1
  const chosen = []
  function choose(start) {
    if (chosen.length === cornerCount) {
      const area = polygonArea(chosen)
      if (area > bestArea) {
        bestArea = area
        best = [...chosen]
      }
      return
    }
    for (let index = start; index < hull.length; index += 1) {
      chosen.push(hull[index])
      choose(index + 1)
      chosen.pop()
    }
  }
  choose(0)
  return best
}

function coverHull(corners, hull) {
  let signedArea = 0
  for (let index = 0; index < corners.length; index += 1) {
    const current = corners[index]
    const next = corners[(index + 1) % corners.length]
    signedArea += current[0] * next[1] - next[0] * current[1]
  }
  const winding = signedArea > 0 ? 1 : -1

  const edges = []
  for (let index = 0; index < corners.length; index += 1) {
    const start = corners[index]
    const end = corners[(index + 1) % corners.length]
    const length = Math.hypot(end[0] - start[0], end[1] - start[1])
    const normal = [winding * (end[1] - start[1]) / length, -winding * (end[0] - start[0]) / length]
    let outward = 0
    for (const point of hull) {
      const distance = (point[0] - start[0]) * normal[0] + (point[1] - start[1]) * normal[1]
      if (distance > outward) outward = distance
    }
    const shift = outward + 0.001
    edges.push({ point: [start[0] + normal[0] * shift, start[1] + normal[1] * shift], direction: [end[0] - start[0], end[1] - start[1]] })
  }

  const padded = []
  for (let index = 0; index < edges.length; index += 1) {
    const previous = edges[(index - 1 + edges.length) % edges.length]
    const current = edges[index]
    const denominator = previous.direction[0] * current.direction[1] - previous.direction[1] * current.direction[0]
    const offset = [current.point[0] - previous.point[0], current.point[1] - previous.point[1]]
    const t = (offset[0] * current.direction[1] - offset[1] * current.direction[0]) / denominator
    padded.push([previous.point[0] + previous.direction[0] * t, previous.point[1] + previous.direction[1] * t])
  }
  return padded
}

function segmentsCross(a, b, c, d) {
  function side(p, q, r) {
    return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
  }
  return side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0
}

function pointInside(point, polygon) {
  let inside = false
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const a = polygon[index]
    const b = polygon[previous]
    if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside
  }
  return inside
}

function assertNoOverlap(path, regions) {
  for (const first of panelOrder) {
    for (const second of panelOrder) {
      if (first >= second) continue
      const a = regions[first]
      const b = regions[second]
      let overlap = pointInside(a[0], b) || pointInside(b[0], a)
      for (let i = 0; i < a.length; i += 1) {
        for (let j = 0; j < b.length; j += 1) {
          if (segmentsCross(a[i], a[(i + 1) % a.length], b[j], b[(j + 1) % b.length])) overlap = true
        }
      }
      if (overlap) throw new Error(`${path}: padded regions ${first} and ${second} overlap`)
    }
  }
}

function uvDirection(vertices, uvs, valueOf) {
  let meanValue = 0
  let meanU = 0
  let meanV = 0
  for (const vertex of vertices) {
    meanValue += valueOf(vertex) / vertices.length
    meanU += uvs[vertex][0] / vertices.length
    meanV += uvs[vertex][1] / vertices.length
  }
  let alongU = 0
  let alongV = 0
  for (const vertex of vertices) {
    alongU += (valueOf(vertex) - meanValue) * (uvs[vertex][0] - meanU)
    alongV += (valueOf(vertex) - meanValue) * (uvs[vertex][1] - meanV)
  }
  if (Math.abs(alongU) > Math.abs(alongV)) return alongU > 0 ? '+u' : '-u'
  return alongV > 0 ? '+v' : '-v'
}

function fabricSize(fabric, vertices, right, down) {
  const island = new Set(vertices)
  const axisIndex = { u: 0, v: 1 }
  let rightLength = 0
  let downLength = 0
  let totalWeight = 0
  for (let triangle = 0; triangle < fabric.indices.length; triangle += 3) {
    const [a, b, c] = [fabric.indices[triangle], fabric.indices[triangle + 1], fabric.indices[triangle + 2]]
    if (!island.has(a)) continue
    const uv1 = [fabric.uvs[b][0] - fabric.uvs[a][0], fabric.uvs[b][1] - fabric.uvs[a][1]]
    const uv2 = [fabric.uvs[c][0] - fabric.uvs[a][0], fabric.uvs[c][1] - fabric.uvs[a][1]]
    const determinant = uv1[0] * uv2[1] - uv1[1] * uv2[0]
    if (determinant === 0) continue
    const edge1 = [0, 1, 2].map((axis) => fabric.positions[b][axis] - fabric.positions[a][axis])
    const edge2 = [0, 1, 2].map((axis) => fabric.positions[c][axis] - fabric.positions[a][axis])
    const perU = [0, 1, 2].map((axis) => (edge1[axis] * uv2[1] - edge2[axis] * uv1[1]) / determinant)
    const perV = [0, 1, 2].map((axis) => (edge2[axis] * uv1[0] - edge1[axis] * uv2[0]) / determinant)
    const metersPerUv = [Math.hypot(...perU), Math.hypot(...perV)]
    const weight = Math.abs(determinant)
    rightLength += metersPerUv[axisIndex[right[1]]] * weight
    downLength += metersPerUv[axisIndex[down[1]]] * weight
    totalWeight += weight
  }
  function extent(axis) {
    const values = vertices.map((vertex) => fabric.uvs[vertex][axisIndex[axis[1]]])
    return Math.max(...values) - Math.min(...values)
  }
  return { width: rightLength / totalWeight * extent(right), height: downLength / totalWeight * extent(down) }
}

function extractRegions(path) {
  const fabric = readFabric(path)
  const islands = findIslands(fabric).map((vertices) => {
    const center = [0, 1, 2].map((axis) => vertices.reduce((sum, vertex) => sum + fabric.positions[vertex][axis], 0) / vertices.length)
    const lowestY = Math.min(...vertices.map((vertex) => fabric.positions[vertex][1]))
    return { vertices, center, lowestY, uvs: vertices.map((vertex) => fabric.uvs[vertex]) }
  })
  const peakThreshold = islands.map((island) => island.lowestY).sort((a, b) => a - b)[4] - 0.001

  const regions = {}
  const orientations = {}
  const sizes = {}
  for (const island of islands) {
    const kind = island.lowestY >= peakThreshold ? 'Peak' : 'Valance'
    let side
    if (Math.abs(island.center[2]) > Math.abs(island.center[0])) side = island.center[2] > 0 ? 'front' : 'back'
    else side = island.center[0] < 0 ? 'left' : 'right'
    const panel = side + kind
    if (regions[panel]) throw new Error(`${path}: two UV islands resolved to ${panel}`)
    const rightAxis = { front: [1, 0], back: [-1, 0], left: [0, 1], right: [0, -1] }[side]
    const right = uvDirection(island.vertices, fabric.uvs, (vertex) => fabric.positions[vertex][0] * rightAxis[0] + fabric.positions[vertex][2] * rightAxis[1])
    const down = uvDirection(island.vertices, fabric.uvs, (vertex) => -fabric.positions[vertex][1])
    orientations[panel] = { right, down }
    sizes[panel] = fabricSize(fabric, island.vertices, right, down)
    const hull = convexHull(island.uvs)
    const corners = coverHull(largestCornerPolygon(hull, kind === 'Peak' ? 3 : 4), hull)
    regions[panel] = corners.map(([u, v]) => [Math.round(u * 10000) / 10000, Math.round(v * 10000) / 10000])
  }
  for (const panel of panelOrder) {
    if (!regions[panel]) throw new Error(`${path}: no UV island found for ${panel}`)
  }
  assertNoOverlap(path, regions)
  return { regions, orientations, sizes, legCenterOffset: fabric.legCenterOffset, eaveHeight: fabric.eaveHeight, footprintWidth: fabric.footprintWidth }
}

let source = "import type { CanopySurfaces } from './types'\n\nexport const canopySurfaces: CanopySurfaces = {\n"
let measurementSource = "import type { ModelId } from './models'\n\nexport const modelMeasurements: Record<ModelId, { footprintWidth: number; legCenterOffset: number; eaveHeight: number }> = {\n"
for (const model of models) {
  const { regions, orientations, sizes, legCenterOffset, eaveHeight, footprintWidth } = extractRegions(model.path)
  measurementSource += `  '${model.id}': { footprintWidth: ${Math.round(footprintWidth * 10000) / 10000}, legCenterOffset: ${Math.round(legCenterOffset * 10000) / 10000}, eaveHeight: ${Math.round(eaveHeight * 10000) / 10000} },\n`
  source += `  '${model.id}': {\n`
  for (const panel of panelOrder) {
    const points = regions[panel].map(([u, v]) => `[${u}, ${v}]`).join(', ')
    const widthMeters = Math.round(sizes[panel].width * 1000) / 1000
    const heightMeters = Math.round(sizes[panel].height * 1000) / 1000
    source += `    ${panel}: { outline: [${points}], right: '${orientations[panel].right}', down: '${orientations[panel].down}', widthMeters: ${widthMeters}, heightMeters: ${heightMeters} },\n`
  }
  source += '  },\n'
}
source += '}\n'

measurementSource += '}\n'

writeFileSync(resolve('src/product/canopySurfaces.ts'), source)
writeFileSync(resolve('src/product/modelMeasurements.ts'), measurementSource)
process.stdout.write('src/product/canopySurfaces.ts and src/product/modelMeasurements.ts written from GLB geometry\n')
