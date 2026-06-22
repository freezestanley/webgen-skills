# 阶段 2：结构落地（Build）

**触发时机**：`.webgen/shape-output.md` 和 `critique-score.json` 均通过，进入 G3_BUILD。
**目标**：将 Block Tree 转化为高保真 React 代码。

---

## 执行命令

### （必须）`/impeccable craft`

- 依据 `.webgen/shape-output.md` 逐区块生成 React 组件。
- 样式：Tailwind CSS（版本以 `DESIGN.md` 声明为准），复杂状态封装为 CSS Module，禁止 inline style。
- 每个组件生成前检查 `package.json`，依赖缺失时先输出安装命令。
- Next.js 项目 RSC 优先；含动效/全局状态的组件提取为独立 Client Component（`'use client'` 置顶）。

### （条件触发）`/impeccable extract`

触发标准二选一：
- 同一 UI 模式（结构 + 样式高度一致）在 **≥ 2 个区块**中重复
- 同一组件被 **≥ 2 个页面**引用

提取至 `src/components/`。未达标时组件保留在 `src/sections/`，禁止手动在 `src/components/` 新建文件绕过此流程。

### （可选）`/impeccable live`

- 浏览器实时调整 Token 值并回写代码。
- **多人协作**：每次 live 调整必须 Git commit 固化，禁止多人同时 live 修改同一文件。

---

## 文件结构规范

```text
src/
├── sections/
│   ├── [PageName]/           # 10+ 页面时按页面分目录，避免命名冲突
│   │   ├── HeroSection.tsx
│   │   ├── FormSection.tsx
│   │   └── HeaderSection.tsx
├── components/               # 仅通过 extract 提升，禁止手动创建
│   ├── ui/                   # 基础 UI 原子：Button、Input、Badge 等
│   └── blocks/               # 业务级复用块：LoginForm、UserCard 等
├── store/                    # 全局状态（仅用于深层 prop-drilling，禁止滥用）
├── api/
├── App.tsx
└── router.tsx
```

**框架适配**：
- Next.js → `sections/` 对应 `app/[page]/` 下的组件
- Monorepo / 微前端 → 在 `DESIGN.md` 中单独声明目录结构，本规范不强制

**TypeScript**：`DESIGN.md` 声明 `typescript: true` 时全部用 `.tsx`，准出含 type-check 零 error；声明 `false` 时用 `.jsx`，需在 `DESIGN.md` 注明原因。

---

## 代码规范约束

| 约束项 | 规则 |
| :--- | :--- |
| 文件大小 | 单文件 ≤ 300 行，超出按功能拆分 |
| 样式策略 | Tailwind 90%；复杂动效/hover 状态机封装为 CSS Module 或 framer-motion 变体 |
| 命名 | 区块：`XxxSection.tsx`；通用组件：`Xxx.tsx`；Client Component：顶部 `'use client'` |
| 图标 | 检查 `package.json` 后使用 `@phosphor-icons/react` 或 `@radix-ui/react-icons`，禁止 emoji |
| 全高 Hero | `min-h-[100dvh]`，禁止 `h-screen` |
| 布局 | CSS Grid，禁止 `w-[calc(33%-1rem)]` 式 flex 百分比数学 |
| 最大宽度 | `max-w-[1400px] mx-auto` 或 `max-w-7xl` |
| 动画属性 | 只动 `transform` 和 `opacity`，禁止 `top/left/width/height` |
| z-index | 只在 Sticky Nav / Modal / Overlay 使用，禁止随意 `z-50` |

---

## 交互状态完整性（强制）

每个数据驱动组件必须实现全部四种状态，禁止只生成成功态：

| 状态 | 实现要求 |
| :--- | :--- |
| Loading | 骨架屏（匹配布局尺寸），禁止通用 circular spinner |
| Empty | 有设计感的空态，告知用户如何填充数据 |
| Error | 内联错误提示（表单字段级别），不弹全屏 modal |
| Tactile Feedback | `:active` 时 `scale-[0.98]` 或 `-translate-y-[1px]` |

---

## G3 校验

```bash
npm run lint -- --max-warnings=0  || exit 1
npm run type-check                || exit 1   # typescript: true 项目
node -e "require('./.webgen/dev-check')" || exit 1
```
