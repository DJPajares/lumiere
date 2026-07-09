# Section Builder Preview Notes

Date: 2026-07-09
Task: `t39-section-builder-live-preview-ux`

## Contract

- The dashboard live preview parses section `content` and `settings` with the same `@lumiere/themes` section schemas used before public invite rendering.
- Each preview carries the same section `rendererKey`, section type, section key, visibility, and theme token context expected by the public invite app.
- Theme tokens are resolved from the selected registry theme and scoped to the preview panel so managers can see the selected theme and resolved mode before saving.

## Approximation

- The dashboard preview is intentionally compact. It does not import the full public invite frame, hero choreography, RSVP submission form, or invite-app parallax CSS.
- The preview renders section content in a dashboard-safe approximation of the public composition so managers can validate content shape, visibility, hierarchy, and imagery without leaving the editor.
- Full motion and immersive invite pacing remain verified in the public invite app.

## Mobile Behavior

- On narrow dashboard widths, the flow is: summary, section order/status, live preview, then detailed JSON editors.
- On wide desktop, the preview becomes a sticky right rail beside the ordered editor list.
- The preview is optimized for tablet and desktop management. Public invite mobile fidelity should still be checked in the invite app.
