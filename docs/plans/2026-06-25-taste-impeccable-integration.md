# Taste and Impeccable Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fuse Taste Skill into the existing `webgen` design workflow so the agent routes the right page types into Taste, initializes design dials before impeccable shape/craft, and enforces screenshot budgets during audit and preview.

**Architecture:** Convert `SKILL.md` from fixed page-output prescriptions into routing rules, insert a Taste configuration layer into `references/design-skill-guide.md`, and add screenshot-budget + screenshot-reuse rules into `references/phase3-audit.md` and any matching gate guidance text.

**Tech Stack:** Markdown workflow docs, existing `webgen` skill conventions, impeccable workflow references

---

### Task 1: Rewrite the page-type optimization section in `SKILL.md`

**Files:**
- Modify: `SKILL.md`

**Step 1: Replace fixed page-result prescriptions**

Rewrite `## 用户需求优化` so it no longer hardcodes:
- About page = always scrollytelling
- marketing page = always strong keyframes

Instead define:
- page-type routing
- Taste required / recommended / optional
- preferred module per category
- dial ranges per category

**Step 2: Preserve useful intent classification**

Keep the page categories because they are valuable for fast routing:
- About / story
- dashboard / data
- product feature
- campaign / marketing
- form / tool

**Step 3: Add candidate-strategy wording**

State that the old examples are candidate strategies, not mandatory outputs.

**Step 4: Review wording for conflict**

Ensure `SKILL.md` no longer conflicts with Taste’s inference-first model.

**Step 5: Commit**

```bash
git add SKILL.md
git commit -m "docs: route page types into taste workflow"
```

### Task 2: Insert a Taste configuration layer into `references/design-skill-guide.md`

**Files:**
- Modify: `references/design-skill-guide.md`

**Step 1: Extend phase 0**

Insert a Taste subsection between `teach` and `shape`.

**Step 2: Define required outputs**

Document that phase 0 must produce:
- Design Read
- module selection
- `DESIGN_VARIANCE`
- `MOTION_INTENSITY`
- `VISUAL_DENSITY`
- font system
- Tailwind base palette
- anti-slop lock

**Step 3: Define persistence**

Require these outputs to be written into `.webgen/design.md` so later steps share one contract.

**Step 4: Update first-round critique language**

Replace vague `critique + /design-taste-frontend` wording with explicit integrated review wording such as:
- `critique + Taste Pre-Flight`

**Step 5: Commit**

```bash
git add references/design-skill-guide.md
git commit -m "docs: insert taste pre-configuration into design workflow"
```

### Task 3: Add screenshot budget and reuse rules to audit guidance

**Files:**
- Modify: `references/phase3-audit.md`
- Review: `SKILL.md`

**Step 1: Define screenshot budget**

Document:
- G3→G4 default max 2 screenshots
- G4→G5 default max 1 screenshot
- Taste review reuses existing screenshots by default
- total normal budget 3
- absolute ceiling 4

**Step 2: Define reuse-first rule**

State that Taste anti-slop review must use existing captures first and may request one extra local screenshot only when unresolved.

**Step 3: Align Gate wording**

Check whether `SKILL.md` also needs a short matching sentence in the runtime validation section so the audit file and the skill do not drift.

**Step 4: Commit**

```bash
git add references/phase3-audit.md SKILL.md
git commit -m "docs: budget cdp screenshots in taste audit flow"
```

### Task 4: Review the combined workflow for consistency

**Files:**
- Review: `SKILL.md`
- Review: `references/design-skill-guide.md`
- Review: `references/phase3-audit.md`

**Step 1: Check responsibility boundaries**

Verify the docs make this clear:
- Taste = design direction and anti-slop
- Impeccable = main execution and refinement loop

**Step 2: Check routing consistency**

Verify page categories and module recommendations are consistent across all files.

**Step 3: Check screenshot consistency**

Verify there is one clear budget model, not multiple conflicting limits.

**Step 4: Commit**

```bash
git add SKILL.md references/design-skill-guide.md references/phase3-audit.md
git commit -m "docs: align taste and impeccable workflow guidance"
```

### Task 5: Final verification

**Files:**
- Verify only

**Step 1: Diff the docs**

Run:

```bash
git diff -- SKILL.md references/design-skill-guide.md references/phase3-audit.md
```

Expected:
- all changes reflect routing, Taste pre-configuration, and screenshot-budget rules

**Step 2: Search for stale wording**

Run:

```bash
rg -n "Scrollytelling \\+ GSAP ScrollTrigger|节奏感强的 keyframe 动画|critique \\+ /design-taste-frontend|take_screenshot\\(\\)" SKILL.md references/design-skill-guide.md references/phase3-audit.md
```

Expected:
- old hardcoded design prescriptions are removed or converted into conditional routing guidance

**Step 3: Manual consistency pass**

Confirm:
- landing pages and redesigns are Taste-required
- tools and dashboards are not forced into the same path
- screenshot limit wording is explicit and reusable

**Step 4: Final commit**

```bash
git add SKILL.md references/design-skill-guide.md references/phase3-audit.md
git commit -m "feat: integrate taste guidance into design workflow"
```
