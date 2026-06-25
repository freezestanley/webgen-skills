#!/usr/bin/env node
/**
 * 发布脚本
 * 仅在 Gate = G6_PUBLISH 时可执行，用户确认后推进到 DONE
 *
 * 用法：node scripts/publish.js <project-path> [--dest <deploy-dir>]
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const SKILL_ROOT = path.resolve(__dirname, "..");
const config = require(path.join(SKILL_ROOT, "config"));
const { buildPublishMarker } = require("./lib/publish-marker");

const args = process.argv.slice(2);
const projectPath = args[0];
const destIdx = args.indexOf("--dest");
const destDir = destIdx !== -1 ? args[destIdx + 1] : null;

if (!projectPath) {
  console.error("用法：node scripts/publish.js <project-path> [--dest <deploy-dir>]");
  process.exit(1);
}

const absPath = path.resolve(projectPath);
const gateFile = path.join(absPath, config.WEBGEN_DIR, config.GATE_FILE);

if (!fs.existsSync(gateFile)) {
  console.error(`[PUBLISH] 项目未初始化：${absPath}`);
  process.exit(1);
}

const state = JSON.parse(fs.readFileSync(gateFile, "utf-8"));

// 强制检查 Gate
if (state.current !== "G6_PUBLISH") {
  console.error(`[PUBLISH] 禁止执行：当前 Gate 为 ${state.current}，必须到达 G6_PUBLISH 才能发布`);
  console.error(`[PUBLISH] 请按 SOP 顺序完成前置阶段`);
  process.exit(1);
}

if (state.blocked) {
  console.error(`[PUBLISH] Gate 被阻塞，原因：${state.blockReason}`);
  process.exit(1);
}

console.log(`[PUBLISH] 开始构建项目：${absPath}`);

try {
  // 安装依赖（如需要）
  const pkgPath = path.join(absPath, "package.json");
  if (fs.existsSync(pkgPath) && !fs.existsSync(path.join(absPath, "node_modules"))) {
    console.log("[PUBLISH] 安装依赖...");
    execSync("npm install", { cwd: absPath, stdio: "inherit" });
  }

  // 执行 vite build
  console.log("[PUBLISH] 执行 vite build...");
  execSync("npm run build", { cwd: absPath, stdio: "inherit" });

  const distDir = path.join(absPath, "dist");
  if (!fs.existsSync(distDir)) {
    throw new Error("构建产物 dist/ 不存在，构建可能失败");
  }

  // 打包 dist/ 为 zip，放在项目根目录
  const zipPath = path.join(absPath, `${path.basename(absPath)}-dist.zip`);
  console.log(`[PUBLISH] 打包 dist/ → ${zipPath}`);
  execSync(`cd "${absPath}" && zip -r "${zipPath}" dist`, { stdio: "inherit" });

  // 回写 project.json 的 dist 字段
  const projectFile = path.join(absPath, config.WEBGEN_DIR, config.PROJECT_FILE);
  if (fs.existsSync(projectFile)) {
    const meta = JSON.parse(fs.readFileSync(projectFile, "utf-8"));
    meta.dist = zipPath;
    meta.updatedAt = new Date().toISOString();
    fs.writeFileSync(projectFile, JSON.stringify(meta, null, 2));
    console.log(`[PUBLISH] project.json dist 已更新：${zipPath}`);
  }

  // 可选：复制到部署目录
  if (destDir) {
    const absDest = path.resolve(destDir);
    console.log(`[PUBLISH] 复制到部署目录：${absDest}`);
    fs.mkdirSync(absDest, { recursive: true });
    fs.cpSync(distDir, absDest, {
      force: true,
      recursive: true
    });
  }

  // 推进 Gate 到 DONE
  state.history = state.history || [];
  state.history.push({
    from: "G6_PUBLISH",
    to: "DONE",
    at: new Date().toISOString()
  });
  state.current = "DONE";
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(gateFile, JSON.stringify(state, null, 2));

  console.log("[PUBLISH] 发布成功，Gate 已推进到 DONE");
  console.log(`[PUBLISH] 构建产物：${distDir}`);
  console.log(buildPublishMarker(absPath, { dist: zipPath }));
} catch (err) {
  console.error(`[PUBLISH] 发布失败：${err.message}`);
  // 记录阻塞
  state.blocked = true;
  state.blockReason = `发布失败：${err.message}`;
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(gateFile, JSON.stringify(state, null, 2));
  process.exit(1);
}
