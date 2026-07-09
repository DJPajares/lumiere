# Lumiere Theme Template Specs

This document is the human-readable companion to `src/specs.ts`. The TypeScript spec is the enforceable source for tests; this file is the design handoff for theme work.

Reference benchmark:

- Reverie repo: <https://github.com/DJPajares/reverie>
- Reverie hosted invite: <https://reverie.wndrhive.com/>

Use Reverie as a benchmark for immersion, section ownership, motion tuning, media depth, and guest-controlled ambient audio. Do not clone its visuals.

## Shared Requirements

- Every theme must define event fit, design read, mood notes, anti-slop constraints, mode support, token guidance, radius, typography, image treatment, motion, ambient media, RSVP states, dashboard preview requirements, and naming guidance.
- Card-based treatment is allowed only when the theme intentionally calls for practical or basic sections.
- Premium, seasonal, and playful themes must mix full-bleed, split, editorial, gallery, and framed moments.
- RSVP must feel integrated into the invitation and include success, closed, disabled, and error guidance.
- Missing media should degrade to intentional fact panels or asset slots, never fake screenshots.

## Lumiere Default

- Fit: dinners, launches, private events, and generic events.
- Mood: warm parchment, soft amber, practical event facts.
- Motion: calm, no parallax.
- Sections: split hero, framed details, editorial story, framed/gallery basics, split location, framed RSVP, full-width outro.
- Ambient media: not supported by default.
- RSVP: clear guest-only panel with visible max pax and concise success/error/closed states.
- Dashboard preview: warm parchment thumbnail with practical split hero and detail panel.

## Premium

- Fit: weddings, elevated dinners, and private events.
- Mood: luminous editorial, ivory fields, portrait light, restrained gold hairlines.
- Reverie benchmark: full-viewport opening, layered image treatment, parallax depth, refined transitions, and emotional pacing.
- Motion: immersive, hero-and-media parallax, gallery drift, and reduced-motion static hierarchy.
- Sections: cinematic hero, split details/profile/location, editorial timeline story, full-bleed gallery and RSVP, cinematic outro.
- Ambient media: optional background music through external controls; no audible forced autoplay.
- RSVP: elegant guest reply card with reserved seats, segmented attendance, success/closed/error states, and preserved entered details on recoverable errors.
- Dashboard preview: must show editorial media depth, not just a gold swatch.

## Kids

- Fit: birthdays and kids parties.
- Mood: sunny party paper, celebrant imagery, rounded friendly controls.
- Motion: playful, hero-only depth; reduced motion keeps cheerful hierarchy without drift.
- Sections: full-bleed celebrant hero, framed logistics, brief editorial story, card-based profile/RSVP, feature gallery.
- Ambient media: optional, explicit controls only.
- RSVP: parent-friendly with max pax visible, compact attendee controls, plain errors, and friendly success copy.
- Dashboard preview: bright image slot, rounded gallery cue, and orange action accent without clutter.

## Noel

- Fit: holiday dinners and year-end gatherings.
- Mood: evergreen, candlelight, warm table settings, restrained seasonal texture.
- Motion: seasonal, story-depth profile; reduced motion disables story drift.
- Sections: cinematic seasonal hero, framed dinner details, editorial story, feature gallery, split location, cozy RSVP, full-width outro.
- Ambient media: optional warm acoustic track with guest-controlled playback.
- RSVP: cozy panel with attendance state, max pax, host message, closed/error states that work in light and dark.
- Dashboard preview: evergreen table scene, cream surface, and restrained seasonal accent.

## Naming And IP

Theme names must stay generic unless licensing is resolved. Avoid protected characters, fashion labels, venue names, songs, films, or franchise cues. Mood references are fine; direct imitation is not.

## Implementation Notes

- Enforceable specs live in `src/specs.ts`.
- Composition and motion families live in `COMPOSITION.md` and `src/composition.ts`.
- Registry metadata lives in `src/themes.ts`.
