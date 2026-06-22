import React from "react";
import { Card } from "antd";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * 统计卡片
 * @param {string} label - 指标名称
 * @param {string|number} value - 指标值
 * @param {number} trend - 涨跌百分比（正数为涨，负数为跌）
 * @param {string} color - 主色（用于左侧色条）
 */
export default function StatsCard({ label, value, trend, color }) {
  const isUp = trend >= 0;

  return (
    <Card
      className="rounded-xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200"
      styles={{ body: { padding: "24px" } }}
    >
      {/* 顶部色条 */}
      <div className="h-1 rounded-full mb-5 -mx-6 -mt-6 rounded-t-xl" style={{ backgroundColor: color }} />

      <div className="flex items-start justify-between">
        {/* 图标圆圈 */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color + "18" }}
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        </div>

        {/* 趋势角标 */}
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
        }`}>
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900 truncate">{value}</p>
        <p className="text-sm text-gray-400 mt-1 truncate">{label}</p>
      </div>
    </Card>
  );
}
