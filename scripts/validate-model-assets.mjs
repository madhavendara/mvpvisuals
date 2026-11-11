import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const assets = [
  { path: 'glb/Tent_5_5.glb', uvCount: 5954, uvHash: '7c29d91862ce88c23abee806ad47d9b2dd2e4b209b92fec82be282d8e6790a10' },
  { path: 'glb/Tent 6.5_6.5.glb', uvCount: 1569, uvHash: '1381211f79a14e855a916529f7360fd32cd1cf661a3ff290e84b62b1315f4e42' },
  { path: 'glb/Tent_8_8.glb', uvCount: 1427, uvHash: '07844538c10d074bd936d5b59e1d08650ea69a7837c6921f1dbd75377cfef2ad' },
]

for (const asset of assets) {
  const bytes = readFileSync(resolve(asset.path))
  const jsonLength = bytes.readUInt32LE(12)
  const document = JSON.parse(bytes.toString('utf8', 20, 20 + jsonLength))
  const binaryStart = 20 + jsonLength + 8
  const fabricNode = document.nodes.find((node) => node.name === 'fabric' && Number.isInteger(node.mesh))
  if (!fabricNode) throw new Error(`${asset.path}: missing fabric mesh`)
  const primitive = document.meshes[fabricNode.mesh].primitives.find((item) => document.materials[item.material]?.name === 'fabric_Mat')
  if (!primitive) throw new Error(`${asset.path}: missing fabric_Mat material`)
  const material = document.materials[primitive.material]
  if (!material.pbrMetallicRoughness?.baseColorTexture) throw new Error(`${asset.path}: missing fabric base color texture`)
  const accessor = document.accessors[primitive.attributes.TEXCOORD_0]
  if (!accessor || accessor.componentType !== 5126 || accessor.type !== 'VEC2') throw new Error(`${asset.path}: missing float UV layout`)
  const view = document.bufferViews[accessor.bufferView]
  const offset = binaryStart + (view.byteOffset || 0) + (accessor.byteOffset || 0)
  const stride = view.byteStride || 8
  const hash = createHash('sha256')
  for (let index = 0; index < accessor.count; index += 1) hash.update(bytes.subarray(offset + index * stride, offset + index * stride + 8))
  if (accessor.count !== asset.uvCount || hash.digest('hex') !== asset.uvHash) {
    throw new Error(`${asset.path}: fabric UV layout changed. Recalibrate its canopy atlas before using this model.`)
  }
  process.stdout.write(`${asset.path}: fabric UV layout verified\n`)
}
