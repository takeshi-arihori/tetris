import { TetrisBoard } from './board';

export interface LineClearResult {
  linesCleared: number;
  clearedLineNumbers: number[];
  isCombo: boolean;
  isTetris: boolean;
  isPerfectClear: boolean;
  isTSpin: boolean;
}

export interface LineClearEvents {
  linesCleared: (result: LineClearResult) => void;
  lineClearing: (lines: number[]) => void;
  perfectClear: () => void;
  combo: (count: number) => void;
  tSpin: (lines: number) => void;
}

/**
 * ライン消去システム - SOLID原則の単一責任原則に基づいた設計
 * ライン消去の判定と実行のみを担当
 */
export class LineClearSystem {
  private events: Partial<LineClearEvents> = {};
  private comboCount: number = 0;
  private lastClearTime: number = 0;

  constructor(private board: TetrisBoard) {}

  /**
   * イベントリスナーを登録
   */
  on<K extends keyof LineClearEvents>(event: K, callback: LineClearEvents[K]): void {
    this.events[event] = callback;
  }

  /**
   * ライン消去をチェックして実行
   */
  checkAndClearLines(): LineClearResult {
    const fullLines = this.findFullLines();
    
    if (fullLines.length === 0) {
      this.comboCount = 0;
      return {
        linesCleared: 0,
        clearedLineNumbers: [],
        isCombo: false,
        isTetris: false,
        isPerfectClear: false,
        isTSpin: false,
      };
    }

    return this.clearLines(fullLines);
  }

  /**
   * T-Spin判定付きでライン消去をチェック
   */
  checkAndClearLinesWithTSpin(lastMove: { type: 'rotate' | 'move'; successful: boolean }): LineClearResult {
    const result = this.checkAndClearLines();
    
    // T-Spin判定（簡易版）
    if (lastMove.type === 'rotate' && lastMove.successful && result.linesCleared > 0) {
      result.isTSpin = this.detectTSpin();
      if (result.isTSpin) {
        this.events.tSpin?.(result.linesCleared);
      }
    }
    
    return result;
  }

  /**
   * 満杯ラインを検索
   */
  private findFullLines(): number[] {
    const fullLines: number[] = [];
    const height = this.board.getHeight();
    const width = this.board.getWidth();
    
    for (let y = 0; y < height; y++) {
      let isFullLine = true;
      
      for (let x = 0; x < width; x++) {
        if (this.board.getCell(x, y) === 0) {
          isFullLine = false;
          break;
        }
      }
      
      if (isFullLine) {
        fullLines.push(y);
      }
    }
    
    return fullLines;
  }

  /**
   * ラインを消去して結果を返す
   */
  private clearLines(lineNumbers: number[]): LineClearResult {
    // イベント発火: ライン消去開始
    this.events.lineClearing?.(lineNumbers);

    // ラインを下から上に向かって消去
    const sortedLines = [...lineNumbers].sort((a, b) => b - a);
    
    for (const lineY of sortedLines) {
      this.board.clearLine(lineY);
    }

    // コンボカウント更新
    this.comboCount++;
    const isCombo = this.comboCount > 1;
    
    if (isCombo) {
      this.events.combo?.(this.comboCount);
    }

    // 特殊条件チェック
    const isTetris = lineNumbers.length === 4;
    const isPerfectClear = this.isPerfectClearAchieved();
    
    if (isPerfectClear) {
      this.events.perfectClear?.();
    }

    const result: LineClearResult = {
      linesCleared: lineNumbers.length,
      clearedLineNumbers: lineNumbers,
      isCombo,
      isTetris,
      isPerfectClear,
      isTSpin: false, // T-Spin判定は別メソッドで実装
    };

    this.lastClearTime = Date.now();
    this.events.linesCleared?.(result);
    
    return result;
  }

  /**
   * パーフェクトクリア判定
   */
  private isPerfectClearAchieved(): boolean {
    const height = this.board.getHeight();
    const width = this.board.getWidth();
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.board.getCell(x, y) !== 0) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * T-Spin判定（簡易版）
   * 実際のT-Spinは複雑な判定が必要ですが、ここでは基本的な実装
   */
  private detectTSpin(): boolean {
    // TODO: より正確なT-Spin判定の実装
    // 現在は簡易版として常にfalseを返す
    return false;
  }

  /**
   * 消去可能ラインをプレビュー
   */
  previewLinesToClear(): number[] {
    return this.findFullLines();
  }

  /**
   * 各ラインの完成度を取得
   */
  getLineCompletionStatus(): Array<{ lineNumber: number; completion: number }> {
    const status: Array<{ lineNumber: number; completion: number }> = [];
    const height = this.board.getHeight();
    const width = this.board.getWidth();
    
    for (let y = 0; y < height; y++) {
      let filledBlocks = 0;
      
      for (let x = 0; x < width; x++) {
        if (this.board.getCell(x, y) !== 0) {
          filledBlocks++;
        }
      }
      
      const completion = filledBlocks / width;
      status.push({ lineNumber: y, completion });
    }
    
    return status;
  }

  /**
   * 最も完成に近いラインを取得
   */
  getMostCompleteLines(count: number = 3): number[] {
    const completionStatus = this.getLineCompletionStatus();
    
    return completionStatus
      .filter(status => status.completion < 1.0 && status.completion > 0)
      .sort((a, b) => b.completion - a.completion)
      .slice(0, count)
      .map(status => status.lineNumber);
  }

  /**
   * ホール（穴）の数を計算
   */
  getTotalHoles(): number {
    let totalHoles = 0;
    const height = this.board.getHeight();
    const width = this.board.getWidth();
    
    for (let x = 0; x < width; x++) {
      let foundBlock = false;
      
      for (let y = 0; y < height; y++) {
        if (this.board.getCell(x, y) !== 0) {
          foundBlock = true;
        } else if (foundBlock) {
          // ブロックの下にある空セルはホール
          totalHoles++;
        }
      }
    }
    
    return totalHoles;
  }

  /**
   * フィールドの凹凸度を計算
   */
  getBumpiness(): number {
    const columnHeights: number[] = [];
    const height = this.board.getHeight();
    const width = this.board.getWidth();
    
    for (let x = 0; x < width; x++) {
      let columnHeight = 0;
      
      for (let y = 0; y < height; y++) {
        if (this.board.getCell(x, y) !== 0) {
          columnHeight = height - y;
          break;
        }
      }
      
      columnHeights.push(columnHeight);
    }
    
    let bumpiness = 0;
    for (let i = 0; i < columnHeights.length - 1; i++) {
      bumpiness += Math.abs(columnHeights[i] - columnHeights[i + 1]);
    }
    
    return bumpiness;
  }

  /**
   * フィールド分析結果を取得
   */
  getFieldAnalysis() {
    const fullLines = this.findFullLines();
    const completionStatus = this.getLineCompletionStatus();
    const totalHoles = this.getTotalHoles();
    const bumpiness = this.getBumpiness();
    const almostFullLines = completionStatus.filter(s => s.completion >= 0.8).length;
    
    return {
      fullLines: fullLines.length,
      almostFullLines,
      totalHoles,
      bumpiness,
      comboCount: this.comboCount,
      timeSinceLastClear: Date.now() - this.lastClearTime,
    };
  }

  /**
   * コンボカウントをリセット
   */
  resetCombo(): void {
    this.comboCount = 0;
  }

  /**
   * システムをリセット
   */
  reset(): void {
    this.comboCount = 0;
    this.lastClearTime = 0;
  }

  /**
   * 現在のコンボカウントを取得
   */
  getCurrentCombo(): number {
    return this.comboCount;
  }
}