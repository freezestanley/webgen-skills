const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const config = require("../config");
const { listProjects } = require("./lib/project-index");

function createProjectsRoot(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "webgen-project-index-"));
  const projectsDir = path.join(root, "projects");
  fs.mkdirSync(projectsDir, { recursive: true });
  t.after(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });
  return projectsDir;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function createProject(projectsDir, name, options = {}) {
  const projectDir = path.join(projectsDir, name);
  fs.mkdirSync(projectDir, { recursive: true });

  if (!options.initialized) {
    return projectDir;
  }

  const webgenDir = path.join(projectDir, ".webgen");
  fs.mkdirSync(webgenDir, { recursive: true });

  if (options.projectJson !== false) {
    writeJson(path.join(webgenDir, "project.json"), {
      name,
      description: "",
      ...(options.projectJson || {})
    });
  }

  if (options.gateJson !== false) {
    writeJson(path.join(webgenDir, "gate.json"), {
      current: "G0_INIT",
      ...(options.gateJson || {})
    });
  }

  if (options.requirements !== undefined) {
    writeFile(path.join(webgenDir, "requirements.md"), options.requirements);
  }

  if (options.projectJsonRaw !== undefined) {
    writeFile(path.join(webgenDir, "project.json"), options.projectJsonRaw);
  }

  if (options.gateJsonRaw !== undefined) {
    writeFile(path.join(webgenDir, "gate.json"), options.gateJsonRaw);
  }

  if (options.mtime) {
    const time = new Date(options.mtime);
    fs.utimesSync(projectDir, time, time);
  }

  return projectDir;
}

function requirementsWithGoal(goal) {
  return `# 需求文档

## 页面名称
示例页面

## 业务目标
${goal}

## 核心功能列表
- 示例功能

## 验收标准
可以完成示例流程
`;
}

function formatDisplay(isoString) {
  const date = new Date(isoString);
  const pad = (value) => String(value).padStart(2, "0");

  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate())
  ].join("-") + ` ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

test("listProjects only includes initialized projects and paginates in recent-first order", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "draft-only", { initialized: false });
  createProject(projectsDir, "oldest", {
    initialized: true,
    projectJson: { updatedAt: "2026-06-20T08:00:00.000Z" }
  });
  createProject(projectsDir, "middle", {
    initialized: true,
    projectJson: { updatedAt: "2026-06-21T08:00:00.000Z" }
  });
  createProject(projectsDir, "newest", {
    initialized: true,
    projectJson: { updatedAt: "2026-06-22T08:00:00.000Z" }
  });

  const result = listProjects({ projectsDir, limit: 2, offset: 1 });

  assert.equal(result.total, 3);
  assert.equal(result.limit, 2);
  assert.equal(result.offset, 1);
  assert.equal(result.hasMore, false);
  assert.deepEqual(
    result.items.map((item) => item.name),
    ["middle", "oldest"]
  );
});

test("listProjects uses config.OUTPUT_DIR when projectsDir is not provided", (t) => {
  const projectsDir = createProjectsRoot(t);
  const originalOutputDir = config.OUTPUT_DIR;
  t.after(() => {
    config.OUTPUT_DIR = originalOutputDir;
  });
  config.OUTPUT_DIR = projectsDir;

  createProject(projectsDir, "from-config-output-dir", {
    initialized: true,
    projectJson: { updatedAt: "2026-06-23T08:00:00.000Z" }
  });

  const result = listProjects();

  assert.equal(result.total, 1);
  assert.deepEqual(
    result.items.map((item) => item.projectKey),
    ["from-config-output-dir"]
  );
});

test("listProjects prefers project.json description over requirements.md", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "priority-description", {
    initialized: true,
    projectJson: {
      description: "来自 project.json 的描述",
      updatedAt: "2026-06-22T08:00:00.000Z"
    },
    requirements: requirementsWithGoal("来自 requirements 的业务目标")
  });

  const [item] = listProjects({ projectsDir }).items;

  assert.deepEqual(Object.keys(item).sort(), [
    "description",
    "descriptionShort",
    "gate",
    "name",
    "path",
    "projectKey",
    "updatedAt",
    "updatedAtDisplay"
  ]);
  assert.equal(item.description, "来自 project.json 的描述");
  assert.equal(item.projectKey, "priority-description");
  assert.equal(item.updatedAtDisplay, formatDisplay(item.updatedAt));
});

test("listProjects falls back to the 业务目标 section in requirements.md", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "requirements-fallback", {
    initialized: true,
    projectJson: { description: "", updatedAt: "2026-06-22T08:00:00.000Z" },
    requirements: requirementsWithGoal("帮助用户快速完成资料录入。")
  });

  const [item] = listProjects({ projectsDir }).items;

  assert.equal(item.description, "帮助用户快速完成资料录入。");
});

test("listProjects matches the exact 业务目标 heading before similarly named headings", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "exact-heading", {
    initialized: true,
    projectJson: { description: "", updatedAt: "2026-06-22T08:00:00.000Z" },
    requirements: `# 需求文档

## 业务目标补充
这段内容不应被读取。

## 业务目标
这里才是规范描述。
`
  });

  const [item] = listProjects({ projectsDir }).items;

  assert.equal(item.description, "这里才是规范描述。");
});

test("listProjects returns 暂无描述 when no description source is available", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "empty-description", {
    initialized: true,
    projectJson: { description: "", updatedAt: "2026-06-22T08:00:00.000Z" }
  });

  const [item] = listProjects({ projectsDir }).items;

  assert.equal(item.description, "暂无描述");
});

test("listProjects uses updatedAt priority project.json > gate.json > filesystem mtime", (t) => {
  const projectsDir = createProjectsRoot(t);
  const mtimeProjectDir = createProject(projectsDir, "mtime-priority", {
    initialized: true,
    projectJson: false,
    gateJson: false,
    mtime: "2026-06-20T08:00:00.000Z"
  });

  createProject(projectsDir, "gate-priority", {
    initialized: true,
    projectJson: { description: "" },
    gateJson: {
      current: "G2_DESIGN",
      updatedAt: "2026-06-21T08:00:00.000Z"
    },
    mtime: "2026-06-19T08:00:00.000Z"
  });

  createProject(projectsDir, "project-priority", {
    initialized: true,
    projectJson: {
      description: "",
      updatedAt: "2026-06-22T08:00:00.000Z"
    },
    gateJson: {
      current: "DONE",
      updatedAt: "2026-06-18T08:00:00.000Z"
    },
    mtime: "2026-06-17T08:00:00.000Z"
  });

  const items = listProjects({ projectsDir }).items;
  const byName = new Map(items.map((item) => [item.name, item]));
  const mtimeStats = fs.statSync(mtimeProjectDir);

  assert.equal(byName.get("project-priority").updatedAt, "2026-06-22T08:00:00.000Z");
  assert.equal(byName.get("gate-priority").updatedAt, "2026-06-21T08:00:00.000Z");
  assert.equal(byName.get("mtime-priority").updatedAt, mtimeStats.mtime.toISOString());
  assert.equal(
    byName.get("project-priority").updatedAtDisplay,
    formatDisplay("2026-06-22T08:00:00.000Z")
  );
});

test("listProjects formats updatedAtDisplay in UTC consistently", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "utc-display", {
    initialized: true,
    projectJson: {
      updatedAt: "2026-06-22T00:05:00.000Z"
    }
  });

  const [item] = listProjects({ projectsDir }).items;

  assert.equal(item.updatedAtDisplay, "2026-06-22 00:05");
});

test("listProjects ignores broken project.json and falls back safely", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "broken-json", {
    initialized: true,
    projectJsonRaw: "{not valid json",
    gateJson: {
      current: "G1_REQUIREMENTS",
      updatedAt: "2026-06-22T08:00:00.000Z"
    },
    requirements: requirementsWithGoal("从损坏的 project.json 回退。")
  });

  const [item] = listProjects({ projectsDir }).items;

  assert.equal(item.description, "从损坏的 project.json 回退。");
  assert.equal(item.gate, "G1_REQUIREMENTS");
  assert.equal(item.updatedAt, "2026-06-22T08:00:00.000Z");
  assert.equal(item.updatedAtDisplay, formatDisplay("2026-06-22T08:00:00.000Z"));
});

test("listProjects sorts equal timestamps deterministically", (t) => {
  const projectsDir = createProjectsRoot(t);
  createProject(projectsDir, "beta", {
    initialized: true,
    projectJson: { updatedAt: "2026-06-22T08:00:00.000Z" }
  });
  createProject(projectsDir, "alpha", {
    initialized: true,
    projectJson: { updatedAt: "2026-06-22T08:00:00.000Z" }
  });

  const items = listProjects({ projectsDir }).items;

  assert.deepEqual(
    items.map((item) => item.name),
    ["alpha", "beta"]
  );
});

test("listProjects falls back to default pagination for malformed values", (t) => {
  const projectsDir = createProjectsRoot(t);
  for (const name of ["a", "b", "c", "d", "e", "f"]) {
    createProject(projectsDir, name, {
      initialized: true,
      projectJson: { updatedAt: "2026-06-22T08:00:00.000Z" }
    });
  }

  const result = listProjects({ projectsDir, limit: "2e1", offset: " 1 " });

  assert.equal(result.limit, 5);
  assert.equal(result.offset, 0);
  assert.equal(result.items.length, 5);
  assert.equal(result.hasMore, true);
});
