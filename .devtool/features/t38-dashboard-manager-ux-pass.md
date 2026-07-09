---
id: "t38-dashboard-manager-ux-pass"
status: "backlog"
priority: "high"
assignee: null
epic: "frontend"
dueDate: null
created: "2026-07-07T00:00:00+08:00"
modified: "2026-07-09T01:24:12.106Z"
completedAt: null
labels: ["dashboard", "uiux", "information-architecture", "frontend"]
order: "a38"
---
# t38-dashboard-manager-ux-pass - Dashboard manager UX pass

## Hierarchy

- Epic: `frontend`
- Dependencies: `t21-dashboard-event-overview`, `t22-dashboard-theme-selector`, `t23-dashboard-section-builder`, `t24-dashboard-guest-management`, `t25-dashboard-responses-activity`

## Scope

Run a focused dashboard UX pass across event management flows so Lumiere feels trustworthy, safe, and efficient for managers on desktop and mobile.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `extra high`

## Acceptance

- \[ \] Dashboard navigation always makes the current event and editing context clear.
- \[ \] Overview cards explain attending, not attending, pending, total invited, max pax, and recent activity in a scannable hierarchy.
- \[ \] Theme, content, guest, response, and activity screens share consistent layout rhythm and action placement.
- \[ \] Risky edits and destructive actions have clear confirmations or draft states.
- \[ \] Dashboard mobile fallback supports key management tasks without broken tables or overflow.
- \[ \] A UX audit note records issues found and fixes applied.

## UI Quality Checklist

- \[ \] Uses Tailwind tokens and project-owned primitives before adding a component library.
- \[ \] Follows Lumiere color, shape, brand, and theme locks from `SKILL.md`.
- \[ \] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- \[ \] Works on required mobile and desktop viewport widths.
- \[ \] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- \[ \] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Use `SKILL.md` dashboard quality bar. Keep decorative event styling mostly in previews, not management surfaces.

## Progress Log

- 2026-07-07T00:00:00+08:00: Task created.
- 2026-07-09T08:41:43+08:00: Improved dashboard navigation discoverability after manager feedback. Event list cards now expose direct workspace/theme/content/guest/activity links, and the dashboard sidebar shows event workspace sections when viewing an event route.
- 2026-07-09T08:47:30+08:00: Fixed invalid API response errors on guest, responses, activity, section, and RSVP payloads by normalizing database timestamp strings to shared API ISO datetimes before client schema parsing.
- 2026-07-09T09:09:07+08:00: Added deterministic local demo seed data for dashboard and invite validation, including a published event, theme sections, guest groups, RSVP responses, activity, notifications, and ready-to-open URLs.