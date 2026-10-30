// 生成简单的 TabBar PNG 图标
// 黑底白字的 generate 图标

const fs = require('fs')
const path = require('path')

// 最简单的 81x81 PNG（纯色方块）
// 使用 Buffer 创建最小化的 PNG

function createSimplePNG(width, height, r, g, b, a) {
  // PNG 签名
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR chunk
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8  // bit depth
  ihdrData[9] = 6  // color type (RGBA)
  ihdrData[10] = 0 // compression
  ihdrData[11] = 0 // filter
  ihdrData[12] = 0 // interlace

  const ihdr = createChunk('IHDR', ihdrData)

  // IDAT chunk - raw pixel data
  const rawData = Buffer.alloc(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0 // filter type none
    for (let x = 0; x < width; x++) {
      const offset = y * (1 + width * 4) + 1 + x * 4
      rawData[offset] = r
      rawData[offset + 1] = g
      rawData[offset + 2] = b
      rawData[offset + 3] = a
    }
  }

  const zlib = require('zlib')
  const compressed = zlib.deflateSync(rawData)
  const idat = createChunk('IDAT', compressed)

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

function createChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)

  const typeBuffer = Buffer.from(type, 'ascii')
  const typeAndData = Buffer.concat([typeBuffer, data])

  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeAndData), 0)

  return Buffer.concat([length, typeAndData, crc])
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

// Create a simple icon: gray circle on transparent background
function createIconPNG(color) {
  const width = 81
  const height = 81
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8
  ihdrData[9] = 6
  const ihdr = createChunk('IHDR', ihdrData)

  // Pixel data: draw a filled circle
  const rawData = Buffer.alloc(height * (1 + width * 4))
  const cx = width / 2
  const cy = height / 2
  const radius = 28

  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0
    for (let x = 0; x < width; x++) {
      const offset = y * (1 + width * 4) + 1 + x * 4
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= radius) {
        rawData[offset] = color[0]
        rawData[offset + 1] = color[1]
        rawData[offset + 2] = color[2]
        rawData[offset + 3] = 255
      } else {
        rawData[offset] = 0
        rawData[offset + 1] = 0
        rawData[offset + 2] = 0
        rawData[offset + 3] = 0
      }
    }
  }

  const zlib = require('zlib')
  const compressed = zlib.deflateSync(rawData)
  const idat = createChunk('IDAT', compressed)
  const iend = createChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

const outputDir = path.join(__dirname, '..', 'src', 'assets', 'icons', 'tabbar')

// Generate icons
const gray = [153, 153, 153]   // #999999 - inactive
const black = [0, 0, 0]         // #000000 - active

const icons = [
  { name: 'generate.png', color: gray },
  { name: 'generate-active.png', color: black },
  { name: 'mine.png', color: gray },
  { name: 'mine-active.png', color: black },
]

icons.forEach(icon => {
  const png = createIconPNG(icon.color)
  const filePath = path.join(outputDir, icon.name)
  fs.writeFileSync(filePath, png)
  console.log(`Created: ${filePath} (${png.length} bytes)`)
})

console.log('All tabbar icons created successfully!')
