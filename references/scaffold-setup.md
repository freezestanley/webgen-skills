# Scaffold 使用说明

## 技术栈（禁止修改）

| 技术 | 版本约束 | 用途 |
|------|----------|------|
| Vite | ^5.x | 构建工具 + dev server + API proxy |
| React | ^18.x | UI 框架 |
| react-router-dom | ^6.x | 客户端路由 |
| Tailwind CSS | ^3.x | utility-first CSS |
| antd | ^5.x | UI 组件库 |
| zustand | ^4.x | 状态管理 |
| axios | ^1.x | HTTP 客户端 |

**违规检查**：用户要求修改技术栈时，明确拒绝并说明原因。

---

## 初始化新项目

```bash
# 在 webgen/ 目录下执行
node scripts/init-project.js <project-name>

# 指定输出目录
node scripts/init-project.js <project-name> ./projects
```

执行后会生成：
```
projects/<project-name>/
  .webgen/
    gate.json
    requirements.md
    design.md
    audit.md
  index.html
  main.js
  package.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  styles/main.css
  sections/
  js/
  docs/
```

---

## Tailwind + antd 共存配置

**关键**：在 `tailwind.config.js` 中关闭 `preflight`，避免覆盖 antd 的 base styles：

```js
corePlugins: {
  preflight: false
}
```

antd 组件用 `ConfigProvider` 覆盖 token：

```jsx
import { ConfigProvider } from "antd";

<ConfigProvider theme={{
  token: {
    colorPrimary: "#1677FF",
    borderRadius: 8,
  }
}}>
  <App />
</ConfigProvider>
```

---

## Vite API 代理配置

编辑 `vite.config.js`：

```js
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3000",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, "")
    }
  }
}
```

---

## zustand Store 规范

每个业务模块一个 store 文件，放 `js/store/`：

```js
// js/store/authStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null }),
}));

export default useAuthStore;
```

---

## axios 封装规范

```js
// js/api/request.js
import axios from "axios";

const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

request.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err)
);

export default request;
```

---

## 文件大小限制

- 单文件 > 30K → **禁止一次性读写**
- 超大文件处理流程：读取 → 总结 → 再读取 → 再总结
- 组件超过 200 行 → 拆分为子组件
- store 超过 100 行 → 拆分为多个 store

---

## 图片素材规范

禁止下载图片到本地，使用 CDN URL：

```
Unsplash：https://images.unsplash.com/photo-<id>?w=800&q=80
Pexels：https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?w=800
```

在 HTML/JSX 中直接引用：
```jsx
<img src="https://images.unsplash.com/photo-xxx?w=800&q=80" alt="描述" />
```

---

## 启动开发服务器

```bash
cd projects/<project-name>
npm install
npm run dev
# → http://localhost:5173
```
