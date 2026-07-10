# Invite Motion QA

The invite motion system is progressive enhancement. The static server-rendered page remains fully
readable before the client runtime starts, when JavaScript is unavailable, and when reduced motion is
requested.

## Variant matrix

| Variant | Theme source | Expected behavior |
| --- | --- | --- |
| None | `prefers-reduced-motion: reduce` | No reveals, parallax, drift, masked translation, or scroll progress. Content is immediately visible. |
| Low | `calm` motion profile | Short section and title reveals. Parallax is disabled. |
| Premium | `immersive`, `playful`, or `seasonal` profile | Chapter reveals, masked hero title, theme-declared media depth, soft image movement, and restrained press feedback. |

## Manual pre-flight

1. Open a calm theme and an immersive theme at 390px, 768px, and 1440px widths.
2. Confirm the hero is readable immediately and every later section reveals only once as it enters.
3. On an immersive theme, confirm hero/media depth stays subtle and does not crop faces or obscure copy.
4. Complete and update an RSVP; controls must remain stable and responsive throughout motion.
5. Enable reduced motion in the operating system, reload, and confirm all content is static and visible.
6. Test keyboard focus on the map link and RSVP controls; focus rings must remain visible during feedback.

Native CSS scroll timelines drive supported browsers. Other browsers use an isolated client runtime
that writes CSS variables from one scheduled animation frame and never updates React state on scroll.
