# 设计 Skill 调用指南

## 哪个 Gate 用哪个 Skill

### GATE-2：方案阶段

**design-taste-frontend**
```
作用：输出初始蓝图、布局骨架、层级方案
调用时机：GATE-2 开始时，第一个调用
输出：布局骨架（文字描述）+ 配色方向 + 字体方向
```

**audit（方案适配检查）**
```
作用：检查方案的移动端适配可行性
调用时机：design-taste-frontend 输出后
输出：适配风险清单
```

### GATE-3：开发阶段

**frontend-design**
```
作用：区块拆分 + 真实前端页面代码
调用时机：每个区块实现前
输入：该区块的方案描述（来自 design-plan.md）
输出：该区块的 HTML + TailwindCSS class
```

### 动效选择矩阵

| 场景 | 选择 | 原因 |
|---|---|---|
| 简单 hover / 淡入淡出 | CSS transition | 零依赖，够用 |
| 元素序列入场动画 | Anime.js | 轻量，API 简洁 |
| 滚动触发动画 | Motion | ScrollTimeline 原生，轻量 |
| 复杂多步时间轴 | GSAP core + timeline | 精确控制 |
| 滚动驱动复杂动画 | GSAP + ScrollTrigger | 配合 timeline |
| React 集成动画 | GSAP React | 生命周期安全 |
| 性能优化需要 | GSAP performance | GPU 合成层 |
| 3D 场景 / WebGL | Three.js | 唯一选择 |

GSAP 使用顺序：core → timeline/scrolltrigger → react → performance
**禁止**跳过 core 直接用 ScrollTrigger。

### GATE-4：自检阶段

**audit（全页面体检）**
```
调用时机：GATE-4 开始，先于 impeccable
输出：分类问题清单（对比度/间距/字体/适配/无障碍）
```

**impeccable（专项修复）**
```
根据 audit 报告选择子工具：
- 对比度/颜色问题   → colorize
- 间距/对齐问题     → arrange
- 字体层级问题      → typeset
- 视觉打磨/细节     → polish
- 动效问题          → animate
- 无障碍/语义化     → harden
```

### 风格沉淀

**teach-impeccable**
```
调用时机：GATE-5 用户确认风格满意后
作用：把本次页面确定的风格约束写入长期记忆
场景：同一项目第 2 个以上的页面开始前先读取
```

## Lucide 图标引入方式

```html
<!-- CDN 引入 Lucide（禁止 @ant-design/icons） -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

<!-- 使用 -->
<i data-lucide="arrow-right"></i>

<script>
  lucide.createIcons();
</script>
```

## 在线图片素材

```
搜索渠道：
- Unsplash：https://unsplash.com/s/photos/<keyword>
- Pexels：https://www.pexels.com/search/<keyword>
- 直接在 HTML 中使用 CDN URL，不下载本地
```

WebSearch 搜索示例：
```
site:unsplash.com <关键词> photo
```
