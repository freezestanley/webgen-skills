# 阶段 4：专项精雕（Polish & Harden）

**触发时机**：`.webgen/audit.md` 生成后，按优先级顺序修复。

---

## 修复流水线

**禁止跳级**：优先级数字越小越先处理，P0 未解决禁止执行 P1 及更高编号命令。

| 优先级 | 分类 | 命令 | audit 触发条件 |
| :--- | :--- | :--- | :--- |
| P0 | 健壮性/边缘情况 | `/impeccable harden` | Empty/Loading/Error 状态缺失、长文本溢出、图片无降级 |
| P1 | 新用户引导 | `/impeccable onboard` | 首次运行流缺失、Empty States 无设计 |
| P2 | 布局与节奏 | `/impeccable layout` | 间距不均、对齐错位、居中 Hero 违规 |
| P3 | 排版与层级 | `/impeccable typeset` | Inter 使用、字号体系混乱 |
| P4 | 色彩与品牌 | `/impeccable colorize` | 对比度不足、AI 紫色渐变、纯黑使用 |
| P5 | 交互与动效 | `/impeccable animate` | MOTION_INTENSITY 对应动效缺失 |
| P6 | 情感化细节 | `/impeccable delight` | 无 P0~P5 + Lighthouse ≥ 90 + 产品明确要求 |
| P7 | 终极收尾 | `/impeccable polish` | P0~P6 全部处理完毕（已重跑 audit 验证） |

**"处理完毕"定义**：重跑 audit 后该问题不再出现；或在 `audit.md` 中登记 `accepted-risk`（原因 + 责任人）。

**polish 准出**：Lighthouse 三项硬指标（见 G5 Gate），不以"设计系统对齐度 100%"为准出条件（无客观算法）。

---

## 辅助调节命令

| 命令 | 触发场景 | 前置条件 |
| :--- | :--- | :--- |
| `/impeccable bolder` | 视觉强度不足 | audit 无 P0 |
| `/impeccable quieter` | 视觉噪音过多 | audit 无 P0 |
| `/impeccable distill` | 非必要装饰过多 | audit 无 P0 |
| `/impeccable clarify` | 文案歧义 | audit 无 P0 |
| `/impeccable adapt` | 指定设备适配（iPad/大屏） | 目标设备已确认 |
| `/impeccable optimize` | Lighthouse Performance < 90 | audit 已运行 |
| `/impeccable overdrive` | 3D/粒子特效 | delight 完成 + Performance ≥ 90 + Three.js 未与 Framer Motion 混用 |

---

## harden 防御性代码规范

**按 audit 检测结果按需插入，非全量插入。**

```tsx
// 触发：列表无空态
{list.length === 0 && (
  <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
    <Icon size={32} />  {/* Phosphor/Radix 图标，禁止 emoji */}
    <p className="text-sm">暂无数据</p>
  </div>
)}

// 触发：异步加载期间布局抖动
{loading
  ? <Skeleton className="h-[200px] w-full rounded-2xl animate-pulse bg-zinc-100" />
  : <Content />
}

// 触发：长文本溢出（确认 Tailwind line-clamp 插件已启用）
<p className="line-clamp-2 text-zinc-600">{longText}</p>

// 触发：图片无降级处理
<img
  src={src}
  alt="描述"
  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackImg;
    e.currentTarget.onerror = null; // 防止 fallback 失败时递归触发
  }}
/>

// 触发：API 无错误捕获
try {
  await api.fetchData();
} catch (error) {
  const msg = error instanceof Error ? error.message : '加载失败，请稍后重试';
  message.error(msg); // 前提：项目已安装 antd；否则替换为项目内 toast 方案
}
```
