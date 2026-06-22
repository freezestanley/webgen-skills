# 阶段 0：项目初始化（Setup）

**触发时机**：新项目启动，或旧项目首次接入本工作流。
**Gate**：G0_SETUP → 准出后进入 G1_REQ。

---

## 执行命令

| 场景 | 命令 | 说明 |
| :--- | :--- | :--- |
| **全新项目** | `/impeccable init` | 生成 `PRODUCT.md`、`DESIGN.md`、`requirements.md` 模板，配置 Live 预览 |
| **存量项目** | `/impeccable document` | 扫描现有代码生成 `DESIGN.md`；**`PRODUCT.md` 必须手动补写**（命令无法反推产品目标） |

---

## 产物清单（全项目生命周期）

```text
./
├── PRODUCT.md                   # 产品目标、用户画像、3~5 个核心用户故事
├── DESIGN.md                    # 设计原则、Design Tokens、技术栈声明、布局规范
├── requirements.md              # 需求文档（模板填写，G1 准出需 Git 注明 req-confirmed）
└── .webgen/
    ├── live.config.js           # Live 预览配置（init 自动生成）
    ├── gate-check.sh            # Gate 检查脚本
    ├── shape-output.md          # Block Tree + Design Tokens（shape 命令生成）
    ├── critique-score.json      # UX 评审评分（critique 命令生成）
    ├── audit.md                 # 审计报告（audit 命令生成）
    └── docs/
        ├── layout-patterns.md
        ├── component-variants.md
        └── token-decisions.md
```

---

## 技术栈前置声明

**写任何 UI 代码前，必须在 `DESIGN.md` 中完成以下声明：**

```yaml
# DESIGN.md 技术栈声明区
framework:  react | nextjs           # 默认 Next.js，RSC 优先
styling:    tailwind-v3 | tailwind-v4 # 必须指定版本；v4 用 @tailwindcss/postcss，不用 tailwindcss plugin
icons:      @phosphor-icons/react | @radix-ui/react-icons
font:       Geist | Satoshi | Cabinet Grotesk | Outfit   # 禁止 Inter
typescript: true | false             # true 时配置 tsconfig，准出含 type-check 零 error
animation:  none | tailwind | framer-motion | gsap       # 按 MOTION_INTENSITY 决定
```

> **依赖验证（强制）**：任何命令执行前检查 `package.json`，库缺失时先输出安装命令再输出代码，禁止假设库存在。

---

## G0 校验脚本

```bash
[ -f PRODUCT.md ] && grep -q "用户故事" PRODUCT.md || exit 1
[ -f DESIGN.md ]  && grep -q "primary:"  DESIGN.md  || exit 1
[ -f .webgen/live.config.js ]                       || exit 1
```
