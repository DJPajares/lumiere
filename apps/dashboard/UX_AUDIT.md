# Dashboard Manager UX Audit

Date: 2026-07-09
Task: `t38-dashboard-manager-ux-pass`

## Issues Found

- Event routes showed workspace tabs, but the shell did not always make the current event ID and editing section visible outside the main content.
- Mobile event tabs could be read as a plain link strip without a clear current-section summary.
- Overview metrics mixed total invited pax and maximum attendance in a way that made two cards look duplicative.
- Recent activity existed as a list, but the overview card hierarchy did not expose whether anything had happened recently.
- Risky guest invite actions already had confirmations; theme and content edits already used save-before-apply draft flow, but the dashboard needed clearer context around where those edits are being made.

## Fixes Applied

- Added route-derived workspace context to the dashboard shell header and sidebar: scope, current editing section, and event ID.
- Updated event section tabs with a current-section label and shrink-safe horizontal scrolling for mobile.
- Adjusted overview cards so total invited reports active guest groups, maximum attendance reports max pax, and recent activity reports update count plus latest timestamp.
- Kept destructive guest actions behind explicit confirmation states.

## Manual Review Notes

- Dashboard styling remains neutral and operational; event theme personality stays inside invite previews and theme metadata.
- Tables and response rows keep mobile labels instead of forcing horizontal data tables.
- Focus rings, hover states, disabled states, loading states, empty states, error states, and status labels remain visible.
