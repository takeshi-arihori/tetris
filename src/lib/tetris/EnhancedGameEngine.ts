import { GameState, GameConfig, Tetromino } from '@/types/tetris';
import { TetrisGameEngine } from './gameEngine';
import { CollisionSystem } from './CollisionSystem';
import { ScoringSystem } from './ScoringSystem';
import { LineClearSystem } from './LineClearSystem';

/**
 * 強化されたゲームエンジン - SOLID原則の統合
 * 既存のTetrisGameEngineにSOLID原則に基づくシステムを統合
 */
export class EnhancedTetrisGameEngine extends TetrisGameEngine {
  private collisionSystem: CollisionSystem;
  private scoringSystem: ScoringSystem;
  private lineClearSystem: LineClearSystem;

  constructor(config: Partial<GameConfig> = {}) {
    super(config);
    
    // システムを初期化
    this.collisionSystem = new CollisionSystem(this['board']); // privateプロパティにアクセス
    this.scoringSystem = new ScoringSystem();
    this.lineClearSystem = new LineClearSystem(this['board']);

    this.setupSystemEvents();
  }

  /**
   * システム間のイベント連携を設定
   */
  private setupSystemEvents(): void {
    // スコアリングシステムイベント
    this.scoringSystem.on('scoreUpdate', (score) => {
      this.callbacks.onStateChange?.(this.gameState);
    });

    this.scoringSystem.on('levelUp', (newLevel, oldLevel) => {
      console.log(`Level up! ${oldLevel} -> ${newLevel}`);
    });

    this.scoringSystem.on('bonus', (type, points) => {
      console.log(`Bonus: ${type} (+${points} points)`);
    });

    // ライン消去システムイベント
    this.lineClearSystem.on('linesCleared', (result) => {
      // スコアリングシステムにライン消去を通知
      this.gameState = this.scoringSystem.applyLineScore(this.gameState, result.linesCleared);
      
      // コンボボーナス適用
      if (result.isCombo) {
        this.gameState = this.scoringSystem.applyComboBonus(this.gameState, this.lineClearSystem.getCurrentCombo());
      }

      // T-Spinボーナス適用
      if (result.isTSpin) {
        this.gameState = this.scoringSystem.applyTSpinBonus(this.gameState, result.linesCleared);
      }

      // パーフェクトクリアボーナス適用
      if (result.isPerfectClear) {
        this.gameState = this.scoringSystem.applyPerfectClearBonus(this.gameState);
      }

      this.callbacks.onLinesCleared?.(result.linesCleared, this.gameState);
    });

    this.lineClearSystem.on('perfectClear', () => {
      console.log('Perfect Clear achieved!');
    });

    this.lineClearSystem.on('combo', (count) => {
      console.log(`Combo x${count}`);
    });
  }

  /**
   * 強化された移動処理
   */
  moveTetrominoEnhanced(direction: 'left' | 'right' | 'down'): boolean {
    const currentTetromino = this.gameState.currentTetromino;
    if (!currentTetromino) return false;

    const dx = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
    const dy = direction === 'down' ? 1 : 0;

    const collisionResult = this.collisionSystem.checkMove(currentTetromino, dx, dy);
    
    if (collisionResult.canMove) {
      // 移動実行
      const newTetromino: Tetromino = {
        ...currentTetromino,
        position: {
          x: currentTetromino.position.x + dx,
          y: currentTetromino.position.y + dy,
        },
      };

      this.gameState = {
        ...this.gameState,
        currentTetromino: newTetromino,
      };

      // ソフトドロップの場合はポイント追加
      if (direction === 'down') {
        this.gameState = this.scoringSystem.applySoftDropScore(this.gameState, 1);
      }

      return true;
    }

    return false;
  }

  /**
   * 強化された回転処理（Wall Kick対応）
   */
  rotateTetrominoEnhanced(): boolean {
    const currentTetromino = this.gameState.currentTetromino;
    if (!currentTetromino) return false;

    // 通常の回転をチェック
    const collisionResult = this.collisionSystem.checkRotation(currentTetromino);
    
    if (collisionResult.canRotate) {
      // 通常回転実行
      return this.rotateTetromino();
    }

    // Wall Kickを試行
    const wallKickResult = this.collisionSystem.tryWallKick(currentTetromino);
    
    if (wallKickResult.success) {
      // Wall Kick回転実行
      const rotatedShape = this.rotateShape(currentTetromino.shape);
      const newTetromino: Tetromino = {
        ...currentTetromino,
        shape: rotatedShape,
        position: {
          x: currentTetromino.position.x + wallKickResult.offset.x,
          y: currentTetromino.position.y + wallKickResult.offset.y,
        },
      };

      this.gameState = {
        ...this.gameState,
        currentTetromino: newTetromino,
      };

      return true;
    }

    return false;
  }

  /**
   * ハードドロップ処理
   */
  hardDropTetromino(): boolean {
    const currentTetromino = this.gameState.currentTetromino;
    if (!currentTetromino) return false;

    const dropPosition = this.collisionSystem.findDropPosition(currentTetromino);
    const dropDistance = dropPosition.y - currentTetromino.position.y;

    if (dropDistance > 0) {
      // ハードドロップ実行
      const newTetromino: Tetromino = {
        ...currentTetromino,
        position: dropPosition,
      };

      this.gameState = {
        ...this.gameState,
        currentTetromino: newTetromino,
      };

      // ハードドロップポイント追加
      this.gameState = this.scoringSystem.applyHardDropScore(this.gameState, dropDistance);

      // テトロミノを固定
      this.lockTetromino();
      return true;
    }

    return false;
  }

  /**
   * ゴーストピースの位置を取得
   */
  getGhostPosition(): { x: number; y: number } | null {
    const currentTetromino = this.gameState.currentTetromino;
    if (!currentTetromino) return null;

    return this.collisionSystem.getGhostPosition(currentTetromino);
  }

  /**
   * 強化されたテトロミノ固定処理
   */
  protected lockTetromino(): void {
    super.lockTetromino();
    
    // ライン消去チェック
    const clearResult = this.lineClearSystem.checkAndClearLines();
    
    // 新しいテトロミノ生成前にゲームオーバーチェック
    if (this.gameState.currentTetromino && 
        this.collisionSystem.isGameOver(this.gameState.currentTetromino)) {
      this.gameState = { ...this.gameState, isGameOver: true };
      this.callbacks.onGameOver?.(this.gameState);
    }
  }

  /**
   * フィールド分析情報を取得
   */
  getFieldAnalysis() {
    return this.lineClearSystem.getFieldAnalysis();
  }

  /**
   * スコア詳細を取得
   */
  getScoreBreakdown() {
    return this.scoringSystem.getScoreBreakdown();
  }

  /**
   * システムをリセット
   */
  reset(): void {
    super.reset();
    this.scoringSystem.reset();
    this.lineClearSystem.reset();
  }

  /**
   * 形状回転ヘルパー（privateメソッドにアクセスするため）
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
}