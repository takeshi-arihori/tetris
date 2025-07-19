import { TETROMINO_COLORS, BACKGROUND_COLORS, TetrominoType } from './colors';
import { 
  CanvasConfig, 
  clearCanvas, 
  drawBackground, 
  drawGrid, 
  drawCellWithShadow,
  fillCell 
} from './utils';

export interface GameBoard {
  grid: (TetrominoType | null)[][];
  rows: number;
  cols: number;
}

export interface TetrominoData {
  shape: number[][];
  type: TetrominoType;
  x: number;
  y: number;
  rotation: number;
}

export interface RenderOptions {
  showGrid?: boolean;
  showShadow?: boolean;
  ghostPiece?: TetrominoData;
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private config: CanvasConfig;
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement, config: CanvasConfig) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    
    this.ctx = ctx;
    this.config = config;
    
    canvas.width = config.width;
    canvas.height = config.height;
    
    this.ctx.imageSmoothingEnabled = false;
  }

  public clear(): void {
    clearCanvas(this.ctx, this.config);
  }

  public drawBoard(board: GameBoard, options: RenderOptions = {}): void {
    const { showGrid = true, showShadow = true } = options;
    
    drawBackground(this.ctx, this.config, BACKGROUND_COLORS.GAME_BOARD);
    
    for (let y = 0; y < board.rows; y++) {
      for (let x = 0; x < board.cols; x++) {
        const cell = board.grid[y][x];
        if (cell && cell !== 'EMPTY') {
          const color = TETROMINO_COLORS[cell];
          if (showShadow) {
            drawCellWithShadow(this.ctx, x, y, color, this.config.cellSize);
          } else {
            fillCell(this.ctx, x, y, color, this.config.cellSize);
          }
        }
      }
    }
    
    if (options.ghostPiece) {
      this.drawGhostPiece(options.ghostPiece);
    }
    
    if (showGrid) {
      drawGrid(this.ctx, this.config, BACKGROUND_COLORS.GRID_LINE);
    }
  }

  public drawTetromino(tetromino: TetrominoData, options: RenderOptions = {}): void {
    const { showShadow = true } = options;
    const color = TETROMINO_COLORS[tetromino.type];
    
    tetromino.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell) {
          const x = tetromino.x + dx;
          const y = tetromino.y + dy;
          
          if (x >= 0 && x < this.config.cols && y >= 0 && y < this.config.rows) {
            if (showShadow) {
              drawCellWithShadow(this.ctx, x, y, color, this.config.cellSize);
            } else {
              fillCell(this.ctx, x, y, color, this.config.cellSize);
            }
          }
        }
      });
    });
  }

  public drawNextPiece(tetromino: TetrominoData): void {
    this.clear();
    drawBackground(this.ctx, this.config, BACKGROUND_COLORS.SIDE_PANEL);
    
    const color = TETROMINO_COLORS[tetromino.type];
    const offsetX = Math.floor((this.config.cols - tetromino.shape[0].length) / 2);
    const offsetY = Math.floor((this.config.rows - tetromino.shape.length) / 2);
    
    tetromino.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell) {
          const x = offsetX + dx;
          const y = offsetY + dy;
          drawCellWithShadow(this.ctx, x, y, color, this.config.cellSize);
        }
      });
    });
  }

  private drawGhostPiece(ghostPiece: TetrominoData): void {
    const ghostColor = TETROMINO_COLORS.GHOST;
    
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    
    ghostPiece.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell) {
          const x = ghostPiece.x + dx;
          const y = ghostPiece.y + dy;
          
          if (x >= 0 && x < this.config.cols && y >= 0 && y < this.config.rows) {
            fillCell(this.ctx, x, y, ghostColor, this.config.cellSize);
          }
        }
      });
    });
    
    this.ctx.restore();
  }

  public startAnimation(callback: () => void): void {
    if (this.animationId) {
      this.stopAnimation();
    }
    
    const animate = () => {
      callback();
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }

  public stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public dispose(): void {
    this.stopAnimation();
  }
}