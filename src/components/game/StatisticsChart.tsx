'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStatistics } from '@/hooks/useStatistics';
import type { ChartDataPoint, GameProgressChart } from '@/types/game-records';

interface StatisticsChartProps {
  className?: string;
  defaultPeriod?: number;
}

export const StatisticsChart: React.FC<StatisticsChartProps> = ({
  className = '',
  defaultPeriod = 30
}) => {
  const { chartData, fetchChartData, loading } = useStatistics(false);
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  const [activeChart, setActiveChart] = useState<keyof GameProgressChart>('score_over_time');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // チャートタイプの定義
  const chartTypes = {
    score_over_time: { label: 'スコア推移', color: '#3B82F6' },
    level_progression: { label: 'レベル推移', color: '#8B5CF6' },
    lines_per_game: { label: 'ライン数推移', color: '#10B981' },
    duration_trends: { label: 'プレイ時間推移', color: '#F59E0B' }
  };

  // 期間オプション
  const periodOptions = [
    { value: 7, label: '7日間' },
    { value: 30, label: '30日間' },
    { value: 90, label: '3ヶ月' },
    { value: 365, label: '1年間' }
  ];

  // データ取得
  useEffect(() => {
    fetchChartData(selectedPeriod);
  }, [selectedPeriod, fetchChartData]);

  // 簡単なチャート描画（Chart.jsの代替）
  useEffect(() => {
    if (!chartData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = chartData[activeChart];
    if (!data || data.length === 0) return;

    // Canvas サイズ設定
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 背景をクリア
    ctx.clearRect(0, 0, width, height);

    // データの最大値・最小値を取得
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const valueRange = maxValue - minValue || 1;

    // グリッド線を描画
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;

    // 水平グリッド線
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // Y軸ラベル
      const value = maxValue - (valueRange * i) / 5;
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(value).toString(), padding.left - 10, y + 4);
    }

    // 垂直グリッド線
    const stepSize = Math.max(1, Math.floor(data.length / 8));
    for (let i = 0; i < data.length; i += stepSize) {
      const x = padding.left + (chartWidth * i) / (data.length - 1);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();

      // X軸ラベル
      const date = new Date(data[i].date);
      const label = date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, height - 10);
    }

    // データライン描画
    if (data.length > 1) {
      ctx.strokeStyle = chartTypes[activeChart].color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding.left + (chartWidth * index) / (data.length - 1);
        const y = padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // データポイント描画
      ctx.fillStyle = chartTypes[activeChart].color;
      data.forEach((point, index) => {
        const x = padding.left + (chartWidth * index) / (data.length - 1);
        const y = padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 軸線描画
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

  }, [chartData, activeChart]);

  // 統計サマリー計算
  const getStatsSummary = () => {
    if (!chartData) return null;

    const data = chartData[activeChart];
    if (!data || data.length === 0) return null;

    const values = data.map(d => d.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { total, average, max, min, count: values.length };
  };

  const stats = getStatsSummary();

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-gray-800">統計チャート</h2>
          
          <div className="flex items-center space-x-4">
            {/* 期間選択 */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* チャート更新 */}
            <button
              onClick={() => fetchChartData(selectedPeriod)}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-md transition-colors"
            >
              {loading ? '更新中...' : '更新'}
            </button>
          </div>
        </div>

        {/* チャートタイプ選択 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(chartTypes).map(([key, type]) => (
            <button
              key={key}
              onClick={() => setActiveChart(key as keyof GameProgressChart)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeChart === key
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: type.color }}
              ></span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* チャート */}
      <div className="px-6 py-4">
        {loading && (
          <div className="h-64 flex items-center justify-center">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              チャートを読み込み中...
            </div>
          </div>
        )}

        {!loading && (!chartData || !chartData[activeChart] || chartData[activeChart].length === 0) && (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>データがありません</p>
              <p className="text-sm">ゲームをプレイしてデータを蓄積しましょう！</p>
            </div>
          </div>
        )}

        {!loading && chartData && chartData[activeChart] && chartData[activeChart].length > 0 && (
          <div className="space-y-4">
            <canvas
              ref={canvasRef}
              className="w-full h-64 border border-gray-200 rounded"
            />

            {/* 統計サマリー */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800">
                    {stats.count}
                  </div>
                  <div className="text-sm text-gray-600">データ数</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {Math.round(stats.average * 100) / 100}
                  </div>
                  <div className="text-sm text-gray-600">平均</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {stats.max}
                  </div>
                  <div className="text-sm text-gray-600">最高</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-600">
                    {stats.min}
                  </div>
                  <div className="text-sm text-gray-600">最低</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};