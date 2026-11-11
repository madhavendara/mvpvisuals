import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ProductConfiguration } from '../src/product/types'

export type Upload = { data: Buffer; mime: string; name: string }

const dataDirectory = resolve(process.cwd(), 'data')
for (const folder of ['configurations', 'previews', 'uploads']) mkdirSync(resolve(dataDirectory, folder), { recursive: true })

function filePath(folder: string, id: string, extension: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) throw new Error('Invalid id')
  return resolve(dataDirectory, folder, `${id}${extension}`)
}

export function saveConfiguration(id: string, config: ProductConfiguration) {
  writeFileSync(filePath('configurations', id, '.json'), JSON.stringify(config))
}

export function readConfiguration(id: string): ProductConfiguration | null {
  const path = filePath('configurations', id, '.json')
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function savePreview(id: string, preview: Buffer) {
  writeFileSync(filePath('previews', id, '.jpg'), preview)
}

export function readPreview(id: string) {
  const path = filePath('previews', id, '.jpg')
  if (!existsSync(path)) return null
  return readFileSync(path)
}

export function saveUpload(id: string, upload: Upload) {
  writeFileSync(filePath('uploads', id, ''), upload.data)
  writeFileSync(filePath('uploads', id, '.json'), JSON.stringify({ mime: upload.mime, name: upload.name }))
}

export function readUpload(id: string): Upload | null {
  const path = filePath('uploads', id, '')
  if (!existsSync(path)) return null
  const details = JSON.parse(readFileSync(filePath('uploads', id, '.json'), 'utf8'))
  return { data: readFileSync(path), mime: details.mime, name: details.name }
}
