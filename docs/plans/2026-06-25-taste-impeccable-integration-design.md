# Taste and Impeccable Integration Design

**Goal:** Integrate Taste Skill into the existing `webgen` + impeccable workflow so marketing and redesign pages get stronger visual output without creating a parallel workflow or exploding CDP screenshot cost.

## Problem

The current system has three separate sources of design guidance:

- `SKILL.md` contains page-type heuristics and visual suggestions.
- `references/design-skill-guide.md` defines the impeccable workflow.
- `design-taste-frontend` provides anti-slop design constraints, dials, and pre-flight rules.

Today they are only loosely connected:

- `SKILL.md` hardcodes some page-type → design-output mappings.
- `design-skill-guide.md` only mentions Taste once during critique.
- `phase3-audit.md` and `SKILL.md` rely on browser screenshot checks during audit and preview, which can compound token usage when visual review loops become too chatty.

This causes three issues:

1. Taste is underused at the moment when it matters most: before layout and visual decisions are locked.
2. Some `SKILL.md` heuristics are too prescriptive and can conflict with Taste’s inference-first model.
3. CDP screenshot usage is not budgeted, so repeated preview/audit iterations can consume excessive tokens.

## Design Principles

The integration must follow these rules:

1. Taste does not replace impeccable.
2. Taste defines visual direction and anti-slop constraints.
3. Impeccable remains the main execution and correction loop.
4. Taste is strongest for landing pages, brand pages, About pages, marketing pages, and redesigns.
5. Taste should not force overdesigned outcomes for dashboards, tools, forms, or dense product UI.
6. Screenshot checks must be budgeted and reused across phases.

## Recommended Model

Use a four-layer structure:

### Layer 1: Page-Type Routing in `SKILL.md`

`SKILL.md` should stop prescribing a fixed visual output per page type.

Instead, it should route pages into one of three categories:

- **Taste required**
  - Landing page
  - Brand site
  - About / story page
  - Campaign / marketing page
  - Existing-project redesign
- **Taste recommended**
  - Product feature page
  - Onboarding / login / signup
- **Taste lightweight or optional**
  - Dashboard
  - Data page
  - Form / tool page
  - Settings / management page

For each page category, `SKILL.md` should define:

- preferred Taste module
- suggested dial ranges
- motion ceiling
- notes on when stronger narrative or animation patterns are allowed

This converts the current “page type = fixed answer” model into “page type = design routing rule”.

### Layer 2: Taste Pre-Configuration Before Impeccable Shape/Craft

`references/design-skill-guide.md` should insert a Taste configuration step into phase 0.

Recommended order:

```text
init
→ teach
→ taste-read
→ taste-module-select
→ taste-dials
→ taste-constraint-lock
→ shape
→ craft
```

The Taste pre-configuration step should require:

1. one-line `Design Read`
2. module selection:
   - `design-taste-frontend`
   - `gpt-taste`
   - `image-to-code`
   - `redesign-existing-projects`
   - `ux-interaction-taste-skill`
3. dial initialization:
   - `DESIGN_VARIANCE`
   - `MOTION_INTENSITY`
   - `VISUAL_DENSITY`
4. font system choice
5. Tailwind base palette choice
6. anti-slop prohibitions written into design context

These outputs should be written back into `.webgen/design.md` so later impeccable steps operate from the same design contract.

### Layer 3: Impeccable Stays the Main Closed Loop

Impeccable remains the primary workflow skeleton:

- `shape`
- `craft`
- `audit`
- `polish`
- `harden`
- `adapt`
- `clarify`
- `optimize`

Taste should not become a second parallel loop.

Instead:

- first-round critique should include Taste pre-flight and anti-slop checks
- second-round polish should include a final Taste consistency recheck

This keeps responsibilities clean:

- Taste: design direction, anti-slop, visual discipline
- Impeccable: generation, correction, enhancement, hardening

### Layer 4: Screenshot Budgeting

Visual verification must be explicitly budgeted.

Recommended screenshot rules per page task:

- **G3_DEV → G4_AUDIT**
  - default budget: 2 screenshots max
  - 1 full-page or first-screen screenshot
  - 1 focused screenshot for the most critical module or a detected problem area
- **G4_AUDIT → G5_PREVIEW**
  - default budget: 1 screenshot max
  - only for preview readiness confirmation
- **Taste pre-flight / anti-slop review**
  - no new screenshot by default
  - must reuse audit screenshots first
  - one extra local screenshot allowed only if the issue cannot be judged from code or existing captures

Hard limits:

- normal page task total: 3 screenshots
- absolute ceiling: 4 screenshots
- after ceiling is reached, the agent must stop taking screenshots and summarize remaining uncertainty instead of continuing blindly

## Proposed Changes by File

### `SKILL.md`

Replace the current “用户需求优化” section with a routing-based version:

- page type classification
- Taste required / recommended / optional
- module selection guidance
- dial-range guidance
- explicit note that examples are candidate strategies, not mandatory outputs

Examples:

- About / story page:
  Taste required; `design-taste-frontend` by default, `gpt-taste` for high-drama narrative pages
- Marketing page:
  Taste required; allow higher motion only if brief supports it
- Form / tool page:
  Taste optional; keep interaction restrained and efficiency-first

### `references/design-skill-guide.md`

Add a dedicated Taste integration subsection under phase 0:

- Design Read
- module select
- dial init
- typography and palette lock
- anti-slop lock
- write results into `.webgen/design.md`

Also change “critique + /design-taste-frontend” into a more explicit integrated check:

- `critique + Taste Pre-Flight`

### `references/phase3-audit.md`

Add two new audit concepts:

1. screenshot budget and reuse rules
2. Taste-based anti-slop recheck tied to existing screenshots

It should explicitly forbid opening repeated screenshot loops unless a concrete unresolved UI risk remains.

## Expected Outcomes

This design should produce:

1. better visual quality on landing, brand, About, marketing, and redesign work
2. less templated output because Taste is applied before shape/craft
3. fewer conflicts with dashboards and tools because Taste is not forced everywhere
4. lower token usage because screenshot review becomes budgeted and reused

## Risks

- If `SKILL.md` keeps too many hardcoded page-type outputs, Taste inference will still be bypassed.
- If Taste checks are described as an additional loop instead of part of impeccable, the workflow will become bloated.
- If screenshot budget is too strict without exception wording, real regressions might be missed; therefore the design includes a small emergency allowance.

## Acceptance Criteria

The integration is correct when:

1. a landing page request triggers Taste-required routing before shape/craft
2. a form or dashboard request does not get forced into cinematic motion or over-varied layout
3. `.webgen/design.md` captures the selected Taste module and the three dials
4. audit and preview phases reuse screenshots rather than repeatedly generating new ones
5. the total screenshot budget is clearly documented and easy for an agent to follow
