# Theme modules

Every shipped invitation theme owns one directory under `src/themes/<theme-id>/`.

## Module shape

- `definition.ts` — typed metadata, event/mode support, light/dark tokens, typography, composition, motion, compatibility, section variants, preview data, and accessibility notes.
- `visual.ts` — backdrop, texture, divider, frame, image treatment, and ornament configuration.
- `assets.ts` — the public asset namespace and supported asset slots.
- `index.ts` — the module's public exports.

Theme modules may import only the neutral contracts in `src/contracts.ts`, the serializable helpers in `src/theme-shared.ts`, and files inside their own directory. Themes must not import other themes, dashboard UI, shadcn, or Base UI.

The custom public invitation renderer and shared section components remain in `apps/invite/components/`. Theme section variants are declared through `composition.sectionDefaults` and `compatibility.rendererSlots`; database content never supplies executable renderer code.

## Asset convention

Theme-owned public assets use `/themes/<theme-id>/<slot>/<filename>` and live in `apps/invite/public/themes/<theme-id>/`. The theme's `assets.ts` exports that base path and the supported `backdrop`, `cover`, `gallery`, and `ornament` slots. Keep alt text in event or preview data rather than encoding it in filenames.

If a future asset is imported at build time instead of served publicly, colocate it in `src/themes/<theme-id>/assets/` and re-export a serializable reference from `assets.ts`.

## Add a theme

1. Copy one existing theme directory and rename its exported constants.
2. Add the stable ID to `themeIds` in `src/contracts.ts`.
3. Fill out `definition.ts`; keep every field required by `ThemeDefinition`.
4. Define the theme's visual effects in `visual.ts` and asset namespace in `assets.ts`.
5. Add the module imports to `src/themes/index.ts`, then include it in `themeRegistry` and `themeVisualEffects`.
6. Add or update the design guidance in `THEME_SPECS.md`.
7. Run the existing themes tests, typecheck, formatting check, and dashboard UI boundary check.

Existing theme IDs are persistence contracts. Rename one only with an explicit data migration and compatibility alias.
