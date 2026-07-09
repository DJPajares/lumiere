# @lumiere/themes

Theme registry, section contracts, visual composition rules, and design specs for Lumiere invitations.

## Documentation

- `THEME_SPECS.md` defines the design intent, motion/media/RSVP guidance, dashboard preview requirements, and anti-slop constraints for each shipped theme.
- `COMPOSITION.md` defines reusable section composition families, scroll-depth rules, image fallbacks, and sample wedding/birthday rhythms.
- `src/themes.ts` contains the runtime theme registry.
- `src/specs.ts` contains the typed, test-covered theme template specs.
- `src/composition.ts` contains the typed, test-covered composition and motion system.

Use the docs before adding or changing a theme. A Lumiere theme must be more than a palette swap.
