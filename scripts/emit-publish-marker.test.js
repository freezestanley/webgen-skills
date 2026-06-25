const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const markerScript = path.join(repoRoot, "scripts", "emit-publish-marker.js");

function runMarker(projectPath) {
  const result = spawnSync(process.execPath, [markerScript, projectPath], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

function createProject(t, projectName, projectMeta) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "webgen-marker-"));
  const projectPath = path.join(root, projectName);
  const webgenDir = path.join(projectPath, ".webgen");

  fs.mkdirSync(webgenDir, { recursive: true });
  fs.writeFileSync(
    path.join(webgenDir, "project.json"),
    JSON.stringify(projectMeta, null, 2)
  );

  t.after(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  return projectPath;
}

test("emit-publish-marker falls back to project dist path and sanitizes marker fields", (t) => {
  const projectPath = createProject(t, "demo-page", {
    name: "Landing|Page\n",
    description: "Desc\nLine|A",
    author: "me|you",
    dist: null
  });

  const result = runMarker(projectPath);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout.trim(),
    `##publishEtart##Landing Page|Desc Line A|me you|${path.join(projectPath, "dist")}##publishEnd##`
  );
});

test("emit-publish-marker prefers persisted dist metadata when available", (t) => {
  const projectPath = createProject(t, "demo-page", {
    name: "Demo",
    description: "发布说明",
    author: "alice",
    dist: "/tmp/demo-page-dist.zip"
  });

  const result = runMarker(projectPath);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout.trim(),
    "##publishEtart##Demo|发布说明|alice|/tmp/demo-page-dist.zip##publishEnd##"
  );
});
