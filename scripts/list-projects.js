#!/usr/bin/env node

const path = require("node:path");
const { listProjects } = require("./lib/project-index");

const HELP = "Usage: node scripts/list-projects.js [--limit <number>] [--offset <number>]";

class UsageError extends Error {}

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--limit" || arg === "--offset") {
      options[arg.slice(2)] = parsePaginationArg(arg, argv[index + 1]);
      index += 1;
      continue;
    }

    throw new UsageError(`Unknown argument: ${arg}`);
  }

  return options;
}

function parsePaginationArg(name, rawValue) {
  if (!/^(0|[1-9]\d*)$/.test(rawValue || "")) {
    throw new UsageError(`${name} must be a non-negative integer`);
  }

  const value = Number.parseInt(rawValue, 10);
  if (!Number.isSafeInteger(value)) {
    throw new UsageError(`${name} must be a safe non-negative integer`);
  }

  return value;
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const projectsDir = process.env.WEBGEN_PROJECTS_DIR
      ? path.resolve(process.env.WEBGEN_PROJECTS_DIR)
      : undefined;
    const result = listProjects({
      ...options,
      projectsDir
    });

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    if (error instanceof UsageError) {
      process.stderr.write(`${error.message}\n${HELP}\n`);
      process.exitCode = 1;
      return;
    }

    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

main();
