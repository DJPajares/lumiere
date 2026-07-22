# Ambient Audio QA

Use Event settings → Background music to save a track on `event.publicSettings`, or use a
premium theme invite with this metadata in `themeConfig`:

```json
{
  "ambientAudio": {
    "enabled": true,
    "src": "https://example.com/ambient.mp3",
    "art": "https://example.com/ambient-cover.jpg",
    "artist": "The Garden Quartet",
    "title": "Garden strings",
    "label": "Evening music",
    "autoplay": true
  }
}
```

Manual smoke checks:

- Dashboard configuration: paste a direct HTTP(S) MP3, AAC/M4A, OGG, or WAV file URL, save, and
  confirm unrelated public settings remain unchanged. A Spotify, Apple Music, SoundCloud, or
  YouTube page URL is not a direct audio source and should not be used.
- Remote host: confirm the media host permits browser playback, HTTPS invitations do not reference
  insecure HTTP audio, and the host supports byte-range requests if seeking is expected.
- Autoplay allowed: open the public invite in a browser/profile that permits media autoplay and confirm the control changes to `Playing`.
- Autoplay blocked: open in a fresh tab/profile with default autoplay blocking and confirm the invite still renders, with a visible `Tap to play` control.
- Manual playback: open the bottom-right player, use play/pause, drag and press the progress bar,
  jump forward 15 seconds, refresh, and confirm the last play/pause choice is remembered for that
  event and source in the current browser.
- Player presentation: confirm the resting button shows play while paused and an animated visualizer
  while playing; confirm it matches the 48px translucent floating controls and the expanded player
  replaces that button at the same bottom-right anchor. Check both light and dark mode for themed
  surface, text, border, progress, control, and focus colors.
- Player dismissal: confirm the panel minimizes with its header action, Escape, an outside click, or
  five seconds of inactivity; it must stay open during a seek drag and while keyboard focus remains
  within the player.
- Artwork fallback: remove `art` and then try a broken image URL; both cases should show the
  intentional music-note placeholder without affecting audio playback.
- Low distraction: set `lowDistraction` to `true` or enable reduced motion and confirm audio does not start automatically.
- Missing audio: remove `src` or set `enabled` to `false` and confirm no player UI appears.
- Failed audio: use a broken or cross-origin-blocked `src`, confirm the player reports audio as
  unavailable without noisy console errors, and confirm its retry action remains available.
- Guest page: repeat play/pause on `/e/[eventSlug]/g/[guestToken]` and confirm the control stays clear of RSVP actions on mobile and desktop.
