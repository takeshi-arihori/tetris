export interface CanvasConfig {
  width: number;
  height: number;
  cellSize: number;
  rows: number;
  cols: number;
}

export const MAIN_CANVAS_CONFIG: CanvasConfig = {
  width: 300,
  height: 600,
  cellSize: 30,
  rows: 20,
  cols: 10,
};

export const SIDE_CANVAS_CONFIG: CanvasConfig = {
  width: 120,
  height: 120,
  cellSize: 30,
  rows: 4,
  cols: 4,
};

export function clearCanvas(ctx: CanvasRenderingContext2D, config: CanvasConfig): void {
  ctx.clearRect(0, 0, config.width, config.height);
}

export function fillCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  cellSize: number
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

export function strokeCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  cellSize: number,
  lineWidth: number = 1
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

export function drawGrid(ctx: CanvasRenderingContext2D, config: CanvasConfig, gridColor: string): void {
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;
  
  for (let x = 0; x <= config.cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * config.cellSize, 0);
    ctx.lineTo(x * config.cellSize, config.height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= config.rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * config.cellSize);
    ctx.lineTo(config.width, y * config.cellSize);
    ctx.stroke();
  }
}

export function drawBackground(ctx: CanvasRenderingContext2D, config: CanvasConfig, bgColor: string): void {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, config.width, config.height);
}

export function drawCellWithShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  cellSize: number
): void {
  const cellX = x * cellSize;
  const cellY = y * cellSize;
  
  ctx.fillStyle = color;
  ctx.fillRect(cellX, cellY, cellSize, cellSize);
  
  const highlightColor = lightenColor(color, 0.3);
  const shadowColor = darkenColor(color, 0.3);
  
  ctx.fillStyle = highlightColor;
  ctx.fillRect(cellX, cellY, cellSize, 2);
  ctx.fillRect(cellX, cellY, 2, cellSize);
  
  ctx.fillStyle = shadowColor;
  ctx.fillRect(cellX, cellY + cellSize - 2, cellSize, 2);
  ctx.fillRect(cellX + cellSize - 2, cellY, 2, cellSize);
}

function lightenColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
  const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
  const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

function darkenColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const newR = Math.max(0, Math.floor(r * (1 - amount)));
  const newG = Math.max(0, Math.floor(g * (1 - amount)));
  const newB = Math.max(0, Math.floor(b * (1 - amount)));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}