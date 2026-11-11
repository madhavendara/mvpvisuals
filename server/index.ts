import express from 'express'
import multer from 'multer'
import PDFDocument from 'pdfkit'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { catalog, calculateQuote, validateConfiguration } from './catalog'
import { renderConfigurationPdf } from './pdf'
import { buildCartAdd } from './shopify'
import { readConfiguration, readPreview, readUpload, saveConfiguration, savePreview, saveUpload, type Upload } from './storage'

const app = express()
app.set('trust proxy', true)
const port = Number(process.env.PORT)
const jpegPrefix = 'data:image/jpeg;base64,'
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.mimetype)),
})

app.post('/api/cart', express.json({ limit: '5mb' }), (request, response) => {
  try {
    const config = validateConfiguration(request.body.configuration)
    const previewDataUrl = request.body.preview
    if (typeof previewDataUrl !== 'string' || !previewDataUrl.startsWith(jpegPrefix)) throw new Error('A JPEG 3D preview is required')
    const id = randomUUID()
    saveConfiguration(id, config)
    savePreview(id, Buffer.from(previewDataUrl.slice(jpegPrefix.length), 'base64'))
    const quote = calculateQuote(config)
    const publicOrigin = `${request.protocol}://${request.get('host')}`
    response.json({ mock: true, configurationId: id, quote, pdfUrl: `/api/configurations/${id}/pdf`, cart: buildCartAdd(config, quote, id, publicOrigin) })
  } catch (error) {
    response.status(400).json({ error: (error as Error).message })
  }
})

app.use(express.json({ limit: '1mb' }))

app.get('/api/catalog', (_request, response) => response.json(catalog))

app.post('/api/quote', (request, response) => {
  try {
    const config = validateConfiguration(request.body)
    response.json(calculateQuote(config))
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Invalid configuration' })
  }
})

app.post('/api/uploads', upload.single('file'), (request, response) => {
  if (!request.file) return response.status(400).json({ error: 'Use a JPG, PNG, or SVG under 10 MB' })
  const assetId = randomUUID()
  saveUpload(assetId, { data: request.file.buffer, mime: request.file.mimetype, name: request.file.originalname })
  response.json({ assetId, url: `/api/uploads/${assetId}`, name: request.file.originalname })
})

app.get('/api/uploads/:id', (request, response) => {
  const asset = readUpload(request.params.id)
  if (!asset) return response.status(404).json({ error: 'Upload not found' })
  response.setHeader('Content-Type', asset.mime)
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Content-Security-Policy', 'sandbox')
  response.send(asset.data)
})

app.get('/api/configurations/:id', (request, response) => {
  const config = readConfiguration(request.params.id)
  if (!config) return response.status(404).json({ error: 'Configuration not found' })
  response.json({ id: request.params.id, configuration: config })
})

app.get('/api/configurations/:id/pdf', (request, response) => {
  const config = readConfiguration(request.params.id)
  const preview = readPreview(request.params.id)
  if (!config || !preview) return response.status(404).json({ error: 'Add the configuration to cart before downloading its PDF' })
  const quote = calculateQuote(config)
  const uploads = new Map<string, Upload>()
  for (const design of [...Object.values(config.panels), ...Object.values(config.walls).flatMap((wall) => [wall.exterior, wall.interior])]) {
    for (const layer of design.layers) if (layer.kind === 'image') uploads.set(layer.assetId, readUpload(layer.assetId)!)
  }
  const document = new PDFDocument({ margin: 0, size: 'A4' })
  response.setHeader('Content-Type', 'application/pdf')
  response.setHeader('Content-Disposition', `attachment; filename="tent-configuration-${request.params.id}.pdf"`)
  document.pipe(response)
  renderConfigurationPdf(document, config, request.params.id, quote, uploads, preview)
})

app.use('/api', (_request, response) => response.status(404).json({ error: 'API route not found' }))
app.use(express.static(resolve(process.cwd(), 'dist')))
app.use((_request, response) => response.sendFile(resolve(process.cwd(), 'dist/index.html')))
app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  response.status(400).json({ error: error.message })
})

app.listen(port, () => process.stdout.write(`Configurator API listening on http://localhost:${port}\n`))
