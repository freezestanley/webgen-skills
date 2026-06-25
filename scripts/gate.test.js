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

function readGateState(projectPath) {
  return JSON.parse(fs.readFileSync(gateFile(projectPath), "utf8"));
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

## 区块树
Hero 概览区 -> 权益列表 -> 资料表单 -> 帮助入口

## 核心设计变量
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

function writeLegacyDesign(projectPath) {
  const designPath = path.join(projectPath, config.WEBGEN_DIR, config.DESIGN_FILE);
  fs.writeFileSync(designPath, `# 设计方案 — demo-page

## Block Tree（区块树）
Hero 概览区 -> 权益列表 -> 资料表单 -> 帮助入口

## Design Tokens
主色 #0f766e，圆角 16，标题使用 32/24/18 层级。

## 布局骨架（响应式断点）
桌面端双列，移动端单列堆叠。

## 组件清单
Antd Card、Form、Button，自定义 MemberHero。

## 路由设计
/member 作为主路由。

## 状态管理（zustand）
zustand 保存资料表单和保存状态。

## 接口代理配置
/api 代理到本地后端服务。
`);
}

function writeAudit(projectPath, { blockers = "无", conclusion = "PASS" } = {}) {
  const auditPath = path.join(projectPath, config.WEBGEN_DIR, config.AUDIT_FILE);
  fs.writeFileSync(auditPath, `# 自检报告 — demo-page

## 运行时验证
- 截图：PASS
- console.error 数量：0
- 结论：PASS

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

const crypto = require("node:crypto");

function sha256(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * 把项目快速推进到 G2_DESIGN 状态（gate.json current = "G2_DESIGN"）
 * 已写好 requirements.md + design.md，gate 版本为 v2
 */
function advanceToG2Design(projectPath, t) {
  // G0 → G1
  assert.equal(runNodeScript(gateScript, ["advance", projectPath]).status, 0);
  // 写需求
  writeRequirements(projectPath);
  // G1 → G2
  assert.equal(
    runNodeScript(gateScript, [
      "advance", projectPath,
      "--confirm", "需求确认完毕，可以进入方案阶段"
    ]).status,
    0
  );
  // 写 design.md
  writeDesign(projectPath);
}

function writeShape(projectPath, content) {
  const shapePath = path.join(projectPath, config.WEBGEN_DIR, config.SHAPE_FILE);
  fs.writeFileSync(shapePath, content ?? `# Shape Output — demo-page

## Block Tree
NavBar -> Hero -> Services -> Footer
Hero: 大标题 + 副文案 + CTA 按钮
Services: 3 列卡片网格
Footer: 版权信息 + 链接组

## Design Tokens
主色 #F97316，背景 #FFF7ED，深棕 #7C2D12
字体：16/20/32，间距：4/8/16/24/32/48
圆角：8px，阴影：0 2px 8px rgba(0,0,0,0.08)
`);
  return shapePath;
}

function writeCritique(projectPath, overrides = {}) {
  const shapePath = path.join(projectPath, config.WEBGEN_DIR, config.SHAPE_FILE);
  const shapeContent = fs.existsSync(shapePath) ? fs.readFileSync(shapePath, "utf-8") : "";
  const base = {
    passed: true,
    total: 80,
    sourceSha256: sha256(shapeContent),
    generatedAt: new Date().toISOString(),
    dimensions: [
      { name: "视觉层次", score: 8, max: 10 },
      { name: "色彩系统", score: 8, max: 10 },
      { name: "间距节奏", score: 8, max: 10 },
      { name: "组件规范", score: 8, max: 10 }
    ]
  };
  const critique = Object.assign({}, base, overrides);
  fs.writeFileSync(
    path.join(projectPath, config.WEBGEN_DIR, config.CRITIQUE_FILE),
    JSON.stringify(critique, null, 2)
  );
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

test("init-project skips scaffold runtime artifacts", (t) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "webgen-init-"));
  t.after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const init = runNodeScript(initScript, ["demo-page", tmpDir]);
  assert.equal(init.status, 0, init.stderr || init.stdout);

  const projectPath = path.join(tmpDir, "demo-page");
  assert.ok(fs.existsSync(path.join(projectPath, "src", "main.jsx")));
  assert.equal(fs.existsSync(path.join(projectPath, "node_modules")), false);
  assert.equal(fs.existsSync(path.join(projectPath, "dist")), false);
});

test("init-project writes gate-compatible design.md section names", (t) => {
  const projectPath = createProject(t);
  const designPath = path.join(projectPath, config.WEBGEN_DIR, config.DESIGN_FILE);
  const design = fs.readFileSync(designPath, "utf8");

  assert.match(design, /^## 区块树$/m);
  assert.match(design, /^## 核心设计变量$/m);
  assert.match(design, /^## 接口代理配置$/m);
  assert.doesNotMatch(design, /^## Block Tree（区块树）$/m);
  assert.doesNotMatch(design, /^## Design Tokens$/m);
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

test("G2_DESIGN accepts legacy design section aliases", (t) => {
  const projectPath = createProject(t);

  assert.equal(runNodeScript(gateScript, ["advance", projectPath]).status, 0);
  writeRequirements(projectPath);
  assert.equal(
    runNodeScript(gateScript, ["advance", projectPath, "--confirm", "需求确认完毕，可以进入方案阶段"]).status,
    0
  );

  writeLegacyDesign(projectPath);
  writeShape(projectPath);
  writeCritique(projectPath);

  const result = runNodeScript(gateScript, [
    "advance", projectPath,
    "--confirm", "方案确认通过，可以进入开发阶段",
    "--compact"
  ]);

  assert.equal(result.status, 0, result.stderr);
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

test("G4_AUDIT accepts runtime validation that uses Chinese punctuation", (t) => {
  const projectPath = createProject(t);

  updateGate(projectPath, (state) => ({
    ...state,
    current: "G4_AUDIT"
  }));
  writeAudit(projectPath);

  const result = runNodeScript(gateScript, ["advance", projectPath]);
  assert.equal(result.status, 0, result.stderr);
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

test("help text includes reopen-dev usage", () => {
  const result = runNodeScript(gateScript, []);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /reopen-dev <project-path> --reason/);
});

test("reopen-dev moves G5_PREVIEW back to G3_DEV and records history", (t) => {
  const projectPath = createProject(t);

  updateGate(projectPath, (state) => ({
    ...state,
    current: "G5_PREVIEW"
  }));

  const result = runNodeScript(gateScript, [
    "reopen-dev",
    projectPath,
    "--reason",
    "新增 about 页面"
  ]);

  assert.equal(result.status, 0, result.stderr);
  const state = readGateState(projectPath);
  const historyEntry = state.history.at(-1);

  assert.equal(state.current, "G3_DEV");
  assert.equal(historyEntry.from, "G5_PREVIEW");
  assert.equal(historyEntry.to, "G3_DEV");
  assert.equal(historyEntry.type, "reopen-dev");
  assert.equal(historyEntry.reason, "新增 about 页面");
});

test("reopen-dev moves G6_PUBLISH back to G3_DEV and clears blocked state", (t) => {
  const projectPath = createProject(t);

  updateGate(projectPath, (state) => ({
    ...state,
    current: "G6_PUBLISH",
    blocked: true,
    blockReason: "等待用户确认"
  }));

  const result = runNodeScript(gateScript, [
    "reopen-dev",
    projectPath,
    "--reason",
    "修复导航错位"
  ]);

  assert.equal(result.status, 0, result.stderr);
  const state = readGateState(projectPath);
  const historyEntry = state.history.at(-1);

  assert.equal(state.current, "G3_DEV");
  assert.equal(state.blocked, false);
  assert.equal(state.blockReason, null);
  assert.equal(historyEntry.from, "G6_PUBLISH");
  assert.equal(historyEntry.to, "G3_DEV");
  assert.equal(historyEntry.type, "reopen-dev");
  assert.equal(historyEntry.reason, "修复导航错位");
});

test("reopen-dev moves DONE back to G3_DEV", (t) => {
  const projectPath = createProject(t);

  updateGate(projectPath, (state) => ({
    ...state,
    current: "DONE"
  }));

  const result = runNodeScript(gateScript, [
    "reopen-dev",
    projectPath,
    "--reason",
    "补充 footer 文案"
  ]);

  assert.equal(result.status, 0, result.stderr);
  const state = readGateState(projectPath);
  const historyEntry = state.history.at(-1);

  assert.equal(state.current, "G3_DEV");
  assert.equal(historyEntry.from, "DONE");
  assert.equal(historyEntry.to, "G3_DEV");
  assert.equal(historyEntry.type, "reopen-dev");
  assert.equal(historyEntry.reason, "补充 footer 文案");
});

test("reopen-dev fails from earlier gates", (t) => {
  const projectPath = createProject(t);

  updateGate(projectPath, (state) => ({
    ...state,
    current: "G2_DESIGN"
  }));

  const designResult = runNodeScript(gateScript, [
    "reopen-dev",
    projectPath,
    "--reason",
    "新增 about 页面"
  ]);

  assert.notEqual(designResult.status, 0);
  assert.match(designResult.stderr, /G2_DESIGN|G5_PREVIEW|G6_PUBLISH|DONE|reopen-dev/i);

  updateGate(projectPath, (state) => ({
    ...state,
    current: "G4_AUDIT"
  }));

  const auditResult = runNodeScript(gateScript, [
    "reopen-dev",
    projectPath,
    "--reason",
    "新增 about 页面"
  ]);

  assert.notEqual(auditResult.status, 0);
  assert.match(auditResult.stderr, /G4_AUDIT|G5_PREVIEW|G6_PUBLISH|DONE|reopen-dev/i);
});

test("publish.js copies dist to destinations with spaces safely", (t) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "webgen-publish-"));
  t.after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const projectPath = path.join(tmpDir, "demo-page");
  const webgenDir = path.join(projectPath, config.WEBGEN_DIR);
  const destDir = path.join(tmpDir, "deploy dir");

  fs.mkdirSync(path.join(projectPath, "node_modules"), { recursive: true });
  fs.mkdirSync(path.join(projectPath, "dist"), { recursive: true });
  fs.mkdirSync(webgenDir, { recursive: true });
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify({
      name: "demo-page",
      private: true,
      scripts: {
        build: "node -e \"const fs=require('fs'); fs.mkdirSync('dist',{recursive:true}); fs.writeFileSync('dist/index.html','ok')\""
      }
    }, null, 2)
  );
  fs.writeFileSync(path.join(projectPath, "dist", "index.html"), "seed");
  fs.writeFileSync(
    path.join(webgenDir, config.GATE_FILE),
    JSON.stringify({
      project: "demo-page",
      current: "G6_PUBLISH",
      blocked: false,
      blockReason: null,
      history: [],
      workflowVersion: config.WORKFLOW_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, null, 2)
  );
  fs.writeFileSync(
    path.join(webgenDir, config.PROJECT_FILE),
    JSON.stringify({
      name: "demo|page",
      description: "preview\nrelease",
      author: "author|name",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dist: null
    }, null, 2)
  );
  fs.mkdirSync(destDir, { recursive: true });

  const result = runNodeScript(path.join(repoRoot, "scripts/publish.js"), [
    projectPath,
    "--dest",
    destDir
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(destDir, "index.html")), true);
  assert.match(
    result.stdout,
    /##publishEtart##demo page\|preview release\|author name\|.*demo-page-dist\.zip##publishEnd##/
  );
  assert.match(
    fs.readFileSync(path.join(webgenDir, config.GATE_FILE), "utf8"),
    /"current": "DONE"/
  );
});

// ─── impeccable 校验新用例 ───────────────────────────────────────────────────

test("G2_DESIGN: 空 shape-output.md 被拒绝", (t) => {
  const projectPath = createProject(t);
  advanceToG2Design(projectPath, t);

  // 写入空 shape（仅有注释行，实质内容不足 5 行）
  writeShape(projectPath, "# Shape Output\n> 占位\n");

  writeCritique(projectPath);

  const result = runNodeScript(gateScript, [
    "advance", projectPath,
    "--confirm", "方案确认通过，可以进入开发阶段",
    "--compact"
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /shape|内容不足/i);
});

test("G2_DESIGN: critique-score.json 损坏（非法 JSON）被拒绝", (t) => {
  const projectPath = createProject(t);
  advanceToG2Design(projectPath, t);
  writeShape(projectPath); // shape 必须合法，才能走到 critique 校验

  // 写入损坏的 JSON（覆盖占位文件）
  fs.writeFileSync(
    path.join(projectPath, config.WEBGEN_DIR, config.CRITIQUE_FILE),
    "{ broken json ::::"
  );

  const result = runNodeScript(gateScript, [
    "advance", projectPath,
    "--confirm", "方案确认通过，可以进入开发阶段",
    "--compact"
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /JSON|格式损坏/i);
});

test("G2_DESIGN: passed=true 但 total<75 被拒绝", (t) => {
  const projectPath = createProject(t);
  advanceToG2Design(projectPath, t);
  writeShape(projectPath); // shape 合法，确保校验走到 total 检查

  writeCritique(projectPath, { passed: true, total: 60 });

  const result = runNodeScript(gateScript, [
    "advance", projectPath,
    "--confirm", "方案确认通过，可以进入开发阶段",
    "--compact"
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /total|75|未通过/i);
});

test("G2_DESIGN: shape 改动后 sourceSha256 哈希失配被拒绝", (t) => {
  const projectPath = createProject(t);
  advanceToG2Design(projectPath, t);

  // 先写 shape，生成 critique（含正确哈希）
  writeShape(projectPath);
  writeCritique(projectPath);

  // 再修改 shape（哈希失效）
  writeShape(projectPath, `# Shape Output — demo-page

## Block Tree
NavBar -> Hero -> **修改后内容** -> Footer

## Design Tokens
主色 #000000
`);

  const result = runNodeScript(gateScript, [
    "advance", projectPath,
    "--confirm", "方案确认通过，可以进入开发阶段",
    "--compact"
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /SHA256|哈希|critique|shape/i);
});

test("G2_DESIGN: v1 老项目跳过 impeccable 校验并打印迁移提示", (t) => {
  const projectPath = createProject(t);

  // 强制降级为 v1
  updateGate(projectPath, (state) => ({ ...state, workflowVersion: "v1" }));
  advanceToG2Design(projectPath, t);
  writeShape(projectPath);
  // 不写 critique-score.json，v1 应跳过校验

  const result = runNodeScript(gateScript, [
    "advance", projectPath,
    "--confirm", "方案确认通过，可以进入开发阶段",
    "--compact"
  ]);
  // v1 应通过
  assert.equal(result.status, 0, result.stderr);
  // 应打印迁移提示
  assert.match(result.stderr, /v1|迁移|workflowVersion/i);
});
