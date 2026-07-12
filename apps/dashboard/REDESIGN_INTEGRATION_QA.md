# Dashboard Redesign Integration and Design Review QA

Date: 2026-07-12
Tasks: `t66-dashboard-redesign-integration-and-visual-regression`,
`t55-dashboard-design-review-from-screenshots`

## Scope and method

This audit covers the consolidated manager home and event list, create/edit flows, event workspace,
tabs, theme gallery, event and guest modals, top navigation, Select, Combobox, calendar, cards,
badges, and responsive overlay behavior. It combines the authenticated before-state screenshots
supplied by the user, source and dependency inspection, official shadcn v4 dry-run diffs, the
deterministic `/ui-showcase` review surface, existing interaction tests, workspace typechecks, and
production builds.

The local preview server could not bind inside the sandbox and the configured browser runtime had
no browser backend. Consequently, this record does not claim a live after-state screenshot. The
completion decision accepts the supplied screenshots as the visual baseline and uses source review,
the existing responsive suites, and the UI showcase as the after-state regression evidence.

## Component and dependency boundaries

- Dashboard feature code consumes project-owned wrappers through `@lumiere/dashboard-ui` package exports.
- `@base-ui/react` is owned by `packages/dashboard-ui`; dashboard feature code has no direct Base UI dependency.
- No `@radix-ui/*` or `radix-ui` dependency is present in the dashboard package graph or lockfile.
- `node scripts/check-dashboard-ui-boundary.mjs` confirms that `apps/invite` and `packages/themes` do not import dashboard UI, shadcn, or Base UI.
- `apps/dashboard/components.json` and `packages/dashboard-ui/components.json` match on `base-nova`, neutral base color, CSS variables, Lucide icons, RTL, menu color/accent, prefix, and shared UI/utils aliases. Their CSS and app-local aliases differ intentionally by workspace.

## Upstream wrapper review

The following command reviewed the highest-risk wrappers without writing files:

```bash
pnpm dlx shadcn@latest add button select combobox calendar dialog drawer field popover --diff --cwd apps/dashboard
```

Decisions:

- Formatting-only registry differences were not copied into project files.
- The upstream dialog currently removes Lumiere’s viewport height and vertical scrolling constraints. That change was intentionally rejected because event forms must remain usable on short screens.
- The upstream drawer currently changes its shared content container to `overflow-hidden`. That change was intentionally rejected because the navigation and date-picker drawers still require a safe scrolling fallback in addition to the explicit scrolling body used by `ResponsiveModal`.
- Application Select and Dropdown Menu items were brought into the documented group composition.
- Icons inside shadcn buttons now defer sizing to the shared Button/Menu wrappers.

## Navigation and data-loading review

- Desktop and tablet use one centered horizontal top navigation; no permanent sidebar is rendered.
- Mobile shows the burger at the left edge, brand next, and account controls at the right. Route
  items exist only inside the labelled navigation Sheet. The Sheet animates fully on and off canvas
  and respects reduced-motion preferences.
- `/events` redirects to `/`, so the manager home is the single consolidated event-management entry point.
- The manager home loads its own events, summaries, and activity. Its loading state renders shape-matched skeletons and does not render fake zero metrics.

## Supplied screenshot review and remediation

| Before-state finding | Remediation | After-state evidence |
| --- | --- | --- |
| Event type/Publish status and Starts/Ends had mismatched vertical starts in the narrow event-edit modal. | Paired fields now reserve matching description space, Starts and Ends have parallel guidance, the pairs wait until `md` to split, and date/time controls stack on narrow phones. | Form source review plus event form, responsive modal, and date/time interaction suites. |
| The event workspace exposed the internal event UUID and repeated Home in the top navigation, breadcrumb, and header action. | User-facing copy now says `Event`/`selected event`, the route still retains its ID, and the redundant header Home action is removed. | Shell source review and dashboard route/navigation suites. |
| The Theme mode popup escaped its card and spread across the gallery. | Theme-card selects no longer align the selected item with the trigger; the shared anchored popup width and collision positioning are used. | Theme gallery source review plus Select and theme workspace suites. |
| The mobile navigation appeared and disappeared instantly. | Mobile navigation now uses the project-owned Base UI Sheet with explicit 300 ms full-width enter/exit transforms. Global and local reduced-motion rules remove the transition when requested. | Sheet/source review plus open, close, Escape, backdrop, navigation, breakpoint, and focus-restoration tests. |

## Design disposition

| Surface or pattern | Decision | Review result |
| --- | --- | --- |
| Manager event list | Kept and consolidated into Home | Home owns event loading, summaries, activity, empty/error/retry states, and event creation; `/events` redirects to it. |
| Permanent sidebar and duplicate route menus | Removed | Desktop/tablet use one centered horizontal top navigation; mobile route links live only in the Sheet. |
| Event workspace tabs | Kept | One consistent tab model links Overview, Content, Theme, Guests, Responses, Activity, and Settings. |
| Workspace identifiers and Home action | Redesigned | Internal UUID copy and the duplicate header action are removed without changing route URLs. |
| Create/edit forms | Redesigned | Create fields use full rows; edit-only Event type/Publish status share a balanced row; labels, help, required, error, disabled, and saving states use shared field anatomy. |
| Event date/time controls | Redesigned | Calendar popover/mobile drawer and time Select replace raw browser date/time controls, retain timezone context, bounds, clearing, and keyboard behavior, and stack safely on phones. |
| Select and Combobox | Redesigned | Project-owned shadcn/Base UI wrappers provide anchored overlays, grouped items, loading/empty/invalid/disabled states, and consistent focus treatment. |
| Event and guest modals | Kept with responsive redesign | Desktop dialogs and mobile drawers share a fixed header and independently scrollable body so long content and actions remain reachable. |
| Buttons | Redesigned | Shared Button variants establish Edit/Create/Save as primary and refresh/cancel/navigation as secondary; disabled/loading behavior remains explicit. |
| Cards and badges | Kept and normalized | Semantic surface, border, radius, spacing, status tone, and density tokens are consistent across overview metrics, event cards, notices, and theme cards. |
| Theme gallery | Kept with interaction fixes | Compatible themes, per-card Theme mode, automatic save on Use theme, and responsive preview remain; the redundant selected-settings card and overflowing popup pattern are gone. |
| Browser-default/wireframe controls | Removed from dashboard feature flows | Dashboard inputs, overlays, dates, menus, cards, skeletons, and states all use project-owned wrappers or deliberate semantic compositions. |

## Existing responsive regression coverage

The repository does not add new tests for this task, per `AGENTS.md`. Existing suites cover the highest-risk structural and interaction regressions:

- `dashboard-top-navigation.test.tsx`: centered desktop navigation, leftmost mobile burger, animated
  Sheet open/close, Escape, backdrop close, breakpoint close, and focus restoration.
- `responsive-modal.test.tsx`: desktop dialog and mobile drawer presentations.
- `event-date-time-picker.test.tsx`: desktop popover, mobile drawer, keyboard date selection, time bounds, and clear behavior.
- `dashboard-fields.test.tsx`: Select and Combobox labels, invalid, disabled, loading, empty, and overlay behavior.
- `manager-overview-workspace.test.tsx`: direct consolidated loading, shape-matched skeletons, real metrics, partial failures, empty state, and retry.
- `theme-selector-workspace.test.tsx`: compatible theme filtering, mode choice, and mobile/desktop preview viewports.
- event/guest workspace tests: modal creation/editing, loading, empty, error, validation, and successful mutation paths.

## Responsive evidence matrix

Target widths remain `390×844`, `768×1024`, and `1440×1000`. The table distinguishes supplied
visual evidence from post-fix structural evidence so an automated result is not presented as a
pixel-level screenshot.

| Surface | Supplied visual baseline | Post-fix responsive evidence |
| --- | --- | --- |
| Manager home and navigation | Desktop event-workspace capture plus reported mobile transition defect | Navigation, manager overview, loading, and route suites; animated Sheet and breakpoint source review |
| Event overview/workspace navigation | Desktop event-workspace capture | Route and event-overview suites; duplicate action/UUID source review |
| Theme gallery and expanded preview | Desktop theme-gallery capture | Theme workspace suite covers filtering, mode choice, and mobile/desktop preview states; anchored popup source review |
| Event create/edit modal | Narrow event-edit capture | Event form and responsive modal suites; aligned descriptions and phone stacking source review |
| Guest create/edit modal | No supplied capture | Guest workspace and responsive modal suites cover create/edit, validation, state transitions, desktop dialog, and mobile drawer |
| Select and Combobox popups | Theme-mode capture | Field suite covers labels, keyboard overlay behavior, invalid, disabled, loading, empty, and selection states |
| Date and time pickers | Narrow event-edit capture | Date/time suite covers desktop popover, mobile drawer, keyboard selection, bounds, and clear behavior |

## Interaction and accessibility results

- Top navigation, mobile Sheet, notification popover, and account menu use keyboard-managed Base UI
  primitives; the existing suites verify Escape, backdrop close, route close, breakpoint close, and
  trigger focus restoration.
- Select and Combobox use grouped items and anchored portals; tests cover keyboard selection,
  loading, empty, disabled, invalid, and labelled states.
- Date controls retain calendar keyboard navigation, valid start/end bounds, and mobile drawer
  behavior. Long modal content uses a fixed header and scrollable body.
- The dashboard global reduced-motion rule collapses animation and transition duration; the mobile
  Sheet also declares a local reduced-motion fallback.
- Loading, empty, partial-error, retry, success, disabled, focus, hover, active, and saving states are
  represented in the current dashboard workspaces and shared UI showcase.

No additional product defect remained after the screenshot remediation and focused t55 review, so
no follow-up feature task was created. A future CI screenshot runner can strengthen the baseline but
is not required to correct the reviewed product issues.
