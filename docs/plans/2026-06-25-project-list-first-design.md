# Project List First Design

**Goal:** Ensure the agent always lists recent existing projects before asking whether the user wants to create a new project or continue an existing one.

## Problem

The current workflow asks or infers "new project vs continue project" too early.
That creates avoidable duplicate projects and makes the user recall project names from memory.

The workflow needs a stable pre-check that is script-driven rather than prompt-driven.

## Decisions

### 1. Query behavior is script-only

All project discovery and lookup must be handled by scripts.
The agent must not scan directories, parse metadata, sort projects, or summarize descriptions in prompt logic.

### 2. List projects before any new/continue branching

At the start of each request, the workflow must first query existing projects and show a recent list.

Only after the list is shown may the workflow branch into:

- continue an existing project
- create a new project

### 3. Default list behavior

The default query shows the most recently updated 5 projects.

Rules:

- sort by recent update descending
- no prompt-side pagination logic
- support follow-up "查看更多项目" by script pagination

### 4. Fields shown in the recent list

Each list item must include:

- project name
- current Gate
- updated time
- short description

### 5. Description fallback

Description extraction must follow this order:

1. `.webgen/project.json.description`
2. `.webgen/requirements.md` "业务目标" section summary
3. fallback text: `暂无描述`

The script should also return:

- `description`: full description
- `descriptionShort`: truncated display description

### 6. Updated time priority

Updated time must follow this priority:

1. `.webgen/project.json.updatedAt`
2. `.webgen/gate.json.updatedAt`
3. filesystem directory mtime

The script should return both:

- `updatedAt`: raw ISO string
- `updatedAtDisplay`: display-ready string

### 7. Continue-project matching

When the user names a project, lookup must be script-driven and exact-match only.

No fuzzy guessing.
If not found, return a structured not-found result instead of failing the whole workflow.

## Recommended Architecture

Use two query scripts with one shared library.

### Shared library

`scripts/lib/project-index.js`

Responsibilities:

- scan `projects/`
- detect initialized projects by `.webgen/`
- read project metadata
- read Gate metadata
- derive description using fallback rules
- derive updated time using priority rules
- normalize one canonical project object
- sort and paginate

### List script

`scripts/list-projects.js`

Responsibilities:

- accept `--limit`
- accept `--offset`
- return JSON only

Return shape:

```json
{
  "items": [],
  "total": 0,
  "limit": 5,
  "offset": 0,
  "hasMore": false
}
```

Each item contains:

```json
{
  "name": "reggae-watch",
  "path": "/abs/path/projects/reggae-watch",
  "gate": "DONE",
  "updatedAt": "2026-06-25T14:20:31.000Z",
  "updatedAtDisplay": "2026-06-25 22:20",
  "description": "完整描述",
  "descriptionShort": "展示用短描述"
}
```

### Resolve script

`scripts/resolve-project.js`

Responsibilities:

- accept `--name`
- exact match only
- return JSON only

Matched shape:

```json
{
  "matched": true,
  "project": {
    "name": "reggae-watch",
    "path": "/abs/path/projects/reggae-watch",
    "gate": "DONE",
    "updatedAt": "2026-06-25T14:20:31.000Z",
    "updatedAtDisplay": "2026-06-25 22:20",
    "description": "完整描述",
    "descriptionShort": "展示用短描述"
  },
  "reason": null
}
```

Not-found shape:

```json
{
  "matched": false,
  "project": null,
  "reason": "NOT_FOUND"
}
```

## Runtime Flow

### Entry flow

At the beginning of each request:

```bash
node scripts/list-projects.js --limit 5 --offset 0
```

If items exist, show the recent list and the fixed guidance:

- continue: `项目名 + 修改内容`
- create: `新建 + 项目名 + 简要目标`
- pagination: `查看更多项目`

If no items exist, show direct create guidance:

`当前还没有已创建项目。可直接说：新建 + 项目名 + 简要目标。`

### More projects

When the user says `查看更多项目`, query:

```bash
node scripts/list-projects.js --limit 5 --offset <next-offset>
```

If `hasMore` is `false`, the workflow should tell the user all projects are already shown.

### Continue existing project

When the user provides a project name:

```bash
node scripts/resolve-project.js --name "<project-name>"
```

If matched:

1. get canonical `project.path`
2. then run `node scripts/gate.js status <project-path>`
3. continue normal Gate workflow

If not matched:

- tell the user the project was not found
- suggest `查看更多项目` or a retry with exact project name

## Failure Handling

- Missing `projects/` directory returns a valid empty list JSON
- Broken metadata on one project should degrade that project, not crash the whole list
- Business not-found is JSON success, not process failure
- Invalid CLI arguments are real script failures and should exit non-zero

## Files To Change

- Create: `scripts/lib/project-index.js`
- Create: `scripts/list-projects.js`
- Create: `scripts/resolve-project.js`
- Modify: `SKILL.md`
- Create or modify tests for list, resolve, pagination, fallback, and empty-state behavior

## Why This Approach

This keeps project discovery separate from Gate state transitions.
It also enforces the user's requirement that all queries be script-based for stability rather than prompt-based.
