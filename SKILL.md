---
name: lumiere-uiux-skill
description: Project-specific UI/UX guardrails for Lumiere. Apply TasteSkill philosophy to a luminous premium invitation PWA and a calm event manager dashboard.
---

# Lumiere UI/UX Skill

> Use this file for frontend and full-stack UI tasks. Apply rules contextually. The public invite app can be expressive and emotional. The dashboard must stay clear, trustworthy, and efficient.

## 0. Brief Inference

```text
Reading this as: a premium multi-event invitation and RSVP platform named Lumiere for hosts and guests, with a luminous editorial/event-brand language for the public invite and a calm modern admin language for the dashboard, leaning toward Tailwind CSS as styling foundation with project-owned components and theme-specific section renderers.
```

## 1. Design Dials

```text
DESIGN_VARIANCE: 7
MOTION_INTENSITY: 5
VISUAL_DENSITY: 4 for invitation pages, 7 for dashboard management screens
```

Interpretation:

- Invitation pages can feel emotional, spacious, and theme-specific.
- Dashboard screens should be denser, predictable, and utility-first.
- Motion should add ceremony, feedback, or state clarity. Avoid constant animation.

## 2. Lumiere Brand Identity

Lumiere should feel like light made practical: premium, warm, memorable, and refined. The brand should frame each event without turning every event into the same gold luxury theme.

Brand rules:

- Use the Lumiere mark for PWA, install, favicon, metadata, and app-shell identity.
- Public invite pages should feel luminous and event-specific.
- Dashboard surfaces should feel composed, precise, and operational.
- Gold or light motifs may be used for the Lumiere brand, but event themes can choose different palettes.
- Avoid making every theme look like a wedding or luxury-gold template.
- Do not use the logo as decoration inside every section.

## 3. Design System Selection

- Do not add a default component library.
- Use Tailwind CSS as the styling foundation.
- Tailwind is not a complete design system. Define tokens, primitives, states, and section rules.
- Add Radix primitives or another accessible package only when a task needs dialogs, popovers, menus, tabs, or similar primitives and the dependency is documented.
- Keep one component strategy across both apps.

## 4. App Personality Split

### Public Invitation App

- Premium, polished, emotional, and event-specific.
- Section rhythm matters more than dashboard-like density.
- Use real event images or clearly marked placeholders.
- The RSVP section should feel integrated into the invitation design.
- Generic public pages must still feel complete without RSVP.

### Dashboard App

- Calm, practical, and trustworthy.
- Prioritize scanability, clear forms, and safe editing.
- Use summary cards, grouped sections, tables only when they are the clearest pattern, and contextual validation.
- Keep decorative event styling out of management surfaces except in previews.

## 5. Color, Shape, And Theme Locks

- Each event theme has one primary accent and semantic status colors.
- Dashboard uses a neutral administrative palette with one product accent.
- Theme variants support light-only, dark-only, system, or toggleable behavior.
- Do not randomly switch accent color between sections.
- Pick a radius system per theme and apply it consistently.
- Use off-black and off-white instead of pure black and pure white.

## 6. Typography Rules

- Invitation themes may use stronger display typography when justified by the event style.
- Dashboard typography should prioritize legibility and hierarchy.
- Avoid serif as the default. Use serif only when a theme genuinely calls for editorial, luxury, heritage, or formal tone.
- Visible copy must be specific and event-appropriate.
- Avoid placeholder copy and generic AI words such as seamless, revolutionize, unleash, and elevate.

## 7. Layout Rules

- Do not default to centered hero plus three cards.
- Public invite sections should vary in rhythm: hero, details, story, gallery, location, RSVP, outro.
- Multi-column sections must declare mobile collapse behavior.
- Use `min-h-[100dvh]` instead of `h-screen` for viewport-height sections.
- Use CSS Grid for section layouts rather than brittle flex percentage math.
- Dashboard navigation must remain single-line or deliberately collapse.

## 8. RSVP Form Rules

- Labels above inputs. Never placeholder-only labels.
- Guest group max pax must be visible before choosing attendee count.
- Disabled and closed RSVP states must be clear.
- Confirmation should be celebratory but not noisy.
- Preserve entered guest data when recoverable errors occur.
- Show contextual errors near fields.

## 9. Motion Rules

Motion must communicate one of these:

- ceremony
- hierarchy
- feedback
- state transition

Rules:

- Respect reduced-motion settings.
- Animate transform and opacity where practical.
- Do not update React state on every scroll frame.
- Avoid infinite loops unless theme-specific and subtle.
- If motion cannot be implemented well, lower the motion and ship polished static UI.

## 9. Visual Asset Strategy

- Public invite pages need real event imagery or explicit asset slots.
- Do not create fake screenshot divs for event visuals.
- Gallery, cover, venue, and couple/celebrant images should reserve layout space.
- Dashboard previews can use the actual section renderer instead of fake cards.
- Missing assets should be represented as intentional upload prompts or TODO slots.

## 10. Accessibility And States

Every meaningful UI surface should consider:

- loading
- empty
- error
- success
- disabled
- focus
- hover and active states where applicable

Accessibility basics:

- Keyboard access for dashboard and RSVP actions.
- Accessible labels for icon-only buttons.
- Text alternatives for meaningful images.
- WCAG AA contrast where practical.
- Reduced-motion fallback.
- Color-coded dress code and RSVP states must include text labels.

## 12. Anti-Slop Bans

Avoid unless explicitly justified by a selected theme:

- AI-purple gradients
- generic centered hero plus three cards
- decorative badges or dots without user value
- repeated zigzag sections
- fake product screenshots or fake invite previews
- vague CTAs
- lorem ipsum
- emoji-heavy guest-facing UI
- pure black or pure white surfaces
- long form pages without grouping and progressive disclosure

## 13. Pre-Flight Review

Before marking a UI task done:

- [ ] The UI matches the public invite or dashboard design read.
- [ ] Tailwind tokens or selected primitives are used consistently.
- [ ] The primary action is obvious.
- [ ] Layout works on required viewport sizes.
- [ ] Public invite sections have varied rhythm.
- [ ] Dashboard information hierarchy is scannable.
- [ ] RSVP states are handled beyond the happy path.
- [ ] Loading, empty, error, success, disabled, focus, hover, and active states are handled where relevant.
- [ ] Typography, color, radius, spacing, and theme are consistent.
- [ ] Motion is purposeful or intentionally absent.
- [ ] Reduced-motion behavior exists for non-trivial animation.
- [ ] Button, form, and text contrast are acceptable.
- [ ] Visible copy is specific and not AI filler.

## 14. Theme Quality Bar

A Lumiere theme is not just a palette. Each theme must define:

- event type fit
- mood and design read
- section rhythm
- image treatment
- typography scale
- light/dark/system support
- RSVP form treatment
- dashboard preview thumbnail
- accessibility notes

A theme fails review if it only changes colors while leaving every section composition identical.

## 15. Dashboard UX Quality Bar

Dashboard UI should make event management feel safe and controlled. Before shipping dashboard surfaces, check:

- Manager always knows which event they are editing.
- Destructive actions have clear confirmation.
- Draft, published, RSVP open, and RSVP closed states are visible.
- Guest group max pax and RSVP counts are easy to scan.
- Activity timeline supports quick diagnosis.
- Theme and section changes have previews before publish where practical.
