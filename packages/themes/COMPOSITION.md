# Lumiere Invite Composition System

This reference turns the TasteSkill direction into reusable invite rules. The quality benchmark is the earlier Reverie invite experience: full-bleed atmosphere, layered imagery, scroll depth, tasteful parallax, and modern editorial pacing. Lumiere should not clone that app, but premium themes should feel similarly immersive.

For per-theme design reads, token guidance, ambient media rules, RSVP states, and dashboard preview requirements, see `THEME_SPECS.md`.

## Core Rule

Only the neutral/basic rhythm may rely on framed cards as the dominant layout. Premium, seasonal, and playful themes must mix full-bleed, editorial, timeline, feature-gallery, and layered-media sections so the page does not read like the same card stack in different colors.

## Section Coverage

The system covers hero/introduction, details, story, people/profile, gallery, location, RSVP, and outro sections. Date, dress-code, entourage, and custom sections inherit the closest family from the same rules.

## Layout Families

- Full-Bleed Atmosphere: viewport-scale chapters for hero, date, RSVP, and outro. Mobile stays single-column, tablet uses one supporting rail, desktop can use full-height bands.
- Editorial Split: asymmetric text plus media/fact compositions for details, profile, story, and location. Mobile reads text first, tablet uses columns only with enough width, desktop alternates 40/60 or 45/55 tracks.
- Layered Media: one inspectable feature image with layered copy/caption/fact depth. Mobile avoids clipping, tablet allows light overlap, desktop can offset layers.
- Timeline Sequence: connected story or schedule rhythm with markers and optional sticky heading. Mobile uses a simple rail, tablet/desktop can pin only when focus remains natural.
- Feature Gallery: one lead image with supporting images rather than equal card tiles. Mobile shows the lead first, tablet adds support images, desktop can use feature plus side column.
- Framed Detail: practical panels for neutral/basic, dress code, and compact utility details. Avoid using this for every section in premium themes.

## Motion Rules

Hero reveal, section reveal, card reveal, media reveal, media parallax, sticky pin, timeline reveal, and gallery drift are declared in `src/composition.ts`.

Parallax and scroll depth should use CSS scroll/view timelines first. If a browser fallback later needs JavaScript, use IntersectionObserver for section visibility or `requestAnimationFrame` to update CSS variables. Do not update React state on every scroll frame.

Reduced motion disables parallax, drift, pinning, scale, and translate reveals. The static page should preserve hierarchy through size, spacing, media order, and contrast instead of motion.

## Image Strategy

Use real event imagery for inspectable subjects: couple/hosts, celebrant, venue, tablescape, gallery, dress-code references, or location context. When media is missing, reserve intentional fact panels or upload/asset slots. Do not use fake screenshots, unrelated stock-like imagery, or abstract decoration as the primary visual.

## Sample Maps

- Wedding Editorial: full-bleed hero, editorial profile, timeline story, feature gallery, full-bleed RSVP, layered-media outro.
- Birthday Feature: full-bleed celebrant hero, editorial details, feature gallery, framed family RSVP.

These maps are exported as `sampleInviteCompositionMaps` and should guide event-type defaults without preventing theme-specific variation.
