# 命令速查表

| 命令 | 功能 | 阶段 | 是否必须 |
| :--- | :--- | :--- | :--- |
| `/impeccable init` | 初始化，生成全套产物 | 阶段 0 | 新项目必须 |
| `/impeccable document` | 存量代码反向生成 `DESIGN.md` | 阶段 0 | 存量项目必须（需手动补 PRODUCT.md） |
| `/impeccable shape` | 生成 Block Tree + Tokens | 阶段 1 | 必须 |
| `/impeccable critique` | UX 评审，输出评分 JSON | 阶段 1 | 必须 |
| `/impeccable craft` | 依据 Block Tree 构建 React 组件 | 阶段 2 | 必须 |
| `/impeccable extract` | 提取复用组件（≥2 区块或 ≥2 页面引用） | 阶段 2 | 条件触发 |
| `/impeccable live` | 浏览器实时 Token 调试（需 Git 协同） | 阶段 2 | 可选 |
| `/impeccable audit` | 全量质量检查，输出 audit.md | 阶段 3 | 必须 |
| `/impeccable harden` | 补全防御性逻辑（P0） | 阶段 4 | audit 触发时必须 |
| `/impeccable onboard` | 补全空态/首次运行流（P1） | 阶段 4 | audit 触发时必须 |
| `/impeccable layout` | 修复布局节奏（P2） | 阶段 4 | audit 触发时必须 |
| `/impeccable typeset` | 修正字体层级（P3） | 阶段 4 | audit 触发时必须 |
| `/impeccable colorize` | 修复色彩/对比度（P4） | 阶段 4 | audit 触发时必须 |
| `/impeccable animate` | 补全动效（P5） | 阶段 4 | audit 触发时必须 |
| `/impeccable delight` | 情感化细节（P6） | 阶段 4 | 条件触发 |
| `/impeccable overdrive` | 3D/粒子特效（P6） | 阶段 4 | 条件触发 |
| `/impeccable bolder` | 放大视觉强度 | 阶段 4 辅助 | 按需 |
| `/impeccable quieter` | 降低视觉强度 | 阶段 4 辅助 | 按需 |
| `/impeccable distill` | 剥离装饰保留核心 | 阶段 4 辅助 | 按需 |
| `/impeccable clarify` | 优化 UX 文案 | 阶段 4 辅助 | 按需 |
| `/impeccable adapt` | 多设备适配 | 阶段 4 辅助 | 按需 |
| `/impeccable optimize` | 性能专项优化 | 阶段 4 辅助 | Lighthouse < 90 时必须 |
| `/impeccable polish` | 终验，准备 G5_SHIP | 阶段 4 P7 | 必须 |
