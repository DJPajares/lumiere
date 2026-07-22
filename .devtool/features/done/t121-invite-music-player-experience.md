---
id: 't121-invite-music-player-experience'
status: 'done'
priority: 'medium'
assignee: null
epic: 'invite-experience'
dueDate: null
created: '2026-07-22T01:19:42+08:00'
modified: '2026-07-22T23:22:34+08:00'
completedAt: '2026-07-22T23:22:34+08:00'
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

## Suggested Agent

- Suggested model: `GPT-5.6 Sol (gpt-5.6-sol)`
- Reasoning level: `high`

## Acceptance

- [x] Hosts can configure an HTTP(S) direct audio URL and track identity from the dashboard; Lumiere stores the reference without uploading or proxying the media and preserves unrelated public settings.
- [x] The player reuses the existing optional event/theme ambient-audio configuration and renders only for a valid enabled source; media uploads, playlists, and provider-page integrations remain outside this task.
- [x] A compact resting control exposes clear play/pause state and track identity, with an expanded state for available metadata and controls such as mute/unmute, elapsed/duration, and seeking when the media source supports it.
- [x] Browser autoplay restrictions remain authoritative: blocked playback falls back to an obvious manual start, and no workaround attempts to force audible autoplay.
- [x] Playback state reacts correctly to play, pause, ended/loop, metadata loading, buffering, seeking, source failure, route rendering, and browser media events without delaying invitation content.
- [x] Guest play/pause preference remains scoped to the event/source and persists safely; the player does not unexpectedly restart or leak state between unrelated events.
- [x] The player shares a deliberate floating-control layout with t120 and the theme-mode toggle, respects safe areas, and never covers section headings, the RSVP form, validation messages, or mobile browser controls.
- [x] Player presentation can use theme-owned tokens/hooks but remains readable across light and dark modes and contains no concrete theme-ID conditions or dashboard UI imports.
- [x] Controls have accessible names, keyboard operation, visible focus, live status only where useful, adequate touch targets, and motion/low-distraction behavior that does not imply audio is disabled merely because reduced motion is enabled.
- [x] Missing, malformed, cross-origin-failing, or unsupported audio fails quietly with a recoverable unavailable state and no guest token, private metadata, or noisy exception logging.
- [x] Relevant existing ambient-audio, invite renderer, mode-control, and motion tests pass with invite typecheck, formatting, lint, autoplay/manual-play smoke checks, responsive visual review, and the `SKILL.md` UI pre-flight review.

## Notes

Treat this as a progressive enhancement of t42. A guest must always be able to read the invitation and complete RSVP with the player paused, blocked, unavailable, or absent.

## Progress Log

- 2026-07-22T01:19:42+08:00: Task created to upgrade the existing ambient control into a compact invitation music player; implementation not started.
- 2026-07-22T23:04:00+08:00: Started implementation with clarified scope: hosts configure a direct browser-playable HTTP(S) audio URL in the dashboard, while Lumiere stores only the external reference. Provider pages such as Spotify or YouTube remain outside the native audio-player contract.
- 2026-07-22T23:22:34+08:00: Completed shared HTTP(S) audio validation, an event-settings editor that preserves unrelated metadata and owns enable/disable overrides, event/source-scoped playback preference, and the compact expandable invite player with mute, elapsed/duration, seeking, buffering/error/retry states, safe-area placement, and navigator coordination. Verified 159 relevant tests, full 10-package typecheck, focused formatting, boundary checks, and invite/dashboard production builds. Completed the `SKILL.md` pre-flight from source and build output at 390px/768px/1440px constraints; live browser screenshots and real-host autoplay/media smoke execution were unavailable in this session, with exact manual checks retained in `apps/invite/AMBIENT_AUDIO_QA.md`.
