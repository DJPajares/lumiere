# Lumiere Invite App UI Notes

Use the root `SKILL.md` for UI decisions.

Design read: the invite app is a mobile-first editorial invitation, not an event landing page. It should open with a cinematic event-specific chapter, move through varied typographic and image-led compositions, and close with an RSVP or farewell that feels native to the invitation. Public URLs must remain emotionally complete without exposing private guest or RSVP context.

Premium wedding direction:

- Full-viewport opening with one dominant portrait or an intentional event-fact fallback.
- Display typography carries the emotional hierarchy; sans-serif copy keeps dates, venue details, and RSVP controls legible.
- Sections alternate full-bleed, editorial split, timeline, feature-gallery, and layered-media rhythms instead of repeating cards.
- Scroll feedback and motion remain progressive enhancement, CSS-first, and reduced-motion safe.
- Content continues to come from Lumiere API contracts and the shared theme registry.

See [`REVERIE_REFERENCE_AUDIT.md`](./REVERIE_REFERENCE_AUDIT.md) for the quality-reference review and adaptation boundaries.

Token notes:

- Warm off-white/off-black base colors.
- One event accent at a time.
- Roomier radius and spacing than the dashboard.
- RSVP states should reuse semantic success, warning, and error tokens.
