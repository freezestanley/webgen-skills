# Publish Marker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dual-safeguard publish marker flow so preview/publish stages always have a machine-readable `##publishEtart##...##publishEnd##` payload.

**Architecture:** Add a small shared publish-marker helper plus a CLI wrapper that reads `.webgen/project.json`, normalizes field values, and emits the exact marker format. Reuse that helper inside `scripts/publish.js` after build metadata is finalized, then update `SKILL.md` so the agent prompt and the scripts agree on the same output contract.

**Tech Stack:** Node.js CLI scripts, `node:test`, markdown SOP docs

---

### Task 1: Lock the expected marker behavior with tests

**Files:**
- Create: `scripts/emit-publish-marker.test.js`
- Modify: `scripts/gate.test.js`
- Test: `scripts/emit-publish-marker.test.js`, `scripts/gate.test.js`

**Step 1: Write the failing test**

Add tests for:
- preview-time fallback to `<project>/dist` when `.webgen/project.json` has no `dist`
- sanitizing `|` and newlines in `name/description/author`
- publish-time marker emission from `scripts/publish.js` after the build completes

**Step 2: Run test to verify it fails**

Run: `node --test scripts/emit-publish-marker.test.js scripts/gate.test.js`
Expected: FAIL because the marker CLI/helper does not exist and `publish.js` does not print the marker.

**Step 3: Write minimal implementation**

Create the helper/CLI and wire `publish.js` to use it.

**Step 4: Run test to verify it passes**

Run: `node --test scripts/emit-publish-marker.test.js scripts/gate.test.js`
Expected: PASS

### Task 2: Implement the shared publish marker generator

**Files:**
- Create: `scripts/lib/publish-marker.js`
- Create: `scripts/emit-publish-marker.js`
- Test: `scripts/emit-publish-marker.test.js`

**Step 1: Write the failing test**

Drive the helper through the CLI so the exact stdout contract is tested.

**Step 2: Run test to verify it fails**

Run: `node --test scripts/emit-publish-marker.test.js`
Expected: FAIL with missing module/script errors.

**Step 3: Write minimal implementation**

Implement:
- metadata read from `<project>/.webgen/project.json`
- fallback `dist` path of `<project>/dist`
- string sanitization that removes line breaks and replaces `|`
- exact output format `##publishEtart##项目名称|项目描述|作者|dist路径##publishEnd##`

**Step 4: Run test to verify it passes**

Run: `node --test scripts/emit-publish-marker.test.js`
Expected: PASS

### Task 3: Reuse the generator inside publish flow

**Files:**
- Modify: `scripts/publish.js`
- Test: `scripts/gate.test.js`

**Step 1: Write the failing test**

Extend the publish regression test to assert the publish marker is printed after build success.

**Step 2: Run test to verify it fails**

Run: `node --test scripts/gate.test.js`
Expected: FAIL because `publish.js` currently does not print the marker.

**Step 3: Write minimal implementation**

After `project.json.dist` is updated, call the shared helper and print the marker to stdout.

**Step 4: Run test to verify it passes**

Run: `node --test scripts/gate.test.js`
Expected: PASS

### Task 4: Align the SOP wording with the implementation

**Files:**
- Modify: `SKILL.md:314-329`

**Step 1: Update the doc text**

Replace vague “追加一条信息” wording with an exact two-line output template for preview and publish stages.

**Step 2: Verify the doc matches the script contract**

Check that both sections use the exact same tag spelling and field order as the CLI output.

