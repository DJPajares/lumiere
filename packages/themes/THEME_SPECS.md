# Lumiere Theme Template Specs

This document is the human-readable companion to `src/specs.ts`. The TypeScript spec is the enforceable source for tests; this file is the design handoff for theme work.

Reference benchmark:

- Reverie repo: <https://github.com/DJPajares/reverie>
- Reverie hosted invite: <https://reverie.wndrhive.com/>

Use Reverie as a benchmark for immersion, section ownership, motion tuning, media depth, and guest-controlled ambient audio. Do not clone its visuals.

## Shared Requirements

- Every theme must define event fit, design read, mood notes, anti-slop constraints, mode support, token guidance, radius, typography, image treatment, motion, ambient media, RSVP states, dashboard preview requirements, and naming guidance.
- Every shipped theme exposes light, dark, system, and guest-toggleable manager options, with complete light/dark tokens and accessible toggle copy.
- Every theme also owns a typed visual-effects profile: backdrop type and cover-image policy, texture/noise strength, ornament set and density, divider style, frame style, and image treatment. Effects must remain decorative, optional, and readable when images are missing.
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

- Fit: every event type, including weddings, birthdays, kids parties, holidays, dinners, launches, private events, and generic celebrations.
- Mood: peaceful winter conservatory, deep evergreen candlelight or warm ivory paper, pearl frost, restrained berries, and candle-gold details.
- Motion: two-depth falling snow, quiet glints, and a seasonal story-depth profile; reduced motion stops all ambient movement.
- Ornaments: original code-native evergreen and mistletoe boughs, sparse holly berries, a single pine-cone accent, small ribbon cues, and fine folio borders rather than clip art or glitter.
- Sections: asymmetric seasonal hero, arched winter imagery, invitation-folio details, editorial profiles and entourages, story depth, feature gallery, split location, crafted RSVP, and full-width outro.
- Ambient media: optional warm acoustic track with guest-controlled playback.
- RSVP: cozy panel with attendance state, max pax, host message, closed/error states that work in light and dark.
- Dashboard preview: evergreen table scene, cream surface, and restrained seasonal accent.

## Noel v2

- Fit: premium weddings, holiday celebrations, and private events with a formal winter tone.
- Mood: warm `#faf0e6` linen, Cormorant Garamond, burgundy `#59000f` titles, antique-gold rules, evergreen ink, and generous editorial whitespace.
- Motion: calm section reveals with light story depth; reduced motion keeps the full composition static.
- Ornaments: one original watercolor canopy, very light Noel-style drifting snow, and three distinct straight watercolor branches—pinecone and holly, walnut and mistletoe, and berry and leaf—distributed at viewport positions; never bend them into corners or a continuous border.
- Sections: centered heirloom hero, alternating story timeline, open formal-attire palette, editorial venue and gallery, bordered reply folio, and full-height typographic outro.
- Modes: light uses the linen field and burgundy titles; dark uses deep evergreen, beige titles, warm-gold card borders, and restrained berry accents.
- Ambient media: optional chamber strings or acoustic carols with explicit guest controls.
- RSVP: formal book-serif fields, clear max-pax and state copy, fine folio borders, and an accessible primary action.
- Dashboard preview: the watercolor canopy, burgundy title hierarchy, and a story or attire cue must distinguish it from the existing Noel and Evergreen Folio themes.

## Signature

- Fit: every event type, from weddings and milestone birthdays to kids parties, dinners, launches, holidays, private events, and generic celebrations.
- Mood: warm vellum and aubergine ink by day; pearl type on aubergine-black lacquer by night; brushed bronze is reserved for fine structural cues.
- Signature elements: one continuous abstract bronze thread, an architectural hero aperture, chapter tabs, salon-hung imagery, an arrival dossier, and a circular sign-off seal.
- Sections: aperture-led split hero, full-width occasion leaf, continuous-thread story, portrait leaves, material-library attire, salon gallery, split arrival dossier, concierge guest ledger, and signed closing.
- Motion: immersive hero-and-media depth with restrained thread drift; reduced motion keeps the full invitation suite static and removes overlaps.
- Ambient media: optional instrumental music, room tone, or a host-selected track with explicit guest controls and no audible autoplay.
- RSVP: a concierge ledger with party and reserved-place facts, tailored rule fields, explicit semantic states, and one decisive action.
- Dashboard preview: the aperture, aubergine title, bronze thread, and either a chapter tab or concierge ledger must be visible; a luxury-colored card alone is not sufficient.
- Anti-slop: no metallic gradients, literal signatures, brand-like monograms, generic glass panels, or event-specific icons that weaken universal use.

## Evergreen Folio

- Fit: Christmas weddings; intentionally not a universal seasonal theme.
- Mood: heirloom cotton paper on a writing desk, dense watercolor pine and holly, carmine titling, forest-green names, and engraved Roman typography.
- Motion: calm stationery and archival-print reveals with no parallax or ambient loop; reduced motion keeps the suite completely static.
- Ornaments: one original painted perimeter of curved long-needle pine, hand-shaped holly, berries, and layered pine cones; no Noel assets, crest, mistletoe, snowfall, or repeated section boughs.
- Sections: portrait wedding folio, optional archival companion print, formal date announcement, ledger details, timeline story, square-matted gallery, editorial venue, detachable reply card, and monogram-like outro.
- Ambient media: optional chamber strings or acoustic carols with guest-controlled playback.
- RSVP: detachable response card with a perforated rule, ledger fields, explicit party capacity, semantic states, and a carmine return action.
- Dashboard preview: Christmas Wedding in carmine, couple names in forest green, dense painted perimeter, and the independent Evergreen Folio name.

## Editorial Ivory

- Fit: weddings, birthdays, dinners, private events, and generic celebrations.
- Mood: uncoated ivory paper, high-contrast serif display, folio rules, and tall portrait crops.
- Motion: immersive hero-and-media depth; reduced motion preserves the asymmetric print layout.
- Sections: offset split hero/profile, ruled timeline story, feature gallery, split venue, and full-width reply.
- Ornament/backdrop: typographic rules and page-number details on an ivory paper field; no fashion or publication imitation.
- Dashboard preview: real Mara & Leon, Reading Room, story, and reply samples arranged as a miniature editorial spread.

## Garden Light

- Fit: weddings, birthdays, dinners, private events, and generic celebrations.
- Mood: sunlit outdoor photography, sage fields, warm clay accent, and softly humanist type.
- Motion: playful hero-only depth and gallery drift; reduced motion keeps broad organic bands.
- Sections: centered media hero, garden-path story, airy feature gallery, split venue, and grounded framed reply.
- Ornament/backdrop: dappled daylight and organic border arcs without literal botanical clip art.
- Dashboard preview: real Sunday in Bloom, Willow Courtyard, afternoon, story, and location samples.

## Modern Minimal

- Fit: weddings, birthdays, launches, private events, and generic celebrations.
- Mood: architectural off-white, graphite type, numbered facts, hard rules, and one cobalt signal.
- Motion: calm with no parallax; hierarchy relies on scale, grid, and alignment.
- Sections: strict split hero, numbered detail/story rails, hard-edge gallery, split reply, and flat full-width outro.
- Ornament/backdrop: structural rules and labels only; no texture, glow, gradient, or rounded card deck.
- Dashboard preview: real Studio 08, North Assembly, Time, Sequence, and Reply samples in the shared grid.

## Celestial Gold

- Fit: weddings, birthdays, dinners, holidays, private events, and generic celebrations.
- Mood: deep indigo atmosphere, luminous serif type, warm gold signal, and cinematic evening imagery.
- Motion: immersive hero-and-media depth; reduced motion preserves layer order and nocturnal chapters.
- Sections: layered portrait hero/profile, full-width date, night-depth story, feature gallery, and luminous layered reply.
- Ornament/backdrop: sparse orbital hairlines and quiet radial light without stars, zodiac symbols, or glitter.
- Dashboard preview: real Evening Sky, Observatory Hall, date, gallery, and reply samples against a night field.

## Velvet Dusk

- Fit: weddings, birthdays, dinners, launches, holidays, private events, and generic celebrations.
- Mood: oxblood velvet, warm portrait light, champagne rules, and a measured evening-program rhythm.
- Motion: immersive story-depth movement; reduced motion preserves the proscenium frame and linear program sequence.
- Sections: layered portrait hero, full-width date, program timeline, curtain-depth story, afterglow gallery, and formal full-width reply.
- Ornament/backdrop: abstract curtain-edge curves and fine champagne rules without literal theatre imagery.
- Dashboard preview: real Evening in Velvet, Crimson Room, program, gallery, and reply samples in matinee and afterglow modes.

## Porcelain Blue

- Fit: weddings, birthdays, dinners, launches, holidays, private events, and generic celebrations.
- Mood: porcelain white, celadon haze, cobalt ink, wide daylight photography, and quiet gallery spacing.
- Motion: calm hero-only depth; reduced motion retains the centered gallery wall and two-column ledger hierarchy.
- Sections: centered landscape hero, airy detail splits, essay-like story, collected-image gallery, and editorial reply ledger.
- Ornament/backdrop: sparse abstract porcelain rings and mineral paper texture without china patterns or ceramic clip art.
- Dashboard preview: real Study in Blue, Glass Gallery, afternoon, collected moments, and reply samples.

## Non-Paper Portfolio Gate

The next portfolio wave moves away from stationery, folios, vellum, porcelain, and editorial-print metaphors. These themes must differ through composition, spatial behavior, typography, media framing, and RSVP structure—not by applying new tokens to an existing invitation page.

| Direction | Primary metaphor | Event-type fit | Deliberate exclusions | Default read |
| --- | --- | --- | --- | --- |
| Neon Signal | Luminous signage and a route through night | Launch, dinner, birthday, private event, other | Wedding, kids party, holiday | Dark-first, fast, urban |
| Tidal Glass | Daylight refracted through moving water | Wedding, dinner, holiday, private event, other | Birthday, kids party, launch | Light-first, calm, fluid |
| Solar Pop | Sunlit festival identity built from color planes | Birthday, kids party, launch, private event, other | Wedding, dinner, holiday | Light-first, bold, joyful |
| Terrain Line | A route unfolding through topographic space | Wedding, birthday, dinner, launch, private event, other | Kids party, holiday | System-first, grounded, place-led |

Event fit is intentional. The dashboard compatibility filter must not offer an excluded pairing as a valid choice, even if the shared renderer could technically display its sections.

### Portfolio-wide requirements

- The four composition maps are `neon-signal`, `tidal-glass`, `solar-pop`, and `terrain-line`. Each map must be a stable typed identifier, not an app-local theme check.
- Every direction supports the complete section contract so a manager can preserve existing event content. Each direction must declare every renderer slot as specialized or themed fallback; a fallback may keep the shared content schema but must still inherit the theme's spacing, type, mode, and accessibility rules.
- All four expose light, dark, system, and toggleable manager options. “Dark-first” and “light-first” describe the art-directed default, not missing token sets.
- Dashboard thumbnails use real `previewData` and the actual preview renderer. The identifying composition must survive at card size; an accent swatch or decorative mock card is insufficient.
- Mobile reading order remains semantic when spatial layers collapse. At 390px, text cannot be hidden by media, route rails, translucent bands, or oversized numerals.
- Luminous, translucent, and saturated treatments still require WCAG AA-readable controls, visible labels, non-color state cues, strong focus indicators, and stable disabled/closed/error/success states.
- Motion communicates arrival, sequence, or response. Reduced motion removes travel, drift, sweeps, wipes, pulses, parallax, and pinning while preserving static hierarchy and orientation.

### Shared anti-slop and anti-overlap rules

- No stationery surfaces, faux paper grain, torn edges, folio borders, reply cards, postage cues, scrapbook layers, or “printed invitation” framing.
- No generic glassmorphism card stacks. Tidal Glass may use translucency as a full-width spatial layer, never as a dashboard-like grid of blurred cards.
- No emoji-heavy celebration UI, sticker packs, confetti wallpaper, stock party motifs, or uncontrolled rainbow gradients.
- No palette-only differentiation. A theme fails the gate if its section map, image cropping, typography, and RSVP layout match an existing theme.
- Neon Signal must not become Celestial Gold with cyan tokens, Velvet Dusk with scanlines, or a cyberpunk franchise imitation.
- Tidal Glass must not become a recolored Porcelain Blue, Garden Light with blur, or resort/beach clip art.
- Solar Pop must not become Kids with stronger colors, Modern Minimal with rounded corners, or a collage of decorative cards.
- Terrain Line must not become Modern Minimal with contour decoration, Garden Light in darker green, or a literal consumer map UI.
- Lumiere gold and logo motifs remain app-shell identity. They are not a required ingredient in any event theme.

## Neon Signal

- Fit: launches, dinners, birthdays, private events, and generic events. Do not offer it for weddings, kids parties, or holidays.
- Design read: a live signal moving through charcoal city space, using electric cyan as the primary signal, coral as a sparing interrupt, and off-white operational text. No broad neon-gradient wash.
- Typography: oversized variable grotesk for event title and chapter numbers, neutral grotesk for body copy, and compact mono for time, place, status, and field labels. Mono is metadata, never the long-form reading face.
- Shape: sharp corners with clipped or notched transitions; controls retain a usable hit area and may use only a slight radius.
- Composition map: `neon-signal`, named **Signal Route**.
- Hero: a full-viewport signal entrance with one edge-lit media field, oversized title, and a directional time/place readout. The no-cover state becomes a deliberate field of signal rails and event facts, not a fake photo or glowing card.
- Section rhythm: signal entrance → time/place readout → sequential program rail → optional people/story transmission → edge-lit contact strip → arrival coordinates → check-in console → signal-close outro. `introduction`, `date`, `details`, `location`, `gallery`, `rsvp`, and `outro` receive specialized slots; `profile`, `story`, `entourage`, `dress_code`, and `custom` use themed fallbacks aligned to the same route rail.
- Image treatment: wide or narrow documentary crops with hard masks, dark edge exposure, restrained cyan/coral rim light, and compact mono captions. Never recolor the subject with a duotone that obscures people or venue details.
- RSVP: a **Check-in Console**, embedded as the final route station rather than a floating card. Show guest identity, reserved capacity, attendance, attendee names, custom answers, host note, and one decisive transmit action with visible labels. Validation appears at its field; recoverable request errors preserve all entries; closed and disabled states read as explicit check-in status; success resolves into a stable confirmed readout.
- Modes: dark-first with complete light, dark, system, and toggleable support. Dark uses charcoal and restrained luminous accents; light uses warm gray, ink, deep cyan, and coral without imitating paper. Toggle labels should describe `Night signal` and `Day signal`.
- Motion: short entry sweeps, staggered route reveals, and one-time progress illumination. No continuously moving cyberpunk background, flicker, marquee, or ambient flashing.
- Reduced motion: remove sweeps, line travel, and stagger offsets; render every route segment and status change immediately with static contrast, rules, and labels.
- Accessibility: cyan/coral never carry status alone; scanline or grid cues stay decorative and cannot cross body copy; glow cannot reduce glyph edges; focus uses a solid high-contrast outline; no flashing treatment exceeds safe animation thresholds.
- Dashboard preview: use a real launch sample such as `After Hours / Studio 18`, showing the charcoal entrance, oversized title, cyan route rail, time/place readout, and a slice of the check-in console at expanded size. The thumbnail must read as a route, not a dark card.
- Naming/IP: use generic transit and signal language. Avoid branded city signs, code-terminal parody, protected sci-fi references, or illegible “hacker” copy.

## Tidal Glass

- Fit: weddings, dinners, holidays, private events, and generic location-led occasions. Do not offer it for birthdays, kids parties, or launches.
- Design read: daylight moving through water, with deep ink, sea-glass aqua, softened blue-green, pale mineral light, and a limited warm signal for semantic emphasis.
- Typography: soft geometric sans for display and body, with open counters and relaxed line spacing; use a quieter humanist label face or weight shift for facts. It must not inherit Porcelain Blue's editorial or serif cadence.
- Shape: broad fluid boundaries and softened corners, but no repeated pill controls or identical rounded cards.
- Composition map: `tidal-glass`, named **Tidal Flow**.
- Hero: a wide fluid horizon with title and event facts held above a refracted cover-image field. A no-cover hero uses layered translucent color bands and a clear venue/date anchor, not frosted placeholder chrome.
- Section rhythm: fluid horizon → tide-marked date → overlapping story/profile current → shoreline detail rail → wide image field → anchored venue chapter → calm-cove reply → horizon outro. `introduction`, `date`, `profile`, `story`, `details`, `gallery`, `location`, `rsvp`, and `outro` receive specialized slots; `entourage`, `dress_code`, and `custom` use spacious themed fallbacks.
- Image treatment: wide crops with protected focal points, soft refracted edge color, and clear text-safe zones. Photography remains crisp enough to inspect; blur is a supporting depth cue, never the main treatment.
- RSVP: a **Shoreline Reply** laid out as one spacious flow with guest and party capacity anchored in a readable side or top rail. Labels remain visible above controls; validation sits near its field; closed and disabled states stay calm but unmistakable; recoverable errors keep data; success settles into a quiet confirmed-cove state.
- Modes: light-first with complete light, dark, system, and toggleable support. Light resembles daylight through aqua water; dark becomes deep-water ink with brighter sea-glass signals, not a generic navy glass UI. Toggle labels should describe `Day water` and `Deep water`.
- Motion: slow one-time layer drift, gentle section reveals, and restrained refraction shifts tied to meaningful entry. No perpetual floating blobs or scroll-jacking liquid simulation.
- Reduced motion: freeze all layers and remove refractive drift; static transparency, overlap, spacing, and tide-line geometry retain the composition.
- Accessibility: every text-bearing translucent band resolves against a controlled backing color; do not place small copy directly on photography; focus rings remain opaque; map and location actions use text labels; transparency cannot be the only section boundary.
- Dashboard preview: use a real dinner or coastal-wedding sample such as `Low Tide Supper / Glass House`, showing the fluid horizon, one wide image, tide-line divider, and shoreline facts. The expanded preview should include part of the reply flow, not a blur-card collage.
- Naming/IP: water language stays abstract and contemporary. Avoid shells, waves-as-clip-art, resort logos, beach typography, or wellness-app tropes.

## Solar Pop

- Fit: birthdays, kids parties, launches, private events, and generic daytime celebrations. Do not offer it for weddings, dinners, or holidays.
- Design read: a confident sunlit festival identity using coral, marigold, cobalt, and leaf green as controlled planes. One plane leads each chapter; all four colors do not compete in every viewport.
- Typography: expressive wide sans or display grotesk for titles and oversized numerals, a highly readable geometric sans for body copy, and a condensed sans for labels and schedule facts. Joy comes from scale and cadence rather than novelty glyphs.
- Shape: crisp crop windows and confident medium radii; avoid bubbly pills, sticker outlines, scalloped paper edges, and a repeated rounded-card deck.
- Composition map: `solar-pop`, named **Solar Field**.
- Hero: a full-viewport arrangement of two or three interlocking color planes, a cutout-like cover crop, and oversized date numerals. The no-cover state lets typography and color geometry carry the opening without decorative party icons.
- Section rhythm: solar field → oversized date gate → directional detail panels → optional celebrant/story crop → bold venue turn → cutout image run → festival-gate reply → color-field outro. `introduction`, `date`, `details`, `profile`, `story`, `location`, `gallery`, `rsvp`, and `outro` receive specialized slots; `dress_code`, `entourage`, and `custom` use themed fallbacks with the same plane logic.
- Image treatment: clean subject-aware crops inside geometric windows, hard color offsets, and occasional full-bleed images. Never simulate scrapbook cut paper, stickers, taped photos, or confetti frames.
- RSVP: a **Festival Gate** with large clear attendance choices, visible party capacity, straightforward attendee names and questions, parent-friendly helper copy, and a strong keyboard path. Field errors remain local; disabled and closed states replace the action with explicit status; recoverable failures preserve entries; success becomes a bold but quiet admission-confirmed panel.
- Modes: light-first with complete light, dark, system, and toggleable support. Light uses sunlit off-white plus saturated planes; the dark `Dusk` variant deepens the base and slightly softens chroma while preserving AA contrast and color relationships.
- Motion: one-time color wipes, crop-window reveals, and restrained numeral emphasis. No bouncing controls, confetti loops, pulsing rainbow fields, or motion that delays reading.
- Reduced motion: remove wipes, pulses, and crop travel; show the final geometric arrangement immediately with document order intact.
- Accessibility: each color plane has a tested foreground pairing; validation and attendance use icons or text in addition to color; oversized numerals cannot displace the real date label; cutout images retain meaningful alt text; focus is high contrast on every plane.
- Dashboard preview: use a real birthday or daytime launch sample such as `Milo Turns Eight / Sunroom`, showing an oversized `08`, coral/marigold/cobalt planes, one real subject crop, and a visible festival-gate choice in expanded view. No emoji or decorative card collage.
- Naming/IP: keep the identity graphic and generic. Avoid copying festival brands, toy packaging, cartoon characters, or familiar pop-art works.

## Terrain Line

- Fit: weddings, birthdays, dinners, launches, private events, and generic place-led gatherings. Do not offer it for kids parties or holidays.
- Design read: a route unfolding through landscape, with pine, slate, sand, and ember tones, documentary imagery, restrained contour geometry, and practical location intelligence.
- Typography: sturdy humanist sans for display and body with a compact utility mono for bearings, time, distance, and itinerary labels. It should feel contemporary and inclusive, not like an archival park poster.
- Shape: compact radii, clipped route markers, and open spatial fields. Avoid utility-card grids and literal map-pin badges.
- Composition map: `terrain-line`, named **Terrain Route**.
- Hero: a route-led opening that pairs a landscape or venue crop with title, date, and one clear origin marker. The no-cover state uses contour density and event coordinates/facts to create depth without pretending to be an interactive map.
- Section rhythm: origin marker → itinerary spine → people/story waypoint → practical kit/details → documentary image field → destination chapter → basecamp reply → final bearing. `introduction`, `date`, `details`, `story`, `location`, `gallery`, `rsvp`, and `outro` receive specialized slots; `profile`, `entourage`, `dress_code`, and `custom` use themed waypoint fallbacks.
- Image treatment: natural documentary color, broad landscape crops, inset human moments, descriptive captions, and no artificial vintage filter. Venue and people remain recognizable; contour lines never cross faces or important map controls.
- RSVP: a **Basecamp Reply** integrated at the route end, with visible party capacity, attendance, names, questions, note, and a single confirm action. Field errors are local; focus is unmistakable; closed and disabled states are explicit; recoverable failures preserve entries; success pins a stable response-confirmed marker.
- Modes: system-first with complete light, dark, system, and toggleable support. Light uses sand and slate with pine/ember signals; dark uses deep pine/slate with sand text and restrained ember. Both modes preserve the same terrain hierarchy.
- Motion: short route progression, waypoint reveals, and very slow contour depth limited to meaningful chapter entry. Do not animate an always-traveling path or make guests chase content down a map.
- Reduced motion: stop route travel, contour drift, pinning, and parallax; keep a static itinerary spine, numbered waypoints, and clear reading order.
- Accessibility: contour lines remain low-density decoration outside text backing areas; markers include text and sequence numbers; location actions clearly distinguish map view from directions; ember is not the only status cue; focus stays visible against both sand and pine.
- Dashboard preview: use a real destination or outdoor-dinner sample such as `North Ridge Supper / Quarry Overlook`, showing the origin marker, itinerary spine, contour field, natural image crop, and part of the basecamp reply at expanded size. It must not read as a generic map card.
- Naming/IP: avoid national-park marks, outdoor-brand language, trail-app UI, expedition stereotypes, and adventure clip art.

## Non-Paper Contract Follow-Up

Complete this as one small shared-contract preparation patch at the start of the implementation wave, then let each theme add only its own isolated module:

- Add the four stable `ThemeId` values and four `InviteCompositionMapId` values without renaming or reordering persisted existing IDs.
- Extend typed visual vocabulary only where metadata needs to express the approved systems: four hero compositions, signal/tide/plane/contour ornament and divider choices, edge-lit/refracted/cutout/documentary image treatments, and matching mode-toggle styles.
- Add motion declarations for one-time signal sweep, fluid drift, color wipe, and route progress, each with an explicit static reduced-motion rule. Keep these generic primitives outside concrete theme modules.
- Add typed RSVP presentation/renderer variants for check-in console, shoreline reply, festival gate, and basecamp reply. Renderer dispatch must be metadata-driven; invite and dashboard code must not branch on concrete theme IDs.
- Add all four composition maps to the shared map registry and test uniqueness across map ID, hero, image treatment, RSVP renderer, and primary section rhythm.
- Keep theme assets, definitions, visual effects, and exports under `src/themes/<theme-id>/`. Do not import dashboard UI, shadcn, or Base UI into `packages/themes` or `apps/invite`; do not import concrete theme modules into dashboard controls.

This contract patch is an implementation prerequisite, not a fifth visual direction. If an enum addition has no consumer in one of the approved maps, do not add it.

## Naming And IP

Theme names must stay generic unless licensing is resolved. Avoid protected characters, fashion labels, venue names, songs, films, or franchise cues. Mood references are fine; direct imitation is not.

## Implementation Notes

- Enforceable specs live in `src/specs.ts`.
- Composition and motion families live in `COMPOSITION.md` and `src/composition.ts`.
- Registry metadata lives in isolated `src/themes/<theme-id>/` modules; `src/themes/index.ts` only assembles the typed registry.
