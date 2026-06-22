# 设计口味基准（Design Taste Baseline）

> 来源：`design-taste-frontend` SKILL。所有构建、审计、精雕阶段的视觉决策均以此为依据。

---

## 三维度基准值

| 维度 | 基准值 | 含义 |
| :--- | :--- | :--- |
| `DESIGN_VARIANCE` | **8** | 非对称布局，禁止居中 Hero，使用分栏/错位/留白结构 |
| `MOTION_INTENSITY` | **6** | Fluid CSS 动效，`cubic-bezier` 过渡，只动 `transform`+`opacity` |
| `VISUAL_DENSITY` | **4** | 日常应用密度，正常间距，适度使用卡片 |

**用户可在对话中覆盖这三个值；命令执行时以最新值为准，不修改本文件。**

---

## 全局禁令

以下规则 grep 可验证，audit 阶段自动检测：

| 禁止 | 替代 |
| :--- | :--- |
| `Inter` 字体 | `Geist`、`Satoshi`、`Cabinet Grotesk`、`Outfit` |
| `#000000` 纯黑 | `zinc-950` 或 `charcoal` |
| AI 紫色 / 霓虹渐变 | `Zinc/Slate` 中性底色 + 单一强调色（饱和度 < 80%） |
| 居中 Hero（`DESIGN_VARIANCE > 4`） | 分屏、左对齐、非对称留白 |
| 3 等列卡片布局 | Bento 网格、Zig-Zag、非对称网格 |
| emoji | `@phosphor-icons/react` 或 `@radix-ui/react-icons` |
| `h-screen` | `min-h-[100dvh]` |
| flex 百分比数学（`w-[calc(33%-1rem)]`） | CSS Grid |
| 随意 `z-50` | 只在 Sticky Nav / Modal / Overlay 系统层级使用 |
| `top/left/width/height` 动画 | 只动 `transform` 和 `opacity` |
| Unsplash 链接 | `https://picsum.photos/seed/{str}/800/600` 或 SVG UI Avatars |
| Generic 占位名（John Doe / Acme） | 有创意的真实感名称 |

---

## 维度定义速查

### DESIGN_VARIANCE

| 值域 | 布局策略 |
| :--- | :--- |
| 1–3 | `justify-center`，严格 12 列对称网格 |
| 4–7 | 错位叠加（`-mt-8`），混合宽高比图片，左对齐标题 |
| **8–10（当前）** | Masonry，CSS Grid 分数单位（`2fr 1fr 1fr`），大段留白（`pl-[20vw]`） |

> `DESIGN_VARIANCE > 3`：`md:` 以下必须折叠为单列（`w-full px-4 py-8`），禁止横向滚动。

### MOTION_INTENSITY

| 值域 | 动效策略 |
| :--- | :--- |
| 1–3 | 只允许 CSS `:hover`/`:active` |
| **4–7（当前）** | `transition-all 0.3s cubic-bezier(0.16,1,0.3,1)`，`animation-delay` 级联，`will-change: transform` 谨慎使用 |
| 8–10 | Framer Motion hooks + scroll-triggered，GSAP 复杂时间轴，Three.js 3D |

### VISUAL_DENSITY

| 值域 | 密度策略 |
| :--- | :--- |
| 1–3 | 大量留白，巨大 section gap，极简 |
| **4–7（当前）** | 标准 Web App 间距 |
| 8–10 | 极小 padding，只用 1px 线分隔，数字强制 `font-mono` |
