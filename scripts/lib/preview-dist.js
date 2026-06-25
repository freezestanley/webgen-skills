const fs = require("node:fs");
const path = require("node:path");

const config = require("../../config");

function persistPreviewDist(projectPath) {
  const absPath = path.resolve(projectPath);
  const projectFile = path.join(absPath, config.WEBGEN_DIR, config.PROJECT_FILE);

  if (!fs.existsSync(projectFile)) {
    throw new Error(`project.json 不存在：${projectFile}`);
  }

  const meta = JSON.parse(fs.readFileSync(projectFile, "utf8"));
  meta.dist = path.join(absPath, "dist");
  meta.updatedAt = new Date().toISOString();
  fs.writeFileSync(projectFile, JSON.stringify(meta, null, 2));

  return meta.dist;
}

module.exports = {
  persistPreviewDist
};
