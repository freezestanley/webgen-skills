# 阶段 3：全面体检（Audit）

**触发时机**：G3_DEV 准出通过，进入 G4_AUDIT。

---

## 前置检查：渲染可用性验证（强制必须保证正常运行）

**在执行 audit 前必须通过，否则禁止继续。**

```text
[ ] 启动预览服务（dev/preview），在浏览器中打开目标页面
[ ] 无白屏（页面有可见内容渲染）
[ ] 无 JS 运行时报错（浏览器 Console 无红色 Error）
[ ] 无构建警告升级为运行时崩溃（如 undefined is not a function）
[ ] 所有路由/页面均可正常访问（无 404/500）
```

**任意一项未通过**：回退到开发阶段修复后，再重新进入本阶段。

---

## 执行命令

```bash
/impeccable audit
```

- 产出写入 `.webgen/audit.md`，按 P0/P1/P2/P3 分级
- 每个问题自动关联对应精雕命令（规则映射，非 AI 主观判断）

---

## 审计维度零：UI/UE

**UI/UE审计**：

- 执行 `design-taste-frontend §7 AI Tells` 检测设计反模式
- 产出写入 `.webgen/audit.md`，按 P0/P1/P2/P3 分级
- 根据检测结果进行页面优化


## 审计维度一：响应式与适配

```text
[ ] sm (640px)：移动端排版正确，无横向滚动
[ ] md (768px)：平板布局合理
[ ] lg (1024px)：桌面默认展示完整
[ ] xl (1280px)：宽屏不过度拉伸

DESIGN_VARIANCE > 4 时额外检查：
[ ] 非对称布局在 md: 以下已折叠为单列（w-full px-4）

[ ] min-h-[100dvh] 替代 h-screen（grep 检查）
[ ] 长文本有 truncate / break-words / line-clamp 保护
[ ] 图片有 aspect-ratio 或固定尺寸保护
[ ] 列表 Empty 状态有设计占位
```

---

## 审计维度二：性能（Lighthouse）

```text
[ ] Performance    ≥ 90
[ ] Accessibility  ≥ 95
[ ] Best Practices ≥ 90
```

---

## 审计维度三：动画性能

```text
[ ] 无 top/left/width/height 动画（grep 检查）
[ ] grain/noise 滤镜仅在 fixed pointer-events-none 伪元素上（禁止用于滚动容器）
[ ] 持续动画组件已隔离为独立 Client Component + React.memo
[ ] useEffect 动画含 cleanup 函数
[ ] 未直接使用 window.addEventListener('scroll')（改用 Framer Motion 或 IntersectionObserver）
```

---

## 审计维度四：AI 反模式检测（grep 可自动化）

```text
[ ] 无 Inter 字体引用
[ ] 无 #000000 纯黑
[ ] 无 AI 紫色渐变（grep: purple / violet / neon）
[ ] 无居中 Hero（DESIGN_VARIANCE > 4 时，grep justify-center 在 Hero 区块）
[ ] 无 3 等列卡片（grep grid-cols-3 在 Feature 区块）
[ ] 无 Unsplash 链接（grep unsplash.com）
[ ] 无 emoji（grep unicode emoji 范围）
[ ] 无 h-screen（grep 检查）
[ ] 无随意 z-50（非 Nav/Modal/Overlay 上下文）
```

---

## 审计维度五：动画选型（按 MOTION_INTENSITY）

| MOTION_INTENSITY | 允许 | 禁止 |
| :--- | :--- | :--- |
| 1–3 | CSS `:hover` / `:active` | 任何自动动画 |
| 4–7（当前） | Tailwind transition，framer-motion 进出场（懒加载） | `requestAnimationFrame` 手动操作 |
| 8–10 | Framer Motion hooks，GSAP（时间轴），Three.js/WebGL（3D） | GSAP + Framer Motion 混用，`window.scroll` 监听 |

**引入动画库前置条件**：

- `framer-motion`：`package.json` 已安装 + MOTION_INTENSITY ≥ 5
- `GSAP`：明确的复杂滚动/时间轴需求 + bundle 影响评估完成 + license 审核
- `Three.js`：明确 3D 需求 + Lighthouse Performance 可维持 ≥ 90 + SSR 兼容性确认

---

## 问题类型 → 精雕命令映射

| audit 问题类型 | 自动关联命令 |
| :--- | :--- |
| Empty/Loading/Error 状态缺失，图片无降级 | `/impeccable harden`（P0） |
| 首次运行流缺失，Empty States 无设计 | `/impeccable onboard`（P1） |
| 间距不均，对齐错位，居中 Hero 违规 | `/impeccable layout`（P2） |
| Inter 字体，字号体系混乱 | `/impeccable typeset`（P3） |
| 对比度不足，AI 渐变，纯黑使用 | `/impeccable colorize`（P4） |
| MOTION_INTENSITY 对应动效缺失 | `/impeccable animate`（P5） |
| Lighthouse Performance < 90 | `/impeccable optimize` |

---

## G4 校验

**前置：运行时验证必须通过（由 MCP chrome-devtools 执行，非静态检查）**

```
检查项                          工具调用                          通过条件
─────────────────────────────────────────────────────────────────────────
无白屏                          take_screenshot()                 页面有可见内容
console.error 为 0              list_console_messages(["error"])  count === 0
```

运行时验证结论必须写入 audit.md `## 运行时验证` 章节，且结论行包含 `PASS`。

**静态校验脚本**

```bash
[ -f .webgen/audit.md ] || exit 1
node -e "
  const fs = require('fs');
  const txt = fs.readFileSync('.webgen/audit.md', 'utf8');

  // 运行时验证必须存在且 PASS
  if (!/## 运行时验证/.test(txt)) {
    console.error('[G4] 缺少运行时验证章节，禁止推进');
    process.exit(1);
  }
  const runtimeSection = txt.split('## 运行时验证')[1] || '';
  if (!/console\.error 数量[：:]\s*0/.test(runtimeSection)) {
    console.error('[G4] console.error 不为 0，禁止推进');
    process.exit(1);
  }
  if (!/结论[：:]\s*PASS/.test(runtimeSection)) {
    console.error('[G4] 运行时验证结论不是 PASS，禁止推进');
    process.exit(1);
  }

  // 静态 audit 不得有 P0/P1
  if (/\[P0\]|\[P1\]/.test(txt)) {
    console.error('[G4] 存在 P0/P1 问题，禁止推进');
    process.exit(1);
  }
"
```
