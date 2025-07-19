// Canvas描画の中核となるレンダラー

import { 
  clearCanvas, 
  drawBackground, 
  drawGrid, 
  fillCell, 
  drawCellWithShadow,
  MAIN_CANVAS_CONFIG,
  SIDE_CANVAS_CONFIG,
  type CanvasConfig,
  type CellPosition
} from './utils'
import { TETROMINO_COLORS, BACKGROUND_COLORS, type TetrominoType } from './colors'

export type GameBoard = (TetrominoType | 'EMPTY')[][]

export interface TetrominoData {
  type: TetrominoType
  shape: boolean[][]
  position: CellPosition
  rotation: number
}

export interface RenderOptions {
  showGrid?: boolean
  showShadow?: boolean
  showGhost?: boolean
  highlightLines?: number[]
  opacity?: number
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D
  private config: CanvasConfig
  private animationFrame: number | null = null

  constructor(canvas: HTMLCanvasElement, config: CanvasConfig = MAIN_CANVAS_CONFIG) {
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to get 2D rendering context')
    }
    
    this.ctx = context
    this.config = config
    
    // キャンバスサイズを設定
    canvas.width = config.width
    canvas.height = config.height
    
    // 高DPI対応
    const devicePixelRatio = window.devicePixelRatio || 1
    if (devicePixelRatio > 1) {
      canvas.width = config.width * devicePixelRatio
      canvas.height = config.height * devicePixelRatio
      canvas.style.width = config.width + 'px'
      canvas.style.height = config.height + 'px'
      this.ctx.scale(devicePixelRatio, devicePixelRatio)
    }
  }

  // ゲームボードを描画
  renderBoard(board: GameBoard, options: RenderOptions = {}): void {
    const { showGrid = true, showShadow = true, highlightLines = [] } = options
    
    // 背景をクリア
    clearCanvas(this.ctx, this.config.width, this.config.height)
    
    // 背景を描画
    drawBackground(this.ctx, this.config, BACKGROUND_COLORS.GAME_BOARD)
    
    // グリッドを描画
    if (showGrid) {
      drawGrid(this.ctx, this.config, BACKGROUND_COLORS.GRID_LINE, 1)
    }
    
    // ボードのセルを描画
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cellType = board[row][col]
        
        if (cellType !== 'EMPTY') {
          const color = TETROMINO_COLORS[cellType]
          const isHighlighted = highlightLines.includes(row)
          
          if (showShadow && !isHighlighted) {
            drawCellWithShadow(this.ctx, row, col, color, this.config.cellSize)
          } else {
            fillCell(this.ctx, row, col, color, this.config.cellSize)
            
            // ハイライト効果
            if (isHighlighted) {
              this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
              this.ctx.fillRect(
                col * this.config.cellSize,
                row * this.config.cellSize,
                this.config.cellSize,
                this.config.cellSize
              )
            }
          }
        }
      }
    }
  }

  // テトロミノを描画
  renderTetromino(tetromino: TetrominoData, options: RenderOptions = {}): void {
    const { showShadow = true, opacity = 1 } = options
    const { type, shape, position } = tetromino
    const color = TETROMINO_COLORS[type]
    
    // 透明度を設定
    if (opacity < 1) {
      this.ctx.globalAlpha = opacity
    }
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const boardRow = position.row + row
          const boardCol = position.col + col
          
          // 画面内にある場合のみ描画
          if (boardRow >= 0 && boardRow < this.config.gridHeight &&
              boardCol >= 0 && boardCol < this.config.gridWidth) {
            
            if (showShadow && opacity === 1) {
              drawCellWithShadow(this.ctx, boardRow, boardCol, color, this.config.cellSize)
            } else {
              fillCell(this.ctx, boardRow, boardCol, color, this.config.cellSize)
            }
          }
        }
      }
    }
    
    // 透明度をリセット
    if (opacity < 1) {
      this.ctx.globalAlpha = 1
    }
  }

  // ゴーストピース（影）を描画
  renderGhost(tetromino: TetrominoData, ghostPosition: CellPosition): void {
    const ghostTetromino: TetrominoData = {
      ...tetromino,
      position: ghostPosition
    }
    
    this.renderTetromino(ghostTetromino, { 
      showShadow: false, 
      opacity: 0.3 
    })
  }

  // 次のピース用の小さなキャンバス描画
  renderNext(tetromino: TetrominoData): void {
    const config = SIDE_CANVAS_CONFIG
    
    // 背景をクリア
    clearCanvas(this.ctx, config.width, config.height)
    drawBackground(this.ctx, config, BACKGROUND_COLORS.SIDE_PANEL)
    
    const { type, shape } = tetromino
    const color = TETROMINO_COLORS[type]
    
    // ピースを中央に配置
    const shapeHeight = shape.length
    const shapeWidth = shape[0]?.length || 0
    const offsetRow = Math.floor((config.gridHeight - shapeHeight) / 2)
    const offsetCol = Math.floor((config.gridWidth - shapeWidth) / 2)
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const drawRow = offsetRow + row
          const drawCol = offsetCol + col
          drawCellWithShadow(this.ctx, drawRow, drawCol, color, config.cellSize)
        }
      }
    }
  }

  // スコア表示用テキスト描画
  renderText(
    text: string, 
    x: number, 
    y: number, 
    options: {
      font?: string
      color?: string
      align?: CanvasTextAlign
      baseline?: CanvasTextBaseline
    } = {}
  ): void {
    const {
      font = '16px Arial',
      color = '#ffffff',
      align = 'left',
      baseline = 'top'
    } = options
    
    this.ctx.font = font
    this.ctx.fillStyle = color
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline
    this.ctx.fillText(text, x, y)
  }

  // ライン消去アニメーション
  renderLineClearAnimation(
    lines: number[], 
    progress: number, 
    board: GameBoard
  ): void {
    // 通常のボードを描画
    this.renderBoard(board, { highlightLines: [] })
    
    // 消去されるラインを特別に描画
    const alpha = 1 - progress
    const scaleY = 1 - progress * 0.5
    
    this.ctx.globalAlpha = alpha
    
    for (const lineIndex of lines) {
      const y = lineIndex * this.config.cellSize
      const centerY = y + this.config.cellSize / 2
      
      this.ctx.save()
      this.ctx.translate(0, centerY)
      this.ctx.scale(1, scaleY)
      this.ctx.translate(0, -centerY)
      
      // ライン全体を白くハイライト
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      this.ctx.fillRect(0, y, this.config.width, this.config.cellSize)
      
      this.ctx.restore()
    }
    
    this.ctx.globalAlpha = 1
  }

  // レベルアップエフェクト
  renderLevelUpEffect(progress: number): void {
    const alpha = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5
    
    this.ctx.globalAlpha = alpha * 0.3
    this.ctx.fillStyle = '#00ff00'
    this.ctx.fillRect(0, 0, this.config.width, this.config.height)
    this.ctx.globalAlpha = 1
    
    // レベルアップテキスト
    const textAlpha = 1 - Math.abs(progress - 0.5) * 2
    this.ctx.globalAlpha = textAlpha
    this.renderText('LEVEL UP!', this.config.width / 2, this.config.height / 2, {
      font: 'bold 24px Arial',
      color: '#00ff00',
      align: 'center',
      baseline: 'middle'
    })
    this.ctx.globalAlpha = 1
  }

  // ゲームオーバーエフェクト
  renderGameOverEffect(progress: number): void {
    // 画面を徐々に暗くする
    this.ctx.globalAlpha = progress * 0.7
    this.ctx.fillStyle = '#000000'
    this.ctx.fillRect(0, 0, this.config.width, this.config.height)
    this.ctx.globalAlpha = 1
    
    // GAME OVERテキスト
    if (progress > 0.5) {
      const textProgress = (progress - 0.5) * 2
      this.ctx.globalAlpha = textProgress
      this.renderText('GAME OVER', this.config.width / 2, this.config.height / 2, {
        font: 'bold 28px Arial',
        color: '#ff0000',
        align: 'center',
        baseline: 'middle'
      })
      this.ctx.globalAlpha = 1
    }
  }

  // パフォーマンス測定
  startPerformanceMonitoring(): void {
    let frameCount = 0
    let lastTime = performance.now()
    
    const monitor = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        console.log(`Canvas FPS: ${frameCount}`)
        frameCount = 0
        lastTime = currentTime
      }
      
      this.animationFrame = requestAnimationFrame(monitor)
    }
    
    monitor()
  }

  stopPerformanceMonitoring(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  // キャンバスのクリア
  clear(): void {
    clearCanvas(this.ctx, this.config.width, this.config.height)
  }

  // 設定を更新
  updateConfig(newConfig: Partial<CanvasConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // 描画コンテキストを取得
  getContext(): CanvasRenderingContext2D {
    return this.ctx
  }

  // 設定を取得
  getConfig(): CanvasConfig {
    return { ...this.config }
  }
}