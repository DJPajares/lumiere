# Invite Visual Effects QA

Lumiere effects are theme-owned atmosphere, not content. Every invitation remains complete when the
decorative layer is disabled, a cover image is missing, or the visitor requests reduced motion.

## Strategy coverage

| Strategy | Theme example | Review focus |
| --- | --- | --- |
| Solid | Lumiere Default, Modern Minimal | No decorative noise; content hierarchy carries the page. |
| Gradient | Premium, Garden Light | Halos stay behind readable content and keep one theme accent. |
| Texture | Kids | Speckle remains subtle and never reads as confetti emoji or visual clutter. |
| Image | Noel, Celestial Gold | Missing cover falls back to tokens; loaded cover is decorative, cropped with `object-fit`, and causes no layout shift. |
| Editorial whitespace | Editorial Ivory | Folio rules support the grid without imitating a dashboard. |

## Manual pre-flight

1. Review every theme at 390px, 768px, and 1440px widths with both a cover image and no cover image.
2. Confirm title, event facts, RSVP labels, errors, focus rings, and buttons remain readable over every effect.
3. Confirm ornaments stay at viewport edges, never capture pointer input, and the third ornament disappears on phones.
4. Throttle image loading and confirm the absolute decorative image produces no layout shift or empty gap.
5. Check light and dark/toggleable modes for contrast, especially Noel and Celestial image washes.
6. Enable reduced motion and confirm decorative imagery is static, less enlarged, and motion blur is absent.
7. Inspect portrait and landscape cover images; meaningful subjects must remain fully available in the real hero image even when the decorative crop is abstracted.
