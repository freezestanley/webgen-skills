import { create } from "zustand";

// Mock 初始数据
const MOCK_USERS = [
  { id: 1, name: "张三", email: "zhangsan@example.com", role: "管理员", status: "active", avatar: "https://i.pravatar.cc/40?img=1" },
  { id: 2, name: "李四", email: "lisi@example.com", role: "编辑", status: "active", avatar: "https://i.pravatar.cc/40?img=2" },
  { id: 3, name: "王五", email: "wangwu@example.com", role: "访客", status: "inactive", avatar: "https://i.pravatar.cc/40?img=3" },
  { id: 4, name: "赵六", email: "zhaoliu@example.com", role: "编辑", status: "active", avatar: "https://i.pravatar.cc/40?img=4" },
  { id: 5, name: "钱七", email: "qianqi@example.com", role: "访客", status: "active", avatar: "https://i.pravatar.cc/40?img=5" },
  { id: 6, name: "孙八", email: "sunba@example.com", role: "管理员", status: "inactive", avatar: "https://i.pravatar.cc/40?img=6" },
  { id: 7, name: "周九", email: "zhoujiu@example.com", role: "编辑", status: "active", avatar: "https://i.pravatar.cc/40?img=7" },
  { id: 8, name: "吴十", email: "wushi@example.com", role: "访客", status: "active", avatar: "https://i.pravatar.cc/40?img=8" },
];

let nextId = MOCK_USERS.length + 1;

const useUserStore = create((set, get) => ({
  users: MOCK_USERS,
  loading: false,
  searchKeyword: "",
  currentPage: 1,
  pageSize: 10,

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),

  // 过滤后的用户列表
  getFilteredUsers: () => {
    const { users, searchKeyword } = get();
    if (!searchKeyword.trim()) return users;
    const kw = searchKeyword.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(kw) ||
        u.email.toLowerCase().includes(kw) ||
        u.role.toLowerCase().includes(kw)
    );
  },

  addUser: (data) =>
    set((s) => ({
      users: [...s.users, { ...data, id: nextId++, avatar: `https://i.pravatar.cc/40?img=${nextId}` }],
    })),

  updateUser: (id, data) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    })),

  deleteUser: (id) =>
    set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
}));

export default useUserStore;
