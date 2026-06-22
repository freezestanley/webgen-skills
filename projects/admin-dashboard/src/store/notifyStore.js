import { create } from "zustand";

const MOCK_NOTIFICATIONS = [
  { id: 1, title: "新用户注册", desc: "用户「周九」刚刚完成注册", time: "2分钟前", read: false },
  { id: 2, title: "订单异常", desc: "订单 #20240622 支付超时", time: "15分钟前", read: false },
  { id: 3, title: "系统更新", desc: "系统已更新至 v2.1.0", time: "1小时前", read: true },
  { id: 4, title: "报表生成完成", desc: "6月份月报已生成，可下载", time: "3小时前", read: true },
];

const useNotifyStore = create((set, get) => ({
  notifications: MOCK_NOTIFICATIONS,

  get unreadCount() {
    return get().notifications.filter((n) => !n.read).length;
  },

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
}));

export default useNotifyStore;
