import { Tetromino, Position } from '@/types/tetris';
import { TetrisBoard } from './board';

export interface CollisionResult {
  canMove: boolean;
  canRotate: boolean;
  hitBottom: boolean;
  hitSide: boolean;
  hitTetromino: boolean;
}

/**
 * 衝突判定システム - SOLID原則の単一責任原則に基づいた設計
 * テトロミノとフィールドの衝突判定のみを担当
 */
export class CollisionSystem {
  constructor(private board: TetrisBoard) {}

  /**
   * テトロミノの移動可能性をチェック
   */
  checkMove(tetromino: Tetromino, dx: number, dy: number): CollisionResult {
    const result: CollisionResult = {
      canMove: true,
      canRotate: true,
      hitBottom: false,
      hitSide: false,
      hitTetromino: false,
    };

    const newPosition: Position = {
      x: tetromino.position.x + dx,
      y: tetromino.position.y + dy,
    };

    return this.checkTetrominoAt(tetromino, newPosition);
  }

  /**
   * テトロミノの回転可能性をチェック
   */
  checkRotation(tetromino: Tetromino): CollisionResult {
    const rotatedShape = this.rotateShape(tetromino.shape);
    const testTetromino: Tetromino = {
      ...tetromino,
      shape: rotatedShape,
    };

    return this.checkTetrominoAt(testTetromino, tetromino.position);
  }

  /**
   * 指定位置でのテトロミノの配置可能性をチェック
   */
  private checkTetrominoAt(tetromino: Tetromino, position: Position): CollisionResult {
    const result: CollisionResult = {
      canMove: true,
      canRotate: true,
      hitBottom: false,
      hitSide: false,
      hitTetromino: false,
    };

    for (let y = 0; y < tetromino.shape.length; y++) {
      for (let x = 0; x < tetromino.shape[y].length; x++) {
        if (tetromino.shape[y][x] !== 0) {
          const worldX = position.x + x;
          const worldY = position.y + y;

          // 境界チェック
          if (worldX < 0 || worldX >= this.board.getWidth()) {
            result.canMove = false;
            result.canRotate = false;
            result.hitSide = true;
          }

          if (worldY >= this.board.getHeight()) {
            result.canMove = false;
            result.canRotate = false;
            result.hitBottom = true;
          }

          // 既存ブロックとの衝突チェック
          if (worldY >= 0 && this.board.getCell(worldX, worldY) !== 0) {
            result.canMove = false;
            result.canRotate = false;
            result.hitTetromino = true;
          }
        }
      }
    }

    return result;
  }

  /**
   * テトロミノが落下可能な最下点を見つける
   */
  findDropPosition(tetromino: Tetromino): Position {
    let testY = tetromino.position.y;
    
    while (this.checkMove(tetromino, 0, testY - tetromino.position.y + 1).canMove) {
      testY++;
    }

    return { x: tetromino.position.x, y: testY };
  }

  /**
   * ゴーストピースの位置を計算
   */
  getGhostPosition(tetromino: Tetromino): Position {
    return this.findDropPosition(tetromino);
  }

  /**
   * Wall Kick システム
   * SRS (Super Rotation System) の簡易実装
   */
  tryWallKick(tetromino: Tetromino): { success: boolean; offset: Position } {
    const kickOffsets: Position[] = [
      { x: 0, y: 0 },   // No kick
      { x: -1, y: 0 },  // Left kick
      { x: 1, y: 0 },   // Right kick
      { x: 0, y: -1 },  // Up kick
      { x: -1, y: -1 }, // Left-up kick
      { x: 1, y: -1 },  // Right-up kick
    ];

    const rotatedShape = this.rotateShape(tetromino.shape);

    for (const offset of kickOffsets) {
      const testPosition: Position = {
        x: tetromino.position.x + offset.x,
        y: tetromino.position.y + offset.y,
      };

      const testTetromino: Tetromino = {
        ...tetromino,
        shape: rotatedShape,
      };

      if (this.checkTetrominoAt(testTetromino, testPosition).canMove) {
        return { success: true, offset };
      }
    }

    return { success: false, offset: { x: 0, y: 0 } };
  }

  /**
   * テトロミノの形状を90度回転
   */
  private rotateShape(shape: number[][]): number[][] {
    const size = shape.length;
    const rotated: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        rotated[x][size - 1 - y] = shape[y][x];
      }
    }

    return rotated;
  }

  /**
   * ゲームオーバー判定
   */
  isGameOver(tetromino: Tetromino): boolean {
    return !this.checkTetrominoAt(tetromino, tetromino.position).canMove;
  }
}