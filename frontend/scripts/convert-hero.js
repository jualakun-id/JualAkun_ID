const path = require('path')
const fs = require('fs')
const sharp = require('sharp')

;(async () => {
  const input = path.resolve(__dirname, '../../hero-banner.jpeg')
  const output = path.resolve(__dirname, '../../hero-banner.webp')

  if (!fs.existsSync(input)) {
    console.error('Input not found:', input)
    process.exit(1)
  }

  const inputSize = fs.statSync(input).size
  await sharp(input).webp({ quality: 88, effort: 6 }).toFile(output)
  const outputSize = fs.statSync(output).size

  console.log(`✓ ${path.basename(input)} → ${path.basename(output)}`)
  console.log(
    `  ${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB (-${(
      (1 - outputSize / inputSize) *
      100
    ).toFixed(1)}%)`,
  )
  console.log(`  Saved: ${output}`)
})()
