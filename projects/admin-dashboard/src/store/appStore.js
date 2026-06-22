import { create } from "zustand";

const useAppStore = create((set) => ({
  siderCollapsed: false,
  systemName: "后台管理系统",
  themeColor: "#1677ff",

  setSiderCollapsed: (collapsed) => set({ siderCollapsed: collapsed }),
  toggleSider: () => set((s) => ({ siderCollapsed: !s.siderCollapsed })),
  setSystemName: (name) => set({ systemName: name }),
  setThemeColor: (color) => set({ themeColor: color }),
}));

export default useAppStore;
