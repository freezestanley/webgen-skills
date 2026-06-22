---
name: webgen
description: 前端页面从需求到发布的完整 SOP skill，含 Gate 状态机强制管控。用于生成基于 Vite + React + Tailwind + antd + zustand 的前端页面项目。
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
| 禁止下载图片到本地 | 使用 CDN URL 直接引用 |
| 禁止在 HANDOFF 前执行 /compact 或 /clear | 防止丢失任务状态 |
| 禁止代替用户确认 Gate | 用户确认门（G1/G2/G5/G6）必须用户口头确认 |
| 禁止一次性生成完整大页面 | 按 Block Tree 逐区块生成 |

---

## SOP 执行流程

### 控制门执行原则（运行时强制）

- 每次用户发起操作，先执行：`node scripts/gate.js status <project-path>`
- `gate.js` 的控制门是脚本强制，不是提示建议；缺少阶段产物、缺少用户确认、缺少 `--compact`、存在 BLOCKER、试图绕过 `publish.js`，都会直接失败
- 用户确认门只能用用户原话推进，命令格式：`node scripts/gate.js advance <project-path> --confirm "用户确认原话"`
- 从 `G2_DESIGN` 进入 `G3_DEV` 前，必须先完成 `/compact`，推进时额外带上：`--compact`
- `G6_PUBLISH` 禁止使用 `gate.js advance` 直达 `DONE`，只能执行：`node scripts/publish.js <project-path> [--dest <dir>]`

### 启动时：读取 Gate 状态

每次用户发起操作，第一步必须执行：

```bash
node scripts/gate.js status <project-path>
```

根据返回的 `current` 决定下一步行动，不得凭记忆判断。

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
1. 读取 `.webgen/requirements.md`（分块读取，超 30K 先总结）
2. 参考 `references/design-skill-guide.md` 的 4 阶段规范
3. 生成以下内容，写入 `.webgen/design.md`：
   - Block Tree（区块树）
   - Design Tokens（颜色/间距/字体）
   - 布局骨架（响应式断点策略）
   - 组件清单（antd 组件 + 自定义组件）
   - 路由设计（react-router-dom）
   - 状态管理（zustand store 设计）
   - API 代理配置（vite proxy）
4. 向用户展示方案摘要，**等待用户口头确认**
5. 先执行 `/compact`
6. 用户确认后：`node scripts/gate.js advance <project-path> --confirm "方案确认通过，可以进入开发阶段" --compact`

---

### G2_DESIGN → G3_DEV：代码落地

**执行步骤**：
1. 读取 `.webgen/design.md` 的 Block Tree 和组件清单
2. 按以下顺序逐步落地（每步完成才进行下一步）：
   - a. 基础结构：`js/App.jsx` + `js/router.jsx`
   - b. 状态管理：`js/store/*.js`
   - c. API 层：`js/api/*.js`
   - d. 逐个区块：`sections/*.jsx`（从上到下）
   - e. 复用组件：`js/components/*.jsx`
3. 每个文件生成后检查文件大小，>30K 立即拆分
4. 所有文件生成完成，更新 `vite.config.js` 的 proxy 配置
5. 推进：`node scripts/gate.js advance <project-path>`

**大文件处理协议**：
```
如果需要读取已有大文件：
  1. 读取文件前 80 行 → 总结结构
  2. 读取中间部分 → 总结逻辑
  3. 读取末尾部分 → 确认完整性
  4. 基于总结执行修改，不保留原文
```

---

### G3_DEV → G4_AUDIT：自检验收

**执行步骤**：
1. 逐项执行 `references/design-skill-guide.md` 的 Audit 清单
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
2. **等待用户在浏览器预览并口头确认**："预览通过，可以发布"
3. 用户确认后：
  `node scripts/gate.js advance <project-path> --confirm "预览通过，可以发布"`

---

### G5_PREVIEW → G6_PUBLISH → DONE：发布

**执行步骤**：
1. 执行`npm run build && npm run preview`并在浏览器最大化并在内打开页面，向用户确认是否发布
2. **等待用户口头确认发布**
3. 执行：`node scripts/publish.js <project-path> [--dest <dir>]`
4. `publish.js` 构建成功后自动推进 Gate 到 DONE
5. 告知用户构建产物路径

---

## context 容量管控

| 阈值 | 动作 |
|------|------|
| 80% | 中断当前操作，先执行 /compact |
| 进入 G3_DEV 前 | 强制执行 /compact |

**/compact 前必须执行 HANDOFF 协议**（见全局规则）

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
- 页面设计 4 阶段规范：`references/design-skill-guide.md`
- 技术栈 scaffold 使用：`references/scaffold-setup.md`
- 全局配置变量：`config.js`
