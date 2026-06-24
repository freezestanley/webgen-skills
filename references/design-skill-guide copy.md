# Impeccable 前端设计开发工作流

> 本文件为索引入口，详细内容已拆分至 `references/impeccable/` 子目录。

---

## 快速入口

| 场景 | 直达文件 |
| :--- | :--- |
| 查阅完整目录与阅读路径 | [impeccable/00-index.md](./impeccable/00-index.md) |
| 页面类型灵感参考（Landing / Admin / Form） | [design/Landing.md](./design/Landing.md)、[design/admin.md](./design/admin.md)、[design/form.md](./design/form.md) |
| 设计口味基准值 + 全局禁令 | [impeccable/01-design-taste-baseline.md](./impeccable/01-design-taste-baseline.md) |
| Gate 控制 + 准出脚本 + 异常路径 | [impeccable/02-gate-control.md](./impeccable/02-gate-control.md) |
| 阶段 0：初始化 / 技术栈声明 | [impeccable/03-phase0-setup.md](./impeccable/03-phase0-setup.md) |
| 阶段 1：shape + critique / Block Tree | [impeccable/04-phase1-define.md](./impeccable/04-phase1-define.md) |
| 阶段 2：craft + 文件结构 + 交互状态 | [impeccable/05-phase2-build.md](./impeccable/05-phase2-build.md) |
| 阶段 3：audit 审计清单 + AI 反模式检测 | [impeccable/06-phase3-audit.md](./impeccable/06-phase3-audit.md) |
| 阶段 4：精雕流水线 + harden 代码规范 | [impeccable/07-phase4-polish.md](./impeccable/07-phase4-polish.md) |
| 知识沉淀 + 多人协作 | [impeccable/08-knowledge.md](./impeccable/08-knowledge.md) |
| 全命令速查表 | [impeccable/09-commands.md](./impeccable/09-commands.md) |

---

## 调用时序（一览）

```
init → shape → critique → craft
                           ↳ bolder / colorize / layout 穿插
                           ↓
               harden + onboard → audit → polish → Ship
```
