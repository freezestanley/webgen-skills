import React, { useEffect, useState } from "react";
import { Card, Skeleton, Empty } from "antd";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import StatsCard from "../components/StatsCard.jsx";
import { getStatsCards, getLineChartData, getBarChartData } from "../api/dashboardApi.js";

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getStatsCards(), getLineChartData(), getBarChartData()])
      .then(([s, l, b]) => {
        setStats(s);
        setLineData(l);
        setBarData(b);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} active paragraph={{ rows: 2 }} />)}
        </div>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.length === 0 ? (
          <Empty description="暂无数据" className="col-span-4" />
        ) : (
          stats.map((item) => (
            <StatsCard
              key={item.key}
              label={item.label}
              value={item.value}
              trend={item.trend}
              color={item.color}
            />
          ))
        )}
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 折线图：近7天访问趋势 */}
        <Card
          title={<span className="text-base font-semibold text-gray-800">近7天访问趋势</span>}
          extra={<span className="text-xs text-gray-400">最近7天</span>}
          className="rounded-xl border-0 shadow-md"
          styles={{ body: { paddingTop: 8 } }}
        >
          {lineData.length === 0 ? (
            <Empty description="暂无数据" imageStyle={{ height: 40 }} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData} margin={{ top: 8, right: 24, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1677ff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                  labelStyle={{ color: "#374151", fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="visits"
                  name="访问量"
                  stroke="#1677ff"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#fff", stroke: "#1677ff", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#1677ff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* 柱状图：近6月收入 */}
        <Card
          title={<span className="text-base font-semibold text-gray-800">近6月收入</span>}
          extra={<span className="text-xs text-gray-400">单位：元</span>}
          className="rounded-xl border-0 shadow-md"
          styles={{ body: { paddingTop: 8 } }}
        >
          {barData.length === 0 ? (
            <Empty description="暂无数据" imageStyle={{ height: 40 }} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 8, right: 24, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1677ff" />
                    <stop offset="100%" stopColor="#69b1ff" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`¥${v.toLocaleString()}`, "收入"]}
                  contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                  labelStyle={{ color: "#374151", fontWeight: 600 }}
                />
                <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
