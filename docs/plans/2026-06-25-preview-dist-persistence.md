# Preview Dist Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Persist `<project>/dist` into `.webgen/project.json.dist` after preview-stage builds so metadata matches the built artifact location before publish packaging.

**Architecture:** Add a small shared helper plus a CLI wrapper dedicated to preview metadata persistence. Keep publish-marker fallback behavior unchanged, update the preview SOP to call the new CLI after `npm run build`, and verify the new behavior with focused `node:test` coverage.

**Tech Stack:** Node.js CLI scripts, `node:test`, markdown SOP docs

---

### Task 1: Lock preview dist persistence behavior with tests

**Files:**
- Create: `scripts/persist-preview-dist.test.js`
- Modify: `scripts/emit-publish-marker.test.js`
- Test: `scripts/persist-preview-dist.test.js`, `scripts/emit-publish-marker.test.js`

**Step 1: Write the failing test**

Add tests for:
- `.webgen/project.json.dist` changing from `null` to `<project>/dist`
- `updatedAt` being refreshed on persistence
- existing fields like `name`, `description`, and `author` remaining unchanged
- marker output preferring the persisted metadata value after the new CLI runs

**Step 2: Run test to verify it fails**

Run: `node --test scripts/persist-preview-dist.test.js scripts/emit-publish-marker.test.js`
Expected: FAIL because the preview persistence CLI/helper does not exist.

**Step 3: Write minimal implementation**

Create the helper/CLI needed to persist preview dist metadata.

**Step 4: Run test to verify it passes**

Run: `node --test scripts/persist-preview-dist.test.js scripts/emit-publish-marker.test.js`
Expected: PASS

### Task 2: Implement preview dist persistence helper and CLI

**Files:**
- Create: `scripts/lib/preview-dist.js`
- Create: `scripts/persist-preview-dist.js`
- Test: `scripts/persist-preview-dist.test.js`

**Step 1: Write the failing test**

Drive the helper through the CLI so the exact persistence behavior is covered end-to-end.

**Step 2: Run test to verify it fails**

Run: `node --test scripts/persist-preview-dist.test.js`
Expected: FAIL with missing module/script errors.

**Step 3: Write minimal implementation**

Implement:
- metadata read from `<project>/.webgen/project.json`
- persisted `dist` value of `<project>/dist`
- `updatedAt` refresh
- JSON write-back preserving existing fields

**Step 4: Run test to verify it passes**

Run: `node --test scripts/persist-preview-dist.test.js`
Expected: PASS

### Task 3: Align marker regression coverage with persisted preview metadata

**Files:**
- Modify: `scripts/emit-publish-marker.test.js`
- Test: `scripts/emit-publish-marker.test.js`

**Step 1: Write the failing test**

Extend marker coverage to assert that, after preview persistence runs, marker output uses the stored metadata value.

**Step 2: Run test to verify it fails**

Run: `node --test scripts/emit-publish-marker.test.js`
Expected: FAIL because the persistence flow is not wired yet.

**Step 3: Write minimal implementation**

Keep the existing marker reader behavior and satisfy the new persisted-metadata test via the new helper/CLI.

**Step 4: Run test to verify it passes**

Run: `node --test scripts/emit-publish-marker.test.js`
Expected: PASS

### Task 4: Update the preview SOP

**Files:**
- Modify: `SKILL.md:308-316`

**Step 1: Update the doc text**

Document the explicit `node scripts/persist-preview-dist.js <project-path>` step after preview-stage `npm run build`.

**Step 2: Verify the doc matches the implementation**

Check that the command name and ordering match the new CLI exactly.
