# Impeccable 前端设计开发工作流（完整规范 v2）

> **适用范围**：从项目初始化到交付上线的全链路工作流，融合 `/impeccable` 命令集与 `design-taste-frontend` 高品质设计规范。
>
> **核心原则**：设计先行 → 结构化构建 → 自动化审计 → 命令化精雕。

---

## 目录

1. [前置条件与 Gate 控制](#1-前置条件与-gate-控制)
2. [阶段 0：项目初始化（Setup）](#2-阶段-0项目初始化setup)
3. [阶段 1：定义与意图（Define）](#3-阶段-1定义与意图define)
4. [阶段 2：结构落地（Build）](#4-阶段-2结构落地build)
5. [阶段 3：全面体检（Audit）](#5-阶段-3全面体检audit)
6. [阶段 4：专项精雕（Polish & Harden）](#6-阶段-4专项精雕polish--harden)
7. [知识沉淀规则](#7-知识沉淀规则)
8. [命令速查表](#8-命令速查表)

---

## 标准调用时序图

```
init (设置) → shape (规划) → critique (评审) → craft (构建)
                                              ↳ (穿插 bolder/colorize/layout 等调整)
                                              ↓
                                    harden + onboard (加固)
                                              ↓
                                    audit (检查)
                                              ↓
                                    polish (终验) → 交付上线
```

---

## 设计口味基准（Design Taste Baseline）

> 来源：`design-taste-frontend` SKILL。所有构建、审计、精雕阶段的视觉决策均以此为依据。

| 维度 | 基准值 | 含义 |
| :--- | :--- | :--- |
| `DESIGN_VARIANCE` | **8** | 非对称布局，禁止居中 Hero，使用分栏/错位/留白结构 |
| `MOTION_INTENSITY` | **6** | Fluid CSS 动效，`cubic-bezier` 过渡，使用 `transform`+`opacity`，禁止 `top/left/width/height` 动画 |
| `VISUAL_DENSITY` | **4** | 日常应用密度，正常间距，适度使用卡片 |

**用户可在对话中覆盖这三个值；命令执行时以最新值为准，不修改本文件。**

### 全局禁令（来自 design-taste-frontend §7）

- 禁止使用 `Inter` 字体，使用 `Geist`、`Satoshi`、`Cabinet Grotesk` 或 `Outfit`
- 禁止使用 `#000000` 纯黑，使用 `zinc-950` 或 `charcoal`
- 禁止 AI 紫色/霓虹渐变，使用 `Zinc/Slate` 中性底色 + 单一强调色
- 禁止居中 Hero（当 `DESIGN_VARIANCE > 4`），强制分屏或左对齐
- 禁止 3 等列卡片布局，使用 Bento 网格、Zig-Zag 或非对称网格
- 禁止使用 emoji，使用 Phosphor Icons 或 Radix Icons（检查 `package.json`）
- 禁止 `h-screen`，使用 `min-h-[100dvh]`
- 禁止复杂 flex 百分比数学，使用 CSS Grid

---

## 1. 前置条件与 Gate 控制

### 1.1 Gate 表

| Gate | 阶段名称 | 准入条件 | 准出条件（客观可验证） |
| :--- | :--- | :--- | :--- |
| **G0_SETUP** | 项目初始化 | 用户发起项目请求 | 产物文件均存在且字段非空（脚本可检测） |
| **G1_REQ** | 需求澄清 | G0 准出通过 | `requirements.md` 使用模板填写，用户签字（Git commit 信息注明 `req-confirmed`） |
| **G2_DESIGN** | 设计定义 | G1 准出通过 | Block Tree 文件存在，critique 评分 JSON 输出且总分 ≥ 75 |
| **G3_BUILD** | 代码构建 | G2 准出通过 | `npm run lint` 零 error，`npm run type-check` 零 error，Dev server 启动无 console error |
| **G4_AUDIT** | 质量审计 | G3 准出通过 | `.webgen/audit.md` 存在，P0/P1 数量 = 0 |
| **G5_SHIP** | 交付上线 | G4 准出通过，`polish` 执行完毕 | Lighthouse Performance ≥ 90，Accessibility ≥ 95，Best Practices ≥ 90 |

### 1.2 Gate 强制执行机制

Gate 检查必须通过**脚本**而非人工判断执行：

```bash
# 示例：G3 准出检查脚本 .webgen/gate-check.sh
npm run lint -- --max-warnings=0   # 零 error
npm run type-check                 # 零 error（要求项目配置 tsconfig）
node -e "require('./.webgen/dev-check')"  # 检测 dev server 启动无 console.error
```

> **强制说明**：Gate 不与 CI/CD 或分支保护硬绑定（各项目 CI 配置不同），但所有 Gate 检查脚本必须可在本地独立运行，且输出 exit code 0/1。任何 Gate 检查结果为 exit code 1 时，禁止手动跳过，需修复后重新运行。

### 1.3 异常路径

| 场景 | 处理方式 |
| :--- | :--- |
| audit 连续 3 次仍有 P0/P1 | 判断根因：若为设计问题回退 G2；若为技术债（第三方 SDK / 性能瓶颈 / 兼容性），在 `.webgen/audit.md` 中登记为 `accepted-risk`，说明原因和预计解决时间，不得回退设计阶段 |
| 紧急 hotfix | 跳过 G2/G3 完整流程，但必须在修复后补跑 G4_AUDIT，不得遗留新的 P0 问题 |
| 需求中途变更 | 在 `requirements.md` 中追加变更记录（版本号 + 变更内容），重新执行 G1 准出确认，Block Tree 标注受影响区块 |

---

## 2. 阶段 0：项目初始化（Setup）

**触发时机**：新项目启动，或旧项目首次接入本工作流。

### 2.1 执行命令

| 场景 | 命令 | 说明 |
| :--- | :--- | :--- |
| **全新项目** | `/impeccable init` | 生成 `PRODUCT.md`、`DESIGN.md`、`requirements.md` 模板，配置 Live 预览 |
| **存量项目** | `/impeccable document` | 扫描现有代码，生成 `DESIGN.md`；**`PRODUCT.md` 需开发者手动补写**（命令不可反推产品目标） |

> **存量项目补充**：`/impeccable document` 执行后，必须手动创建 `PRODUCT.md`（使用模板），否则 G0 Gate 检查脚本将返回 exit code 1。

### 2.2 产物清单（全项目生命周期）

```text
./
├── PRODUCT.md                   # 产品目标、用户画像、3~5 个核心用户故事
├── DESIGN.md                    # 设计原则、Design Tokens、组件库选型、布局规范
├── requirements.md              # 需求文档（使用模板，G1 准出需 Git 注明 req-confirmed）
└── .webgen/
    ├── live.config.js           # Live 预览配置
    ├── gate-check.sh            # Gate 检查脚本
    ├── audit.md                 # 审计报告（由 audit 命令生成）
    └── docs/
        ├── layout-patterns.md   # 迭代中使用的布局模式
        ├── component-variants.md
        └── token-decisions.md
```

### 2.3 技术栈前置声明（与 design-taste-frontend 对齐）

**在写任何 UI 代码前，必须在 `DESIGN.md` 中声明以下配置：**

```yaml
# DESIGN.md 技术栈声明区
framework: react | nextjs          # 默认 Next.js，RSC 优先
styling: tailwind-v3 | tailwind-v4 # 必须指定版本，v4 用 @tailwindcss/postcss
icons: @phosphor-icons/react | @radix-ui/react-icons
font: Geist | Satoshi | Cabinet Grotesk | Outfit  # 禁止 Inter
typescript: true | false           # 若 true，必须配置 tsconfig，准出标准含 type-check
animation: none | tailwind | framer-motion | gsap  # 按 MOTION_INTENSITY 决定
```

> **依赖验证（强制）**：craft / harden / animate 命令执行前，必须检查 `package.json` 确认库已安装。未安装时先输出安装命令，再输出代码。禁止假设库存在。

### 2.4 校验标准（脚本可验证）

```bash
# G0 Gate 检查脚本片段
[ -f PRODUCT.md ] && grep -q "用户故事" PRODUCT.md  # 存在且含用户故事
[ -f DESIGN.md ] && grep -q "primary:" DESIGN.md    # 存在且含色值定义
[ -f .webgen/live.config.js ]                       # Live 配置存在
```

---

## 3. 阶段 1：定义与意图（Define）

**触发时机**：`requirements.md` G1 准出通过，进入 G2_DESIGN。

**目标**：在不编写任何 UI 代码的前提下，完成页面结构的逻辑推演。

### 3.1 执行命令（顺序执行）

**第一步：`/impeccable shape`**

- 读取 `PRODUCT.md`、`DESIGN.md`、`requirements.md`。
- 指定目标页面范围（单页 or 全站，多页项目需逐页执行 shape）。
- 输出：Block Tree 文件 + Design Tokens YAML（写入 `.webgen/shape-output.md`）。
- **Block Tree 产物为唯一事实来源**，critique 和 craft 均以此文件为输入，不得手动修改后再运行 shape（会被覆盖）。若需调整结构，在 shape 命令的 prompt 中指定修改意图，由命令重新生成。

**第二步：`/impeccable critique`**

- 对 `.webgen/shape-output.md` 中的 Block Tree 进行 UX 评审。
- 输出评分 JSON（写入 `.webgen/critique-score.json`）：

```json
{
  "total": 82,
  "dimensions": {
    "hierarchy": { "score": 28, "max": 35, "issues": ["表单区嵌套过深"] },
    "clarity":   { "score": 30, "max": 35, "issues": [] },
    "resonance": { "score": 24, "max": 30, "issues": ["Hero 情感不足"] }
  },
  "passed": true
}
```

- **通过标准**：`total ≥ 75`，且所有维度 `score / max ≥ 0.6`。
- **不通过处理**：根据 `issues` 字段修改 shape 的 prompt，重新运行 shape，最多迭代 3 次。3 次后仍不通过，记录原因并人工决策是否降低阈值（需在 `requirements.md` 中备注）。

### 3.2 Block Tree 与 Design Tokens 规范

**Block Tree 示例（写入 `.webgen/shape-output.md`）**

```text
Page: 用户登录页  [version: 1.2]
  ├── Header（顶部导航）
  │   ├── Logo
  │   └── 返回首页链接
  ├── Hero（主视觉区）[布局：左右分屏，DESIGN_VARIANCE=8]
  │   ├── 左：标语文案 + 登录表单区
  │   └── 右：品牌插图（aspect-ratio 保护）
  ├── FormSection（表单区）[抽象边界：≥2页面复用时 extract]
  │   ├── 邮箱输入
  │   ├── 密码输入
  │   ├── 记住我 + 忘记密码
  │   └── 登录按钮（Tactile Feedback：active 时 scale-[0.98]）
  └── Footer（底部）
      └── 注册引导文案
```

**Design Tokens（写入 `.webgen/shape-output.md`）**

```yaml
colors:
  primary: "#1677FF"        # 单一强调色，饱和度 < 80%
  bg: "#F9FAFB"             # 接近白，非纯白
  text-main: "#18181B"      # zinc-900，非 #000000
  text-sub: "#71717A"       # zinc-500

spacing:
  section-gap: "48px"
  form-gap: "16px"

typography:
  font-family: "Geist, Satoshi, sans-serif"   # 禁止 Inter
  heading: "text-4xl md:text-6xl tracking-tighter leading-none"
  body: "text-base text-zinc-600 leading-relaxed max-w-[65ch]"
  caption: "text-sm text-zinc-400"

motion:
  default: "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
  spring: "type: spring, stiffness: 100, damping: 20"   # framer-motion 专用
```

### 3.3 多页项目策略

- 10 页以上项目：先执行 `shape` 生成**全站 Block Tree 索引**，再逐页细化。
- Design Tokens 必须全站统一，禁止每页各自定义色值。
- 共享组件在全站 Block Tree 中标注 `[shared]`，shape 时即识别，避免后期 extract 混乱。

### 3.4 校验标准

- Block Tree 版本号已更新。
- Block Tree 嵌套深度不超过 5 层（反映真实复杂度，禁止将复杂度藏入配置对象）。
- `critique-score.json` 存在且 `passed: true`。
- Design Tokens 色值与 `DESIGN.md` 声明的 `primary` 一致。

---

## 4. 阶段 2：结构落地（Build）

**触发时机**：`.webgen/shape-output.md` 和 `.webgen/critique-score.json` 均通过，进入 G3_BUILD。

**目标**：将 Block Tree 转化为高保真 React 代码。

### 4.1 执行命令

**（必须）`/impeccable craft`**

- 依据 `.webgen/shape-output.md` 中的 Block Tree 逐区块生成 React 组件。
- 样式：Tailwind CSS（版本已在 `DESIGN.md` 声明），复杂状态封装为 CSS Module，禁止 inline style。
- 每个组件生成前，根据 `package.json` 验证依赖，缺失时先输出安装命令。
- RSC 优先（Next.js 项目）；含动效、全局状态的组件必须提取为独立 Client Component（`'use client'` 置于文件顶部）。

**（条件触发）`/impeccable extract`**

- **触发标准（二选一满足即可）**：
  - 同一 UI 模式（结构 + 样式高度一致）在 **≥ 2 个区块**中重复出现
  - 同一组件被 **≥ 2 个页面**引用
- 提取目标：`src/components/` 公共目录。
- 禁止提前抽象：未达到以上标准时，组件保留在 `src/sections/` 中，不得手动在 `src/components/` 新建文件绕过此流程。

**（可选）`/impeccable live`**（构建期实时调试）

- 用途：设计师/产品在浏览器中实时调整 Token 值并回写代码。
- **多人使用时**：每次 live 调整必须通过 Git commit 固化，禁止多人同时开启 live 模式修改同一文件。

### 4.2 文件结构规范

```text
src/
├── sections/               # 页面级区块（Block Tree 一级子节点）
│   ├── [PageName]/         # 10+ 页面时按页面分目录，避免命名冲突
│   │   ├── HeaderSection.tsx
│   │   ├── HeroSection.tsx
│   │   └── FormSection.tsx
├── components/             # 跨页面复用组件（仅通过 extract 提升）
│   ├── ui/                 # 基础 UI 原子（Button、Input、Badge 等）
│   └── blocks/             # 业务级复用块（LoginForm、UserCard 等）
├── store/                  # 全局状态（仅用于深层 prop-drilling，不得滥用）
├── api/                    # API 请求封装
├── App.tsx
└── router.tsx
```

> **框架适配说明**：以上结构适用于标准 React SPA。Next.js 项目将 `sections/` 对应至 `app/[page]/` 下的组件；Monorepo / 微前端项目需在 `DESIGN.md` 中单独声明目录结构，本规范不强制。

> **TypeScript 说明**：`DESIGN.md` 中声明 `typescript: true` 时，所有文件使用 `.tsx`，准出含 `type-check` 零 error。声明 `typescript: false` 时使用 `.jsx`，准出不含 type-check（但需在 `DESIGN.md` 中注明原因）。

### 4.3 代码规范约束（来自 design-taste-frontend §2 + §5）

| 约束项 | 规则 |
| :--- | :--- |
| 文件大小 | 单文件不超过 300 行（行数比字节数更稳定可测），超出按功能拆分子组件 |
| 样式策略 | Tailwind CSS 90%；复杂动效 / hover 状态机封装为独立 CSS Module 或 framer-motion 变体 |
| 命名约定 | 区块：`XxxSection.tsx`；通用组件：`Xxx.tsx`；Client Component：文件顶部 `'use client'` |
| 图标 | 检查 `package.json` 后使用 `@phosphor-icons/react` 或 `@radix-ui/react-icons`，禁止 emoji |
| 全高 Hero | 使用 `min-h-[100dvh]`，禁止 `h-screen` |
| 布局 | 使用 CSS Grid，禁止 `w-[calc(33%-1rem)]` 式 flex 百分比数学 |
| 最大宽度 | 页面布局使用 `max-w-[1400px] mx-auto` 或 `max-w-7xl` |
| 动画属性 | 只动 `transform` 和 `opacity`，禁止动 `top/left/width/height` |
| z-index | 只在系统层级（Sticky Nav / Modal / Overlay）使用，禁止随意 `z-50` |
| 准出标准 | `npm run lint` 零 error，`npm run type-check` 零 error（若 TS 项目），Dev server 启动无 console.error |

### 4.4 交互状态完整性（强制，来自 design-taste-frontend §3 Rule 5）

每个数据驱动组件必须实现完整交互状态，禁止只生成成功态：

| 状态 | 实现方式 |
| :--- | :--- |
| Loading | 骨架屏（匹配布局尺寸），禁止通用 circular spinner |
| Empty | 有设计感的空态，说明如何填充数据 |
| Error | 内联错误提示（表单字段级别），不弹全屏 modal |
| Tactile Feedback | `:active` 时 `scale-[0.98]` 或 `-translate-y-[1px]` |

---

## 5. 阶段 3：全面体检（Audit）

**触发时机**：G3_BUILD 准出通过，进入 G4_AUDIT。

### 5.1 执行命令

```bash
/impeccable audit
```

- 自动运行以下检查项，产出写入 `.webgen/audit.md`。
- 每个问题按 P0/P1/P2/P3 分级，并自动关联精雕命令建议（基于问题类型的规则映射，非 AI 主观推荐）。
- 同时对照 `design-taste-frontend §7 AI Tells` 检测设计反模式。

### 5.2 审计维度清单

**（1）响应式与适配**

```text
[ ] sm (640px)：移动端排版正确，无横向滚动
[ ] md (768px)：平板布局合理
[ ] lg (1024px)：桌面默认展示完整
[ ] xl (1280px)：宽屏不过度拉伸

DESIGN_VARIANCE > 4 时：
[ ] 非对称布局在 md: 以下已折叠为单列（w-full px-4）

[ ] min-h-[100dvh] 替代 h-screen（grep 检查）
[ ] 长文本有 truncate / break-words / line-clamp 保护
[ ] 图片有 aspect-ratio 或固定尺寸保护
[ ] 列表 Empty 状态有设计占位
```

**（2）性能（Lighthouse）**

```text
[ ] Performance ≥ 90
[ ] Accessibility ≥ 95
[ ] Best Practices ≥ 90
```

**（3）动画性能**

```text
[ ] 无 top/left/width/height 动画（grep 检查）
[ ] grain/noise 滤镜仅在 fixed pointer-events-none 伪元素上
[ ] 持续动画组件已隔离为独立 Client Component + React.memo
[ ] useEffect 动画含 cleanup 函数
[ ] 未使用 window.addEventListener('scroll')（使用 Framer Motion 或 Intersection Observer）
```

**（4）design-taste-frontend AI 反模式检测**

```text
[ ] 无 Inter 字体（grep 检查）
[ ] 无 #000000 纯黑（grep 检查）
[ ] 无 AI 紫色渐变（grep purple/violet/neon）
[ ] 无居中 Hero（当 DESIGN_VARIANCE > 4 时 grep justify-center 在 Hero 区块中的使用）
[ ] 无 3 等列卡片（grep grid-cols-3 在 Feature 区块中的使用）
[ ] 无 Unsplash 链接（grep unsplash.com）
[ ] 无 emoji（grep unicode 范围）
[ ] 无 h-screen（grep 检查）
[ ] 无随意 z-50（非 Nav/Modal/Overlay 使用）
```

**（5）动画选型决策（按 `MOTION_INTENSITY` 值）**

```text
MOTION_INTENSITY 1-3：只允许 CSS :hover/:active
MOTION_INTENSITY 4-7：
  - Tailwind transition-* (推荐)
  - framer-motion 组件进出场（按需懒加载）
  - 禁止 requestAnimationFrame 手动操作
MOTION_INTENSITY 8-10：
  - Framer Motion hooks（scroll-triggered）
  - GSAP（复杂时间轴，禁止与 Framer Motion 混用）
  - Three.js / WebGL（3D，按需加载，useEffect 含 cleanup）

引入动画库前置条件：
  - framer-motion：package.json 已安装 + MOTION_INTENSITY ≥ 5
  - GSAP：明确的复杂滚动/时间轴需求 + bundle 影响评估已完成
  - Three.js：3D 场景明确需求 + Performance Lighthouse ≥ 90 可维持
```

> **审计结果映射**：audit 对每个问题类型输出固定的命令建议（见 §6.1 触发条件列），不依赖 AI 主观判断，而是基于问题类型的规则映射表。

---

## 6. 阶段 4：专项精雕（Polish & Harden）

**触发时机**：`.webgen/audit.md` 生成后，按问题优先级修复。

### 6.1 修复流水线（按优先级排序）

| 优先级 | 分类 | 命令 | audit 触发条件 | 目标 |
| :--- | :--- | :--- | :--- | :--- |
| P0 | 健壮性/边缘情况 | `/impeccable harden` | audit 检测到 Empty/Loading/Error 状态缺失、长文本溢出、图片无降级 | 补全防御性逻辑 |
| P1 | 新用户引导 | `/impeccable onboard` | audit 检测到首次运行流缺失、Empty States 无设计 | 补全激活路径 |
| P2 | 布局与节奏 | `/impeccable layout` | audit 检测到间距不均、对齐错位、居中 Hero 违规 | 修复视觉节奏 |
| P3 | 排版与层级 | `/impeccable typeset` | audit 检测到 Inter 使用、字号体系混乱 | 修正字体层级 |
| P4 | 色彩与品牌 | `/impeccable colorize` | audit 检测到对比度不足、AI 紫色渐变、纯黑使用 | 增强对比度与品牌感 |
| P5 | 交互与动效 | `/impeccable animate` | audit 检测到 MOTION_INTENSITY 对应动效缺失 | 增加有目的的运动 |
| P6 | 情感化细节 | `/impeccable delight` | audit 无 P0~P5 问题 + Lighthouse ≥ 90 + 产品明确要求 | 添加愉悦瞬间 |
| P7 | 终极收尾 | `/impeccable polish` | P0~P6 全部处理完毕（已跑 audit 验证） | 全量对齐 Design System |

> **禁止跳级**：P0 未解决时，禁止执行 P1 及更高编号命令。优先级数字越小，越先处理。

> **"处理完毕"定义**：重新运行 audit，对应问题不再出现；或在 `.webgen/audit.md` 中登记为 `accepted-risk`（需说明原因和责任人）。

> **polish 准出**：Lighthouse 三项阈值通过（见 G5 Gate），而非"设计系统对齐度 100%"（该指标无客观算法，不作为准出条件）。

### 6.2 辅助调节命令

| 命令 | 触发场景 | 前置条件 |
| :--- | :--- | :--- |
| `/impeccable bolder` | 视觉强度不足（audit 备注 / 产品反馈） | audit 无 P0 |
| `/impeccable quieter` | 视觉噪音过多（audit 备注 / 产品反馈） | audit 无 P0 |
| `/impeccable distill` | audit 检测到非必要装饰元素 | audit 无 P0 |
| `/impeccable clarify` | audit 检测到文案歧义 | audit 无 P0 |
| `/impeccable adapt` | 明确指定目标设备（如 iPad / 大屏）并有具体断点需求 | 目标设备型号已确认 |
| `/impeccable optimize` | Lighthouse Performance < 90 | audit 已运行 |
| `/impeccable overdrive` | 产品明确要求 3D/粒子特效 + Performance 可维持 ≥ 90 | delight 阶段完成 + Three.js 未与 Framer Motion 混用 |

### 6.3 harden 防御性代码规范

**按 audit 检测结果按需插入，非全量插入。每条有明确触发条件。**

```tsx
// 触发条件：audit 检测到列表无空态
{list.length === 0 && (
  <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
    <Icon size={32} />  {/* 使用 Phosphor/Radix 图标，禁止 emoji */}
    <p className="text-sm">暂无数据</p>
  </div>
)}

// 触发条件：audit 检测到异步加载期间布局抖动
{loading
  ? <Skeleton className="h-[200px] w-full rounded-2xl animate-pulse bg-zinc-100" />
  : <Content />
}

// 触发条件：audit 检测到长文本溢出（需确认 Tailwind 已启用 line-clamp 插件）
<p className="line-clamp-2 text-zinc-600">{longText}</p>

// 触发条件：audit 检测到图片无降级处理
<img
  src={src}
  alt="描述"
  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackImg;
    e.currentTarget.onerror = null; // 防止 fallback 也失败时递归触发
  }}
/>

// 触发条件：audit 检测到 API 无错误捕获
try {
  await api.fetchData();
} catch (error) {
  const msg = error instanceof Error ? error.message : '加载失败，请稍后重试';
  message.error(msg);  // 前提：项目已安装 antd；否则替换为项目内的 toast 方案
}
```

---

## 7. 知识沉淀规则

每次版本迭代完成后，将关键知识写入 `.webgen/docs/` 供后续复用。

```text
.webgen/docs/
├── layout-patterns.md      # 本迭代中使用的核心布局模式
├── component-variants.md   # 组件的定制化配置（设计口味参数影响的样式决策）
└── token-decisions.md      # Design Token 变更记录与决策依据
```

### 7.1 触发机制

| 触发方式 | 时机 | 操作 | 责任人 |
| :--- | :--- | :--- | :--- |
| **交互提示** | `/impeccable polish` 通过时 | 系统提示更新知识库，输入 `y` 自动提炼 | 自动 |
| **手动补充** | G5_SHIP 后 | 开发者补充 `token-decisions.md` 中的决策背景 | 迭代负责人 |
| **归档检测** | 下一次 `/impeccable init` 时 | **警告**（不阻断）上一次迭代 `.webgen/docs/` 不完整，提示补充 | 自动提示，人工决定 |

> **修正说明**：归档检测改为**警告而非阻断**，避免 hotfix / 紧急迭代被锁死。阻断机制只适用于强制性准出条件（如 Gate 脚本检查），知识沉淀属于质量提升项，不得作为流程阻断条件。

### 7.2 多人协作说明

- Block Tree、Design Tokens、audit.md 作为共享产物，修改需通过 Git commit + PR review，禁止直接推送到主分支。
- `critique-score.json` 由命令自动生成，禁止手动修改。
- live 模式调整产生的 Token 变更，必须在当天 commit，禁止遗留未提交的样式漂移。

---

## 8. 命令速查表

| 命令 | 功能 | 阶段 | 是否必须 |
| :--- | :--- | :--- | :--- |
| `/impeccable init` | 项目初始化，生成全套产物 | 阶段 0 | 新项目必须 |
| `/impeccable document` | 存量代码反向生成 `DESIGN.md` | 阶段 0 | 存量项目必须（需手动补 PRODUCT.md） |
| `/impeccable shape` | 生成 Block Tree 与 Tokens | 阶段 1 | 必须 |
| `/impeccable critique` | UX 评审，输出评分 JSON | 阶段 1 | 必须 |
| `/impeccable craft` | 依据 Block Tree 构建 React 组件 | 阶段 2 | 必须 |
| `/impeccable extract` | 提取复用组件（≥2 处重复或 ≥2 页面引用） | 阶段 2 | 条件触发 |
| `/impeccable live` | 浏览器实时 Token 调试（需 Git 协同） | 阶段 2 | 可选 |
| `/impeccable audit` | 全量质量检查，输出 audit.md | 阶段 3 | 必须 |
| `/impeccable harden` | 补全防御性逻辑（P0） | 阶段 4 | audit 触发时必须 |
| `/impeccable onboard` | 补全空态/首次运行流（P1） | 阶段 4 | audit 触发时必须 |
| `/impeccable layout` | 修复布局节奏（P2） | 阶段 4 | audit 触发时必须 |
| `/impeccable typeset` | 修正字体层级（P3） | 阶段 4 | audit 触发时必须 |
| `/impeccable colorize` | 修复色彩/对比度（P4） | 阶段 4 | audit 触发时必须 |
| `/impeccable animate` | 补全动效（P5） | 阶段 4 | audit 触发时必须 |
| `/impeccable delight` | 情感化细节（P6） | 阶段 4 | 条件触发（见 §6.1） |
| `/impeccable overdrive` | 3D/粒子特效（P6） | 阶段 4 | 条件触发（见 §6.2） |
| `/impeccable bolder` | 放大视觉强度 | 阶段 4 辅助 | 按需 |
| `/impeccable quieter` | 降低视觉强度 | 阶段 4 辅助 | 按需 |
| `/impeccable distill` | 剥离装饰保留核心 | 阶段 4 辅助 | 按需 |
| `/impeccable clarify` | 优化 UX 文案 | 阶段 4 辅助 | 按需 |
| `/impeccable adapt` | 多设备适配 | 阶段 4 辅助 | 按需 |
| `/impeccable optimize` | 性能专项优化 | 阶段 4 辅助 | Lighthouse < 90 时必须 |
| `/impeccable polish` | 终验，准备 G5_SHIP | 阶段 4 P7 | 必须 |
