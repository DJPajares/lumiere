---
id: 't42-invite-ambient-audio-and-media-controls'
status: 'backlog'
priority: 'high'
assignee: null
epic: 'frontend'
dueDate: null
created: '2026-07-09T13:18:44+08:00'
modified: '2026-07-09T13:18:44+08:00'
completedAt: null
labels: ['invite', 'audio', 'media', 'uiux', 'accessibility']
depends_on: ['t27-invite-guest-event-page', 't30-initial-theme-implementations', 't37-theme-template-design-specs']
order: 'a40a'
---

# t42-invite-ambient-audio-and-media-controls - Invite ambient audio and media controls

## Hierarchy

- Epic: `frontend`
- Dependencies: `t27-invite-guest-event-page`, `t30-initial-theme-implementations`, `t37-theme-template-design-specs`

## Scope

Add theme-aware ambient audio support for public and guest invitation pages so premium invites can feel cinematic and ceremonial without surprising guests or violating browser autoplay behavior.

## Suggested Agent

- Suggested model: `GPT-5.5`
- Reasoning level: `high`

## Acceptance

- [ ] Event/theme data can provide an optional background music source with title/label metadata and a disabled/missing state.
- [ ] Invite pages attempt autoplay only when the browser allows it and gracefully fall back to a visible play control when blocked.
- [ ] A persistent, accessible play/pause or mute control is available without covering core invite content or RSVP actions.
- [ ] Guest preference is remembered for the current browser so music does not restart unexpectedly across navigation or refresh.
- [ ] Audio never blocks page load, RSVP completion, route rendering, or section interaction.
- [ ] Reduced-motion or explicit low-distraction settings prevent automatic audio start and use a quieter static control state.
- [ ] Missing, failed, or unsupported audio shows no broken player UI and logs only safe client-side diagnostics.
- [ ] Tests or documented smoke checks cover autoplay allowed, autoplay blocked, manual play/pause, missing audio, and guest-token page behavior.

## UI Quality Checklist

- [ ] Uses Tailwind tokens and project-owned primitives before adding a component library.
- [ ] Follows Lumiere color, shape, brand, and theme locks from `SKILL.md`.
- [ ] Handles loading, empty, error, success, disabled, focus, hover, and active states where relevant.
- [ ] Works on required mobile and desktop viewport widths.
- [ ] Meets keyboard, label, contrast, and reduced-motion basics where applicable.
- [ ] Avoids generic AI-slop patterns listed in `SKILL.md`.

## Notes

Modern browsers often block unmuted autoplay until a user gesture occurs. Implement this as best-effort autoplay plus an elegant opt-in fallback, not as a brittle forced autoplay hack.

## Progress Log

- 2026-07-09T13:18:44+08:00: Task created from request to bring Reverie-like ambience, including background music, into the invite app.
