# Theme modules

Every shipped invitation theme owns one directory under `src/themes/<theme-id>/`.

## Module shape

- `definition.ts` — typed metadata, event/mode support, light/dark tokens, typography, composition, motion, compatibility, section variants, preview data, and accessibility notes.
- `visual.ts` — typed hero, RSVP, backdrop, texture, divider, frame, image treatment, and ornament presentation.
- `styles.css` — optional theme-owned selectors for visual treatments that cannot be expressed by typed class strings alone.
- `assets.ts` — the public asset namespace and supported asset slots.
- `index.ts` — the module's public exports.

Theme modules may import only the neutral contracts in `src/contracts.ts`, the serializable helpers in `src/theme-shared.ts`, and files inside their own directory. Themes must not import other themes, dashboard UI, shadcn, or Base UI.

The custom public invitation renderer and shared section components remain in `apps/invite/components/`. That shared shell owns event state, guest/public access, enabled sections, RSVP availability, validation, recovery, accessibility, and theme-neutral rendering behavior. Theme modules own visual class names, RSVP treatment, hero/media layout, theme selectors, tokens, composition, motion, effects, copy, and renderer declarations. Theme section variants are declared through `presentation`, `composition.sectionDefaults`, and `compatibility.rendererSlots`; database content never supplies executable renderer code.

Application components consume the resolved `ThemeDefinition` and must not compare concrete theme IDs or names. Invalid or missing IDs are resolved through the package-level common fallback. Dashboard previews consume the same serializable theme definitions and never import invitation implementation logic.

RSVP presentation declares a serializable `rendererId`. The invite app resolves that capability to a renderer receiving one typed controller contract; theme modules never duplicate form state, validation, API submission, disabled-state, accessibility, or recovery behavior. The `common` renderer is the safe fallback, while specialized renderers may rearrange the same fields and actions into a meaningfully different composition.

## Asset convention

Theme-owned public assets use `/themes/<theme-id>/<slot>/<filename>` and live in `apps/invite/public/themes/<theme-id>/`. The theme's `assets.ts` exports that base path and the supported `backdrop`, `cover`, `gallery`, and `ornament` slots. Keep alt text in event or preview data rather than encoding it in filenames.

If a future asset is imported at build time instead of served publicly, colocate it in `src/themes/<theme-id>/assets/` and re-export a serializable reference from `assets.ts`.

## Add a theme

1. Copy one existing theme directory and rename its exported constants.
2. Add the stable ID to `themeIds` in `src/contracts.ts`.
3. Fill out `definition.ts`; keep every field required by `ThemeDefinition`.
4. Define the theme's typed presentation and visual effects in `visual.ts`, optional selectors in `styles.css`, and asset namespace in `assets.ts`.
5. Add the module imports to `src/themes/index.ts`, then include it in `themeRegistry` and `themeVisualEffects`.
6. Add or update the design guidance in `THEME_SPECS.md`.
7. Run the existing themes tests, typecheck, formatting check, and dashboard UI boundary check.

Existing theme IDs are persistence contracts. Rename one only with an explicit data migration and compatibility alias.
