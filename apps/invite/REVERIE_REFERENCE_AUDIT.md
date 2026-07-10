# Reverie reference audit

Reviewed 2026-07-10 for `t51-reverie-inspired-invite-modernization`.

## Reference boundary

- Source repository: <https://github.com/DJPajares/reverie>
- Hosted reference: <https://reverie.wndrhive.com/>
- Reverie is a single-event wedding keepsake driven by one local configuration file. Lumiere is a multi-event SaaS driven by authenticated manager data, public API contracts, publication snapshots, and a shared theme registry.
- The repository does not publish a standard permissive license file. Its README permits personal event adaptation, so this task borrows design and architecture ideas only. No Reverie source, copy, assets, theme names, or visual composition is ported one-to-one.

## Applicable patterns

| Reverie pattern | Lumiere adaptation |
| --- | --- |
| One typed configuration drives visible event content | Keep `PublicEventResponse`, `EventSection`, and the database publication snapshot as the source of truth. |
| Theme-owned variants select a complete visual experience | Keep the `@lumiere/themes` registry and specialize Premium through theme metadata, data attributes, and project-owned renderer styling. |
| Full-viewport opening and editorial typography | Give Premium weddings a fluid display scale, asymmetric portrait composition, hairline facts, and a deliberate no-image fallback. |
| Reveal, parallax, and masked-motion wrappers | Reuse Lumiere's existing motion/parallax hooks. This pass adds only CSS-native scroll progress and static composition improvements; `t53` owns deeper motion behavior. |
| Smooth-scroll orchestration | Use native smooth anchor scrolling where allowed and preserve normal browser scrolling. Do not add Lenis or another runtime dependency in this pass. |
| Scroll progress | Add a decorative, CSS scroll-timeline progress rule with a reduced-motion fallback and no per-frame React state. |
| Guest-controlled music | Keep the existing external `AmbientAudioControls`; never force audible playback. |
| Venue map | Keep Lumiere's safe map-link/fact preview. Do not add Leaflet until the product needs an interactive map and its loading/privacy cost is justified. |

## Chosen Premium wedding rhythm

1. Cinematic introduction: oversized names/copy, event facts as hairlines, dominant portrait or composed fact fallback.
2. Editorial people/profile: portrait-led columns without dashboard cards.
3. Full-bleed date chapter: large date typography and a quiet time rail.
4. Timeline story: one connected narrative with generous measure.
5. Split details and location: practical information stays readable but visually integrated.
6. Feature gallery: one lead image with supporting crops and captions.
7. Ceremonial RSVP: full-width chapter with the private guest form or a clear public locked state.
8. Layered outro: quiet typographic ending with optional media.

## Quality and compatibility checks

- Public and guest-token routes use the same database-driven section renderer.
- Public routes never render guest names, group status, or RSVP controls.
- Mobile remains single-column; tablet introduces balanced splits; desktop allows asymmetric editorial grids.
- Meaningful images retain alt text and reserved aspect ratios.
- Focus, disabled, error, submitted, and closed RSVP states remain owned by the existing form flow.
- Reduced motion disables scroll-progress animation, parallax, drift, and reveal transforms.
