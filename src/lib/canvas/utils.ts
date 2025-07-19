// Canvas描画のユーティリティ関数

export interface CanvasConfig {
  width: number
  height: number
  cellSize: number
  gridWidth: number
  gridHeight: number
}

export const MAIN_CANVAS_CONFIG: CanvasConfig = {
  width: 300,
  height: 600,
  cellSize: 30,
  gridWidth: 10,
  gridHeight: 20
}

export const SIDE_CANVAS_CONFIG: CanvasConfig = {
  width: 120,
  height: 120,
  cellSize: 30,
  gridWidth: 4,
  gridHeight: 4
}

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface CellPosition {
  row: number
  col: number
}

// Canvas初期化とクリア
export function clearCanvas(ctx: CanvasRenderingContext2D, width?: number, height?: number): void {
  ctx.clearRect(0, 0, width || ctx.canvas.width, height || ctx.canvas.height)
}

// セルの塗りつぶし
export function fillCell(
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  color: string,
  cellSize: number = MAIN_CANVAS_CONFIG.cellSize
): void {
  ctx.fillStyle = color
  ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
}

// セルの枠線描画
export function strokeCell(
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  color: string,
  lineWidth: number = 1,
  cellSize: number = MAIN_CANVAS_CONFIG.cellSize
): void {
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize)
}

// グリッド描画
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  gridColor: string = '#444444',
  lineWidth: number = 1
): void {
  ctx.strokeStyle = gridColor
  ctx.lineWidth = lineWidth

  // 縦線
  for (let col = 0; col <= config.gridWidth; col++) {
    const x = col * config.cellSize
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, config.height)
    ctx.stroke()
  }

  // 横線
  for (let row = 0; row <= config.gridHeight; row++) {
    const y = row * config.cellSize
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(config.width, y)
    ctx.stroke()
  }
}

// 背景描画
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  backgroundColor: string = '#222222'
): void {
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, config.width, config.height)
}

// 影付きセル描画
export function drawCellWithShadow(
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  color: string,
  cellSize: number = MAIN_CANVAS_CONFIG.cellSize,
  shadowOffset: number = 2
): void {
  const x = col * cellSize
  const y = row * cellSize

  // 影を描画
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(x + shadowOffset, y + shadowOffset, cellSize, cellSize)

  // メインのセルを描画
  ctx.fillStyle = color
  ctx.fillRect(x, y, cellSize, cellSize)

  // ハイライト（上と左の明るい縁）
  const lightColor = lightenColor(color, 0.3)
  ctx.fillStyle = lightColor
  ctx.fillRect(x, y, cellSize, 2) // 上端
  ctx.fillRect(x, y, 2, cellSize) // 左端

  // シャドウ（下と右の暗い縁）
  const darkColor = darkenColor(color, 0.3)
  ctx.fillStyle = darkColor
  ctx.fillRect(x, y + cellSize - 2, cellSize, 2) // 下端
  ctx.fillRect(x + cellSize - 2, y, 2, cellSize) // 右端
}

// 色を明るくする
export function lightenColor(color: string, factor: number): string {
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const amt = Math.round(2.55 * factor * 100)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

// 色を暗くする
export function darkenColor(color: string, factor: number): string {
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const amt = Math.round(2.55 * factor * 100)
  const R = (num >> 16) - amt
  const G = (num >> 8 & 0x00FF) - amt
  const B = (num & 0x0000FF) - amt
  return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
    (G > 0 ? G : 0) * 0x100 +
    (B > 0 ? B : 0)).toString(16).slice(1)
}

// 座標変換
export function cellToPixel(cellPos: CellPosition, cellSize: number): Position {
  return {
    x: cellPos.col * cellSize,
    y: cellPos.row * cellSize
  }
}

export function pixelToCell(pixelPos: Position, cellSize: number): CellPosition {
  return {
    row: Math.floor(pixelPos.y / cellSize),
    col: Math.floor(pixelPos.x / cellSize)
  }
}

// 領域内判定
export function isInBounds(pos: CellPosition, config: CanvasConfig): boolean {
  return pos.row >= 0 && pos.row < config.gridHeight &&
         pos.col >= 0 && pos.col < config.gridWidth
}

// 角丸四角形描画
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

// グラデーション作成
export function createLinearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  colorStops: Array<{ offset: number; color: string }>
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  colorStops.forEach(stop => {
    gradient.addColorStop(stop.offset, stop.color)
  })
  return gradient
}

// 中央揃えテキスト描画
export function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string = '16px Arial',
  color: string = '#ffffff'
): void {
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
}

// キャンバスのリサイズ
export function resizeCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
): void {
  canvas.width = width * devicePixelRatio
  canvas.height = height * devicePixelRatio
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(devicePixelRatio, devicePixelRatio)
  }
}