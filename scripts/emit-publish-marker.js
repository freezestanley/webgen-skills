#!/usr/bin/env node

const path = require("node:path");

const { buildPublishMarker } = require("./lib/publish-marker");

const projectPath = process.argv[2];

if (!projectPath) {
  console.error("用法：node scripts/emit-publish-marker.js <project-path>");
  process.exit(1);
}

console.log(buildPublishMarker(path.resolve(projectPath)));
