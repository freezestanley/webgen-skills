---
name: webgen
description: 前端页面从需求到发布的完整 SOP skill，含 Gate 状态机强制管控。用于生成基于 Vite + React + Tailwind + antd + zustand 的前端页面项目。
depends_on:
  - greensock/gsap-skills
  - Leonxlnx/taste-skill
  - anthropics/skills
  - ofershap/tailwind-best-practices
  - emilkowalski/skills
---

# webgen — 前端页面生成 Skill

> 版本：2.0 | 适用：OpenClaw 平台 | 技术栈：Vite + React + Tailwind + antd + zustand

---

## 核心约定（最优先，违反即停止执行）

| 禁令 | 原因 |
|------|------|
| 禁止跳跃 Gate | Gate 是工程代码强制执行的，不是建议 |
| 禁止修改技术栈 | 用户要求修改时明确拒绝 |
| 禁止一次性读写 >30K 文件 | 防止 context 爆炸 |
| 禁止读取 base64 图片 | 极度消耗 context |
| 禁止图片使用 CDN URL 直接引用 | 下载图片到本地 |
| 禁止在 HANDOFF 前执行 /compact 或 /clear | 防止丢失任务状态 |
| 禁止代替用户确认 Gate | 用户确认门（G1/G2/G5/G6）必须用户口头确认 |
| 禁止一次性生成完整大页面 | 按 Block Tree 逐区块生成 |

**大文件处理协议**：
```
如果需要读取已有大文件：
  1. 读取文件前 80 行 → 总结结构
  2. 读取中间部分 → 总结逻辑
  3. 读取末尾部分 → 确认完整性
  4. 基于总结执行修改，不保留原文
```

---

## 用户需求优化

参考规则：

- 品牌/故事/About页 → Scrollytelling + GSAP ScrollTrigger
  案例:
   ```text
      页面采用 Scrollytelling（滚动叙事）手法，基于 GSAP + ScrollTrigger 实现。页面像一部纪录片，随着用户滚动，文字、图片、视觉元素沿着一条“故事发现线”层层展开，带领用户从创立初心进入设计哲学，再到关键里程碑，最后自然收束到 CTA。H5 端允许降级为顺序堆叠 + 轻量 reveal，避免强行保留桌面级重滚动编排。
   ```
- 数据/仪表盘页 → 数字滚动动效 + 图表渐入

- 产品功能页 → 微交互 + hover 状态丰富
  案例:
   ```text
      产品功能页采用微交互增强体验。每个功能模块都配有 hover 状态反馈，如按钮悬停时轻微放大、图标变色、阴影加深等。点击后有即时反馈，如加载动画、状态切换。所有交互都遵循“可预测性”原则，确保用户操作后能清晰感知结果。
   ```
- 活动/营销页 → 节奏感强的 keyframe 动画
  案例:
   ```text
      活动页采用节奏感强的 keyframe 动画，配合用户交互触发。例如: GSAP滚动动画的前进或倒退来实现叙事内容的层层展开
   ```
- 表单/工具页 → 简洁、快速响应的交互，避免过度动画
   案例:
   ```text
      表单页和工具页注重简洁和快速响应，避免过度动画。表单输入框在聚焦时有轻微的边框高亮，提交按钮在点击时有短暂的颜色变化反馈。所有交互都以提高效率为核心，确保用户能够快速完成任务。
   ```

---

## SOP 执行流程

### 控制门执行原则（运行时强制）

- 每次用户发起操作，先执行：`node scripts/gate.js status <project-path>`
- `gate.js` 的控制门是脚本强制，不是提示建议；缺少阶段产物、缺少用户确认、缺少 `--compact`、存在 BLOCKER、试图绕过 `publish.js`，都会直接失败
- 续改已有项目时，凡是新增页面、修改页面、修 bug、补样式、补交互、补文案，都视为 `development-intent`，必须先判断是否需要回退 Gate
- 用户确认门只能用用户原话推进，命令格式：`node scripts/gate.js advance <project-path> --confirm "用户确认原话"`
- 从 `G2_DESIGN` 进入 `G3_DEV` 前，必须先完成 `/compact`，推进时额外带上：`--compact`
- `G6_PUBLISH` 禁止使用 `gate.js advance` 直达 `DONE`，只能执行：`node scripts/publish.js <project-path> [--dest <dir>]`

### 启动时：读取 Gate 状态

每次用户发起操作，第一步必须执行：

```bash
node scripts/gate.js status <project-path>
```

根据返回的 `current` 决定下一步行动，不得凭记忆判断。

### 续改守卫：已有项目发生开发类请求时，必须先回到 G3_DEV

以下请求统一视为 `development-intent`：

- 新增页面
- 修改已有页面
- 修 bug
- 调整布局、样式、动画、交互、文案
- 在已有项目上继续开发

如果命中 `development-intent`，并且当前 Gate 是：

- `G5_PREVIEW`
- `G6_PUBLISH`
- `DONE`

则必须先执行：

```bash
node scripts/gate.js reopen-dev <project-path> --reason "<用户本次修改意图>"
```

执行 `reopen-dev` 之后，Gate 必须回到 `G3_DEV`，然后重新按：

```text
G3_DEV -> G4_AUDIT -> G5_PREVIEW
```

继续推进。禁止先写代码、后补 Gate。

---

### G0_INIT → G1_REQUIREMENTS：项目初始化

**触发**：用户说"新建页面"、"开始一个新项目"

**执行步骤**：
1. 询问项目名称（如未提供）
2. 执行初始化：`node scripts/init-project.js <name>`
3. 打开 `.webgen/requirements.md`，引导用户逐项填写
4. 填写完成后，**等待用户口头确认**："需求确认完毕，可以进入方案阶段"
5. 用户确认后：`node scripts/gate.js advance <project-path> --confirm "需求确认完毕，可以进入方案阶段"`

**LLM 检查清单**（推进前逐项核实）：
- [ ] 页面名称已填写
- [ ] 业务目标已填写
- [ ] 核心功能列表不为空
- [ ] 验收标准已填写

---

### G1_REQUIREMENTS → G2_DESIGN：方案输出

**进入前强制执行 `/compact`（新页面设计前必须）**

**执行步骤**：
0. 执行`/impeccable init`
1. 读取 `.webgen/requirements.md`（分块读取，超 30K 先总结）
2. 强制准守 `references/design-skill-guide.md` 的设计流程
3. 生成以下内容，写入 `.webgen/design.md`：
   - Block Tree（区块树）
   - Design Tokens（颜色/间距/字体）
   - 布局骨架（响应式断点策略）
   - 组件清单（antd 组件 + 自定义组件）
   - 路由设计（react-router-dom）
   - 状态管理（zustand store 设计）
   - API 代理配置（vite proxy）
4. 向用户展示方案摘要，**等待用户口头确认**
5. 用户确认后：`node scripts/gate.js advance <project-path> --confirm "方案确认通过，可以进入开发阶段" --compact`


---

### G2_DESIGN → G3_DEV：代码落地

**执行步骤**：
1. 执行 `/impeccable extract`提炼、抽取成可复用的设计资产（如组件、设计令牌等），沉淀到 `.webgen/design.md`
2. 推进：`node scripts/gate.js advance <project-path>`


---

### G3_DEV → G4_AUDIT：自检验收

**执行步骤**：

#### 步骤 0：运行时验证（必须先通过，否则禁止继续）

使用 MCP chrome-devtools 工具执行，不得跳过：

```
1. 在后台启动 dev server：
   cd <project-path> && npm run dev &
   等待端口就绪

2. 调用 navigate_page 打开页面

3. 调用 take_screenshot() 确认：
   - 页面有可见内容（无白屏）
   - 无明显布局崩溃

4. 调用 list_console_messages(types=["error"]) 抓取控制台错误
   - console.error 数量必须为 0
   - 如有错误：逐条记录到 audit.md 的「运行时错误」章节，标记 [P0]，立即回退修复

5. 将运行时验证结论写入 audit.md：
   ## 运行时验证
   - 截图：[PASS/FAIL]
   - console.error 数量：<N>（必须为 0 才能继续，兼容 `:` / `：`）
   - 结论：[PASS/BLOCKED]（兼容 `:` / `：`）
```

**任意项 FAIL → 禁止进入静态 Audit，必须先修复再重跑步骤 0。**

#### 步骤 1：静态 Audit

1. 逐项执行 `references/phase3-audit.md` 的 Audit 清单
2. 将结果写入 `.webgen/audit.md`
3. 如有 BLOCKER：
   - `node scripts/gate.js block <project-path> "<问题描述>"`
   - 修复后：`node scripts/gate.js unblock <project-path>`
4. 无 BLOCKER 后推进：`node scripts/gate.js advance <project-path>`

---

### G4_AUDIT → G5_PREVIEW：用户预览

**执行步骤**：
1. 直接启动开发服务器并在浏览器最大化并在内打开页面,给用户预览追问是否可发布或修改意见：
   ```bash
   cd <project-path> && npm install && npm run dev
   # → http://localhost:5173
   ```
2. 开发完成后，必须明确对用户说：
   `开发完毕，请在浏览器预览 http://URL 地址，确认后说“预览通过，可以发布”`
3. **等待用户在浏览器预览并口头确认**："预览通过，可以发布"
4. 用户确认后：
  `node scripts/gate.js advance <project-path> --confirm "预览通过，可以发布"`

---

### G5_PREVIEW → G6_PUBLISH → DONE：发布

**执行步骤**：
1. 执行 `npm run build`，必要时再执行 `npm run preview` 并在浏览器或 CDP 中打开页面，向用户确认是否发布
2. **等待用户口头确认发布**
3. 执行：`node scripts/publish.js <project-path> [--dest <dir>]`
4. `publish.js` 构建成功后自动推进 Gate 到 DONE
5. 告知用户构建产物路径

---

## context 容量管控

**/compact 前必须执行 HANDOFF 协议**（见全局规则）

| 阈值 | 动作 |
|------|------|
| 80% | 中断当前操作，先自动执行 /compact |
| 进入 G3_DEV 前 | 强制自动执行 /compact |

自动/compact后自动读取HANDOFF恢复任务

---

## 多页面项目管理

每个页面/子项目独立 `.webgen/`，互不干扰：

```
projects/
  landing-page/
    .webgen/gate.json   # 独立 Gate 状态
  dashboard/
    .webgen/gate.json   # 独立 Gate 状态
  login/
    .webgen/gate.json   # 独立 Gate 状态
```

---

## 参考文档索引

- Gate 状态机详细规范：`references/gate-fsm.md`
- 页面设计规范：`references/design-skill-guide.md`
- 技术栈 scaffold 使用：`references/scaffold-setup.md`
- 全局配置变量：`config.js`


## 安装前置条件：

安装依赖技能,如解析失败请手动安装
- `npx skills add https://github.com/greensock/gsap-skills`
- `npx impeccable skills install -y --providers=openclaw,claude,codex --scope=user`
- `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"`
- `npx skills add anthropics/skills --skill frontend-design`
- `npx skills add ofershap/tailwind-best-practices`
- 默认输出目录由 `config.js` 的 `OUTPUT_DIR` 控制，仓库默认值为相对路径 `projects/`
