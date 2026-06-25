#!/usr/bin/env node

const path = require("node:path");

const { persistPreviewDist } = require("./lib/preview-dist");

const projectPath = process.argv[2];

if (!projectPath) {
  console.error("用法：node scripts/persist-preview-dist.js <project-path>");
  process.exit(1);
}

const distPath = persistPreviewDist(path.resolve(projectPath));
console.log(distPath);
