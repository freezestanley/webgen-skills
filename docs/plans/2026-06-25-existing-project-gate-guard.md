# Existing Project Gate Guard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Force resumed development on existing projects to reopen Gate at `G3_DEV` before any code changes, then require the standard `G3_DEV -> G4_AUDIT -> G5_PREVIEW` flow and user preview confirmation again.

**Architecture:** Add a small explicit reopen transition to the Gate script, then update the `webgen` skill instructions so every entry checks Gate status, classifies resumed-development intent, and calls `reopen-dev` before implementation. Cover the behavior with script tests and workflow documentation.

**Tech Stack:** Node.js CLI scripts, markdown workflow docs, built-in `node:test`

---

### Task 1: Add failing tests for `reopen-dev`

**Files:**
- Modify: `scripts/gate.test.js`
- Test: `scripts/gate.test.js`

**Step 1: Write the failing test**

Add tests that cover:
- `reopen-dev` moves `G5_PREVIEW` to `G3_DEV`
- `reopen-dev` moves `G6_PUBLISH` to `G3_DEV`
- `reopen-dev` moves `DONE` to `G3_DEV`
- history entry contains `type: "reopen-dev"` and `reason`
- blocked state is cleared on reopen
- `reopen-dev` fails from earlier stages such as `G2_DESIGN` or `G4_AUDIT`

**Step 2: Run test to verify it fails**

Run:

```bash
node --test scripts/gate.test.js
```

Expected:
- FAIL with unknown command or missing behavior around `reopen-dev`

**Step 3: Write minimal implementation**

Implement only enough in `scripts/gate.js` to make these tests pass.

**Step 4: Run test to verify it passes**

Run:

```bash
node --test scripts/gate.test.js
```

Expected:
- PASS for the new reopen tests

**Step 5: Commit**

```bash
git add scripts/gate.js scripts/gate.test.js
git commit -m "feat: add gate reopen-dev transition"
```

### Task 2: Implement `reopen-dev` in the Gate CLI

**Files:**
- Modify: `scripts/gate.js`
- Test: `scripts/gate.test.js`

**Step 1: Add CLI parsing for `--reason`**

Extend argument parsing so `reopen-dev` can accept:

```bash
node scripts/gate.js reopen-dev <project-path> --reason "新增 about 页面"
```

**Step 2: Add reopen validation**

Allow reopen only from:
- `G5_PREVIEW`
- `G6_PUBLISH`
- `DONE`

Reject all earlier states with a clear error message.

**Step 3: Add reopen transition**

When reopen succeeds:
- push a history entry
- set `current` to `G3_DEV`
- clear `blocked` and `blockReason`
- write updated state

**Step 4: Update CLI help text**

Add usage output for `reopen-dev`.

**Step 5: Run tests**

Run:

```bash
node --test scripts/gate.test.js
```

Expected:
- PASS

**Step 6: Commit**

```bash
git add scripts/gate.js scripts/gate.test.js
git commit -m "feat: support reopening gate for resumed development"
```

### Task 3: Update the `webgen` workflow instructions

**Files:**
- Modify: `SKILL.md`

**Step 1: Add resumed-development guard rules**

Update the SOP so the startup sequence explicitly says:
- always run `gate status`
- classify development-intent
- if Gate is `G5_PREVIEW`, `G6_PUBLISH`, or `DONE`, run `reopen-dev` before code edits

**Step 2: Enumerate development-intent**

List representative cases:
- add page
- modify page
- fix bug
- tweak style, layout, interaction, animation, copy

**Step 3: Add fixed preview-completion prompt**

Insert the exact required user-facing line:

```text
开发完毕，请在浏览器预览 http://URL 地址，确认后说“预览通过，可以发布”
```

Make clear that publish is forbidden before the user says that phrase.

**Step 4: Review wording for ambiguity**

Ensure the workflow text does not leave room for "code first, Gate later".

**Step 5: Commit**

```bash
git add SKILL.md
git commit -m "docs: enforce gate reopen on existing project changes"
```

### Task 4: Update the formal FSM reference

**Files:**
- Modify: `references/gate-fsm.md`

**Step 1: Document resumed-development behavior**

Add a section that states:
- later-stage projects are not exempt from future development
- resumed work must reopen to `G3_DEV`

**Step 2: Add command examples**

Document:

```bash
node scripts/gate.js reopen-dev ./projects/my-page --reason "新增 about 页面"
```

**Step 3: Align terminology**

Keep wording consistent with `SKILL.md` and `scripts/gate.js`.

**Step 4: Commit**

```bash
git add references/gate-fsm.md
git commit -m "docs: document resumed gate flow"
```

### Task 5: Run full verification

**Files:**
- Verify only

**Step 1: Run Gate test suite**

Run:

```bash
node --test scripts/gate.test.js
```

Expected:
- PASS

**Step 2: Smoke test the CLI manually**

Create a temp project fixture and verify:
- reopen from `DONE` works
- reopen from `G5_PREVIEW` works
- reopen from `G4_AUDIT` fails

Run commands similar to:

```bash
node scripts/init-project.js gate-guard-smoke /tmp
node scripts/gate.js status /tmp/gate-guard-smoke
```

Then mutate the fixture state as needed inside the test harness or temporary fixture.

Expected:
- behavior matches the design

**Step 3: Review docs for consistency**

Check that:
- `SKILL.md`
- `references/gate-fsm.md`
- CLI help text

all describe the same resumed-development flow.

**Step 4: Final commit**

```bash
git add SKILL.md references/gate-fsm.md scripts/gate.js scripts/gate.test.js
git commit -m "feat: enforce gate reopen for existing project updates"
```
