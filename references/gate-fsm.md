# Gate FSM 状态机规范

## Gate 顺序（严禁跳跃）

```
G0_INIT → G1_REQUIREMENTS → G2_DESIGN → G3_DEV → G4_AUDIT → G5_PREVIEW → G6_PUBLISH → DONE
```

## 续改已有项目的回退规则

`DONE` 不是永久免检状态。如果已有项目再次发生开发类请求，必须重新回到 `G3_DEV`。

以下情况都视为开发类请求：

- 新增页面
- 修改已有页面
- 修 bug
- 调整布局、样式、动画、交互、文案
- 在已有项目上继续开发

当项目当前 Gate 为 `G5_PREVIEW`、`G6_PUBLISH` 或 `DONE` 时，必须先执行：

```bash
node scripts/gate.js reopen-dev ./projects/my-page --reason "新增 about 页面"
```

然后重新走：

```text
G3_DEV → G4_AUDIT → G5_PREVIEW
```

完成开发、自检和用户预览确认后，才允许再次发布。

## 各 Gate 定义

| Gate | 名称 | 退出条件 | 需要用户确认 |
|------|------|----------|------------|
| G0_INIT | 项目初始化 | .webgen/ 创建完成 | 否 |
| G1_REQUIREMENTS | 需求确认 | requirements.md 完整填写，用户口头确认 | **是** |
| G2_DESIGN | 方案输出 | design.md 完整输出，用户确认 | **是** |
| G3_DEV | 代码落地 | 功能代码可运行，无语法错误 | 否 |
| G4_AUDIT | 自检验收 | audit.md 填写完成，无 BLOCKER | 否 |
| G5_PREVIEW | 用户预览 | 用户在浏览器确认 OK | **是** |
| G6_PUBLISH | 发布 | publish.js 执行成功 | **是** |
| DONE | 完成 | — | — |

## 强制规则

1. **禁止跳跃**：每次只能推进一个 Gate，`advance` 命令由工程代码控制
2. **阻塞优先**：任何阶段出现 BLOCKER，立即执行 `gate.js block`，解决后再 `unblock`
3. **用户确认门**：G1/G2/G5/G6 必须有用户的明确口头确认，LLM 不得代替用户确认；推进命令必须携带 `--confirm "用户原话"`
4. **强制 compact**：从 G2_DESIGN 进入 G3_DEV 前必须先自动HANDOFF -> 再自动执行 `/compact` -> 恢复后续任务，推进命令必须额外携带 `--compact`
5. **发布独占**：G6_PUBLISH 禁止执行 `gate.js advance`，只能运行 `publish.js` 推进到 DONE

## Gate 状态文件格式（.webgen/gate.json）

```json
{
  "project": "my-page",
  "current": "G2_DESIGN",
  "blocked": false,
  "blockReason": null,
  "history": [
    { "from": "G0_INIT", "to": "G1_REQUIREMENTS", "at": "2026-06-22T10:00:00Z" },
    { "from": "G1_REQUIREMENTS", "to": "G2_DESIGN", "at": "2026-06-22T10:30:00Z" }
  ],
  "createdAt": "2026-06-22T09:00:00Z",
  "updatedAt": "2026-06-22T10:30:00Z"
}
```

## 常用命令

```bash
# 查看当前状态
node scripts/gate.js status ./projects/my-page

# 推进到 G2（需求阶段完成后）
node scripts/gate.js advance ./projects/my-page --confirm "需求确认完毕，可以进入方案阶段"

# 推进到 G3（设计阶段完成后，先 compact）
node scripts/gate.js advance ./projects/my-page --confirm "方案确认通过，可以进入开发阶段" --compact

# 推进到 G6（预览通过后）
node scripts/gate.js advance ./projects/my-page --confirm "预览通过，可以发布"

# 已发布或待发布项目续改时，先回到 G3_DEV
node scripts/gate.js reopen-dev ./projects/my-page --reason "新增 about 页面"

# 记录阻塞
node scripts/gate.js block ./projects/my-page "audit.md 发现响应式布局 BLOCKER"

# 解除阻塞
node scripts/gate.js unblock ./projects/my-page

# 发布（仅 G6_PUBLISH 可执行，禁止 gate.js advance）
node scripts/publish.js ./projects/my-page --dest /var/www/html
```

## LLM 判断当前 Gate 的方式

每次用户发起操作时，LLM 必须先读取 `.webgen/gate.json`，判断当前所处阶段，再决定执行什么操作。判断逻辑：

```
读取 gate.json
  → blocked=true？→ 停止，告知用户解决阻塞
  → current=?
      G0: 引导用户填写 requirements.md
      G1: 确认需求完整 → 等待用户口头确认 → advance --confirm
      G2: 生成 design.md → 等待用户口头确认 → 先 compact → advance --confirm --compact
      G3: 代码落地 → 完成后 advance
      G4: 填写 audit.md → 无 BLOCKER 后 advance
      G5: 启动 dev server → 等待用户预览确认 → advance --confirm
      G6: 执行 publish.js
      DONE: 如用户继续开发，先 reopen-dev 回到 G3；否则告知用户项目已发布
```
