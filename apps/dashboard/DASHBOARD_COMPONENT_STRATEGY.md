# Dashboard Component Strategy

## Decision

Use improved project-owned dashboard primitives for this pass. Do not adopt HeroUI yet.

HeroUI v3 is attractive for common controls, but the current documented package is still beta,
requires React 19 and Tailwind CSS v4, and adds a global `@heroui/styles` import. Lumiere already
meets the React/Tailwind requirements, but the dashboard problems in this task are mostly consistency,
spacing, state treatment, and timezone clarity. Those are safer to solve with small local primitives
before taking on a beta component dependency.

Revisit HeroUI or another component library when the dashboard needs richer calendar pickers,
command menus, complex comboboxes, or modal focus management that would be expensive to maintain
locally.

## Current Primitives

The shared controls live in `apps/dashboard/components/ui/dashboard-fields.tsx`.

- `DashboardTextInput`, `DashboardTextArea`, `DashboardSelect`, and `DashboardDateTimeInput`
  standardize labels, helper text, errors, focus rings, disabled states, and radius.
- `DashboardDateTimeInput` keeps native `datetime-local` behavior and surfaces the event timezone
  beside the control so managers know how guest-facing times will be interpreted.
- `DashboardCheckbox` and `DashboardSwitch` cover boolean settings with larger hit areas.
- `DashboardButton` centralizes primary and secondary button treatments.
- `DashboardNotice` covers alert/status messaging.
- `DashboardPopover`, `DashboardDialog`, `DashboardDrawer`, and `DashboardTabs` provide local
  building blocks for the next dashboard surfaces without changing `globals.css`.

## Applied Surfaces

- Event create/edit basics now use the shared field primitives.
- Section builder content, settings, asset, visibility, JSON, checkbox, select, number, and date-time
  fields now use the shared field primitives.

## Guardrails

- Keep `globals.css` limited to design tokens, base document styles, and reduced-motion behavior.
- Prefer native browser behavior until a control truly needs library-level keyboard/focus logic.
- New dashboard forms should start from the shared primitives before adding page-local control chrome.
- If a library is adopted later, wrap it behind these primitives first so event basics, guests, RSVP,
  theme settings, and content sections do not drift apart.
