#!/usr/bin/env node
/**
 * Gate FSM 状态机
 * 强制管控 webgen SOP 的每个阶段,禁止跳跃执行
 *
 * Gate 顺序（不可逆跳跃）:
 *   G0_INIT → G1_REQUIREMENTS → G2_DESIGN → G3_DEV → G4_AUDIT → G5_PREVIEW → G6_PUBLISH → DONE
 *
 * 用法:
 *   node scripts/gate.js status <project-path>         # 查看当前 gate
 *   node scripts/gate.js advance <project-path>        # 推进到下一 gate（需用户确认已完成当前阶段）
 *   node scripts/gate.js block <project-path> <reason> # 阻塞当前 gate（记录阻塞原因）
 *   node scripts/gate.js reset <project-path>          # 重置到 G0（慎用）
 */

const fs = require("fs");
const path = require("path");
const SKILL_ROOT = path.resolve(__dirname, "..");
const config = require(path.join(SKILL_ROOT, "config"));

const GATES = [
  "G0_INIT",
  "G1_REQUIREMENTS",  // 需求确认素材收集（用户确认）
  "G2_DESIGN",        // 输出方案（用户确认）
  "G3_DEV",           // 开发代码落地
  "G4_AUDIT",         // 自检验收
  "G5_PREVIEW",       // 用户预览（用户确认）
  "G6_PUBLISH",       // 发布（用户确认）
  "DONE"
];

// 需要用户显式确认才能推进的 gate
const USER_CONFIRM_GATES = new Set([
  "G1_REQUIREMENTS",
  "G2_DESIGN",
  "G5_PREVIEW",
  "G6_PUBLISH"
]);

// 各 Gate 的准入前提（进入前必须满足）
const GATE_PRECONDITIONS = {
  G1_REQUIREMENTS: ["项目已初始化,.webgen/ 目录存在"],
  G2_DESIGN: ["requirements.md 已填写并用户确认"],
  G3_DEV: ["design.md 已输出并用户确认", "compact 已执行（新页面设计前强制）"],
  G4_AUDIT: ["代码已落地,主要功能可运行"],
  G5_PREVIEW: ["audit.md 自检完成,无 BLOCKER 级问题"],
  G6_PUBLISH: ["用户预览确认通过"],
  DONE: ["发布脚本执行成功"]
};

const ADVANCE_REQUIREMENTS = {
  G0_INIT: ["项目已初始化,允许进入需求确认阶段"],
  G1_REQUIREMENTS: ["requirements.md 关键字段已填写", "必须附带 --confirm 记录用户确认"],
  G2_DESIGN: ["design.md 关键章节已输出", "必须附带 --confirm", "必须附带 --compact"],
  G3_DEV: ["代码已落地,允许进入自检阶段"],
  G4_AUDIT: ["audit.md 结论必须为 PASS", "BLOCKER 问题列表必须为无"],
  G5_PREVIEW: ["必须附带 --confirm 记录用户预览确认"],
  G6_PUBLISH: ["禁止直接 advance,必须运行 publish.js"]
};

function fail(message, details) {
  console.error(`[GATE] ${message}`);
  if (details) {
    console.error(`[GATE] ${details}`);
  }
  process.exit(1);
}

function readTextFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`${label} 不存在`, `缺少文件:${filePath}`);
  }

  return fs.readFileSync(filePath, "utf-8");
}

function parseSections(markdown) {
  const sections = {};
  let current = null;

  markdown.split(/\r?\n/).forEach((line) => {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      current = heading[1].trim();
      sections[current] = [];
      return;
    }

    if (current) {
      sections[current].push(line);
    }
  });

  return sections;
}

function cleanupSection(lines = []) {
  return lines
    .join("\n")
    .replace(/<!--[\s\S]*?-->/g, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line || line === "-" || line === "*" || line === "—") {
        return false;
      }
      if (line.startsWith(">")) {
        return false;
      }
      return true;
    });
}

function getSectionLines(sections, namePrefix) {
  const key = Object.keys(sections).find((sectionName) => sectionName.startsWith(namePrefix));
  return key ? cleanupSection(sections[key]) : [];
}

function assertRequiredSections(fileLabel, sections, names) {
  const missing = names.filter((name) => getSectionLines(sections, name).length === 0);
  if (missing.length > 0) {
    fail(`${fileLabel} 未完成,禁止推进`, `缺少有效内容的章节:${missing.join("、")}`);
  }
}

function assertUserConfirmation(currentGate, options) {
  if (USER_CONFIRM_GATES.has(currentGate) && !options.confirm) {
    fail(`当前阶段 ${currentGate} 需要用户确认`, "请使用 --confirm \"用户原话\" 后再推进");
  }
}

function assertCompactAcknowledged(currentGate, options) {
  if (currentGate === "G2_DESIGN" && !options.compact) {
    fail("进入 G3_DEV 前必须先执行 compact", "请在完成 compact 后附带 --compact 再推进");
  }
}

function validateRequirements(projectPath) {
  const filePath = path.join(projectPath, config.WEBGEN_DIR, config.REQUIREMENTS_FILE);
  const sections = parseSections(readTextFile(filePath, "requirements.md"));
  assertRequiredSections("requirements.md", sections, ["页面名称", "业务目标", "核心功能列表", "验收标准"]);
}

function validateDesign(projectPath) {
  const filePath = path.join(projectPath, config.WEBGEN_DIR, config.DESIGN_FILE);
  const sections = parseSections(readTextFile(filePath, "design.md"));
  assertRequiredSections("design.md", sections, [
    "区块树",
    "核心设计变量",
    "布局骨架",
    "组件清单",
    "路由设计",
    "状态管理",
    "接口代理配置"
  ]);
}

function validateAudit(projectPath) {
  const filePath = path.join(projectPath, config.WEBGEN_DIR, config.AUDIT_FILE);
  const txt = readTextFile(filePath, "audit.md");
  const sections = parseSections(txt);

  // 1. 运行时验证章节必须存在
  if (!txt.includes("## 运行时验证")) {
    fail(
      "audit.md 缺少「运行时验证」章节,禁止推进",
      "必须先用 MCP chrome-devtools 执行运行时检查（navigate_page + list_console_messages）,再写入结论"
    );
  }

  // 2. console.error 必须为 0
  const runtimeSection = txt.split("## 运行时验证")[1] || "";
  if (!/console\.error 数量:\s*0/.test(runtimeSection)) {
    fail(
      "运行时验证未通过:console.error 不为 0,禁止推进",
      "请修复所有 console.error 后重新执行运行时验证"
    );
  }

  // 3. 运行时结论必须是 PASS
  if (!/结论:\s*PASS/.test(runtimeSection)) {
    fail(
      "运行时验证结论不是 PASS,禁止推进",
      "请确认截图无白屏、console.error 为 0,再将结论改为 PASS"
    );
  }

  // 4. 静态 audit 不得有 P0/P1
  const blockers = getSectionLines(sections, "BLOCKER 问题列表").join(" ").trim();
  const conclusion = getSectionLines(sections, "结论").join(" ").trim();

  if (!blockers) {
    fail("audit.md 缺少 BLOCKER 结论", "请明确填写 BLOCKER 问题列表,无问题时填写'无'");
  }

  if (!/^(无|none|n\/a|no blocker|no blockers)$/i.test(blockers)) {
    fail("audit.md 仍存在 BLOCKER,禁止推进", `当前 BLOCKER:${blockers}`);
  }

  if (!/\bPASS\b/i.test(conclusion)) {
    fail("audit.md 结论不是 PASS,禁止推进", `当前结论:${conclusion || "未填写"}`);
  }
}

function validateAdvance(projectPath, state, options) {
  assertUserConfirmation(state.current, options);
  assertCompactAcknowledged(state.current, options);

  switch (state.current) {
    case "G1_REQUIREMENTS":
      validateRequirements(projectPath);
      break;
    case "G2_DESIGN":
      validateDesign(projectPath);
      break;
    case "G4_AUDIT":
      validateAudit(projectPath);
      break;
    case "G6_PUBLISH":
      fail("G6_PUBLISH 禁止直接 advance", "请运行 node scripts/publish.js <project-path> [--dest <dir>]");
      break;
    default:
      break;
  }
}

function parseCli(rawArgs) {
  const positional = [];
  const options = {
    compact: false,
    confirm: ""
  };

  for (let i = 0; i < rawArgs.length; i += 1) {
    const arg = rawArgs[i];
    if (arg === "--compact") {
      options.compact = true;
      continue;
    }
    if (arg === "--confirm") {
      options.confirm = (rawArgs[i + 1] || "").trim();
      i += 1;
      continue;
    }
    positional.push(arg);
  }

  return {
    cmd: positional[0],
    projectPath: positional[1],
    args: positional.slice(2),
    options
  };
}

function getGateFilePath(projectPath) {
  return path.join(projectPath, config.WEBGEN_DIR, config.GATE_FILE);
}

function readGate(projectPath) {
  const gateFile = getGateFilePath(projectPath);
  if (!fs.existsSync(gateFile)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(gateFile, "utf-8"));
}

function writeGate(projectPath, state) {
  const gateFile = getGateFilePath(projectPath);
  const webgenDir = path.join(projectPath, config.WEBGEN_DIR);
  if (!fs.existsSync(webgenDir)) {
    fs.mkdirSync(webgenDir, { recursive: true });
  }
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(gateFile, JSON.stringify(state, null, 2));
}

function status(projectPath) {
  const state = readGate(projectPath);
  if (!state) {
    fail(`项目未初始化:${projectPath}`, "请先运行: node scripts/init-project.js <project-path>");
  }
  const idx = GATES.indexOf(state.current);
  const next = GATES[idx + 1] || "DONE";
  const needsConfirm = USER_CONFIRM_GATES.has(state.current);

  console.log("=== Gate Status ===");
  console.log(`当前 Gate : ${state.current}`);
  console.log(`下一 Gate : ${next}`);
  console.log(`需要用户确认 : ${needsConfirm ? "是" : "否"}`);
  console.log(`阻塞状态 : ${state.blocked ? `是（${state.blockReason}）` : "否"}`);
  console.log(`上次更新 : ${state.updatedAt}`);

  if (ADVANCE_REQUIREMENTS[state.current]) {
    console.log(`\n当前阶段推进要求:`);
    ADVANCE_REQUIREMENTS[state.current].forEach((item) => console.log(`  - ${item}`));
  }
  if (GATE_PRECONDITIONS[next]) {
    console.log(`\n下一阶段准入前提:`);
    GATE_PRECONDITIONS[next].forEach((item) => console.log(`  - ${item}`));
  }
  return state;
}

function advance(projectPath, options) {
  const state = readGate(projectPath);
  if (!state) {
    fail("项目未初始化");
  }
  if (state.blocked) {
    fail(`当前 Gate 被阻塞,无法推进。原因:${state.blockReason}`, "请先解决阻塞问题,再运行: node scripts/gate.js unblock <project-path>");
  }

  const idx = GATES.indexOf(state.current);
  if (idx === -1 || idx >= GATES.length - 1) {
    console.log("[GATE] 已到达终态 DONE,无法继续推进");
    process.exit(0);
  }

  validateAdvance(projectPath, state, options);

  const next = GATES[idx + 1];
  state.history = state.history || [];
  const historyEntry = {
    from: state.current,
    to: next,
    at: new Date().toISOString()
  };
  if (options.confirm) {
    historyEntry.confirm = options.confirm;
  }
  if (options.compact) {
    historyEntry.compact = true;
  }
  state.history.push(historyEntry);
  state.current = next;
  writeGate(projectPath, state);

  console.log(`[GATE] 推进成功:${state.history[state.history.length - 1].from} → ${next}`);
  if (GATE_PRECONDITIONS[next]) {
    console.log(`\n[GATE] 进入 ${next} 的前提条件:`);
    GATE_PRECONDITIONS[next].forEach(c => console.log(`  - ${c}`));
  }
}

function block(projectPath, reason) {
  const state = readGate(projectPath);
  if (!state) {
    fail("项目未初始化");
  }
  state.blocked = true;
  state.blockReason = reason || "未说明原因";
  writeGate(projectPath, state);
  console.log(`[GATE] 已阻塞 ${state.current},原因:${state.blockReason}`);
}

function unblock(projectPath) {
  const state = readGate(projectPath);
  if (!state) {
    fail("项目未初始化");
  }
  state.blocked = false;
  state.blockReason = null;
  writeGate(projectPath, state);
  console.log(`[GATE] 已解除阻塞,当前 Gate:${state.current}`);
}

function reset(projectPath) {
  const state = readGate(projectPath);
  if (!state) {
    fail("项目未初始化");
  }
  state.history = state.history || [];
  state.history.push({
    from: state.current,
    to: "G0_INIT",
    at: new Date().toISOString(),
    note: "手动重置"
  });
  state.current = "G0_INIT";
  state.blocked = false;
  state.blockReason = null;
  writeGate(projectPath, state);
  console.log("[GATE] 已重置到 G0_INIT");
}

// CLI 入口
const { cmd, projectPath, args, options } = parseCli(process.argv.slice(2));

if (!cmd || !projectPath) {
  console.log("用法:");
  console.log("  node scripts/gate.js status <project-path>");
  console.log("  node scripts/gate.js advance <project-path> [--confirm \"用户确认原话\"] [--compact]");
  console.log("  node scripts/gate.js block <project-path> <reason>");
  console.log("  node scripts/gate.js unblock <project-path>");
  console.log("  node scripts/gate.js reset <project-path>");
  process.exit(0);
}

const absPath = path.resolve(projectPath);

switch (cmd) {
  case "status":  status(absPath); break;
  case "advance": advance(absPath, options); break;
  case "block":   block(absPath, args.join(" ")); break;
  case "unblock": unblock(absPath); break;
  case "reset":   reset(absPath); break;
  default:
    console.error(`未知命令:${cmd}`);
    process.exit(1);
}
