const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const persistScript = path.join(repoRoot, "scripts", "persist-preview-dist.js");

function runPersist(projectPath) {
  const result = spawnSync(process.execPath, [persistScript, projectPath], {
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
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "webgen-preview-dist-"));
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

  return {
    projectPath,
    projectFile: path.join(webgenDir, "project.json")
  };
}

test("persist-preview-dist stores the preview dist path and refreshes updatedAt", (t) => {
  const originalUpdatedAt = "2026-06-25T00:00:00.000Z";
  const { projectPath, projectFile } = createProject(t, "demo-page", {
    name: "Demo",
    description: "Preview build",
    author: "alice",
    createdAt: "2026-06-24T00:00:00.000Z",
    updatedAt: originalUpdatedAt,
    dist: null
  });

  const result = runPersist(projectPath);

  assert.equal(result.status, 0, result.stderr);

  const meta = JSON.parse(fs.readFileSync(projectFile, "utf8"));
  assert.equal(meta.name, "Demo");
  assert.equal(meta.description, "Preview build");
  assert.equal(meta.author, "alice");
  assert.equal(meta.createdAt, "2026-06-24T00:00:00.000Z");
  assert.equal(meta.dist, path.join(projectPath, "dist"));
  assert.notEqual(meta.updatedAt, originalUpdatedAt);
});
