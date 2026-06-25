# Preview Dist Persistence Design

**Goal:** Ensure the preview stage persists a concrete `dist` path into `.webgen/project.json` after a successful build, instead of relying on marker-time fallback only.

## Problem

Today `node scripts/emit-publish-marker.js <project-path>` falls back to `<project>/dist` when `.webgen/project.json.dist` is empty. That keeps the publish marker usable, but the metadata file itself still says `dist: null` during `G5_PREVIEW`.

This creates two sources of truth:
- marker consumers see a usable dist path
- metadata readers still see a missing dist value

The user expectation is that once preview runs `npm run build`, `.webgen/project.json.dist` should contain the built output path.

## Options Considered

### Option A: Persist preview dist in a dedicated script after build

Run a small CLI immediately after preview-stage `npm run build`. The CLI reads `.webgen/project.json`, sets `dist` to `<project>/dist`, updates `updatedAt`, and writes the file back.

**Pros**
- Keeps responsibility explicit: preview build completion triggers metadata persistence
- Reusable from any preview entrypoint, not just marker printing
- Preserves `emit-publish-marker.js` as a mostly read-only formatter

**Cons**
- Adds one more small script/helper

### Option B: Persist inside `emit-publish-marker.js`

Make the marker CLI mutate `.webgen/project.json` before printing.

**Pros**
- Fewer files

**Cons**
- Hidden side effect in a command that looks like pure output generation
- Couples metadata persistence to marker emission instead of build completion

## Decision

Choose **Option A**.

The persistence action should be explicit and tied to preview build success. A separate helper/CLI keeps the boundary clear and avoids surprising writes from a formatting command.

## Design

Add a shared helper under `scripts/lib/` that:
- resolves `<project>/.webgen/project.json`
- reads existing metadata
- sets `dist` to `<project>/dist`
- sets `updatedAt` to the current ISO timestamp
- writes the updated JSON back
- returns the persisted path for callers/logging

Add a thin CLI wrapper:
- `node scripts/persist-preview-dist.js <project-path>`

Update `SKILL.md` preview-stage SOP so the documented command sequence becomes:
- `npm install`
- `npm run dev`
- `npm run build`
- `node scripts/persist-preview-dist.js <project-path>`

`emit-publish-marker.js` will keep its current fallback behavior. This preserves compatibility for cases where persistence has not run yet, while making preview stage write the expected metadata in the normal flow.

## Testing

Use TDD with `node:test`.

Add tests for:
- persisting `dist` from `null` to `<project>/dist`
- updating `updatedAt`
- leaving unrelated metadata fields intact
- marker output preferring the persisted `dist` value after preview persistence runs

## Impact

- Preview-stage metadata becomes accurate immediately after build
- Publish stage can still overwrite `dist` later with the final zip path
- Existing marker fallback remains as a defensive safeguard
