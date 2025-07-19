'use client';

import React, { useState, useEffect } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { MAIN_CANVAS_CONFIG, SIDE_CANVAS_CONFIG } from '@/lib/canvas/utils';
import { TETROMINO_COLORS, type TetrominoType } from '@/lib/canvas/colors';
import { GameBoard, TetrominoData } from '@/lib/canvas/renderer';

// デモ用のテトロミノデータ
const DEMO_TETROMINOS: Record<TetrominoType, boolean[][]> = {
  I: [
    [false, false, false, false],
    [true, true, true, true],
    [false, false, false, false],
    [false, false, false, false]
  ],
  O: [
    [true, true],
    [true, true]
  ],
  T: [
    [false, true, false],
    [true, true, true],
    [false, false, false]
  ],
  S: [
    [false, true, true],
    [true, true, false],
    [false, false, false]
  ],
  Z: [
    [true, true, false],
    [false, true, true],
    [false, false, false]
  ],
  J: [
    [true, false, false],
    [true, true, true],
    [false, false, false]
  ],
  L: [
    [false, false, true],
    [true, true, true],
    [false, false, false]
  ],
  EMPTY: [[]],
  GHOST: [[]]
};

// デモ用のボード作成
function createDemoBoard(): GameBoard {
  const board: GameBoard = Array(20).fill(null).map(() => 
    Array(10).fill('EMPTY' as TetrominoType | 'EMPTY')
  );
  
  // 下部にいくつかのブロックを配置
  for (let row = 17; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (Math.random() > 0.3) {
        const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        board[row][col] = types[Math.floor(Math.random() * types.length)];
      }
    }
  }
  
  return board;
}

function createRandomTetromino(): TetrominoData {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  return {
    type,
    shape: DEMO_TETROMINOS[type],
    position: { row: 2, col: 4 },
    rotation: 0
  };
}

export default function CanvasDemoPage() {
  const [demoBoard] = useState<GameBoard>(createDemoBoard());
  const [currentTetromino, setCurrentTetromino] = useState<TetrominoData>(createRandomTetromino());
  const [nextTetromino] = useState<TetrominoData>(createRandomTetromino());
  const [showGrid, setShowGrid] = useState(true);
  const [showShadow, setShowShadow] = useState(true);
  const [showEffects, setShowEffects] = useState(true);

  // メインキャンバス
  const mainCanvas = useCanvas({
    config: MAIN_CANVAS_CONFIG,
    enableEffects: showEffects,
    enableAnimations: true,
    onMount: (renderer) => {
      console.log('Main canvas mounted:', renderer);
    },
    onError: (error) => {
      console.error('Main canvas error:', error);
    }
  });

  // サイドキャンバス
  const sideCanvas = useCanvas({
    config: SIDE_CANVAS_CONFIG,
    enableEffects: false,
    enableAnimations: false,
    onMount: (renderer) => {
      console.log('Side canvas mounted:', renderer);
    },
    onError: (error) => {
      console.error('Side canvas error:', error);
    }
  });

  // 描画関数
  const renderDemo = () => {
    if (!mainCanvas.isReady || !sideCanvas.isReady) return;

    // メインキャンバスの描画
    mainCanvas.clear();
    mainCanvas.renderBoard(demoBoard, { 
      showGrid, 
      showShadow,
      highlightLines: [] 
    });
    
    // 現在のテトロミノを描画
    mainCanvas.renderTetromino(currentTetromino, { 
      showShadow, 
      opacity: 1 
    });

    // ゴーストピースを描画
    const ghostPosition = { row: currentTetromino.position.row + 5, col: currentTetromino.position.col };
    mainCanvas.renderGhost(currentTetromino, ghostPosition);

    // サイドキャンバスの描画
    sideCanvas.clear();
    sideCanvas.renderNext(nextTetromino);
  };

  // 定期的な描画更新
  useEffect(() => {
    const intervalId = setInterval(() => {
      renderDemo();
    }, 100);

    return () => clearInterval(intervalId);
  }, [mainCanvas.isReady, sideCanvas.isReady, showGrid, showShadow, currentTetromino]);

  // テトロミノ変更
  const changeTetromino = () => {
    setCurrentTetromino(createRandomTetromino());
  };

  // エフェクトテスト関数
  const testExplosion = () => {
    const x = Math.random() * MAIN_CANVAS_CONFIG.width;
    const y = Math.random() * MAIN_CANVAS_CONFIG.height;
    mainCanvas.createExplosion(x, y, 1.5);
  };

  const testLineClear = () => {
    const lines = [16, 17, 18, 19];
    mainCanvas.startLineClearAnimation(lines, demoBoard, () => {
      console.log('Line clear animation complete!');
    });
    mainCanvas.createLineClearEffect(500, MAIN_CANVAS_CONFIG.width, lines.length);
  };

  const testLevelUp = () => {
    mainCanvas.startLevelUpAnimation(() => {
      console.log('Level up animation complete!');
    });
  };

  const testGameOver = () => {
    mainCanvas.startGameOverAnimation(() => {
      console.log('Game over animation complete!');
    });
  };

  const testScreenShake = () => {
    mainCanvas.startScreenShake(10, 1000, 30);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Canvas描画・アニメーションシステム デモ</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* キャンバス表示エリア */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">ゲームキャンバス</h2>
              <div className="flex justify-center">
                <div className="inline-block border-2 border-gray-600">
                  <canvas
                    ref={mainCanvas.canvasRef}
                    className="block bg-gray-900"
                    style={{
                      width: MAIN_CANVAS_CONFIG.width,
                      height: MAIN_CANVAS_CONFIG.height,
                    }}
                  />
                </div>
              </div>
              {mainCanvas.error && (
                <div className="mt-4 p-3 bg-red-900 text-red-200 rounded">
                  Error: {mainCanvas.error.message}
                </div>
              )}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">次のピース</h2>
              <div className="flex justify-center">
                <div className="inline-block border-2 border-gray-600">
                  <canvas
                    ref={sideCanvas.canvasRef}
                    className="block bg-gray-800"
                    style={{
                      width: SIDE_CANVAS_CONFIG.width,
                      height: SIDE_CANVAS_CONFIG.height,
                    }}
                  />
                </div>
              </div>
              {sideCanvas.error && (
                <div className="mt-4 p-3 bg-red-900 text-red-200 rounded">
                  Error: {sideCanvas.error.message}
                </div>
              )}
            </div>
          </div>

          {/* コントロールパネル */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">表示設定</h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span>グリッド表示</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showShadow}
                    onChange={(e) => setShowShadow(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span>シャドウ効果</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showEffects}
                    onChange={(e) => setShowEffects(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span>パーティクルエフェクト</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">テトロミノ操作</h2>
              <button
                onClick={changeTetromino}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                テトロミノ変更
              </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">エフェクトテスト</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={testExplosion}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition-colors"
                >
                  爆発エフェクト
                </button>
                
                <button
                  onClick={testLineClear}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                >
                  ライン消去
                </button>
                
                <button
                  onClick={testLevelUp}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                >
                  レベルアップ
                </button>
                
                <button
                  onClick={testGameOver}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  ゲームオーバー
                </button>
                
                <button
                  onClick={testScreenShake}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors col-span-1 sm:col-span-2"
                >
                  画面振動
                </button>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">システム情報</h2>
              <div className="space-y-2 text-sm">
                <div>メインキャンバス: {mainCanvas.isReady ? '✅ 準備完了' : '❌ 初期化中'}</div>
                <div>サイドキャンバス: {sideCanvas.isReady ? '✅ 準備完了' : '❌ 初期化中'}</div>
                <div>アニメーション: {mainCanvas.animationManager ? '✅ 有効' : '❌ 無効'}</div>
                <div>エフェクト: {mainCanvas.effectsManager ? '✅ 有効' : '❌ 無効'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">実装済み機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-400">描画システム</h3>
              <ul className="text-sm space-y-1">
                <li>• ゲームボード描画</li>
                <li>• テトロミノ描画</li>
                <li>• ゴーストピース</li>
                <li>• グリッド表示</li>
                <li>• 影効果</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-400">アニメーション</h3>
              <ul className="text-sm space-y-1">
                <li>• 15種類のイージング関数</li>
                <li>• ライン消去アニメーション</li>
                <li>• レベルアップエフェクト</li>
                <li>• ゲームオーバーエフェクト</li>
                <li>• カスタムアニメーション</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-400">パーティクルシステム</h3>
              <ul className="text-sm space-y-1">
                <li>• 4種類のパーティクル</li>
                <li>• 爆発エフェクト</li>
                <li>• 画面振動</li>
                <li>• 物理シミュレーション</li>
                <li>• パフォーマンス最適化</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}