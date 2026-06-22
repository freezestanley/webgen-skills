---
name: frontend-page-builder
description: 前端页面设计与代码落地全流程。用于新建页面、重构页面、落地设计稿。包含六阶段门控 SOP（需求确认→方案输出→开发落地→自检验收→用户预览→发布），强制技术栈约束（Vite+TailwindCSS+JS+HTML），禁止大文件整块读写，上下文超限前必须 HANDOFF。
---

# Frontend Page Builder

## Overview

本 skill 管控前端页面从需求到发布的完整流程。

核心约束三条：
1. **技术栈锁定**：Vite + TailwindCSS + Vanilla JS + HTML，禁止引入其他框架
2. **大文件保护**：单文件超过 150 行必须拆分，禁止整块读写
3. **上下文保护**：新页面开始前强制 /compact，超过 80% 立即 /compact

设计产出由专用 skill 负责，本 skill 负责门控推进与执行纪律。

---

## Gate 系统

每个阶段是一个 Gate，只有用户明确确认才能进入下一个 Gate。

LLM 在每次响应前必须先判断当前处于哪个 Gate，输出当前 Gate 名称，再继续执行。

```
GATE-1: 需求确认 & 素材收集  → 用户确认后进入 GATE-2
GATE-2: 方案输出             → 用户确认后进入 GATE-3
GATE-3: 开发代码落地         → 完成后进入 GATE-4
GATE-4: 自检验收             → 通过后进入 GATE-5
GATE-5: 用户预览             → 用户确认后进入 GATE-6
GATE-6: 发布                 → 用户确认后执行
```

---

## GATE-1：需求确认 & 素材收集

### 触发
用户说"新建页面"、"做一个页面"、"设计一个 XX 页面"等。

### 强制执行
```
1. 调用 /compact（清理上下文，为新页面腾空间）
2. 加载 superpowers:brainstorming，明确以下五项：
   - 页面目标（一句话：这个页面要让用户做什么）
   - 目标用户（PC / 移动 / 两者）
   - 核心模块（列举 3-5 个区块名称）
   - 视觉参考（截图链接、竞品 URL、关键词，至少一项）
   - 文案素材（是否需要在线搜索）
3. 图片/文案素材：通过 WebSearch 在线搜索，不伪造
4. 输出"素材清单"，逐项列出已收集 / 待收集项
```

### 用户确认输出
```
[GATE-1 完成]
页面目标：<一句话>
目标平台：<PC/移动/两者>
核心模块：<列表>
素材状态：<已收集 N 项，待收集 M 项>

→ 确认后进入 GATE-2（方案输出）
```

---

## GATE-2：方案输出

### 触发
GATE-1 用户确认后。

### 强制执行
```
1. 调用 design-taste-frontend skill：
   - 输出蓝图（线框布局，文字描述为主）
   - 输出层级方案（Header / Hero / Section / Footer 等）
   - 输出配色方向（主色 / 辅色 / 背景色）
   - 输出字体方案（标题 / 正文 / 强调）
2. 调用 audit skill：检查方案的移动端适配可行性
3. 输出"方案文档"，保存到 ./docs/design-plan.md
4. 方案文档结构：
   - ## 页面目标
   - ## 布局骨架（区块顺序 + 每块核心内容）
   - ## 配色方案（色值 + 用途）
   - ## 字体方案
   - ## 交互说明（hover/动效/响应式断点）
   - ## 技术约束（Vite + TailwindCSS + JS + HTML）
```

### 禁令
- 禁止在方案阶段写任何 HTML/JS/CSS 代码
- 禁止跳过 audit 的适配检查

### 用户确认输出
```
[GATE-2 完成]
方案文档：./docs/design-plan.md
布局概览：<区块列表>
配色：<主色值>
待确认修改项：<有/无>

→ 确认后进入 GATE-3（代码落地）
```

---

## GATE-3：开发代码落地

### 触发
GATE-2 用户确认后。

### 强制执行

**Step 1：脚手架初始化**
```bash
# 读取 templates/scaffold/ 目录，使用现有脚手架
# 禁止手动创建 package.json / vite.config.js，使用模板
cp -r templates/scaffold/ ./<项目目录>/
cd <项目目录> && npm install
```

**Step 2：文件拆分规则（强制）**
```
每个区块对应一个 HTML 分片文件：
  sections/
    hero.html
    features.html
    pricing.html
    footer.html
    ...

每个区块的 JS 逻辑独立文件：
  js/
    hero.js
    nav.js
    animation.js
    ...

主文件只负责组装：
  index.html        ← 引入 sections/*.html
  main.js           ← 引入 js/*.js
  styles/main.css   ← 引入 Tailwind 配置

单文件超过 150 行 → 立即拆分，不等实现完再拆
```

**Step 3：设计实现工具链**
```
区块拆分   → 调用 frontend-design skill
视觉质量   → 调用 impeccable skill（audit → arrange / typeset / colorize / polish）
动效判断   → 根据场景选择：
             简单过渡      → CSS transition
             序列动画      → Anime.js
             滚动触发      → Motion
             复杂时间轴    → GSAP（core → timeline → scrolltrigger）
             3D场景        → Three.js
图片素材   → WebSearch 搜索 Unsplash/Pexels 链接，直接用 URL，不下载
```

**Step 4：开发顺序**
```
1. index.html 骨架（只写结构，无样式）
2. TailwindCSS 配置（主题色、字体变量写入 tailwind.config.js）
3. 区块逐个实现（每个区块：HTML → Tailwind 样式 → JS 交互）
4. 响应式适配（mobile-first，断点：sm/md/lg/xl）
5. 动效层（最后加，不影响布局调试）
```

### 禁令
- 禁止修改技术栈（不得引入 React / Vue / Bootstrap / 任何 CSS 框架）
- 禁止整块读写超过 150 行的文件
- 禁止把所有区块写在一个 HTML 文件里
- 禁止内联 style（一律用 Tailwind class 或 CSS 变量）

---

## GATE-4：自检验收

### 触发
GATE-3 代码实现完成后，自动进入。

### 强制执行
```
1. 调用 audit skill：全页面体检
2. 调用 impeccable skill：根据 audit 报告逐项修复
   - 对比度/可读性问题  → colorize
   - 间距/对齐问题      → arrange
   - 字体层级问题       → typeset
   - 视觉打磨           → polish
   - 动效问题           → animate
   - 无障碍问题         → harden
3. 响应式检查（三个断点：375px / 768px / 1280px）
4. 输出"自检报告"：
   - 已修复问题列表
   - 已确认通过项
   - 遗留已知问题（如有）
```

### 通过标准
以下全部满足才能进入 GATE-5：
- [ ] 无明显对比度问题
- [ ] 三个断点布局正常
- [ ] 无 JS 控制台报错
- [ ] 图片全部正常加载
- [ ] 交互反馈正常（hover/click）

---

## GATE-5：用户预览

### 触发
GATE-4 自检通过后。

### 强制执行
```bash
# 启动本地预览服务
cd <项目目录> && npm run dev
# 输出访问地址给用户
```

### 输出格式
```
[GATE-4 自检通过]
[GATE-5 预览就绪]

本地预览：http://localhost:5173
自检报告：./docs/qa-report.md

已修复：<N 项>
遗留问题：<有/无>

→ 预览确认无误后，告知"确认发布"进入 GATE-6
```

---

## GATE-6：发布

### 触发
用户说"确认发布"、"发布"、"上线"。

### 强制执行
```bash
# 构建产物
cd <项目目录> && npm run build

# 输出构建结果
ls -la dist/

# 可选：部署到静态托管（用户指定平台）
# Vercel:  vercel --prod
# Netlify: netlify deploy --prod --dir=dist
# GitHub Pages: 参考 scripts/deploy-gh-pages.sh
```

### 发布前最终确认
```
[GATE-6 发布确认]
构建产物：./dist/
构建大小：<X KB>
部署目标：<平台名或"本地">

→ 确认后执行部署
```

---

## 上下文保护规则

| 触发条件 | 动作 |
|---|---|
| 新页面开始（GATE-1 前） | 强制 /compact |
| 上下文超过 80% | 强制 /compact，完成后继续当前 Gate |
| 执行 /compact 或 /clear 前 | 强制输出 HANDOFF 块 |
| 从 /clear 后恢复 | 从 HANDOFF 块中读取 GATE 状态，继续执行 |

### HANDOFF 块格式
```
[CONTEXT_SAVE]
[TASK]  <当前页面名称>，处于 GATE-<N>：<Gate 名称>
[DONE]  <已完成文件列表，格式：路径 - 做了什么>
[BLOCK] <最多 3 条阻塞，格式：问题 - 原因>
[NEXT]  <下一步具体操作，精确到命令或函数名>
[REF]   <关键值：端口号、颜色变量名、API 路径等>
[GATE]  当前 Gate: <N>，下一 Gate: <N+1>，等待：<用户确认/自动>
```

---

## 大文件读写规则

```
文件行数     处理方式
< 80 行      直接读写
80-150 行    读前先看结构（函数签名），按需展开
> 150 行     禁止整块操作，必须按区块拆分后逐个处理
```

拆分触发时机：实现过程中发现单文件超过 150 行，立即暂停，先拆分再继续。

---

## 技术栈约束（不可修改）

```
构建工具：Vite（使用 templates/scaffold/ 中的模板）
样式框架：TailwindCSS（mobile-first，配置写入 tailwind.config.js）
脚本：Vanilla JS（ES Module，禁止 jQuery / lodash 等工具库）
标记：HTML5 语义化标签
图片：在线 URL（Unsplash/Pexels），禁止 base64 内嵌大图
字体：Google Fonts CDN 引入，最多 2 个字族
图标：Lucide（CDN 引入），禁止 @ant-design/icons
```

禁止引入：React / Vue / Angular / Bootstrap / Foundation / jQuery / 任何 UI 组件库。

---

## 设计 Skill 调用映射

| 阶段 | 使用 Skill | 作用 |
|---|---|---|
| GATE-2 方案 | design-taste-frontend | 蓝图、布局骨架、配色、字体 |
| GATE-2 方案 | audit | 适配可行性检查 |
| GATE-3 区块 | frontend-design | 区块拆分 + 真实前端代码 |
| GATE-3 动效 | anime.js / motion / gsap-* / three.js | 按场景选择 |
| GATE-4 自检 | audit + impeccable | 体检 + 专项修复 |
| 风格沉淀 | teach-impeccable | 把稳定风格写入长期约束 |

---

## 处罚规则（LLM 自我约束）

以下行为视为违规，发生后必须回滚并说明原因：

1. **跳过用户确认直接进入下一 Gate** — 回滚到当前 Gate，重新等待确认
2. **整块读写超过 150 行的文件** — 停止，先拆分，再继续
3. **引入禁止技术栈** — 停止，移除依赖，改用约定技术栈
4. **上下文超 80% 不 compact** — 立即输出 HANDOFF，执行 /compact
5. **伪造图片/文案素材** — 停止，改用 WebSearch 在线搜索真实素材
6. **在方案阶段写代码** — 停止，删除代码，回到方案文档输出格式

---

## 快速参考：Gate 推进口令

```
用户说                    LLM 动作
"做一个页面/新建页面"   → 强制 /compact + 进入 GATE-1
"确认需求"              → 输出 GATE-1 完成块，等待确认信号进入 GATE-2
"确认方案"              → 输出 GATE-2 完成块，进入 GATE-3
"代码完成"（自动触发）  → 进入 GATE-4 自检
"自检通过"（自动触发）  → 启动预览，进入 GATE-5
"确认发布"              → 进入 GATE-6 执行构建+部署
```
