import { Tetromino, TetrominoType, Position } from '@/types/tetris'
import { TETROMINO_SHAPES, TETROMINO_TYPES } from './constants'

export class TetrominoFactory {
  private static bagIndex = 0
  private static currentBag: TetrominoType[] = []

  static createTetromino(type: TetrominoType, position: Position = { x: 0, y: 0 }): Tetromino {
    const shapes = TETROMINO_SHAPES[type]
    if (!shapes || shapes.length === 0) {
      throw new Error(`Invalid tetromino type: ${type}`)
    }

    return {
      type,
      shape: shapes[0], // Start with first rotation
      position,
      rotation: 0,
    }
  }

  static getRandomTetromino(): TetrominoType {
    // 7-bag system implementation
    if (this.currentBag.length === 0) {
      this.currentBag = [...TETROMINO_TYPES]
      this.shuffleBag()
    }

    const type = this.currentBag.pop()!
    return type
  }

  private static shuffleBag(): void {
    for (let i = this.currentBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.currentBag[i], this.currentBag[j]] = [this.currentBag[j], this.currentBag[i]]
    }
  }

  static rotateTetromino(tetromino: Tetromino, clockwise: boolean = true): Tetromino {
    const shapes = TETROMINO_SHAPES[tetromino.type]
    if (!shapes || shapes.length === 1) {
      // O piece doesn't rotate
      return tetromino
    }

    const newRotation = clockwise 
      ? (tetromino.rotation + 1) % shapes.length
      : (tetromino.rotation - 1 + shapes.length) % shapes.length

    return {
      ...tetromino,
      shape: shapes[newRotation],
      rotation: newRotation,
    }
  }

  static moveTetromino(tetromino: Tetromino, deltaX: number, deltaY: number): Tetromino {
    return {
      ...tetromino,
      position: {
        x: tetromino.position.x + deltaX,
        y: tetromino.position.y + deltaY,
      },
    }
  }

  static getTetrominoBlocks(tetromino: Tetromino): Position[] {
    const blocks: Position[] = []
    const shape = tetromino.shape

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          blocks.push({
            x: tetromino.position.x + x,
            y: tetromino.position.y + y,
          })
        }
      }
    }

    return blocks
  }

  static getSpawnPosition(boardWidth: number): Position {
    return {
      x: Math.floor(boardWidth / 2) - 2,
      y: -1,
    }
  }

  static getShadowPosition(tetromino: Tetromino, board: number[][]): Position {
    let shadowY = tetromino.position.y
    const testTetromino = { ...tetromino }

    while (true) {
      testTetromino.position.y = shadowY + 1
      if (!this.isValidPosition(testTetromino, board)) {
        break
      }
      shadowY++
    }

    return { x: tetromino.position.x, y: shadowY }
  }

  static isValidPosition(tetromino: Tetromino, board: number[][]): boolean {
    const blocks = this.getTetrominoBlocks(tetromino)
    
    for (const block of blocks) {
      // Check boundaries
      if (block.x < 0 || block.x >= board[0].length || block.y >= board.length) {
        return false
      }

      // Allow pieces to be above the board during spawn
      if (block.y < 0) {
        continue
      }

      // Check collision with existing blocks
      if (board[block.y][block.x] !== 0) {
        return false
      }
    }

    return true
  }
}