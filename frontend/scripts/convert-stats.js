const path = require('path')
const fs = require('fs')
const sharp = require('sharp')

const ROOT = path.resolve(__dirname, '../..')
const FILES = ['stat-blue.jpeg', 'stat-red.jpeg', 'stat-green.jpeg', 'stat-yellow.jpeg']

;(async () => {
  let totalIn = 0
  let totalOut = 0
  for (const file of FILES) {
    const input = path.join(ROOT, file)
    const output = path.join(ROOT, file.replace(/\.jpe?g$/i, '.webp'))
    if (!fs.existsSync(input)) {
      console.log(`✗ ${file} not found, skipping`)
      continue
    }
    const inSize = fs.statSync(input).size
    totalIn += inSize
    await sharp(input).webp({ quality: 88, effort: 6 }).toFile(output)
    const outSize = fs.statSync(output).size
    totalOut += outSize
    console.log(
      `✓ ${file.padEnd(20)} ${(inSize / 1024).toFixed(1).padStart(7)}KB → ${(outSize / 1024).toFixed(1).padStart(7)}KB (-${((1 - outSize / inSize) * 100).toFixed(1)}%)`,
    )
  }
  console.log(`\nTotal: ${(totalIn / 1024).toFixed(1)}KB → ${(totalOut / 1024).toFixed(1)}KB (-${((1 - totalOut / totalIn) * 100).toFixed(1)}%)`)
})()
