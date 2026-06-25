const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const listProjectsScript = path.join(repoRoot, "scripts", "list-projects.js");

function createProjectsRoot(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "webgen-list-projects-"));
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
  return projectDir;
}

function runListProjects(args, projectsDir, env = {}) {
  const result = spawnSync(process.execPath, [listProjectsScript, ...args], {
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

function assertUsageError(result, message) {
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(
    result.stderr,
    `${message}\nUsage: node scripts/list-projects.js [--limit <number>] [--offset <number>]\n`
  );
}

test("list-projects outputs the default JSON shape", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "alpha", "2026-06-21T08:00:00.000Z");

  const result = runListProjects([], projectsDir);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(parseJsonOutput(result), {
    items: [
      {
        name: "alpha",
        path: path.join(projectsDir, "alpha"),
        projectKey: "alpha",
        gate: "G0_INIT",
        updatedAt: "2026-06-21T08:00:00.000Z",
        updatedAtDisplay: "2026-06-21 08:00",
        description: "alpha description",
        descriptionShort: "alpha description"
      }
    ],
    total: 1,
    limit: 5,
    offset: 0,
    hasMore: false
  });
});

test("list-projects applies --limit and --offset", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "older", "2026-06-20T08:00:00.000Z");
  createProject(projectsDir, "middle", "2026-06-21T08:00:00.000Z");
  createProject(projectsDir, "newer", "2026-06-22T08:00:00.000Z");

  const result = runListProjects(["--limit", "1", "--offset", "1"], projectsDir);
  const output = parseJsonOutput(result);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(output.total, 3);
  assert.equal(output.limit, 1);
  assert.equal(output.offset, 1);
  assert.deepEqual(output.items.map((item) => item.name), ["middle"]);
});

test("list-projects reports hasMore when additional items remain", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "one", "2026-06-20T08:00:00.000Z");
  createProject(projectsDir, "two", "2026-06-21T08:00:00.000Z");
  createProject(projectsDir, "three", "2026-06-22T08:00:00.000Z");

  const result = runListProjects(["--limit", "2", "--offset", "0"], projectsDir);
  const output = parseJsonOutput(result);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(output.hasMore, true);
});

test("list-projects returns valid empty JSON when the projects directory is empty", (t) => {
  const projectsDir = createProjectsRoot(t);

  const result = runListProjects([], projectsDir);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(parseJsonOutput(result), {
    items: [],
    total: 0,
    limit: 5,
    offset: 0,
    hasMore: false
  });
});

test("list-projects rejects unknown flags as usage errors", (t) => {
  const projectsDir = createProjectsRoot(t);

  const result = runListProjects(["--bogus"], projectsDir);

  assertUsageError(result, "Unknown argument: --bogus");
});

test("list-projects rejects missing and malformed pagination values", (t) => {
  const projectsDir = createProjectsRoot(t);

  assertUsageError(
    runListProjects(["--limit"], projectsDir),
    "--limit must be a non-negative integer"
  );
  assertUsageError(
    runListProjects(["--limit", "1.5"], projectsDir),
    "--limit must be a non-negative integer"
  );
  assertUsageError(
    runListProjects(["--offset"], projectsDir),
    "--offset must be a non-negative integer"
  );
  assertUsageError(
    runListProjects(["--offset", "-1"], projectsDir),
    "--offset must be a non-negative integer"
  );
});

test("list-projects rejects unsafe integer pagination values at the CLI boundary", (t) => {
  const projectsDir = createProjectsRoot(t);
  const unsafe = String(Number.MAX_SAFE_INTEGER + 1);

  assertUsageError(
    runListProjects(["--limit", unsafe], projectsDir),
    "--limit must be a safe non-negative integer"
  );
  assertUsageError(
    runListProjects(["--offset", unsafe], projectsDir),
    "--offset must be a safe non-negative integer"
  );
});

test("list-projects reports runtime failures without printing usage text", (t) => {
  const projectsDir = createProjectsRoot(t);
  const brokenProjectsPath = path.join(projectsDir, "not-a-directory");
  fs.writeFileSync(brokenProjectsPath, "broken");

  const result = runListProjects([], brokenProjectsPath);

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /ENOTDIR|not a directory/i);
  assert.doesNotMatch(result.stderr, /Usage: node scripts\/list-projects\.js/);
});
