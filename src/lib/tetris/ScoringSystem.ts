import { GameState } from '@/types/tetris';

export interface ScoreCalculation {
  linePoints: number;
  levelBonus: number;
  speedBonus: number;
  totalPoints: number;
}

export interface ScoringEvents {
  scoreUpdate: (score: number) => void;
  levelUp: (newLevel: number, oldLevel: number) => void;
  linesClear: (lines: number, points: number) => void;
  bonus: (type: string, points: number) => void;
}

/**
 * スコアリングシステム - SOLID原則の単一責任原則に基づいた設計
 * スコア計算とレベル管理のみを担当
 */
export class ScoringSystem {
  private events: Partial<ScoringEvents> = {};
  private softDropPoints: number = 0;
  private hardDropPoints: number = 0;

  // スコアテーブル (テトリス標準)
  private readonly SCORE_TABLE: Record<number, number> = {
    1: 40,    // Single
    2: 100,   // Double
    3: 300,   // Triple
    4: 1200,  // Tetris
  };

  constructor() {}

  /**
   * イベントリスナーを登録
   */
  on<K extends keyof ScoringEvents>(event: K, callback: ScoringEvents[K]): void {
    this.events[event] = callback;
  }

  /**
   * ライン消去スコアを計算
   */
  calculateLineScore(linesCleared: number, level: number): ScoreCalculation {
    if (linesCleared < 1 || linesCleared > 4) {
      return {
        linePoints: 0,
        levelBonus: 0,
        speedBonus: 0,
        totalPoints: 0,
      };
    }

    const basePoints = this.SCORE_TABLE[linesCleared] || 0;
    const levelBonus = Math.floor(basePoints * (level * 0.1));
    const speedBonus = this.calculateSpeedBonus(linesCleared, level);
    const totalPoints = basePoints + levelBonus + speedBonus;

    return {
      linePoints: basePoints,
      levelBonus,
      speedBonus,
      totalPoints,
    };
  }

  /**
   * ゲーム状態にライン消去スコアを適用
   */
  applyLineScore(gameState: GameState, linesCleared: number): GameState {
    const calculation = this.calculateLineScore(linesCleared, gameState.level);
    
    const newState: GameState = {
      ...gameState,
      score: gameState.score + calculation.totalPoints,
      totalLinesCleared: gameState.totalLinesCleared + linesCleared,
    };

    // レベルアップチェック
    const newLevel = this.calculateLevel(newState.totalLinesCleared);
    if (newLevel > gameState.level) {
      newState.level = newLevel;
      this.events.levelUp?.(newLevel, gameState.level);
    }

    // イベント発火
    this.events.scoreUpdate?.(newState.score);
    this.events.linesClear?.(linesCleared, calculation.totalPoints);

    return newState;
  }

  /**
   * ソフトドロップポイントを追加
   */
  applySoftDropScore(gameState: GameState, cells: number): GameState {
    const points = cells * 1; // 1 point per cell
    this.softDropPoints += points;
    
    return {
      ...gameState,
      score: gameState.score + points,
    };
  }

  /**
   * ハードドロップポイントを追加
   */
  applyHardDropScore(gameState: GameState, cells: number): GameState {
    const points = cells * 2; // 2 points per cell
    this.hardDropPoints += points;
    
    this.events.bonus?.('hard_drop', points);
    
    return {
      ...gameState,
      score: gameState.score + points,
    };
  }

  /**
   * T-Spinボーナスを追加
   */
  applyTSpinBonus(gameState: GameState, linesCleared: number): GameState {
    const bonusMultiplier: Record<number, number> = {
      0: 400,  // T-Spin no lines
      1: 800,  // T-Spin Single
      2: 1200, // T-Spin Double
      3: 1600, // T-Spin Triple
    };

    const bonus = (bonusMultiplier[linesCleared] || 0) * gameState.level;
    
    this.events.bonus?.('t_spin', bonus);
    
    return {
      ...gameState,
      score: gameState.score + bonus,
    };
  }

  /**
   * パーフェクトクリアボーナスを追加
   */
  applyPerfectClearBonus(gameState: GameState): GameState {
    const bonus = 2000 * gameState.level;
    
    this.events.bonus?.('perfect_clear', bonus);
    
    return {
      ...gameState,
      score: gameState.score + bonus,
    };
  }

  /**
   * コンボボーナスを追加
   */
  applyComboBonus(gameState: GameState, comboCount: number): GameState {
    if (comboCount <= 0) return gameState;
    
    const bonusPoints = Math.min(comboCount * 50 * gameState.level, 1000 * gameState.level);
    
    this.events.bonus?.('combo', bonusPoints);
    
    return {
      ...gameState,
      score: gameState.score + bonusPoints,
    };
  }

  /**
   * スピードボーナスを計算
   */
  private calculateSpeedBonus(linesCleared: number, level: number): number {
    if (level < 5) return 0;
    
    const speedMultiplier = Math.floor((level - 4) / 2);
    return linesCleared * 10 * speedMultiplier;
  }

  /**
   * 総ライン数からレベルを計算
   */
  private calculateLevel(totalLines: number): number {
    return Math.floor(totalLines / 10) + 1;
  }

  /**
   * 次のレベルまでに必要なライン数を取得
   */
  getLinesToNextLevel(gameState: GameState): number {
    const linesForCurrentLevel = (gameState.level - 1) * 10;
    const linesForNextLevel = gameState.level * 10;
    return linesForNextLevel - gameState.totalLinesCleared;
  }

  /**
   * スコアの内訳を取得
   */
  getScoreBreakdown() {
    return {
      softDropPoints: this.softDropPoints,
      hardDropPoints: this.hardDropPoints,
      linePoints: 0, // 計算が複雑なため、必要に応じて実装
    };
  }

  /**
   * システムをリセット
   */
  reset(): void {
    this.softDropPoints = 0;
    this.hardDropPoints = 0;
  }

  /**
   * 理論上の最大スコアを計算
   */
  static calculateMaxScore(level: number, lines: number): number {
    const tetrises = Math.floor(lines / 4);
    const remainingLines = lines % 4;
    
    let maxScore = 0;
    maxScore += tetrises * 1200 * level; // All Tetrises
    
    if (remainingLines > 0) {
      const remainingScore = [0, 40, 100, 300][remainingLines] || 0;
      maxScore += remainingScore * level;
    }
    
    return maxScore;
  }
}