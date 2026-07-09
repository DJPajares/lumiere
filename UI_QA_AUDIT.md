# Lumiere Accessibility And Visual QA Audit

Date: 2026-07-09
Task: `t41-accessibility-visual-qa-audit`

## Method

- Reviewed `SKILL.md`, route tests, renderer tests, and the main invite/dashboard UI components.
- Checked representative states: loading, empty, error, success, disabled, focus, hover, active, public, guest, and authenticated manager flows.
- Ran token contrast checks for dashboard light/dark and invite theme variants.
- Captured manual QA notes below for mobile, tablet, and desktop review. Browser screenshot capture remains covered by the later screenshot-specific dashboard task.

## Surfaces Covered

- Public invite: public event route, unavailable state, safe metadata, themed section renderer, premium composition hooks, parallax/reduced-motion CSS, and missing-section empty state.
- Guest invite: guest-token route, invalid/disabled token states, guest context panel, guest-only sections, RSVP section, and private metadata safety.
- RSVP: draft, update, success, validation error, failed submit recovery, closed/disabled/expired/rate-limited recovery, attendee count, required questions, and guest names.
- Dashboard: event list/create, event overview, theme selector, section builder/live preview, guest management, responses, activity, protected route, login, shell navigation, and current-context states.
- Audio: configured audio, missing/disabled audio, public/guest render paths, low-distraction state, autoplay fallback notes, play/pause persistence, and failed source handling.

## Checks

### Contrast

- Body text against background/surface/muted tokens is comfortably above AA in checked app/theme variants.
- Accent-filled controls now use `--accent-contrast` instead of fixed white text.
- Checked accent text contrast after the fix:
  - Dashboard light: `6.57`
  - Dashboard dark: `7.53`
  - Invite default light: `5.17`
  - Invite default dark: `9.32`
  - Premium light: `4.51`
  - Premium dark: `8.54`
  - Kids light: `6.82`
  - Noel light: `6.12`
  - Noel dark: `9.64`
- Color-coded RSVP, dress-code, response, and guest statuses include text labels, not color alone.

### Focus And Keyboard

- Dashboard links/buttons/selects/textareas use visible focus rings.
- Guest management destructive actions require explicit confirmation.
- RSVP segmented attendance radios now expose a visible focus-within ring around the custom pill.
- Icon-like controls have accessible labels where present: audio play/pause, RSVP count buttons, section move buttons, guest invite link input.

### Labels And Alt Text

- Invite hero/gallery images read authored alt text; dashboard preview images read section asset alt text.
- Decorative brand logos and theme color swatches are hidden from assistive output.
- Guest management validation errors are now associated with their fields through `aria-describedby`.

### Reduced Motion

- Invite motion/parallax is guarded by `prefers-reduced-motion`; parallax and section animations are disabled in reduce mode.
- Ambient audio does not autoplay in reduced-motion or low-distraction states.
- Dashboard now suppresses long-running skeleton/transition motion under `prefers-reduced-motion: reduce`.

## Manual QA Notes

- Mobile `390px`: invite sections collapse into single-column rhythm; RSVP count control remains tappable; audio control is fixed top-right with max-width protection; dashboard navigation collapses into a `details` menu; response rows show mobile labels instead of horizontal tables.
- Tablet `768px`: invite editorial sections retain reserved media aspect ratios; dashboard cards move into two-column summaries where available; section builder stays readable before the sticky desktop preview layout activates.
- Desktop `1280px+`: premium invite hero and image-led sections no longer read as a repeated card stack; dashboard overview/theme/content/guest/responses pages keep sticky or side panels only at roomy widths.
- Light/dark: dashboard and premium/noel/default invite dark tokens preserve readable foreground/surface contrast; kids is light-only as designed.
- Audio: browser autoplay is policy-dependent, so manual verification should use `apps/invite/AMBIENT_AUDIO_QA.md` for allowed autoplay, blocked autoplay, manual play/pause, missing source, failed source, and guest-token checks.

## Anti-Slop Review

- Public invite pages use varied section composition hooks, real media slots, reserved aspect ratios, theme-specific RSVP treatments, and reduced-motion-safe motion.
- Premium invite surfaces include layered hero/gallery/story motion hooks and avoid a simple repeated card stack.
- Dashboard surfaces remain restrained and operational; event theme personality is contained to previews and invite rendering.
- No component library was added.
- No lorem ipsum, generic fake screenshots, emoji-heavy guest UI, or random accent switching was introduced.

## Fixes Applied

- Added `--accent-contrast` for dashboard globals and invite theme shells, then switched primary accent-filled controls away from hard-coded white text.
- Switched primary hover feedback from accent color swaps to brightness so text contrast remains stable on hover.
- Added dashboard reduced-motion CSS for skeleton/transition motion.
- Added visible focus treatment for the custom RSVP attendance radio pills.
- Added `aria-describedby` and alert semantics to guest management form errors.
- Marked decorative theme preview swatches as hidden from assistive technologies.
- Made the ambient audio status text polite-live so blocked/playing/error state changes are announced.

## Follow-Ups

- `t42-dashboard-navigation-ia-reset`: keep improving manager navigation IA and test keyboard flow once the IA reset lands.
- `t47-schema-driven-content-field-forms`: replace raw JSON editing with field-level forms for better labels, validation, and non-technical editing.
- `t51-reverie-inspired-invite-modernization`, `t53-invite-motion-parallax-system`, and `t54-invite-backdrops-ornaments-and-effects`: continue the premium invite polish beyond this QA gate.
- `t55-dashboard-design-review-from-screenshots`: capture screenshot-based dashboard review after the next dashboard IA/component passes.
- Recommended future task: add automated accessibility smoke checks with a browser runner and axe-compatible assertions once browser E2E infrastructure exists.
