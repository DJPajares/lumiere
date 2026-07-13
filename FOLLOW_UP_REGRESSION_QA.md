# Follow-up Integration and Regression QA

Date: 2026-07-14  
Task: `t80-follow-up-integration-and-regression-suite`  
Increment: `t68` through `t79`

## Verification command

Run the focused increment gate from the repository root:

```bash
pnpm check:follow-up-regression
CI=true pnpm typecheck
pnpm lint
CI=true pnpm build
```

The gate checks Next Image usage and loading contracts, theme ownership boundaries, and every
existing workspace test. CI also runs image, theme-boundary, and theme-registry contract checks as
named steps before the normal lint, typecheck, and test gates.

The workspace pins TypeScript to `^6.0.3`. Next.js 16 embeds the JavaScript compiler API during its
production build, while TypeScript 7's native package does not yet expose a stable programmatic API.
The 6.x line preserves that integration contract; both Next applications complete their optimized
production builds with this pin.

## Manager workflow evidence

The manager flow is covered across existing route and component suites rather than a second browser
automation framework:

1. `dashboard-routes.test.tsx` renders the signed-out route, validates required credentials, submits
   a manager sign-in, preserves a safe event redirect, renders the authenticated shell, and verifies
   bearer-token API requests.
2. `dashboard-top-bar-controls.test.tsx` verifies notification loading, unread state, safe
   destination navigation, persistent dismissal, optimistic recovery, empty/error states, and
   keyboard focus restoration.
3. `section-builder-workspace.test.tsx` covers story paragraph titles/bodies, legacy normalization,
   add/reorder/validation, live preview, RSVP response-field settings, custom questions, dirty
   recovery, and successful saves.
4. `theme-selector-workspace.test.tsx` covers compatible-theme filtering, isolated public theme APIs,
   expanded preview, mobile/desktop preview modes, light/dark variants, automatic save, and failure
   recovery.
5. `event-overview-workspace.test.tsx` covers readiness blockers, preview destinations, publish and
   unpublish confirmations, stale-version recovery, and the successful live state.
6. `event-settings-workspace.test.tsx` verifies the deletion danger zone, exact case-sensitive event
   title confirmation, disabled destructive action, retained-data copy, and dirty-close safeguard.

Publishing uses immediate updates. Managers who need private revisions must unpublish first. Event
deletion remains a 30-day recoverable tombstone; irreversible purge remains deferred as documented
in t71.

## Guest workflow evidence

1. `invite-routes.test.tsx` covers public and guest invite loading, unavailable/disabled links,
   guest-only data separation, the map fallback/open action, and safe metadata.
2. `public-invite.test.tsx` covers light, dark, system, and toggleable modes; a persisted keyboard
   button toggle; real map embedding and safe external directions; story rendering; and common versus
   specialized section contracts.
3. `rsvp-form.test.ts` runs the common and editorial-ledger renderers through labels, max-pax,
   configurable guest-name/message fields, questions, validation, loading, recovery, success, update,
   attending, declining, and successful submission payloads.
4. API RSVP, publication, slug, event-settings, and lifecycle suites remain the server-authoritative
   cross-layer checks for field availability, safe map URLs, publish readiness, tombstones, and guest
   access.

## Visual regression contracts

The existing suites now retain deterministic inline snapshots for:

- dashboard navigation at the `390px` mobile, `768px` tablet, and `1440px` desktop contract points,
  including the mobile-only trigger, tablet/desktop navigation switch, and responsive shell spacing;
- four materially different invite directions: Editorial Ivory, Garden Light, Modern Minimal, and
  Celestial Gold. Each snapshot records mode, backdrop, frame, ornament, image treatment, hero class,
  composition map, and section-composition rhythm.

These are stable rendered-structure and responsive-class snapshots, not pixel-diff screenshots. The
configured in-app browser had no available backend during this pass, so fresh live screenshots and
automated pixel comparisons are intentionally deferred. Existing responsive interaction suites and
the deterministic `/ui-showcase` remain the local review surfaces when a browser backend is
available.

## Image and layout checks

`pnpm check:next-image-usage` now rejects:

- raw `<img>` elements in dashboard, invite, or theme source;
- Image usages without responsive `sizes`;
- direct Next Image usages without intrinsic dimensions or a constrained `fill` layout;
- dynamic remote media below the hero without lazy loading;
- undocumented eager/priority loading outside the public invite hero;
- removal of the unoptimized remote-media policy from either Next app.

Rendered tests additionally assert lazy gallery, backdrop, preview, and map loading. External image
and map-provider availability still depends on the guest network, so remote HTTP uptime is not
represented as a deterministic CI assertion; meaningful alt text, reserved aspect ratios, safe
fallbacks, and direct loading prevent an upstream failure from collapsing layout or exposing an
unsafe optimizer path.

## Accessibility and UI pre-flight

- Manager sign-in now uses the shared Base UI-backed `Field`, `Input`, and `Button` components with
  labelled controls, alert-linked errors, disabled state, and a status announcement.
- Notification controls expose labelled open/dismiss actions and restore focus on Escape.
- Publish/unpublish and deletion use titled dialog/alert-dialog flows with explicit safe exits.
- Theme mode uses a labelled, pressed-state button with event-scoped persistence.
- Maps have descriptive iframe titles, textual venue fallbacks, attribution, and safe external-link
  attributes.
- Common and specialized RSVP renderers share labels, field errors, focus treatment, max-pax copy,
  disabled/recovery behavior, and polite success announcements.
- Dashboard controls remain inside `@lumiere/dashboard-ui`; invite/theme rendering remains custom.
- Mobile, tablet, desktop, light/dark, loading, empty, error, success, disabled, focus, hover, active,
  and reduced-motion behavior are covered by the listed suites and contract snapshots where relevant.

## Intentionally deferred behavior

- Permanent deletion/purge worker and external media-object cleanup remain deferred by the t71
  deletion policy.
- Pixel-diff screenshot CI and an axe browser runner remain future infrastructure work. Current
  accessibility assertions are role/name/state based and are supplemented by the existing
  `UI_QA_AUDIT.md` contrast review.
- Live provider uptime for arbitrary remote images, OpenStreetMap embeds, and external directions is
  network-dependent and must be checked during a browser-enabled release review.
