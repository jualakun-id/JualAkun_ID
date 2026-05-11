/**
 * Convert stat images (.jpeg/.jpg/.png) → .webp with aspect 16:9 normalization.
 *
 * Usage:
 *   1. Drop files: stat-blue.jpeg, stat-red.jpeg, stat-green.jpeg, stat-yellow.jpeg
 *      ke folder root project (d:/JualAkun_ID/)
 *   2. From frontend dir: node scripts/convert-stats.js
 *   3. Output: stat-blue.webp dst di folder root
 *   4. Upload manual ke Supabase Storage bucket `product-thumbnails`
 *      (replace file existing dgn nama sama)
 *
 * Sharp resize ke 1280x720 (16:9) — kalau input bukan 16:9, di-crop center.
 */
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')

const ROOT = path.resolve(__dirname, '../..')
const FILES = ['stat-blue', 'stat-red', 'stat-green', 'stat-yellow']
const TARGET_WIDTH = 1280
const TARGET_HEIGHT = 720 // 16:9 ratio
const EXTENSIONS = ['.jpeg', '.jpg', '.png']

;(async () => {
  let totalIn = 0
  let totalOut = 0
  for (const base of FILES) {
    let input = null
    for (const ext of EXTENSIONS) {
      const candidate = path.join(ROOT, `${base}${ext}`)
      if (fs.existsSync(candidate)) {
        input = candidate
        break
      }
    }
    if (!input) {
      console.log(`✗ ${base}.{jpeg,jpg,png} not found in ${ROOT}, skipping`)
      continue
    }

    const output = path.join(ROOT, `${base}.webp`)
    const inSize = fs.statSync(input).size
    totalIn += inSize

    // Resize ke 1280x720 — cover mode (crop center kalau aspect input ≠ 16:9)
    await sharp(input)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 88, effort: 6 })
      .toFile(output)

    const outSize = fs.statSync(output).size
    totalOut += outSize
    console.log(
      `✓ ${path.basename(input).padEnd(20)} ${(inSize / 1024).toFixed(1).padStart(7)}KB → ${path
        .basename(output)
        .padEnd(20)} ${(outSize / 1024).toFixed(1).padStart(7)}KB (-${((1 - outSize / inSize) * 100).toFixed(1)}%) · ${TARGET_WIDTH}x${TARGET_HEIGHT}`,
    )
  }
  if (totalIn > 0) {
    console.log(
      `\nTotal: ${(totalIn / 1024).toFixed(1)}KB → ${(totalOut / 1024).toFixed(1)}KB (-${((1 - totalOut / totalIn) * 100).toFixed(1)}%)`,
    )
  }
})()
