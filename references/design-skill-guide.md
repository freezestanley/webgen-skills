# 页面设计规范（4 阶段）

> 仅在 Gate = G2_DESIGN 阶段执行，产出写入 .webgen/design.md

---

## 阶段 1：定义与意图（design-taste-frontend）

**触发时机**：收到用户确认的 requirements.md 后

**产出物**：
1. **Block Tree（区块树）**：页面语义区块的层级结构，用缩进表示父子关系
2. **Design Tokens（设计变量）**：颜色系统、间距规律、字体规范

### Block Tree 格式示例

```
Page: 用户登录页
  ├── Header（顶部导航）
  │   ├── Logo
  │   └── 返回首页链接
  ├── Hero（主视觉区）
  │   ├── 插图
  │   └── 标语文案
  ├── FormSection（表单区）
  │   ├── 标题
  │   ├── 邮箱输入
  │   ├── 密码输入
  │   ├── 记住我 + 忘记密码
  │   └── 登录按钮
  └── Footer（底部）
      └── 注册引导文案
```

### Design Tokens 格式示例

```yaml
colors:
  primary: "#1677FF"       # antd blue-6
  bg: "#F5F7FA"
  text-main: "#1A1A1A"
  text-sub: "#8C8C8C"

spacing:
  section-gap: "48px"
  form-gap: "16px"

typography:
  heading: "24px / 700"
  body: "14px / 400"
  caption: "12px / 400"
```

---

## 阶段 2：结构落地（frontend-design）

**触发时机**：Block Tree 和 Design Tokens 确认后

**执行规则**：
- 按 Block Tree 逐个区块生成 React 组件
- 组件文件放 `sections/`（页面级）或 `js/components/`（复用级）
- 单文件不超过 30K，超出拆分
- 样式优先用 Tailwind utility class，抽象 antd 组件变体

**文件命名规范**：
```
sections/
  HeroSection.jsx
  FormSection.jsx
  HeaderSection.jsx
js/
  components/
    LoginForm.jsx
    Logo.jsx
  store/
    authStore.js
  api/
    authApi.js
  App.jsx
  router.jsx
```

---

## 阶段 3：全面体检（Audit）

**触发时机**：代码落地完成（G4_AUDIT），产出写入 .webgen/audit.md

### 适配体检清单

```
响应式断点：
  [ ] sm (640px)：移动端排版正确
  [ ] md (768px)：平板布局
  [ ] lg (1024px)：桌面默认
  [ ] xl (1280px)：宽屏适配

移动端手势：
  [ ] 触摸滚动顺畅
  [ ] 无双击缩放问题（viewport meta 已设置）

弹性盒健壮性：
  [ ] 长文本不溢出（使用 truncate / break-words）
  [ ] 图片有 aspect-ratio 保护
  [ ] 列表 Empty 状态有占位
```

### 动画选型规则

| 场景 | 选择 | 原因 |
|------|------|------|
| 简单 hover/transition | Tailwind transition | 零依赖 |
| 组件进出场动画 | framer-motion（按需引入） | 轻量，声明式 |
| 复杂时间轴动画 | GSAP | 精确控制 |
| 3D 场景 | Three.js | 专用 |

**默认选 Tailwind transition，不引入额外动画库，除非需求明确要求**

---

## 阶段 4：专项精雕（Impeccable）

**触发时机**：Audit 发现问题后，针对性修复

### 工具箱

| 工具 | 作用 | 触发条件 |
|------|------|----------|
| arrange | 修复布局错位 | Audit 发现 flex/grid 问题 |
| typeset | 修复排版 | 字号/行高/截断问题 |
| colorize | 修复颜色 | 对比度不足，颜色不一致 |
| polish | 视觉细节提升 | 整体通过但视觉粗糙 |
| harden | 边缘防御 | 空状态/长文本/Loading 缺失 |

### harden 必做项

```jsx
// 1. 空数据状态
{list.length === 0 && <Empty description="暂无数据" />}

// 2. Loading 骨架屏
{loading ? <Skeleton active /> : <Content />}

// 3. 长文本截断
<p className="truncate max-w-xs">{text}</p>

// 4. 图片加载失败
<img src={src} onError={(e) => e.target.src = fallbackImg} />
```

---

## 知识沉淀规则

每次满意的方案完成后，提炼到 `.webgen/docs/` 下的专项文档：

```
docs/
  layout-patterns.md     # 本项目使用的布局模式
  component-variants.md  # antd 组件定制配置
  token-decisions.md     # Design Token 决策记录
```
