import { resolve } from 'node:path'
import { catalog } from './catalog'
import { canopyPanelSize, designWidth, unprintedFabricColor } from '../src/product/designs'
import { canopySurfaces } from '../src/product/canopySurfaces'
import { isDoubleSided, selectedWalls, wallTextureSize } from '../src/product/walls'
import type { PanelDesign, ProductConfiguration } from '../src/product/types'
import type { PriceQuote } from '../src/product/commerce'
import type { Upload } from './storage'


const brand = {
  ink: '#1d1d1d',
  body: '#444444',
  muted: '#8a8584',
  line: '#ede8e7',
  gold: '#f1b242',
}

const page = { width: 595.28, height: 841.89, margin: 48 }
const contentWidth = page.width - page.margin * 2
const columnGap = 20
const cellWidth = (contentWidth - columnGap) / 2

const fontFiles = {
  heading: 'node_modules/@fontsource/encode-sans-expanded/files/encode-sans-expanded-latin-700-normal.woff',
  headingSemi: 'node_modules/@fontsource/encode-sans-expanded/files/encode-sans-expanded-latin-600-normal.woff',
  body: 'node_modules/@fontsource/overpass/files/overpass-latin-400-normal.woff',
  bodySemi: 'node_modules/@fontsource/overpass/files/overpass-latin-600-normal.woff',
}

function money(minor: number, currency: string) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, currencyDisplay: 'code' }).format(minor / 100)
}

function drawPageChrome(document: PDFKit.PDFDocument, id: string, pageNumber: number) {
  document.font('heading').fontSize(11).fillColor(brand.ink).text('TENT STUDIO.', page.margin, 34, { characterSpacing: 1.6, lineBreak: false })
  document.font('bodySemi').fontSize(7.5).fillColor(brand.muted)
    .text('PRODUCTION SUMMARY', page.margin, 37, { width: contentWidth, align: 'right', characterSpacing: 1.2, lineBreak: false })
  document.rect(page.margin, 56, contentWidth, 2).fill(brand.gold)
  document.font('body').fontSize(7.5).fillColor(brand.muted)
  document.text(`Configuration ${id}`, page.margin, page.height - 34, { lineBreak: false })
  document.text(`Page ${pageNumber}`, page.margin, page.height - 34, { width: contentWidth, align: 'right', lineBreak: false })
}

function sectionHeading(document: PDFKit.PDFDocument, text: string, x: number, y: number) {
  document.font('heading').fontSize(11).fillColor(brand.ink).text(text.toUpperCase(), x, y, { characterSpacing: 0.6, lineBreak: false })
}

function groupLabel(document: PDFKit.PDFDocument, text: string, y: number) {
  document.font('bodySemi').fontSize(7.5).fillColor(brand.muted).text(text.toUpperCase(), page.margin, y, { characterSpacing: 1, lineBreak: false })
}

function drawPreview(document: PDFKit.PDFDocument, design: PanelDesign, x: number, y: number, width: number, height: number, peak: boolean, uploads: Map<string, Upload>) {
  const designScale = width / designWidth
  document.save()
  if (peak) document.polygon([x + width / 2, y], [x + width, y + height], [x, y + height]).clip()
  else document.rect(x, y, width, height).clip()
  document.rect(x, y, width, height).fill(design.color)
  for (const layer of design.layers) {
    document.save()
    document.translate(x + layer.x * width, y + layer.y * height)
    document.rotate(layer.rotation)
    if (layer.kind === 'text') {
      const fontSize = Math.max(5, layer.fontSize * layer.scale * designScale)
      document.font(layer.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize)
      document.fillColor(layer.color).text(layer.text, -width * 2, -fontSize / 2, { width: width * 4, align: 'center', lineBreak: false })
    } else {
      const asset = uploads.get(layer.assetId)!
      const imageWidth = 180 * layer.scale * designScale
      const imageHeight = imageWidth / layer.aspect
      if (asset.mime !== 'image/svg+xml') {
        document.image(asset.data, -imageWidth / 2, -imageHeight / 2, { width: imageWidth, height: imageHeight })
      } else {
        document.font('body').fontSize(6).fillColor(brand.ink).text(layer.name, -imageWidth / 2, -3, { width: imageWidth, align: 'center', lineBreak: false })
      }
    }
    document.restore()
  }
  document.restore()
  if (peak) document.polygon([x + width / 2, y], [x + width, y + height], [x, y + height]).lineWidth(0.6).stroke(brand.line)
  else document.rect(x, y, width, height).lineWidth(0.6).stroke(brand.line)
}

function drawCaption(document: PDFKit.PDFDocument, title: string, detail: string, x: number, y: number) {
  document.font('headingSemi').fontSize(7.5).fillColor(brand.ink).text(title.toUpperCase(), x, y, { width: cellWidth, characterSpacing: 0.4, lineBreak: false })
  document.font('body').fontSize(7.5).fillColor(brand.muted).text(detail, x, y + 11, { width: cellWidth, lineBreak: false })
}

function designSummary(design: PanelDesign) {
  return `${design.color.toUpperCase()} · ${design.layers.length} artwork layer${design.layers.length === 1 ? '' : 's'}`
}

function drawPanelGrid(document: PDFKit.PDFDocument, config: ProductConfiguration, kind: 'Peak' | 'Valance', startY: number, uploads: Map<string, Upload>) {
  const panels = catalog.panels.filter((panel) => panel.id.endsWith(kind))
  const size = canopyPanelSize(canopySurfaces[config.modelId][panels[0].id])
  const height = cellWidth * size.height / size.width
  panels.forEach((panel, index) => {
    const x = page.margin + (index % 2) * (cellWidth + columnGap)
    const y = startY + Math.floor(index / 2) * (height + 40)
    drawPreview(document, config.panels[panel.id], x, y, cellWidth, height, kind === 'Peak', uploads)
    drawCaption(document, panel.label, designSummary(config.panels[panel.id]), x, y + height + 8)
  })
  return startY + 2 * (height + 40)
}

export function renderConfigurationPdf(document: PDFKit.PDFDocument, config: ProductConfiguration, id: string, quote: PriceQuote, uploads: Map<string, Upload>, preview: Buffer) {
  document.registerFont('heading', resolve(process.cwd(), fontFiles.heading))
  document.registerFont('headingSemi', resolve(process.cwd(), fontFiles.headingSemi))
  document.registerFont('body', resolve(process.cwd(), fontFiles.body))
  document.registerFont('bodySemi', resolve(process.cwd(), fontFiles.bodySemi))

  drawPageChrome(document, id, 1)
  groupLabel(document, 'Logo canopy tents', 80)
  document.font('heading').fontSize(24).fillColor(brand.ink).text(`${config.modelId} ${catalog.productName}`.toUpperCase(), page.margin, 94, { width: contentWidth, lineBreak: false })
  document.font('headingSemi').fontSize(15).fillColor(brand.ink).text(money(quote.totalMinor, quote.currency), page.margin, 126, { lineBreak: false })

  const heroY = 156
  const heroHeight = contentWidth * 800 / 1200
  document.save().roundedRect(page.margin, heroY, contentWidth, heroHeight, 3).clip()
  document.image(preview, page.margin, heroY, { width: contentWidth, height: heroHeight })
  document.restore()

  const columnsY = heroY + heroHeight + 28
  const leftWidth = 270
  const rightX = page.margin + leftWidth + 24
  const rightWidth = contentWidth - leftWidth - 24

  sectionHeading(document, 'Selections', page.margin, columnsY)
  const selections = [
    ['Tent size', config.modelId],
    ['Frame', catalog.frames.find((option) => option.id === config.frame)!.label],
    ['Side walls', catalog.sideWalls.find((option) => option.id === config.sideWalls)!.label],
    ['Half walls', catalog.halfWalls.find((option) => option.id === config.halfWalls)!.label],
    ['Artwork service', catalog.artworkServices.find((option) => option.id === config.artworkService)!.label],
    ['Quantity', String(config.quantity)],
  ]
  let rowY = columnsY + 24
  for (const [label, value] of selections) {
    document.font('bodySemi').fontSize(7).fillColor(brand.muted).text(label.toUpperCase(), page.margin, rowY + 1, { characterSpacing: 0.8, lineBreak: false })
    document.font('body').fontSize(9.5).fillColor(brand.ink).text(value, page.margin + 92, rowY, { width: leftWidth - 92, lineBreak: false })
    document.moveTo(page.margin, rowY + 15).lineTo(page.margin + leftWidth, rowY + 15).lineWidth(0.6).stroke(brand.line)
    rowY += 22
  }

  sectionHeading(document, 'Price', rightX, columnsY)
  let priceY = columnsY + 24
  const priceLines = quote.lines.map((line, index) => [`${index === 0 ? 'Tent, frame & walls' : line.label} × ${line.quantity}`, money(line.amountMinor, quote.currency)])
  for (const [label, value] of priceLines) {
    document.font('body').fontSize(9).fillColor(brand.body).text(label, rightX, priceY, { lineBreak: false })
    document.text(value, rightX, priceY, { width: rightWidth, align: 'right', lineBreak: false })
    priceY += 18
  }
  priceY += 6
  document.rect(rightX, priceY, 3, 20).fill(brand.gold)
  document.font('bodySemi').fontSize(8).fillColor(brand.muted).text('TOTAL', rightX + 12, priceY + 6, { characterSpacing: 0.8, lineBreak: false })
  document.font('headingSemi').fontSize(13).fillColor(brand.ink).text(money(quote.totalMinor, quote.currency), rightX, priceY + 3, { width: rightWidth, align: 'right', lineBreak: false })
  priceY += 34
  document.font('body').fontSize(7).fillColor(brand.muted).text(`Shopify variants ${quote.lines.map((line) => line.variantId).join(', ')}`, rightX, priceY, { width: rightWidth, lineBreak: false })

  if (config.notes) {
    const notesY = Math.max(rowY, priceY + 16) + 10
    sectionHeading(document, 'Design notes', page.margin, notesY)
    document.font('body').fontSize(9).fillColor(brand.body).text(config.notes, page.margin, notesY + 18, { width: contentWidth })
  }

  document.addPage()
  drawPageChrome(document, id, 2)
  sectionHeading(document, 'Canopy artwork', page.margin, 80)
  groupLabel(document, 'Peaks', 104)
  const valancesY = drawPanelGrid(document, config, 'Peak', 120, uploads) + 8
  groupLabel(document, 'Valances', valancesY)
  drawPanelGrid(document, config, 'Valance', valancesY + 16, uploads)

  const walls = selectedWalls(config.sideWalls, config.halfWalls)
  if (walls.length > 0) {
    document.addPage()
    drawPageChrome(document, id, 3)
    sectionHeading(document, 'Walls', page.margin, 80)
    let wallY = 104
    for (const wall of walls) {
      const label = catalog.walls.find((item) => item.id === wall)!.label
      const doubleSided = isDoubleSided(config, wall)
      const size = wallTextureSize(config.modelId, wall)
      const height = cellWidth * size.height / size.width
      const interiorX = page.margin + cellWidth + columnGap
      document.font('headingSemi').fontSize(8.5).fillColor(brand.ink).text(label.toUpperCase(), page.margin, wallY, { characterSpacing: 0.4, lineBreak: false })
      document.font('body').fontSize(8).fillColor(brand.muted).text(doubleSided ? 'Double-sided print' : 'Single-sided print', page.margin, wallY, { width: contentWidth, align: 'right', lineBreak: false })
      wallY += 18
      drawPreview(document, config.walls[wall].exterior, page.margin, wallY, cellWidth, height, false, uploads)
      drawCaption(document, 'Exterior', designSummary(config.walls[wall].exterior), page.margin, wallY + height + 8)
      if (doubleSided) {
        drawPreview(document, config.walls[wall].interior, interiorX, wallY, cellWidth, height, false, uploads)
        drawCaption(document, 'Interior', designSummary(config.walls[wall].interior), interiorX, wallY + height + 8)
      } else {
        document.rect(interiorX, wallY, cellWidth, height).fill(unprintedFabricColor)
        drawCaption(document, 'Interior', 'Not printed (single-sided)', interiorX, wallY + height + 8)
      }
      wallY += height + 44
    }
  }
  document.end()
}
