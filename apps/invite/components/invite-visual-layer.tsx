import type { ThemeVisualEffects } from "@lumiere/themes";

import { InviteImage } from "./invite-image";

type InviteVisualLayerProps = {
  backdropImageUrl?: string;
  effects: ThemeVisualEffects;
};

export function InviteVisualLayer({ backdropImageUrl, effects }: InviteVisualLayerProps) {
  const hasBackdropImage = effects.backdrop.imageSource === "cover" && Boolean(backdropImageUrl);
  const ornamentsEnabled = effects.ornaments.enabled && effects.ornaments.set !== "none";

  return (
    <>
      <div
        aria-hidden="true"
        className="lumiere-visual-layer lumiere-visual-layer--backdrop"
        data-backdrop-image={hasBackdropImage ? "ready" : "missing"}
        data-effects-layer="invite-atmosphere"
      >
        <div className="lumiere-visual-layer__viewport">
          <span className="lumiere-visual-layer__backdrop" />
          {hasBackdropImage && backdropImageUrl ? (
            <InviteImage
              alt=""
              className="lumiere-visual-layer__image"
              decoding="async"
              fetchPriority="low"
              height={1080}
              loading="lazy"
              sizes="100vw"
              src={backdropImageUrl}
              width={1920}
            />
          ) : null}
          <span className="lumiere-visual-layer__wash" />
        </div>
      </div>
      <div aria-hidden="true" className="lumiere-visual-layer lumiere-visual-layer--overlay">
        <div className="lumiere-visual-layer__viewport">
          {effects.texture.policy !== "none" ? (
            <span className="lumiere-visual-layer__texture" />
          ) : null}
          {ornamentsEnabled ? (
            <span className="lumiere-ornaments">
              <span className="lumiere-ornament" data-ornament-position="primary" />
              <span className="lumiere-ornament" data-ornament-position="secondary" />
              {effects.ornaments.density === "balanced" ? (
                <span className="lumiere-ornament" data-ornament-position="tertiary" />
              ) : null}
            </span>
          ) : null}
          <span className="lumiere-visual-layer__vignette" />
        </div>
      </div>
    </>
  );
}
