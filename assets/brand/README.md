# Lumiere brand assets

The approved Lumiere app mark is a geometric `L` paired with one four-point light flare. The mark intentionally removes the old fine orbit lines, multiple stars, metallic texture, and embedded wordmark so it remains recognizable at 16 px and feels at home beside native app icons.

## Source artwork

- `lumiere-invite-app-icon.svg` is the expressive public-invite source: warm ivory and champagne on warm black.
- `lumiere-dashboard-app-icon.svg` is the operational dashboard source: charcoal and bronze on warm stone.

Both sources use identical geometry. Their palette and field treatment distinguish the two installable apps without splitting the Lumiere identity. These SVG files are the editable masters; public PNG and ICO files are generated outputs.

## Usage

- Keep the `L` and flare together. Do not rotate, outline, add a wordmark inside the tile, or add more rays and ornaments.
- Keep visible lockups as icon plus live text. The image is decorative when adjacent text or a link label already names Lumiere.
- Use the Invite treatment on public metadata, install surfaces, and top-level public chrome. Do not repeat it inside event-theme sections.
- Use the Dashboard treatment in manager navigation, authentication surfaces, metadata, and install surfaces.
- Standard icons and `logo.png` retain transparent rounded corners. Apple touch and maskable icons use a full-bleed field so platform masks cannot expose an unintended background.
- The mark stays inside the maskable safe circle. Do not scale it up independently in maskable exports.

## Regeneration

From the repository root:

```bash
pnpm brand:assets
pnpm brand:assets --check
```

The generator exports each app's `logo.png`, 180 px Apple touch icon, 192/512 px standard and maskable PWA icons, and a 16/32/48/64 px multi-resolution favicon. Asset URLs carry the version token documented in the app manifests and layouts; bump that token when source artwork changes so browsers and installed PWAs request the new pack.
