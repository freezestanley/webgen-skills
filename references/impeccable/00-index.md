# Impeccable 工作流索引

> **适用范围**：从项目初始化到交付上线的全链路工作流，融合 `/impeccable` 命令集与 `design-taste-frontend` 高品质设计规范。
>
> **核心原则**：设计先行 → 结构化构建 → 自动化审计 → 命令化精雕。

---

## 调用时序

```
init → shape → critique → craft
                           ↳ (bolder / colorize / layout 穿插)
                           ↓
               harden + onboard
                           ↓
                         audit
                           ↓
                        polish → Ship
```

---

## 子文件目录

| 文件 | 内容 | 关键词 |
| :--- | :--- | :--- |
| [01-design-taste-baseline.md](./01-design-taste-baseline.md) | 设计口味三维度基准值 + 全局禁令 | DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY |
| [02-gate-control.md](./02-gate-control.md) | G0~G5 Gate 表 + 脚本机制 + 异常路径 | Gate / 准出条件 / hotfix / accepted-risk |
| [03-phase0-setup.md](./03-phase0-setup.md) | 阶段 0：项目初始化，产物清单，技术栈声明 | init / document / DESIGN.md / package.json |
| [04-phase1-define.md](./04-phase1-define.md) | 阶段 1：shape + critique，Block Tree，Design Tokens | shape / critique / 评分 JSON / 多页策略 |
| [05-phase2-build.md](./05-phase2-build.md) | 阶段 2：craft + extract，文件结构，代码规范 | craft / extract / 交互状态 / RSC |
| [06-phase3-audit.md](./06-phase3-audit.md) | 阶段 3：audit 审计维度清单 + AI 反模式检测 | audit / Lighthouse / grep 检查 |
| [07-phase4-polish.md](./07-phase4-polish.md) | 阶段 4：精雕流水线 + harden 代码规范 + 辅助命令 | harden / polish / P0~P7 优先级 |
| [08-knowledge.md](./08-knowledge.md) | 知识沉淀规则 + 多人协作说明 | docs / token-decisions / 归档 |
| [09-commands.md](./09-commands.md) | 全命令速查表 | 所有 /impeccable 命令 |

---

## 阅读路径

- **快速执行**：`02-gate-control` → 对应阶段子文件 → `09-commands`
- **新项目启动**：`03-phase0-setup` → `04-phase1-define` → `05-phase2-build`
- **设计品质对齐**：`01-design-taste-baseline` → `06-phase3-audit`
- **问题修复**：`06-phase3-audit`（找问题）→ `07-phase4-polish`（找命令）
