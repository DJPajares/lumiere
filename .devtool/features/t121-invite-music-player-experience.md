---
id: 't121-invite-music-player-experience'
status: 'todo'
priority: 'medium'
assignee: null
epic: 'invite-experience'
dueDate: null
created: '2026-07-22T01:19:42+08:00'
modified: '2026-07-22T01:19:42+08:00'
labels: ['invite', 'music', 'audio', 'player', 'floating-control', 'accessibility']
depends_on: ['t42-invite-ambient-audio-and-media-controls', 't120-invite-floating-section-navigator']
order: 'a121'
---

# t121-invite-music-player-experience - Upgrade ambient audio into an invite music player

## Hierarchy

- Epic: `invite-experience`
- Dependencies: `t42-invite-ambient-audio-and-media-controls`, `t120-invite-floating-section-navigator`

## Scope

Evolve the existing ambient-audio play/pause pill into a polished compact music player for public and guest invitation pages. Preserve browser-safe opt-in/autoplay behavior, then add useful track context and playback feedback without turning the invitation into a media application or blocking RSVP and section navigation.

## Acceptance

- [ ] The player reuses the existing optional event/theme ambient-audio configuration and renders only for a valid enabled source; media uploads, playlists, and streaming-provider integrations remain outside this task.
- [ ] A compact resting control exposes clear play/pause state and track identity, with an expanded state for available metadata and controls such as mute/unmute, elapsed/duration, and seeking when the media source supports it.
- [ ] Browser autoplay restrictions remain authoritative: blocked playback falls back to an obvious manual start, and no workaround attempts to force audible autoplay.
- [ ] Playback state reacts correctly to play, pause, ended/loop, metadata loading, buffering, seeking, source failure, route rendering, and browser media events without delaying invitation content.
- [ ] Guest play/pause preference remains scoped to the event/source and persists safely; the player does not unexpectedly restart or leak state between unrelated events.
- [ ] The player shares a deliberate floating-control layout with t120 and the theme-mode toggle, respects safe areas, and never covers section headings, the RSVP form, validation messages, or mobile browser controls.
- [ ] Player presentation can use theme-owned tokens/hooks but remains readable across light and dark modes and contains no concrete theme-ID conditions or dashboard UI imports.
- [ ] Controls have accessible names, keyboard operation, visible focus, live status only where useful, adequate touch targets, and motion/low-distraction behavior that does not imply audio is disabled merely because reduced motion is enabled.
- [ ] Missing, malformed, cross-origin-failing, or unsupported audio fails quietly with a recoverable unavailable state and no guest token, private metadata, or noisy exception logging.
- [ ] Relevant existing ambient-audio, invite renderer, mode-control, and motion tests pass with invite typecheck, formatting, lint, autoplay/manual-play smoke checks, responsive visual review, and the `SKILL.md` UI pre-flight review.

## Notes

Treat this as a progressive enhancement of t42. A guest must always be able to read the invitation and complete RSVP with the player paused, blocked, unavailable, or absent.

## Progress Log

- 2026-07-22T01:19:42+08:00: Task created to upgrade the existing ambient control into a compact invitation music player; implementation not started.
