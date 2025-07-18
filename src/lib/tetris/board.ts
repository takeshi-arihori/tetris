import { Tetromino, Position } from '@/types/tetris'
import { TetrominoFactory } from './tetromino'

export class TetrisBoard {
  private board: number[][]
  private width: number
  private height: number

  constructor(width: number = 10, height: number = 20) {
    this.width = width
    this.height = height
    this.board = this.createEmptyBoard()
  }

  private createEmptyBoard(): number[][] {
    return Array(this.height).fill(null).map(() => Array(this.width).fill(0))
  }

  getBoard(): number[][] {
    return this.board.map(row => [...row])
  }

  getWidth(): number {
    return this.width
  }

  getHeight(): number {
    return this.height
  }

  isValidPosition(tetromino: Tetromino): boolean {
    return TetrominoFactory.isValidPosition(tetromino, this.board)
  }

  placeTetromino(tetromino: Tetromino): void {
    const blocks = TetrominoFactory.getTetrominoBlocks(tetromino)
    
    for (const block of blocks) {
      if (block.y >= 0 && block.y < this.height && block.x >= 0 && block.x < this.width) {
        this.board[block.y][block.x] = this.getTetrominoValue(tetromino.type)
      }
    }
  }

  private getTetrominoValue(type: string): number {
    const typeMap: Record<string, number> = {
      'I': 1, 'O': 2, 'T': 3, 'S': 4, 'Z': 5, 'J': 6, 'L': 7
    }
    return typeMap[type] || 1
  }

  clearLines(): number {
    let linesCleared = 0
    
    for (let y = this.height - 1; y >= 0; y--) {
      if (this.isLineFull(y)) {
        this.clearLine(y)
        linesCleared++
        y++ // Check the same row again since rows shifted down
      }
    }
    
    return linesCleared
  }

  private isLineFull(y: number): boolean {
    return this.board[y].every(cell => cell !== 0)
  }

  private clearLine(y: number): void {
    // Remove the full line
    this.board.splice(y, 1)
    // Add empty line at the top
    this.board.unshift(Array(this.width).fill(0))
  }

  getCompletedLines(): number[] {
    const completedLines: number[] = []
    
    for (let y = 0; y < this.height; y++) {
      if (this.isLineFull(y)) {
        completedLines.push(y)
      }
    }
    
    return completedLines
  }

  isGameOver(): boolean {
    // Check if any blocks are above the board
    for (let x = 0; x < this.width; x++) {
      if (this.board[0][x] !== 0) {
        return true
      }
    }
    return false
  }

  reset(): void {
    this.board = this.createEmptyBoard()
  }

  getHighestBlock(): number {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.board[y][x] !== 0) {
          return y
        }
      }
    }
    return this.height
  }

  getBoardWithTetromino(tetromino: Tetromino): number[][] {
    const boardCopy = this.getBoard()
    const blocks = TetrominoFactory.getTetrominoBlocks(tetromino)
    
    for (const block of blocks) {
      if (block.y >= 0 && block.y < this.height && block.x >= 0 && block.x < this.width) {
        boardCopy[block.y][block.x] = this.getTetrominoValue(tetromino.type)
      }
    }
    
    return boardCopy
  }

  getBoardWithShadow(tetromino: Tetromino): number[][] {
    const boardCopy = this.getBoard()
    const shadowPos = TetrominoFactory.getShadowPosition(tetromino, this.board)
    
    const shadowTetromino = {
      ...tetromino,
      position: shadowPos,
    }
    
    const blocks = TetrominoFactory.getTetrominoBlocks(shadowTetromino)
    
    for (const block of blocks) {
      if (block.y >= 0 && block.y < this.height && block.x >= 0 && block.x < this.width) {
        if (boardCopy[block.y][block.x] === 0) {
          boardCopy[block.y][block.x] = -1 // Shadow marker
        }
      }
    }
    
    return boardCopy
  }
}