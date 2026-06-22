const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const gateScript = path.join(repoRoot, "scripts/gate.js");
const initScript = path.join(repoRoot, "scripts/init-project.js");
const config = require("../config");

function runNodeScript(scriptPath, args, cwd = repoRoot) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd,
    encoding: "utf8"
  });

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

function createProject(t) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "webgen-gate-"));
  const projectName = "demo-page";
  const init = runNodeScript(initScript, [projectName, tmpDir]);

  assert.equal(init.status, 0, init.stderr || init.stdout);

  const projectPath = path.join(tmpDir, projectName);
  t.after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  return projectPath;
}

function gateFile(projectPath) {
  return path.join(projectPath, config.WEBGEN_DIR, config.GATE_FILE);
}

function updateGate(projectPath, updater) {
  const file = gateFile(projectPath);
  const state = JSON.parse(fs.readFileSync(file, "utf8"));
  const next = updater(state);
  fs.writeFileSync(file, JSON.stringify(next, null, 2));
}

function writeRequirements(projectPath) {
  const requirementsPath = path.join(projectPath, config.WEBGEN_DIR, config.REQUIREMENTS_FILE);
  fs.writeFileSync(requirementsPath, `# 需求文档 — demo-page

## 页面名称
会员中心

## 业务目标
帮助用户查看账户状态并完成资料更新。

## 核心功能列表
- 展示会员权益
- 编辑基础资料

## 交互逻辑
进入页面后展示概览卡片，点击按钮进入表单编辑。

## 视觉偏好
浅色、卡片化、留白充足。

## 数据接口
/api/member/profile

## 验收标准
用户可以完成资料编辑并看到保存结果。

## 素材需求
无
`);
}

function writeDesign(projectPath) {
  const designPath = path.join(projectPath, config.WEBGEN_DIR, config.DESIGN_FILE);
  fs.writeFileSync(designPath, `# 设计方案 — demo-page

## 区块树（Block Tree）
Hero 概览区 -> 权益列表 -> 资料表单 -> 帮助入口

## 核心设计变量（Design Tokens）
主色 #0f766e，圆角 16，标题使用 32/24/18 层级。

## 布局骨架
桌面端双列，移动端单列堆叠。

## 组件清单
Antd Card、Form、Button，自定义 MemberHero。

## 路由设计
/member 作为主路由。

## 状态管理
zustand 保存资料表单和保存状态。

## 接口代理配置
/api 代理到本地后端服务。
`);
}

function writeAudit(projectPath, { blockers = "无", conclusion = "PASS" } = {}) {
  const auditPath = path.join(projectPath, config.WEBGEN_DIR, config.AUDIT_FILE);
  fs.writeFileSync(auditPath, `# 自检报告 — demo-page

## 适配体检
- [x] 响应式断点（sm/md/lg/xl）
- [x] 移动端手势支持
- [x] Flexbox/Grid 健壮性

## 功能验收
- [x] 所有核心功能可运行
- [x] 空数据状态处理
- [x] Loading 骨架屏

## 代码质量
- [x] 无 console.error
- [x] 无硬编码颜色/尺寸（使用 Tailwind token）
- [x] 大文件已拆分（<30K）

## BLOCKER 问题列表
${blockers}

## 结论
${conclusion}
`);
}

test("G1_REQUIREMENTS rejects advance when requirements are incomplete", (t) => {
  const projectPath = createProject(t);

  assert.equal(runNodeScript(gateScript, ["advance", projectPath]).status, 0);

  const result = runNodeScript(gateScript, ["advance", projectPath]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requirements|需求|确认/);
});

test("G1_REQUIREMENTS requires explicit confirmation even when requirements are complete", (t) => {
  const projectPath = createProject(t);

  assert.equal(runNodeScript(gateScript, ["advance", projectPath]).status, 0);
  writeRequirements(projectPath);

  const result = runNodeScript(gateScript, ["advance", projectPath]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /confirm|确认/);
});

test("G2_DESIGN requires compact acknowledgement before entering G3_DEV", (t) => {
  const projectPath = createProject(t);

  assert.equal(runNodeScript(gateScript, ["advance", projectPath]).status, 0);
  writeRequirements(projectPath);
  assert.equal(
    runNodeScript(gateScript, ["advance", projectPath, "--confirm", "需求确认完毕，可以进入方案阶段"]).status,
    0
  );

  writeDesign(projectPath);
  const result = runNodeScript(gateScript, ["advance", projectPath, "--confirm", "方案确认通过，可以进入开发阶段"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /compact/i);
});

test("G4_AUDIT rejects advance when audit has blockers or non-pass conclusion", (t) => {
  const projectPath = createProject(t);

  updateGate(projectPath, (state) => ({
    ...state,
    current: "G4_AUDIT"
  }));
  writeAudit(projectPath, {
    blockers: "移动端表单溢出",
    conclusion: "FAIL"
  });

  const result = runNodeScript(gateScript, ["advance", projectPath]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /BLOCKER|PASS|审计|audit/i);
});

test("G6_PUBLISH cannot be advanced directly without running publish.js", (t) => {
  const projectPath = createProject(t);

  updateGate(projectPath, (state) => ({
    ...state,
    current: "G6_PUBLISH"
  }));

  const result = runNodeScript(gateScript, ["advance", projectPath, "--confirm", "确认发布"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /publish\.js|发布/i);
});
