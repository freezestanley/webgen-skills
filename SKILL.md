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
**项目仓库路径**
`config.js` 的 `OUTPUT_DIR` 控制输出目录，仓库默认值为相对路径 `projects/`

---

## 用户需求优化

优先参考 `references/design-patterns.md`需求经验

此节用于 **页面类型路由**，不是固定视觉处方。先判断页面类型，再决定是否强制接入 Taste Skill、选择哪个模块、三枚旋钮建议区间，以及动效上限。所有案例都属于候选策略，不是必须输出。


### Taste 接入等级

- **强制接入 Taste**
  - Landing Page
  - 品牌官网
  - 品牌/故事/About/类ppt 页
  - 活动/营销页
  - 老项目 UI 改版
- **建议接入 Taste**
  - 产品功能页
  - 登录 / 注册 / onboarding
- **轻量接入或可选**
  - 数据/仪表盘页
  - 表单/工具页
  - 设置 / 管理页

### 模块路由与三枚旋钮建议

- **品牌/故事/About/类ppt 页**
  - 模块优先：`design-taste-frontend`
  - 高叙事、高实验要求时：`gpt-taste`
  - 建议旋钮：`DESIGN_VARIANCE 6-8`，`MOTION_INTENSITY 5-7`，`VISUAL_DENSITY 2-4`
  - 候选策略：若 brief 明确强调品牌历程、沉浸叙事、纪录片式表达，可选 `Scrollytelling + GSAP ScrollTrigger`；若 brief 偏克制，则降级为分段叙事 + 轻量 reveal

- **活动/营销页**
  - 模块优先：`gpt-taste`
  - 建议旋钮：`DESIGN_VARIANCE 7-9`，`MOTION_INTENSITY 6-8`，`VISUAL_DENSITY 2-4`
  - 候选策略：允许更强节奏感与关键帧动画，但必须服从 brief，不得默认落入 AI 紫色渐变和无意义漂浮装饰

- **产品功能页**
  - 模块优先：`design-taste-frontend`
  - 需要补齐加载态、错误态、按钮反馈时：`ux-interaction-taste-skill`
  - 建议旋钮：`DESIGN_VARIANCE 4-6`，`MOTION_INTENSITY 3-5`，`VISUAL_DENSITY 4-5`
  - 候选策略：默认微交互、hover 状态、结构清晰；不默认使用重滚动或强叙事布局

- **数据/仪表盘页**
  - 默认轻量接入 Taste
  - 模块优先：`ux-interaction-taste-skill`
  - 建议旋钮：`DESIGN_VARIANCE 2-4`，`MOTION_INTENSITY 2-4`，`VISUAL_DENSITY 5-7`
  - 候选策略：强调信息优先、图表渐入、数字反馈；禁止为了“好看”牺牲密度和可扫读性

- **表单/工具页**
  - 默认轻量接入 Taste
  - 模块优先：`ux-interaction-taste-skill`
  - 建议旋钮：`DESIGN_VARIANCE 2-4`，`MOTION_INTENSITY 1-3`，`VISUAL_DENSITY 5-7`
  - 候选策略：保持简洁、快速响应、反馈明确；动效只服务状态变化，不服务炫技

- **老项目改版**
  - 模块优先：`redesign-existing-projects`
  - 建议旋钮：以原站基线为起点，`DESIGN_VARIANCE +1~2`，`MOTION_INTENSITY +1`，`VISUAL_DENSITY` 按现有信息架构保持
  - 候选策略：优先修复布局、间距、层级、组件气质，避免整站重写式审美漂移

- **图稿还原**
  - 模块优先：`image-to-code`
  - 候选策略：先还原，再做最小必要的响应式和交互修正，不要借机替换设计语言

### Taste 输出协议

对于强制或建议接入 Taste 的页面，在写代码前必须先完成：

1. 一句 `Design Read`
2. 模块选择（如 `design-taste-frontend` / `gpt-taste` / `redesign-existing-projects`）
3. 三枚旋钮设定：
   - `DESIGN_VARIANCE`
   - `MOTION_INTENSITY`
   - `VISUAL_DENSITY`
4. 字体系统声明（禁止默认使用 Inter）
5. Tailwind 基础色调声明
6. Anti-Slop 禁令锁定（如禁止 AI 紫色大渐变、无意义徽章、无意义 `SECTION 01` 标签）

---

## SOP 执行流程

### 控制门执行原则（运行时强制）

- 每次用户发起操作，项目发现必须先走脚本；入口命令固定为：`node scripts/list-projects.js --limit 5 --offset 0`
- 只有通过脚本解析出目标项目后，才允许执行：`node scripts/gate.js status <project-path>`
- `gate.js` 的控制门是脚本强制，不是提示建议；缺少阶段产物、缺少用户确认、缺少 `--compact`、存在 BLOCKER、试图绕过 `publish.js`，都会直接失败
- 续改已有项目时，凡是新增页面、修改页面、修 bug、补样式、补交互、补文案，都视为 `development-intent`，必须先判断是否需要回退 Gate
- 用户确认门只能用用户原话推进，命令格式：`node scripts/gate.js advance <project-path> --confirm "用户确认原话"`
- 从 `G2_DESIGN` 进入 `G3_DEV` 前，必须先完成 `/compact`，推进时额外带上：`--compact`
- `G6_PUBLISH` 禁止使用 `gate.js advance` 直达 `DONE`，只能执行：`node scripts/publish.js <project-path> [--dest <dir>]`

### 启动时：先脚本发现项目，再读取 Gate 状态

每次用户发起操作，入口顺序固定，不得交换。第一步必须执行：

```bash
node scripts/list-projects.js --limit 5 --offset 0
```

执行要求：

1. 无论用户是否已经提供项目名，都必须先展示脚本返回的最近 5 个项目；不得靠 prompt 侧扫描仓库、手工 `ls` 猜目录、或凭上下文记忆推断项目路径
2. 项目发现与分页只能以脚本返回的 `limit`、`offset`、`hasMore` 为准；`查看更多项目` 只是用户触发翻页的一个示例，不是分页判断依据
3. 如果用户在本轮请求中明确给出项目名，展示最近 5 个项目后，必须立即解析项目路径：

```bash
node scripts/resolve-project.js --name "<project-name>"
```

4. 只有 `resolve-project.js` 返回明确的 `<project-path>` 后，才能执行：

```bash
node scripts/gate.js status <project-path>
```

5. 如果用户没有给出项目名，而是要求继续翻页（例如点击或输入 `查看更多项目`），只有上一页返回 `hasMore=true` 时才允许继续请求下一页；下一页命令必须延续同一分页契约：

```bash
node scripts/list-projects.js --limit <上一页 limit> --offset <下一页 offset>
```

6. 如果首屏列表为空，或分页后确认没有目标项目，必须明确告知当前没有可续改项目，并回退到新建项目引导；不得伪造项目路径或跳过发现流程
7. 根据返回的 `current` 决定下一步行动，不得凭记忆判断

项目发现必须以脚本输出为准，不得在 prompt 侧扫描。

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

**触发**：用户说"新建页面"、"开始一个新项目"，或上一节项目发现已确认当前没有可续改项目

**执行步骤**：
1. 进入创建引导；如果是由上一节“当前没有可续改项目”的结论回退到这里，沿用该结论即可，不再重复另一套空列表话术
2. 询问项目名称（如未提供）
3. 执行初始化：`node scripts/init-project.js <name>`
4. 打开 `.webgen/requirements.md`，逐项向用户提问，由用户提供每一项内容；禁止直接自行生成任何字段；仅当用户明确表示"无法提供"或"跳过"时，才允许自动填充该项
5. 所有字段确认完毕后，**等待用户口头确认**："需求确认完毕，可以进入方案阶段"
6. 用户确认后：`node scripts/gate.js advance <project-path> --confirm "需求确认完毕，可以进入方案阶段"`

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

**截图预算规则**：

- `G3_DEV -> G4_AUDIT` 默认最多 2 张截图
- 第 1 张用于整页或首屏可用性确认
- 第 2 张仅用于关键模块或问题区域复查
- Taste 审美检查默认复用这 2 张截图，不得额外开启截图循环
- 如代码和已有截图仍无法判断，可额外补 1 张局部截图
- 单次页面任务常规总预算 3 张，绝对上限 4 张；达到上限后必须停止截图并总结剩余不确定项

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
   cd <project-path> && npm install && npm run dev && npm run build
   node scripts/persist-preview-dist.js <project-path>
   # → http://localhost:5173
   ```
2. 开发完成后，必须明确对用户说：
   `开发完毕，请在浏览器预览 http://URL 地址，确认后说“预览通过，可以发布”`
   紧接着原样输出第二行发布标记（可通过 `node scripts/emit-publish-marker.js <project-path>` 生成）：
   `##publishEtart##项目名称|项目描述|作者|dist路径##publishEnd##`
3. 必须追问用户是否确认要发布；未确认前不得进入发布阶段
4. **等待用户在浏览器预览并口头确认**："预览通过，可以发布"
5. 用户确认后：
  `node scripts/gate.js advance <project-path> --confirm "预览通过，可以发布"`

---

### G5_PREVIEW → G6_PUBLISH → DONE：发布

**执行步骤**：
1. 执行 `npm run build`，必要时再执行 `npm run preview` 并在浏览器或 CDP 中打开页面
2. 明确追问用户是否确认要发布；未得到确认前不得执行发布
   按次询问:`开发完毕，请在浏览器预览 http://URL 地址，确认后说“预览通过，可以发布”`
   紧接着原样输出第二行发布标记（可通过 `node scripts/emit-publish-marker.js <project-path>` 生成）：
   `##publishEtart##项目名称|项目描述|作者|dist路径##publishEnd##`
3. 执行：`node scripts/publish.js <project-path> [--dest <dir>]`
4. `publish.js` 构建成功后自动推进 Gate 到 DONE，并再次输出最终发布标记
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
