# 知识沉淀规则

每次版本迭代完成后，将关键知识写入 `.webgen/docs/` 供后续复用。

---

## 产物目录

```text
.webgen/docs/
├── layout-patterns.md      # 本迭代使用的核心布局模式
├── component-variants.md   # 组件定制配置（设计口味参数影响的样式决策）
└── token-decisions.md      # Design Token 变更记录与决策依据
```

---

## 触发机制

| 方式 | 时机 | 操作 | 责任人 |
| :--- | :--- | :--- | :--- |
| **交互提示** | `/impeccable polish` 通过时 | 提示"是否更新知识库？"，输入 `y` 自动提炼 | 自动 |
| **手动补充** | G5_SHIP 后 | 补充 `token-decisions.md` 中的决策背景 | 迭代负责人 |
| **归档检测** | 下一次 `/impeccable init` 时 | **警告**（不阻断），提示上次 `.webgen/docs/` 不完整 | 自动提示，人工决定 |

> 归档检测为**警告不阻断**：知识沉淀属于质量提升项，不作为流程阻断条件，避免锁死 hotfix 或紧急迭代。

---

## 多人协作说明

- `shape-output.md`、`critique-score.json`、`audit.md` 为共享产物，修改需通过 Git commit + PR review，禁止直推主分支。
- `critique-score.json` 由命令自动生成，禁止手动修改。
- live 模式产生的 Token 变更，必须在当天 commit，禁止遗留未提交的样式漂移。
