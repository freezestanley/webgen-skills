const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const resolveProjectScript = path.join(repoRoot, "scripts", "resolve-project.js");

function createProjectsRoot(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "webgen-resolve-project-"));
  const projectsDir = path.join(root, "projects");
  fs.mkdirSync(projectsDir, { recursive: true });
  t.after(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });
  return projectsDir;
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function createProject(projectsDir, name, updatedAt) {
  const projectDir = path.join(projectsDir, name);
  const webgenDir = path.join(projectDir, ".webgen");
  fs.mkdirSync(webgenDir, { recursive: true });
  writeJson(path.join(webgenDir, "project.json"), {
    name,
    description: `${name} description`,
    updatedAt
  });
  writeJson(path.join(webgenDir, "gate.json"), {
    current: "G0_INIT",
    updatedAt
  });
}

function runResolveProject(args, projectsDir, env = {}) {
  const result = spawnSync(process.execPath, [resolveProjectScript, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      WEBGEN_PROJECTS_DIR: projectsDir,
      ...env
    }
  });

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

function parseJsonOutput(result) {
  assert.equal(result.stderr, "");
  assert.notEqual(result.stdout, "");
  return JSON.parse(result.stdout);
}

function assertUsageError(result) {
  assert.equal(result.status, 1);
  assert.equal(result.stderr, "");
  assert.deepEqual(parseJsonOutput(result), {
    matched: false,
    project: null,
    reason: "ARGUMENT_ERROR"
  });
}

test("resolve-project returns a matched project for an exact --name lookup", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "alpha", "2026-06-21T08:00:00.000Z");
  createProject(projectsDir, "alpha-two", "2026-06-22T08:00:00.000Z");

  const result = runResolveProject(["--name", "alpha"], projectsDir);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(parseJsonOutput(result), {
    matched: true,
    project: {
      name: "alpha",
      path: path.join(projectsDir, "alpha"),
      projectKey: "alpha",
      gate: "G0_INIT",
      updatedAt: "2026-06-21T08:00:00.000Z",
      updatedAtDisplay: "2026-06-21 08:00",
      description: "alpha description",
      descriptionShort: "alpha description"
    },
    reason: null
  });
});

test("resolve-project returns NOT_FOUND when no exact project name matches", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "alpha", "2026-06-21T08:00:00.000Z");

  const result = runResolveProject(["--name", "alp"], projectsDir);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(parseJsonOutput(result), {
    matched: false,
    project: null,
    reason: "NOT_FOUND"
  });
});

test("resolve-project matches exact display name only", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "alpha", "2026-06-21T08:00:00.000Z");
  createProject(projectsDir, "beta", "2026-06-22T08:00:00.000Z");
  writeJson(path.join(projectsDir, "beta", ".webgen", "project.json"), {
    name: "alpha",
    description: "beta description",
    updatedAt: "2026-06-22T08:00:00.000Z"
  });

  const result = runResolveProject(["--name", "alpha"], projectsDir);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(parseJsonOutput(result), {
    matched: false,
    project: null,
    reason: "NOT_FOUND"
  });
});

test("resolve-project returns NOT_FOUND when duplicate display-name matches exist", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "alpha-one", "2026-06-21T08:00:00.000Z");
  createProject(projectsDir, "alpha-two", "2026-06-22T08:00:00.000Z");
  writeJson(path.join(projectsDir, "alpha-one", ".webgen", "project.json"), {
    name: "shared-name",
    description: "alpha-one description",
    updatedAt: "2026-06-21T08:00:00.000Z"
  });
  writeJson(path.join(projectsDir, "alpha-two", ".webgen", "project.json"), {
    name: "shared-name",
    description: "alpha-two description",
    updatedAt: "2026-06-22T08:00:00.000Z"
  });

  const result = runResolveProject(["--name", "shared-name"], projectsDir);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(parseJsonOutput(result), {
    matched: false,
    project: null,
    reason: "NOT_FOUND"
  });
});

test("resolve-project matched output preserves the canonical project fields", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "beta", "2026-06-22T08:00:00.000Z");

  const result = runResolveProject(["--name", "beta"], projectsDir);
  const output = parseJsonOutput(result);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(Object.keys(output.project).sort(), [
    "description",
    "descriptionShort",
    "gate",
    "name",
    "path",
    "projectKey",
    "updatedAt",
    "updatedAtDisplay"
  ]);
});

test("resolve-project rejects missing --name values as usage errors", (t) => {
  const projectsDir = createProjectsRoot(t);

  const result = runResolveProject(["--name"], projectsDir);

  assertUsageError(result);
});

test("resolve-project rejects option-looking --name values as usage errors", (t) => {
  const projectsDir = createProjectsRoot(t);

  const result = runResolveProject(["--name", "--bogus"], projectsDir);

  assertUsageError(result);
});

test("resolve-project supports --name=<value> for names that begin with --", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "project-with-dash-name", "2026-06-22T08:00:00.000Z");
  writeJson(path.join(projectsDir, "project-with-dash-name", ".webgen", "project.json"), {
    name: "--bogus",
    description: "flag-like name description",
    updatedAt: "2026-06-22T08:00:00.000Z"
  });

  const result = runResolveProject(["--name=--bogus"], projectsDir);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(parseJsonOutput(result).project.name, "--bogus");
});

test("resolve-project reports runtime failures as JSON only", (t) => {
  const projectsDir = createProjectsRoot(t);
  const brokenProjectsPath = path.join(projectsDir, "not-a-directory");
  fs.writeFileSync(brokenProjectsPath, "broken");

  const result = runResolveProject(["--name", "alpha"], brokenProjectsPath);

  assert.equal(result.status, 1);
  assert.equal(result.stderr, "");
  assert.deepEqual(parseJsonOutput(result), {
    matched: false,
    project: null,
    reason: "RUNTIME_ERROR"
  });
});
