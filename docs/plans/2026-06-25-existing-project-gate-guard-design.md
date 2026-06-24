# Existing Project Gate Guard Design

**Goal:** Ensure any page addition or modification in an existing project must re-enter the Gate flow from `G3_DEV`, even when the project is currently at `G5_PREVIEW`, `G6_PUBLISH`, or `DONE`.

## Problem

The current Gate workflow validates forward transitions, but it does not model the "resume development on an existing project" case.

Current behavior:
- `scripts/gate.js` only validates `advance` operations.
- The `webgen` skill requires checking Gate status first, but it does not define a mandatory reopen rule for follow-up development.
- When an agent directly edits code in a project already at `G5_PREVIEW` or later, the code change can happen without forcing a return to `G3_DEV -> G4_AUDIT -> G5_PREVIEW`.

This creates a workflow hole:
- Gate status can remain in preview/publish-complete states while new code is already being written.
- The agent can skip re-audit and skip renewed user preview confirmation.

## Scope

In scope:
- Enforce the rule at the `webgen` agent entry workflow.
- Add a legal Gate action to reopen development from later stages back to `G3_DEV`.
- Standardize the completion prompt after development and audit.

Out of scope:
- Source fingerprint or file-diff detection in `scripts/gate.js`.
- Enforcement in `scripts/publish.js`.
- Automatic intent detection inside shell scripts.

## Requirements

The agreed rules are:

1. New project and existing project follow the same no-skip principle.
2. Any page addition, page modification, bug fix, style adjustment, interaction adjustment, or copy change counts as development work.
3. If development work is requested while the project is in `G5_PREVIEW`, `G6_PUBLISH`, or `DONE`, the workflow must first return to `G3_DEV`.
4. After code completion, the project must re-run `G3_DEV -> G4_AUDIT -> G5_PREVIEW`.
5. The agent must stop at preview and ask the user to confirm with the exact phrase:
   `预览通过，可以发布`

## Recommended Approach

Use entry-level enforcement in the `webgen` skill plus a minimal Gate script extension.

### 1. Add a `reopen-dev` Gate command

Extend `scripts/gate.js` with a new command:

```bash
node scripts/gate.js reopen-dev <project-path> --reason "<reason>"
```

Behavior:
- Allowed only when current Gate is `G5_PREVIEW`, `G6_PUBLISH`, or `DONE`.
- Rewrites `current` to `G3_DEV`.
- Appends a history record with:
  - `from`
  - `to`
  - `at`
  - `reason`
  - `type: "reopen-dev"`
- Clears any stale blocked state.

Why this is needed:
- The entry workflow needs an auditable and explicit Gate operation.
- The agent should never mutate `gate.json` directly.

### 2. Add a "development-intent" guard in `SKILL.md`

At `webgen` startup, after `gate status`, the workflow must classify the request.

Requests that count as `development-intent`:
- Add a new page
- Modify an existing page
- Fix a bug
- Adjust layout, style, animation, interaction, or copy
- Continue work on an already generated page

If the request is `development-intent` and current Gate is one of:
- `G5_PREVIEW`
- `G6_PUBLISH`
- `DONE`

then the agent must run:

```bash
node scripts/gate.js reopen-dev <project-path> --reason "<user intent>"
```

before any code edit or implementation step.

### 3. Normalize the resumed flow

For resumed work on an existing project, the required flow becomes:

```text
G5_PREVIEW / G6_PUBLISH / DONE
-> reopen-dev
-> G3_DEV
-> G4_AUDIT
-> G5_PREVIEW
-> wait for user preview confirmation
```

This makes `DONE` a releasable terminal state, but not a permanent exemption from future Gate re-entry.

### 4. Standardize the post-dev preview prompt

After development is complete and audit passes, the agent must respond with:

```text
开发完毕，请在浏览器预览 http://URL 地址，确认后说“预览通过，可以发布”
```

Rules:
- The agent must not publish before that user confirmation.
- The agent must not skip preview confirmation because the project was previously published.
- If the user asks for more changes after preview, the workflow remains in resumed development flow and repeats as needed.

## Alternatives Considered

### Option A: Documentation-only enforcement

Add rules only in `SKILL.md`.

Rejected because:
- It still relies entirely on agent compliance.
- It does not provide an explicit state transition for resumed development.

### Option B: Entry enforcement plus `reopen-dev`

Chosen because:
- It matches the requested boundary: only the `webgen` agent entry must enforce the rule.
- It is small, auditable, and consistent with the existing Gate model.

### Option C: Script-level source fingerprint enforcement

Not chosen for this change because:
- It exceeds the requested scope.
- It increases complexity without being required for entry-level enforcement.

## Affected Files

- `SKILL.md`
  Add resumed-development guard and fixed preview prompt.
- `scripts/gate.js`
  Add `reopen-dev` command and CLI option parsing for `--reason`.
- `scripts/gate.test.js`
  Add regression tests for reopen behavior and command restrictions.
- `references/gate-fsm.md`
  Document resumed-development re-entry behavior.

## Validation

The solution is correct when these scenarios hold:

1. Existing project at `DONE`, user asks to add `/about`
- Agent reads Gate status.
- Agent executes `reopen-dev`.
- Agent only then starts coding.

2. Existing project at `G5_PREVIEW`, user asks to fix a bug
- Agent reopens to `G3_DEV`.
- Agent re-runs audit.
- Agent asks the user to preview again.

3. Fresh project
- Existing initialization and forward Gate flow remain unchanged.

4. Invalid reopen
- `reopen-dev` fails from `G0_INIT` through `G4_AUDIT`.

## Risks

- Intent classification is still done by the agent workflow, so `SKILL.md` wording must be explicit and hard to misread.
- If future tooling invokes `scripts/gate.js` directly without going through `webgen`, this enforcement will not apply. That is acceptable for the agreed scope.
