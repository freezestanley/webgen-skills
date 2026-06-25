#!/usr/bin/env node

const path = require("node:path");
const { listProjects } = require("./lib/project-index");

class UsageError extends Error {}

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--name") {
      options.name = parseNameArg(argv[index + 1], { allowOptionLikeValue: false });
      index += 1;
      continue;
    }

    if (arg.startsWith("--name=")) {
      options.name = parseNameArg(arg.slice("--name=".length), { allowOptionLikeValue: true });
      continue;
    }

    throw new UsageError(`Unknown argument: ${arg}`);
  }

  if (!options.name) {
    throw new UsageError("--name is required");
  }

  return options;
}

function parseNameArg(rawValue, options = {}) {
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    throw new UsageError("--name is required");
  }

  if (!options.allowOptionLikeValue && rawValue.startsWith("--")) {
    throw new UsageError("--name must be a non-empty value");
  }

  return rawValue.trim();
}

function resolveProject(name, projectsDir) {
  const { items } = listProjects({
    projectsDir,
    limit: Number.MAX_SAFE_INTEGER,
    offset: 0
  });
  const nameMatches = items.filter((item) => item.name === name);
  if (nameMatches.length !== 1) {
    return {
      matched: false,
      project: null,
      reason: "NOT_FOUND"
    };
  }

  return {
    matched: true,
    project: nameMatches[0],
    reason: null
  };
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const projectsDir = process.env.WEBGEN_PROJECTS_DIR
      ? path.resolve(process.env.WEBGEN_PROJECTS_DIR)
      : undefined;
    const result = resolveProject(options.name, projectsDir);

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    if (error instanceof UsageError) {
      process.stdout.write(`${JSON.stringify({
        matched: false,
        project: null,
        reason: "ARGUMENT_ERROR"
      }, null, 2)}\n`);
      process.exitCode = 1;
      return;
    }

    process.stdout.write(`${JSON.stringify({
      matched: false,
      project: null,
      reason: "RUNTIME_ERROR"
    }, null, 2)}\n`);
    process.exitCode = 1;
  }
}

main();
