// Mock 仪表盘数据，不发真实请求

export const getStatsCards = () =>
  Promise.resolve([
    { key: "users",   label: "用户总数", value: 12480, trend: +8.2,  color: "#1677ff" },
    { key: "orders",  label: "订单总数", value: 3620,  trend: +3.5,  color: "#52c41a" },
    { key: "revenue", label: "总收入",   value: "¥86,420", trend: +12.1, color: "#faad14" },
    { key: "visits",  label: "今日访问", value: 2341,  trend: -1.8,  color: "#722ed1" },
  ]);

export const getLineChartData = () =>
  Promise.resolve([
    { date: "06/16", visits: 1200 },
    { date: "06/17", visits: 1900 },
    { date: "06/18", visits: 1500 },
    { date: "06/19", visits: 2200 },
    { date: "06/20", visits: 1800 },
    { date: "06/21", visits: 2800 },
    { date: "06/22", visits: 2341 },
  ]);

export const getBarChartData = () =>
  Promise.resolve([
    { month: "1月", revenue: 42000 },
    { month: "2月", revenue: 38000 },
    { month: "3月", revenue: 55000 },
    { month: "4月", revenue: 61000 },
    { month: "5月", revenue: 72000 },
    { month: "6月", revenue: 86420 },
  ]);
