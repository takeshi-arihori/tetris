import { CollisionSystem } from '../CollisionSystem';
import { TetrisBoard } from '../board';
import { Tetromino, TetrominoType } from '@/types/tetris';

describe('CollisionSystem', () => {
  let board: TetrisBoard;
  let collisionSystem: CollisionSystem;

  beforeEach(() => {
    board = new TetrisBoard(10, 20);
    collisionSystem = new CollisionSystem(board);
  });

  describe('checkMove', () => {
    const createITetromino = (): Tetromino => ({
      type: TetrominoType.I,
      shape: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      position: { x: 3, y: 0 },
    });

    it('should allow valid moves', () => {
      const tetromino = createITetromino();
      const result = collisionSystem.checkMove(tetromino, 1, 0);
      
      expect(result.canMove).toBe(true);
      expect(result.hitSide).toBe(false);
      expect(result.hitBottom).toBe(false);
      expect(result.hitTetromino).toBe(false);
    });

    it('should detect left wall collision', () => {
      const tetromino = createITetromino();
      tetromino.position.x = 0;
      const result = collisionSystem.checkMove(tetromino, -1, 0);
      
      expect(result.canMove).toBe(false);
      expect(result.hitSide).toBe(true);
    });

    it('should detect right wall collision', () => {
      const tetromino = createITetromino();
      tetromino.position.x = 6; // I-piece is 4 wide, so 6 + 4 = 10 (board width)
      const result = collisionSystem.checkMove(tetromino, 1, 0);
      
      expect(result.canMove).toBe(false);
      expect(result.hitSide).toBe(true);
    });

    it('should detect bottom collision', () => {
      const tetromino = createITetromino();
      tetromino.position.y = 19; // Bottom of 20-high board
      const result = collisionSystem.checkMove(tetromino, 0, 1);
      
      expect(result.canMove).toBe(false);
      expect(result.hitBottom).toBe(true);
    });

    it('should detect tetromino collision', () => {
      // Place a block on the board
      board.setCell(4, 2, 1);
      
      const tetromino = createITetromino();
      tetromino.position.y = 1;
      const result = collisionSystem.checkMove(tetromino, 0, 1);
      
      expect(result.canMove).toBe(false);
      expect(result.hitTetromino).toBe(true);
    });
  });

  describe('checkRotation', () => {
    const createITetromino = (): Tetromino => ({
      type: TetrominoType.I,
      shape: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      position: { x: 3, y: 0 },
    });

    it('should allow valid rotation', () => {
      const tetromino = createITetromino();
      const result = collisionSystem.checkRotation(tetromino);
      
      expect(result.canRotate).toBe(true);
    });

    it('should prevent rotation near walls', () => {
      const tetromino = createITetromino();
      tetromino.position.x = 9; // Too close to right wall for vertical I-piece
      const result = collisionSystem.checkRotation(tetromino);
      
      expect(result.canRotate).toBe(false);
    });
  });

  describe('findDropPosition', () => {
    it('should find correct drop position on empty board', () => {
      const tetromino: Tetromino = {
        type: TetrominoType.I,
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        position: { x: 3, y: 0 },
      };

      const dropPosition = collisionSystem.findDropPosition(tetromino);
      expect(dropPosition.y).toBe(19); // Should drop to bottom
    });

    it('should find correct drop position with obstacles', () => {
      // Place obstacle
      board.setCell(4, 18, 1);
      
      const tetromino: Tetromino = {
        type: TetrominoType.I,
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        position: { x: 3, y: 0 },
      };

      const dropPosition = collisionSystem.findDropPosition(tetromino);
      expect(dropPosition.y).toBe(17); // Should stop above obstacle
    });
  });

  describe('tryWallKick', () => {
    it('should succeed with basic wall kick', () => {
      const tetromino: Tetromino = {
        type: TetrominoType.I,
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        position: { x: 8, y: 0 }, // Near right wall
      };

      const result = collisionSystem.tryWallKick(tetromino);
      expect(result.success).toBe(true);
      expect(result.offset.x).toBeLessThan(0); // Should kick left
    });

    it('should fail when no kick is possible', () => {
      // Fill area around tetromino to prevent kicks
      for (let x = 7; x <= 9; x++) {
        for (let y = 0; y <= 2; y++) {
          if (x !== 8 || y !== 1) { // Don't block current position
            board.setCell(x, y, 1);
          }
        }
      }

      const tetromino: Tetromino = {
        type: TetrominoType.I,
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        position: { x: 8, y: 1 },
      };

      const result = collisionSystem.tryWallKick(tetromino);
      expect(result.success).toBe(false);
    });
  });

  describe('isGameOver', () => {
    it('should detect game over when tetromino cannot be placed', () => {
      // Fill top row
      for (let x = 0; x < 10; x++) {
        board.setCell(x, 0, 1);
      }

      const tetromino: Tetromino = {
        type: TetrominoType.I,
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        position: { x: 3, y: 0 },
      };

      expect(collisionSystem.isGameOver(tetromino)).toBe(true);
    });

    it('should not detect game over when tetromino can be placed', () => {
      const tetromino: Tetromino = {
        type: TetrominoType.I,
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        position: { x: 3, y: 0 },
      };

      expect(collisionSystem.isGameOver(tetromino)).toBe(false);
    });
  });
});