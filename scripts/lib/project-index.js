const fs = require("node:fs");
const path = require("node:path");

const config = require(path.join(__dirname, "..", "..", "config"));

const DEFAULT_LIMIT = 5;
const DEFAULT_OFFSET = 0;
const FALLBACK_DESCRIPTION = "暂无描述";
const UNKNOWN_GATE = "UNKNOWN";

function listProjects(options = {}) {
  const projectsDir = path.resolve(
    options.projectsDir || config.OUTPUT_DIR
  );
  const limit = normalizeNumber(options.limit, DEFAULT_LIMIT);
  const offset = normalizeNumber(options.offset, DEFAULT_OFFSET);
  const items = readProjectIndex(projectsDir);
  const pagedItems = items.slice(offset, offset + limit);

  return {
    items: pagedItems,
    total: items.length,
    limit,
    offset,
    hasMore: offset + limit < items.length
  };
}

function readProjectIndex(projectsDir) {
  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  return fs.readdirSync(projectsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => normalizeProject(path.join(projectsDir, entry.name)))
    .filter(Boolean)
    .sort(compareRecentFirst);
}

function normalizeProject(projectPath) {
  const webgenDir = path.join(projectPath, config.WEBGEN_DIR);
  if (!fs.existsSync(webgenDir)) {
    return null;
  }

  const projectMeta = readJsonSafe(path.join(webgenDir, config.PROJECT_FILE));
  const gateMeta = readJsonSafe(path.join(webgenDir, config.GATE_FILE));
  const requirements = readTextSafe(path.join(webgenDir, config.REQUIREMENTS_FILE));
  const stats = statSafe(projectPath);
  const updatedAt = pickUpdatedAt(projectMeta, gateMeta, stats);
  const description = pickDescription(projectMeta, requirements);

  return {
    name: pickProjectName(projectPath, projectMeta),
    path: projectPath,
    projectKey: path.basename(projectPath),
    gate: pickGate(gateMeta),
    updatedAt,
    updatedAtDisplay: formatUpdatedAtDisplay(updatedAt),
    description,
    descriptionShort: shorten(description)
  };
}

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readTextSafe(filePath) {
  if (!fs.existsSync(filePath)) {
    return "";
  }

  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function statSafe(filePath) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

function parseSections(markdown) {
  const sections = {};
  let current = null;

  String(markdown || "").split(/\r?\n/).forEach((line) => {
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

function cleanSectionLines(lines = []) {
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
    })
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);
}

function getSectionText(markdown, sectionName) {
  const sections = parseSections(markdown);
  if (!Object.hasOwn(sections, sectionName)) {
    return "";
  }

  return cleanSectionLines(sections[sectionName]).join(" ").trim();
}

function pickDescription(projectMeta, requirements) {
  const projectDescription = asNonEmptyString(projectMeta && projectMeta.description);
  if (projectDescription) {
    return projectDescription;
  }

  const requirementsGoal = getSectionText(requirements, "业务目标");
  if (requirementsGoal) {
    return requirementsGoal;
  }

  return FALLBACK_DESCRIPTION;
}

function pickProjectName(projectPath, projectMeta) {
  return asNonEmptyString(projectMeta && projectMeta.name) || path.basename(projectPath);
}

function pickGate(gateMeta) {
  return asNonEmptyString(gateMeta && gateMeta.current) || UNKNOWN_GATE;
}

function pickUpdatedAt(projectMeta, gateMeta, stats) {
  const projectUpdatedAt = asIsoString(projectMeta && projectMeta.updatedAt);
  if (projectUpdatedAt) {
    return projectUpdatedAt;
  }

  const gateUpdatedAt = asIsoString(gateMeta && gateMeta.updatedAt);
  if (gateUpdatedAt) {
    return gateUpdatedAt;
  }

  if (stats && stats.mtime instanceof Date) {
    return stats.mtime.toISOString();
  }

  return null;
}

function compareRecentFirst(left, right) {
  const timestampDiff = toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt);
  if (timestampDiff !== 0) {
    return timestampDiff;
  }

  return left.path.localeCompare(right.path, "en");
}

function toTimestamp(value) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function asNonEmptyString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function asIsoString(value) {
  const text = asNonEmptyString(value);
  return text && !Number.isNaN(Date.parse(text)) ? text : "";
}

function normalizeNumber(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) {
      return fallback;
    }

    return value;
  }

  if (typeof value === "string" && /^(0|[1-9]\d*)$/.test(value)) {
    return Number.parseInt(value, 10);
  }

  return fallback;
}

function shorten(text, maxLength = 80) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

function formatUpdatedAtDisplay(updatedAt) {
  const timestamp = toTimestamp(updatedAt);
  if (timestamp === 0 && !updatedAt) {
    return "";
  }

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate())
  ].join("-") + ` ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

module.exports = {
  listProjects
};
