#!/usr/bin/env node
/**
 * 初始化子项目 .webgen/ 状态目录
 *
 * 用法：node scripts/init-project.js <project-name> [output-dir]
 *
 * 执行结果：
 *   <output-dir>/<project-name>/
 *     .webgen/
 *       gate.json          # Gate 状态
 *       requirements.md    # 需求文档（待填写）
 *       design.md          # 设计方案（G2 阶段生成）
 *       audit.md           # 自检报告（G4 阶段生成）
 *     （其余文件由 scaffold 模板复制）
 */

const fs = require("fs");
const path = require("path");
// SKILL_ROOT 固定为 webgen/ 目录，不依赖 CWD
const SKILL_ROOT = path.resolve(__dirname, "..");
const config = require(path.join(SKILL_ROOT, "config"));

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const [,, projectName, outputDir] = process.argv;

if (!projectName) {
  console.error("用法：node scripts/init-project.js <project-name> [output-dir]");
  process.exit(1);
}

// OUTPUT_DIR 相对 SKILL_ROOT 展开，不依赖 CWD
const baseDir = outputDir
  ? path.resolve(outputDir)
  : path.resolve(SKILL_ROOT, config.OUTPUT_DIR);
const projectDir = path.join(baseDir, projectName);
const webgenDir = path.join(projectDir, config.WEBGEN_DIR);

// 禁止重复初始化
if (fs.existsSync(webgenDir)) {
  console.error(`[INIT] 项目已存在：${projectDir}`);
  console.error("[INIT] 如需重新初始化，请手动删除 .webgen/ 目录");
  process.exit(1);
}

// 复制 scaffold 模板
const scaffoldDir = path.join(__dirname, "../templates/scaffold");
if (fs.existsSync(scaffoldDir)) {
  copyDir(scaffoldDir, projectDir);
  console.log(`[INIT] scaffold 模板已复制到 ${projectDir}`);
} else {
  fs.mkdirSync(projectDir, { recursive: true });
  console.log(`[INIT] scaffold 模板不存在，已创建空项目目录`);
}

// 创建 .webgen/
fs.mkdirSync(webgenDir, { recursive: true });

// 初始化 gate.json
const gateState = {
  project: projectName,
  current: "G0_INIT",
  blocked: false,
  blockReason: null,
  history: [],
  workflowVersion: config.WORKFLOW_VERSION,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
fs.writeFileSync(
  path.join(webgenDir, config.GATE_FILE),
  JSON.stringify(gateState, null, 2)
);

// 初始化 requirements.md 模板
fs.writeFileSync(path.join(webgenDir, config.REQUIREMENTS_FILE), `# 需求文档 — ${projectName}

> 填写完成后，由 LLM 确认内容完整，用户口头确认后执行：
> \`node scripts/gate.js advance ${projectDir} --confirm "需求确认完毕，可以进入方案阶段"\`

## 页面名称
<!-- 例：用户登录页 -->

## 业务目标
<!-- 这个页面要解决什么问题？目标用户是谁？ -->

## 核心功能列表
<!-- 逐条列举，每条一行 -->
-

## 交互逻辑
<!-- 用户操作流程，关键状态变化 -->

## 视觉偏好
<!-- 风格参考（极简/卡片/暗色/...)，主色调，参考截图链接 -->

## 数据接口
<!-- API 路径、字段说明（如已知） -->

## 验收标准
<!-- 完成的标准是什么？ -->

## 素材需求
<!-- 需要哪些图片、图标？关键词（用于 Unsplash/Pexels 搜索） -->
`);

// 初始化 design.md 占位
fs.writeFileSync(path.join(webgenDir, config.DESIGN_FILE), `# 设计方案 — ${projectName}

> 此文件由 LLM 在 G2_DESIGN 阶段生成，先执行 /compact，再在用户确认后执行：
> \`node scripts/gate.js advance ${projectDir} --confirm "方案确认通过，可以进入开发阶段" --compact\`

## 区块树（Block Tree）
<!-- 页面语义区块层级结构 -->

## 核心设计变量（Design Tokens）
<!-- 颜色、间距、字体 -->

## 布局骨架
<!-- 响应式断点策略 -->

## 组件清单
<!-- 使用的 antd 组件 + 自定义组件 -->

## 路由设计
<!-- react-router-dom 路由规划 -->

## 状态管理
<!-- zustand store 设计 -->

## 接口代理配置
<!-- vite proxy 配置 -->
`);

// 初始化 shape-output.md 占位（G2 阶段由 /impeccable shape 填写）
fs.writeFileSync(path.join(webgenDir, config.SHAPE_FILE), `# Shape Output — ${projectName}

> 此文件由 /impeccable shape 在 G2_DESIGN 阶段生成。
> 禁止手动填写绕过 impeccable 工作流。

## Block Tree
<!-- /impeccable shape 输出 -->

## Design Tokens
<!-- /impeccable shape 输出 -->
`);

// 初始化 critique-score.json 占位（G2 阶段由 /impeccable critique 填写）
fs.writeFileSync(path.join(webgenDir, config.CRITIQUE_FILE), JSON.stringify({
  _placeholder: true,
  passed: false,
  total: 0,
  sourceSha256: "",
  dimensions: [],
  generatedAt: ""
}, null, 2));

// 初始化 audit.md 占位
fs.writeFileSync(path.join(webgenDir, config.AUDIT_FILE), `# 自检报告 — ${projectName}

> 此文件由 LLM 在 G4_AUDIT 阶段填写，无 BLOCKER 后推进到 G5_PREVIEW。

## 适配体检
- [ ] 响应式断点（sm/md/lg/xl）
- [ ] 移动端手势支持
- [ ] Flexbox/Grid 健壮性

## 功能验收
- [ ] 所有核心功能可运行
- [ ] 空数据状态处理
- [ ] Loading 骨架屏

## 代码质量
- [ ] 无 console.error
- [ ] 无硬编码颜色/尺寸（使用 Tailwind token）
- [ ] 大文件已拆分（<30K）

## BLOCKER 问题列表
<!-- 有则列出，无则填"无" -->

## 结论
<!-- PASS / FAIL -->
`);

console.log(`[INIT] 项目初始化完成：${projectDir}`);
console.log(`[INIT] .webgen/ 已创建，当前 Gate：G0_INIT`);
console.log(`[INIT] 下一步：填写 ${path.join(webgenDir, config.REQUIREMENTS_FILE)}`);
console.log(`[INIT] 填写完成后运行：node scripts/gate.js advance ${projectDir} --confirm "需求确认完毕，可以进入方案阶段"`);
