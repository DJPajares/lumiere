# Ambient Audio QA

Use a premium theme invite with this metadata in `themeConfig` or `event.publicSettings`:

```json
{
  "ambientAudio": {
    "enabled": true,
    "src": "https://example.com/ambient.mp3",
    "title": "Garden strings",
    "label": "Evening music",
    "autoplay": true
  }
}
```

Manual smoke checks:

- Autoplay allowed: open the public invite in a browser/profile that permits media autoplay and confirm the control changes to `Playing`.
- Autoplay blocked: open in a fresh tab/profile with default autoplay blocking and confirm the invite still renders, with a visible `Tap to play` control.
- Manual play/pause: click the control, confirm audio toggles, refresh, and confirm the last play/pause choice is remembered for that browser.
- Low distraction: set `lowDistraction` to `true` or enable reduced motion and confirm audio does not start automatically.
- Missing audio: remove `src` or set `enabled` to `false` and confirm no player UI appears.
- Failed audio: use a broken `src` and confirm the control reports audio as unavailable without blocking invite sections or RSVP.
- Guest page: repeat play/pause on `/e/[eventSlug]/g/[guestToken]` and confirm the control stays clear of RSVP actions on mobile and desktop.
