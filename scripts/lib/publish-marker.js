const fs = require("node:fs");
const path = require("node:path");

const config = require("../../config");

function sanitizeMarkerValue(value, fallback = "") {
  const input = typeof value === "string" ? value : fallback;
  return input
    .replace(/[\r\n|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readProjectMeta(projectPath) {
  const projectFile = path.join(projectPath, config.WEBGEN_DIR, config.PROJECT_FILE);
  if (!fs.existsSync(projectFile)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(projectFile, "utf8"));
}

function buildPublishMarker(projectPath, overrides = {}) {
  const absPath = path.resolve(projectPath);
  const projectMeta = Object.assign({}, readProjectMeta(absPath), overrides);

  const name = sanitizeMarkerValue(projectMeta.name, path.basename(absPath));
  const description = sanitizeMarkerValue(projectMeta.description, "");
  const author = sanitizeMarkerValue(projectMeta.author, "");
  const dist = sanitizeMarkerValue(projectMeta.dist, path.join(absPath, "dist"));

  return `##publishEtart##${name}|${description}|${author}|${dist}##publishEnd##`;
}

module.exports = {
  buildPublishMarker,
  sanitizeMarkerValue
};
