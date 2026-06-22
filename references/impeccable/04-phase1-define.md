# 阶段 1：定义与意图（Define）

**触发时机**：G1_REQ 准出通过，进入 G2_DESIGN。
**目标**：不写任何 UI 代码，完成页面结构的逻辑推演。

---

## 执行命令（顺序执行）

### 第一步：`/impeccable shape`

- 读取 `PRODUCT.md`、`DESIGN.md`、`requirements.md`。
- 根据页面类型，加载对应的灵感参考文件，作为 Block Tree 的起点参照：

  | 页面类型 | 加载文件 |
  | :--- | :--- |
  | 宣传类 / Landing / 品牌页 | `references/design/Landing.md` |
  | 后管系统 / Dashboard | `references/design/admin.md` |
  | 表单 / 登录 / 注册 | `references/design/form.md` |

  加载后执行两步提取：
  1. 提取模板中的**设计拨盘值**（`DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY`）作为 Design Tokens 的初始范围。
  2. 提取模板中的**规则清单**，追加至 critique 的约束条件。

- 指定目标页面范围（单页 or 全站，多页项目需逐页执行）。
- 输出 Block Tree + Design Tokens YAML，写入 `.webgen/shape-output.md`。

**Block Tree 是唯一事实来源**：critique 和 craft 均以此文件为输入。需要调整时，修改 shape 的 prompt 重新生成，禁止手动修改文件后再运行 shape（会被覆盖）。

### 第二步：`/impeccable critique`

- 对 `.webgen/shape-output.md` 进行 UX 评审。
- 输出评分 JSON 写入 `.webgen/critique-score.json`：

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

**通过标准**：`total ≥ 75`，且每个维度 `score / max ≥ 0.6`。

**不通过处理**：根据 `issues` 修改 shape prompt，重新运行，最多迭代 3 次。3 次后仍不通过，在 `requirements.md` 备注原因，人工决策是否降低阈值。

---

## Block Tree 规范

```text
Page: 用户登录页  [version: 1.2]
  ├── Header（顶部导航）
  │   ├── Logo
  │   └── 返回首页链接
  ├── Hero（主视觉区）[布局：左右分屏，DESIGN_VARIANCE=8]
  │   ├── 左：标语文案 + 登录表单区
  │   └── 右：品牌插图（aspect-ratio 保护）
  ├── FormSection（表单区）[抽象边界：≥2 页面复用时 extract]
  │   ├── 邮箱输入
  │   ├── 密码输入
  │   ├── 记住我 + 忘记密码
  │   └── 登录按钮（Tactile Feedback：active 时 scale-[0.98]）
  └── Footer（底部）
      └── 注册引导文案
```

**约束**：
- 嵌套深度不超过 5 层（禁止将复杂度藏入配置对象规避限制）
- 共享组件标注 `[shared]`，全站 Block Tree 索引时统一识别
- 版本号随每次 shape 重新生成自动递增

---

## Design Tokens 规范

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

---

## 多页项目策略

- 10 页以上：先 shape 生成**全站 Block Tree 索引**，再逐页细化。
- Design Tokens 全站统一，禁止每页各自定义色值。
- 全站索引中标注 `[shared]` 的组件，shape 时即识别，避免后期 extract 混乱。

---

## G2 校验

```bash
[ -f .webgen/shape-output.md ]     || exit 1
node -e "
  const s = require('./.webgen/critique-score.json');
  if (!s.passed) process.exit(1);
"
```
