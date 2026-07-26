import {
  resolveThemeRendererSlot,
  resolveThemeTypographyRoles,
  type ThemeDefinition,
  type ThemeTokenSet,
} from "@lumiere/themes";
import type { SectionType } from "@lumiere/types";
import type { CSSProperties } from "react";

export type InvitePreviewMode = "dark" | "light";
export type InvitePreviewViewport = "desktop" | "mobile";

export function InviteThemePreviewRenderer({
  fallbackReason,
  mode,
  theme,
  thumbnail = false,
  thumbnailSize = "default",
  viewport = "desktop",
}: {
  fallbackReason?: string;
  mode: InvitePreviewMode;
  theme: ThemeDefinition;
  thumbnail?: boolean;
  thumbnailSize?: "compact" | "default";
  viewport?: InvitePreviewViewport;
}) {
  const tokens = mode === "dark" && theme.tokens.dark ? theme.tokens.dark : theme.tokens.light;
  const sections = theme.previewData.sections.slice(0, thumbnail ? 1 : 3);
  const effects = theme.composition.effects;
  const compactThumbnail = thumbnail && thumbnailSize === "compact";
  const typographyRoles = resolveThemeTypographyRoles(theme.typography.scale, theme.typography.roles);

  return (
    <div
      data-invite-preview-boundary="isolated"
      data-preview-fallback={fallbackReason ? "true" : "false"}
      style={{
        all: "initial",
        boxSizing: "border-box",
        contain: "layout paint style",
        display: "block",
        isolation: "isolate",
        margin: "0 auto",
        maxWidth: "100%",
      }}
    >
      <article
        data-backdrop-type={effects.backdrop.type}
        data-composition-map={theme.composition.visualSystem.compositionMap}
        data-frame-style={effects.frameStyle}
        data-image-treatment={effects.imageTreatment}
        data-ornament-set={effects.ornaments.enabled ? effects.ornaments.set : "none"}
        data-preview-mode={mode}
        data-preview-theme={theme.id}
        data-preview-viewport={viewport}
        style={{
          backgroundColor: tokens.background,
          backgroundImage: previewBackdrop(theme, tokens),
          border: `${effects.frameStyle === "frameless" ? 0 : 1}px solid ${tokens.border}`,
          borderRadius: theme.radius.lg,
          boxShadow: thumbnail ? "none" : `0 24px 80px ${withAlpha(tokens.accent, "24")}`,
          boxSizing: "border-box",
          color: tokens.foreground,
          fontFamily: theme.typography.css.bodyFamily,
          minHeight: thumbnail
            ? compactThumbnail
              ? "156px"
              : "238px"
            : viewport === "mobile"
              ? "620px"
              : "540px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <PreviewOrnament theme={theme} tokens={tokens} />

        <header
          style={{
            alignContent: "center",
            borderBottom: `1px solid ${tokens.border}`,
            boxSizing: "border-box",
            display: "grid",
            gap: thumbnail ? (compactThumbnail ? "8px" : "10px") : "18px",
            minHeight: thumbnail
              ? compactThumbnail
                ? "96px"
                : "146px"
              : viewport === "mobile"
                ? "300px"
                : "250px",
            padding: thumbnail
              ? compactThumbnail
                ? "12px"
                : "18px"
              : viewport === "mobile"
                ? "40px 28px"
                : "46px 54px",
            position: "relative",
            textAlign: theme.composition.hero.composition === "centered-media" ? "center" : "left",
            zIndex: 1,
            ...previewHeroTreatment(theme, tokens),
          }}
        >
          <p
            style={{
              color: tokens.accentStrong,
              fontFamily: theme.typography.css.bodyFamily,
              fontSize: thumbnail ? (compactThumbnail ? "8px" : "9px") : "11px",
              fontStyle: typographyRoles.eyebrow.fontStyle,
              fontWeight: typographyRoles.eyebrow.fontWeight,
              letterSpacing: theme.typography.css.eyebrowLetterSpacing,
              lineHeight: typographyRoles.eyebrow.lineHeight,
              margin: 0,
              textTransform: typographyRoles.eyebrow.textTransform,
            }}
          >
            {theme.previewData.eyebrow}
          </p>
          <h3
            style={{
              color: tokens.foreground,
              fontFamily: theme.typography.css.displayFamily,
              fontSize: thumbnail
                ? compactThumbnail
                  ? "18px"
                  : "24px"
                : viewport === "mobile"
                  ? "42px"
                  : "54px",
              fontStyle: typographyRoles.hero.fontStyle,
              fontWeight: typographyRoles.hero.fontWeight,
              letterSpacing: typographyRoles.hero.letterSpacing,
              lineHeight: typographyRoles.hero.lineHeight,
              margin: 0,
              maxWidth: "14ch",
              textTransform: typographyRoles.hero.textTransform,
              ...(theme.composition.hero.composition === "centered-media"
                ? { marginInline: "auto" }
                : {}),
            }}
          >
            {theme.previewData.eventTitle}
          </h3>
          {!thumbnail ? (
            <p
              style={{
                color: tokens.foreground,
                fontFamily: theme.typography.css.bodyFamily,
                fontSize: "14px",
                lineHeight: 1.65,
                margin: 0,
                maxWidth: "52ch",
                opacity: 0.78,
                ...(theme.composition.hero.composition === "centered-media"
                  ? { marginInline: "auto" }
                  : {}),
              }}
            >
              {theme.previewData.subtitle}
            </p>
          ) : null}
        </header>

        <div
          style={{
            boxSizing: "border-box",
            display: "grid",
            gap: thumbnail ? "0" : "1px",
            gridTemplateColumns:
              !thumbnail && viewport === "desktop" && sections.length > 1
                ? `repeat(${Math.min(sections.length, 3)}, minmax(0, 1fr))`
                : "1fr",
            position: "relative",
            zIndex: 1,
          }}
        >
          {sections.map((section, index) => (
            <RepresentativeSection
              index={index}
              key={`${section.type}-${section.title}`}
              section={section}
              theme={theme}
              thumbnail={thumbnail}
              tokens={tokens}
            />
          ))}
        </div>

        {!thumbnail ? (
          <footer
            style={{
              alignItems: "center",
              borderTop: `1px solid ${tokens.border}`,
              display: "flex",
              fontSize: "11px",
              justifyContent: "space-between",
              letterSpacing: "0.08em",
              lineHeight: 1.4,
              padding: "14px 22px",
              position: "relative",
              textTransform: "uppercase",
              zIndex: 1,
            }}
          >
            <span>{theme.previewData.venueName}</span>
            <span style={{ color: tokens.accentStrong }}>{theme.dashboardPreview.summary}</span>
          </footer>
        ) : null}

        {fallbackReason ? (
          <p
            role="status"
            style={{
              background: tokens.surface,
              borderTop: `1px solid ${tokens.warning}`,
              bottom: 0,
              boxSizing: "border-box",
              color: tokens.foreground,
              fontFamily: theme.typography.css.bodyFamily,
              fontSize: "11px",
              left: 0,
              lineHeight: 1.45,
              margin: 0,
              padding: "8px 12px",
              position: "absolute",
              right: 0,
              zIndex: 2,
            }}
          >
            Preview fallback: {fallbackReason}
          </p>
        ) : null}
      </article>
    </div>
  );
}

function RepresentativeSection({
  index,
  section,
  theme,
  thumbnail,
  tokens,
}: {
  index: number;
  section: ThemeDefinition["previewData"]["sections"][number];
  theme: ThemeDefinition;
  thumbnail: boolean;
  tokens: ThemeTokenSet;
}) {
  const renderer = resolveThemeRendererSlot(theme, section.type);
  const typographyRoles = resolveThemeTypographyRoles(theme.typography.scale, theme.typography.roles);
  const treatment = sectionTreatment(renderer.composition, tokens, thumbnail);
  const sectionForeground =
    renderer.composition === "full-bleed" ? tokens.background : tokens.foreground;

  return (
    <section
      data-renderer-coverage={renderer.coverage}
      data-renderer-key={renderer.rendererKey}
      data-section-composition={renderer.composition}
      data-section-type={section.type}
      style={{
        ...treatment,
        borderColor: tokens.border,
        boxSizing: "border-box",
        minHeight: thumbnail ? "91px" : "168px",
        padding: thumbnail ? "14px 18px" : "26px",
      }}
    >
      <p
        style={{
          color: renderer.composition === "full-bleed" ? tokens.background : tokens.accentStrong,
          fontSize: thumbnail ? "8px" : "10px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          lineHeight: 1.2,
          margin: 0,
          textTransform: "uppercase",
        }}
      >
        {String(index + 1).padStart(2, "0")} · {formatSectionType(section.type)}
      </p>
      <h4
        style={{
          color: sectionForeground,
          fontFamily: theme.typography.css.displayFamily,
          fontSize: thumbnail ? "15px" : "22px",
          fontStyle: typographyRoles.title.fontStyle,
          fontWeight: typographyRoles.title.fontWeight,
          letterSpacing: typographyRoles.title.letterSpacing,
          lineHeight: typographyRoles.title.lineHeight,
          margin: thumbnail ? "7px 0 0" : "12px 0 0",
          textTransform: typographyRoles.title.textTransform,
        }}
      >
        {section.title}
      </h4>
      {!thumbnail ? (
        <p
          style={{
            color: sectionForeground,
            fontSize: "12px",
            lineHeight: 1.6,
            margin: "10px 0 0",
            opacity: 0.72,
          }}
        >
          {section.summary}
        </p>
      ) : null}
    </section>
  );
}

function previewHeroTreatment(theme: ThemeDefinition, tokens: ThemeTokenSet): CSSProperties {
  switch (theme.composition.hero.composition) {
    case "architectural-courtyard":
      return {
        background: `linear-gradient(112deg, transparent 0 68%, ${withAlpha(tokens.accent, "22")} 68%)`,
        borderLeft: `4px solid ${tokens.accent}`,
      };
    case "banquet-axis":
      return {
        alignContent: "end",
        background: `radial-gradient(ellipse at 50% 12%, ${withAlpha(tokens.accent, "28")}, transparent 48%)`,
      };
    case "botanical-canopy":
      return {
        background: `radial-gradient(ellipse at 82% 6%, ${withAlpha(tokens.accent, "24")}, transparent 38%)`,
      };
    case "flash-frame":
      return {
        background: `linear-gradient(96deg, transparent 0 70%, ${tokens.accent} 70% 72%, ${withAlpha(tokens.surfaceMuted, "88")} 72%)`,
        borderBottom: `2px solid ${tokens.foreground}`,
      };
    default:
      return {};
  }
}

function PreviewOrnament({ theme, tokens }: { theme: ThemeDefinition; tokens: ThemeTokenSet }) {
  const ornaments = theme.composition.effects.ornaments;

  if (!ornaments.enabled || ornaments.set === "none") {
    return null;
  }

  const style: CSSProperties = {
    border: `1px solid ${withAlpha(tokens.accent, "66")}`,
    borderRadius: "999px",
    background: "transparent",
    boxShadow: `0 0 36px ${withAlpha(tokens.accent, "44")}`,
    height: "72px",
    opacity: ornaments.density === "sparse" ? 0.45 : 0.7,
    pointerEvents: "none",
    position: "absolute",
    right: "7%",
    top: "8%",
    transform: "none",
    width: "72px",
    zIndex: 0,
    ...previewOrnamentTreatment(ornaments.set, tokens),
  };

  return <span aria-hidden="true" data-preview-ornament={ornaments.set} style={style} />;
}

function previewOrnamentTreatment(
  ornamentSet: ThemeDefinition["composition"]["effects"]["ornaments"]["set"],
  tokens: ThemeTokenSet,
): CSSProperties {
  switch (ornamentSet) {
    case "architectural-shadows":
      return {
        background: `linear-gradient(118deg, transparent 0 52%, ${withAlpha(tokens.accent, "33")} 52%)`,
        borderRadius: "999px 999px 0 0",
        boxShadow: `12px 12px 0 ${withAlpha(tokens.accent, "22")}`,
        height: "86px",
        width: "66px",
      };
    case "botanical":
      return { borderRadius: "75% 15% 75% 15%", transform: "rotate(28deg)" };
    case "confetti":
      return {
        boxShadow: `18px 28px 0 -2px ${tokens.warning}, 44px 8px 0 -3px ${tokens.accentStrong}`,
      };
    case "constellation":
      return {
        boxShadow: `22px 18px 0 -3px ${tokens.accent}, 48px -10px 0 -4px ${tokens.accentStrong}`,
      };
    case "contact-sheet":
      return {
        background: `linear-gradient(90deg, ${tokens.accent} 0 4%, transparent 4% 96%, ${tokens.accent} 96%)`,
        borderRadius: "0",
        boxShadow: "none",
        height: "82px",
        width: "64px",
      };
    case "contour-lines":
      return {
        background: `repeating-radial-gradient(ellipse, transparent 0 9px, ${withAlpha(tokens.accent, "66")} 10px 11px)`,
      };
    case "editorial-rules":
      return { height: "1px", width: "34%" };
    case "geometric-planes":
      return {
        background: `linear-gradient(135deg, ${tokens.accent} 0 48%, ${tokens.warning} 48% 72%, ${tokens.surfaceMuted} 72%)`,
        borderRadius: "0",
        transform: "rotate(-8deg)",
      };
    case "night-foliage":
      return {
        background: `linear-gradient(142deg, ${withAlpha(tokens.accent, "44")}, transparent 68%)`,
        borderRadius: "82% 18% 72% 28% / 68% 24% 76% 32%",
        boxShadow: `inset 18px -12px 0 ${withAlpha(tokens.accent, "18")}`,
        height: "92px",
        transform: "rotate(-22deg)",
        width: "70px",
      };
    case "signal-grid":
      return {
        background: `repeating-linear-gradient(90deg, transparent 0 11px, ${withAlpha(tokens.accent, "66")} 11px 12px)`,
        borderRadius: "0",
        height: "88%",
        width: "34%",
      };
    case "table-axis":
      return {
        background: `linear-gradient(90deg, transparent, ${tokens.accentStrong} 18% 82%, transparent)`,
        border: "0",
        borderRadius: "0",
        boxShadow: `24px 0 0 -22px ${tokens.accent}, -24px 0 0 -22px ${tokens.accent}`,
        height: "1px",
        top: "18%",
        width: "46%",
      };
    case "tide-lines":
      return {
        background: `radial-gradient(ellipse at 50% 100%, transparent 0 48%, ${withAlpha(tokens.accent, "66")} 49% 50%, transparent 51%)`,
      };
    default:
      return {};
  }
}

function sectionTreatment(
  composition: ReturnType<typeof resolveThemeRendererSlot>["composition"],
  tokens: ThemeTokenSet,
  thumbnail: boolean,
): CSSProperties {
  switch (composition) {
    case "editorial-split":
      return {
        background: tokens.surface,
        borderLeft: thumbnail ? 0 : `3px solid ${tokens.accent}`,
      };
    case "full-bleed":
      return {
        background: `linear-gradient(135deg, ${tokens.accentStrong}, ${tokens.accent})`,
        color: tokens.background,
      };
    case "gallery-feature":
    case "layered-media":
      return {
        background: `radial-gradient(circle at 78% 24%, ${withAlpha(tokens.accent, "55")}, transparent 38%), ${tokens.surfaceMuted}`,
      };
    case "timeline":
      return {
        background: tokens.surface,
        borderLeft: `1px solid ${tokens.accent}`,
      };
    default:
      return {
        background: tokens.surface,
        border: `1px solid ${tokens.border}`,
      };
  }
}

function previewBackdrop(theme: ThemeDefinition, tokens: ThemeTokenSet) {
  const type = theme.composition.effects.backdrop.type;

  switch (type) {
    case "gradient":
      return `radial-gradient(circle at 15% 12%, ${withAlpha(tokens.accent, "42")}, transparent 42%), linear-gradient(155deg, ${tokens.background}, ${tokens.surfaceMuted})`;
    case "image":
      return `linear-gradient(145deg, ${withAlpha(tokens.accentStrong, "ee")}, ${withAlpha(tokens.background, "e8")}), radial-gradient(circle at 72% 20%, ${tokens.accent}, transparent 40%)`;
    case "texture":
      return `radial-gradient(circle at 18px 18px, ${withAlpha(tokens.accent, "38")} 1px, transparent 2px)`;
    case "editorial-whitespace":
      return `linear-gradient(90deg, transparent 0 8%, ${withAlpha(tokens.border, "88")} 8% calc(8% + 1px), transparent calc(8% + 1px))`;
    default:
      return "none";
  }
}

function withAlpha(color: string, alpha: string) {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? `${color}${alpha}` : color;
}

function formatSectionType(sectionType: SectionType) {
  return sectionType.replaceAll("_", " ");
}
