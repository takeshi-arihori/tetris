import { GameState, GameConfig, GameAction, Tetromino, TetrominoType } from '@/types/tetris'
import { TetrisBoard } from './board'
import { TetrominoFactory } from './tetromino'
import { DEFAULT_GAME_CONFIG } from './constants'

export class TetrisGameEngine {
  private board: TetrisBoard
  private gameState: GameState
  private config: GameConfig
  private gameLoopInterval: number | null = null
  private startTime: number = 0
  private callbacks: {
    onStateChange?: (state: GameState) => void
    onGameOver?: (state: GameState) => void
    onLinesCleared?: (lines: number, state: GameState) => void
  } = {}

  constructor(config: Partial<GameConfig> = {}) {
    this.config = { ...DEFAULT_GAME_CONFIG, ...config }
    this.board = new TetrisBoard(this.config.boardWidth, this.config.boardHeight)
    this.gameState = this.createInitialState()
  }

  private createInitialState(): GameState {
    return {
      board: this.board.getBoard(),
      currentPiece: null,
      nextPiece: TetrominoFactory.getRandomTetromino(),
      score: 0,
      level: 1,
      lines: 0,
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      playtime: 0,
      tetrominoCount: 0,
    }
  }

  setCallbacks(callbacks: {
    onStateChange?: (state: GameState) => void
    onGameOver?: (state: GameState) => void
    onLinesCleared?: (lines: number, state: GameState) => void
  }): void {
    this.callbacks = callbacks
  }

  getState(): GameState {
    return { ...this.gameState }
  }

  startGame(): void {
    this.gameState.isPlaying = true
    this.gameState.isPaused = false
    this.gameState.isGameOver = false
    this.startTime = Date.now()
    this.spawnNewPiece()
    this.startGameLoop()
    this.notifyStateChange()
  }

  pauseGame(): void {
    if (!this.gameState.isPlaying) return
    
    this.gameState.isPaused = !this.gameState.isPaused
    
    if (this.gameState.isPaused) {
      this.stopGameLoop()
    } else {
      this.startGameLoop()
    }
    
    this.notifyStateChange()
  }

  restartGame(): void {
    this.stopGameLoop()
    this.board.reset()
    this.gameState = this.createInitialState()
    this.gameState.nextPiece = TetrominoFactory.getRandomTetromino()
    this.notifyStateChange()
  }

  handleAction(action: GameAction): boolean {
    if (!this.gameState.isPlaying || this.gameState.isPaused || this.gameState.isGameOver) {
      return false
    }

    if (!this.gameState.currentPiece) {
      return false
    }

    let success = false

    switch (action) {
      case GameAction.MOVE_LEFT:
        success = this.movePiece(-1, 0)
        break
      case GameAction.MOVE_RIGHT:
        success = this.movePiece(1, 0)
        break
      case GameAction.MOVE_DOWN:
        success = this.movePiece(0, 1)
        if (success) {
          this.gameState.score += this.config.scoring.softDrop
        }
        break
      case GameAction.ROTATE_CW:
        success = this.rotatePiece(true)
        break
      case GameAction.ROTATE_CCW:
        success = this.rotatePiece(false)
        break
      case GameAction.HARD_DROP:
        success = this.hardDrop()
        break
      case GameAction.SOFT_DROP:
        success = this.movePiece(0, 1)
        if (success) {
          this.gameState.score += this.config.scoring.softDrop
        }
        break
    }

    if (success) {
      this.updateGameState()
      this.notifyStateChange()
    }

    return success
  }

  private movePiece(deltaX: number, deltaY: number): boolean {
    if (!this.gameState.currentPiece) return false

    const newPiece = TetrominoFactory.moveTetromino(this.gameState.currentPiece, deltaX, deltaY)
    
    if (this.board.isValidPosition(newPiece)) {
      this.gameState.currentPiece = newPiece
      return true
    }

    // If moving down failed, lock the piece
    if (deltaY > 0) {
      this.lockPiece()
    }

    return false
  }

  private rotatePiece(clockwise: boolean): boolean {
    if (!this.gameState.currentPiece) return false

    const rotatedPiece = TetrominoFactory.rotateTetromino(this.gameState.currentPiece, clockwise)
    
    if (this.board.isValidPosition(rotatedPiece)) {
      this.gameState.currentPiece = rotatedPiece
      return true
    }

    // TODO: Implement wall kick system
    return false
  }

  private hardDrop(): boolean {
    if (!this.gameState.currentPiece) return false

    const shadowPos = TetrominoFactory.getShadowPosition(this.gameState.currentPiece, this.board.getBoard())
    const dropDistance = shadowPos.y - this.gameState.currentPiece.position.y
    
    this.gameState.currentPiece.position.y = shadowPos.y
    this.gameState.score += dropDistance * this.config.scoring.hardDrop
    
    this.lockPiece()
    return true
  }

  private lockPiece(): void {
    if (!this.gameState.currentPiece) return

    this.board.placeTetromino(this.gameState.currentPiece)
    
    const linesCleared = this.board.clearLines()
    if (linesCleared > 0) {
      this.handleLinesCleared(linesCleared)
    }
    
    this.gameState.currentPiece = null
    this.spawnNewPiece()
    
    if (this.board.isGameOver()) {
      this.endGame()
    }
  }

  private handleLinesCleared(lines: number): void {
    this.gameState.lines += lines
    
    // Calculate score based on lines cleared
    const baseScore = [0, this.config.scoring.single, this.config.scoring.double, this.config.scoring.triple, this.config.scoring.tetris]
    const lineScore = baseScore[lines] || 0
    this.gameState.score += lineScore * this.gameState.level
    
    // Level up every 10 lines
    const newLevel = Math.floor(this.gameState.lines / 10) + 1
    if (newLevel > this.gameState.level) {
      this.gameState.level = newLevel
      this.updateGameSpeed()
    }
    
    this.callbacks.onLinesCleared?.(lines, this.gameState)
  }

  private spawnNewPiece(): void {
    if (!this.gameState.nextPiece) return

    const spawnPosition = TetrominoFactory.getSpawnPosition(this.config.boardWidth)
    this.gameState.currentPiece = TetrominoFactory.createTetromino(this.gameState.nextPiece, spawnPosition)
    this.gameState.nextPiece = TetrominoFactory.getRandomTetromino()
    this.gameState.tetrominoCount++
  }

  private updateGameState(): void {
    this.gameState.board = this.board.getBoard()
    this.gameState.playtime = Math.floor((Date.now() - this.startTime) / 1000)
  }

  private startGameLoop(): void {
    if (this.gameLoopInterval) return

    const interval = this.config.dropInterval * Math.pow(this.config.levelSpeedMultiplier, this.gameState.level - 1)
    
    this.gameLoopInterval = window.setInterval(() => {
      if (!this.gameState.isPaused && this.gameState.isPlaying) {
        this.handleAction(GameAction.MOVE_DOWN)
      }
    }, interval)
  }

  private stopGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval)
      this.gameLoopInterval = null
    }
  }

  private updateGameSpeed(): void {
    this.stopGameLoop()
    if (this.gameState.isPlaying && !this.gameState.isPaused) {
      this.startGameLoop()
    }
  }

  private endGame(): void {
    this.gameState.isGameOver = true
    this.gameState.isPlaying = false
    this.stopGameLoop()
    this.updateGameState()
    this.callbacks.onGameOver?.(this.gameState)
  }

  private notifyStateChange(): void {
    this.callbacks.onStateChange?.(this.gameState)
  }

  destroy(): void {
    this.stopGameLoop()
  }
}