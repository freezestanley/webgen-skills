# Project List First Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add stable script-based project discovery so the workflow always lists recent existing projects before branching into new-project or continue-project handling.

**Architecture:** Introduce a shared project index library plus two thin CLI scripts. The shared library owns metadata discovery, description fallback, updated-time priority, sorting, and pagination; `SKILL.md` consumes only the script outputs and stops doing prompt-side discovery.

**Tech Stack:** Node.js, existing `scripts/` CLI pattern, markdown parsing via local utility code, repo docs in `docs/plans/`

---

### Task 1: Add shared project index library

**Files:**
- Create: `scripts/lib/project-index.js`
- Read for reference: `scripts/init-project.js`
- Read for reference: `config.js`

**Step 1: Write the failing test**

Create a test file that covers:

- initialized project detection via `.webgen/`
- `project.json.description` priority
- `requirements.md` fallback to "业务目标"
- `暂无描述` fallback
- updated time priority

**Step 2: Run test to verify it fails**

Run: `node --test scripts/*.test.js`
Expected: FAIL because `scripts/lib/project-index.js` does not exist and new test cannot import it.

**Step 3: Write minimal implementation**

Implement library helpers for:

- scanning `projects/`
- safe JSON reading
- safe markdown section extraction
- project normalization
- recent-first sorting
- offset/limit pagination

**Step 4: Run test to verify it passes**

Run: `node --test scripts/*.test.js`
Expected: PASS for the new project-index tests.

**Step 5: Commit**

```bash
git add scripts/lib/project-index.js scripts/*.test.js
git commit -m "feat: add shared project index library"
```

### Task 2: Add recent project listing CLI

**Files:**
- Create: `scripts/list-projects.js`
- Modify: tests created in Task 1 or add `scripts/list-projects.test.js`

**Step 1: Write the failing test**

Add coverage for:

- default JSON shape
- `--limit` and `--offset`
- `hasMore`
- empty projects directory behavior

**Step 2: Run test to verify it fails**

Run: `node --test scripts/*.test.js`
Expected: FAIL because `list-projects.js` does not exist or output shape is missing.

**Step 3: Write minimal implementation**

Implement CLI parsing and JSON-only output:

```json
{
  "items": [],
  "total": 0,
  "limit": 5,
  "offset": 0,
  "hasMore": false
}
```

**Step 4: Run test to verify it passes**

Run: `node --test scripts/*.test.js`
Expected: PASS for list behavior tests.

**Step 5: Commit**

```bash
git add scripts/list-projects.js scripts/*.test.js
git commit -m "feat: add recent project listing cli"
```

### Task 3: Add exact project resolve CLI

**Files:**
- Create: `scripts/resolve-project.js`
- Modify: tests created earlier or add `scripts/resolve-project.test.js`

**Step 1: Write the failing test**

Add coverage for:

- exact match success
- `NOT_FOUND` result
- matched response contains canonical project fields

**Step 2: Run test to verify it fails**

Run: `node --test scripts/*.test.js`
Expected: FAIL because `resolve-project.js` does not exist or returns the wrong shape.

**Step 3: Write minimal implementation**

Implement CLI parsing for `--name` and JSON output:

```json
{
  "matched": false,
  "project": null,
  "reason": "NOT_FOUND"
}
```

and matched variant with full project payload.

**Step 4: Run test to verify it passes**

Run: `node --test scripts/*.test.js`
Expected: PASS for resolve behavior tests.

**Step 5: Commit**

```bash
git add scripts/resolve-project.js scripts/*.test.js
git commit -m "feat: add exact project resolver cli"
```

### Task 4: Update workflow instructions to consume scripts

**Files:**
- Modify: `SKILL.md`
- Read for reference: `references/gate-fsm.md`

**Step 1: Write the failing test**

If instruction tests exist, extend them; otherwise add a checklist-based regression note in a small doc test or review checklist covering:

- always list recent 5 projects first
- use `查看更多项目` via pagination
- resolve named project via script before `gate status`
- empty list falls back to create guidance

**Step 2: Run verification to show current docs do not meet the rule**

Run: `rg -n "list-projects|resolve-project|查看更多项目|最近更新 5 个" SKILL.md`
Expected: missing or incomplete references.

**Step 3: Write minimal implementation**

Update `SKILL.md` entry workflow so it:

- calls `node scripts/list-projects.js --limit 5 --offset 0`
- shows recent 5 projects
- handles `查看更多项目`
- calls `node scripts/resolve-project.js --name "<project-name>"`
- only then runs `node scripts/gate.js status <project-path>`

**Step 4: Run verification to confirm docs include the new flow**

Run: `rg -n "list-projects|resolve-project|查看更多项目|最近更新 5 个" SKILL.md`
Expected: all required entry workflow references present.

**Step 5: Commit**

```bash
git add SKILL.md
git commit -m "docs: require project list before project selection"
```

### Task 5: Final verification

**Files:**
- Verify: `scripts/lib/project-index.js`
- Verify: `scripts/list-projects.js`
- Verify: `scripts/resolve-project.js`
- Verify: `SKILL.md`
- Verify: test files added in earlier tasks

**Step 1: Run full relevant tests**

Run: `node --test scripts/*.test.js`
Expected: PASS

**Step 2: Run smoke checks on CLI output**

Run: `node scripts/list-projects.js --limit 5 --offset 0`
Expected: valid JSON with `items/total/limit/offset/hasMore`

Run: `node scripts/resolve-project.js --name "reggae-watch"`
Expected: valid JSON with `matched=true` and canonical project fields

Run: `node scripts/resolve-project.js --name "missing-project"`
Expected: valid JSON with `matched=false` and `reason="NOT_FOUND"`

**Step 3: Review instruction flow**

Run: `rg -n "list-projects|resolve-project|查看更多项目|新建 \\+ 项目名 \\+ 简要目标" SKILL.md`
Expected: the project-list-first flow is documented in the skill.

**Step 4: Commit**

```bash
git add scripts/lib/project-index.js scripts/list-projects.js scripts/resolve-project.js scripts/*.test.js SKILL.md
git commit -m "feat: add script-based project discovery flow"
```
