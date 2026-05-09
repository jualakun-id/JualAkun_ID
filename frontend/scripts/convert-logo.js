const path = require('path')
const fs = require('fs')
const sharp = require('sharp')

const ROOT = path.resolve(__dirname, '../..')
const INPUT = path.join(ROOT, 'logo-doodle.jpeg')

;(async () => {
  if (!fs.existsSync(INPUT)) {
    console.error('Input not found:', INPUT)
    process.exit(1)
  }

  const inSize = fs.statSync(INPUT).size

  // 1) Plain WebP (white BG kept) — for general use
  const outOpaque = path.join(ROOT, 'logo-doodle.webp')
  await sharp(INPUT).webp({ quality: 92, effort: 6 }).toFile(outOpaque)

  // 2) Transparent WebP — chroma key white -> transparent
  // Threshold: pixels brighter than this are considered "white background"
  const THRESHOLD = 245

  const { data, info } = await sharp(INPUT).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const out = Buffer.from(data)

  for (let i = 0; i < out.length; i += channels) {
    const r = out[i]
    const g = out[i + 1]
    const b = out[i + 2]
    if (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
      // Make pure white transparent
      out[i + 3] = 0
    } else if (r >= 220 && g >= 220 && b >= 220) {
      // Soft edge: partial transparency for anti-aliased pixels
      const avg = (r + g + b) / 3
      const alpha = Math.max(0, Math.min(255, Math.round((255 - avg) * 8)))
      out[i + 3] = alpha
    }
  }

  const outTransparent = path.join(ROOT, 'logo-doodle-transparent.webp')
  await sharp(out, { raw: { width, height, channels } })
    .webp({ quality: 92, effort: 6, alphaQuality: 100 })
    .toFile(outTransparent)

  const opaqueSize = fs.statSync(outOpaque).size
  const trSize = fs.statSync(outTransparent).size

  console.log(`✓ logo-doodle.jpeg → logo-doodle.webp`)
  console.log(`  ${(inSize / 1024).toFixed(1)}KB → ${(opaqueSize / 1024).toFixed(1)}KB (-${((1 - opaqueSize / inSize) * 100).toFixed(1)}%) — white BG kept`)
  console.log(`✓ logo-doodle.jpeg → logo-doodle-transparent.webp`)
  console.log(`  ${(inSize / 1024).toFixed(1)}KB → ${(trSize / 1024).toFixed(1)}KB (-${((1 - trSize / inSize) * 100).toFixed(1)}%) — transparent BG (chroma key)`)
  console.log(`\nThreshold: white pixels ≥ rgb(${THRESHOLD},${THRESHOLD},${THRESHOLD}) made transparent`)
  console.log('Soft edge: rgb 220-244 partial transparency for anti-aliasing')
})()
