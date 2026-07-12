import {
  resolveThemeRendererSlot,
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
  viewport = "desktop",
}: {
  fallbackReason?: string;
  mode: InvitePreviewMode;
  theme: ThemeDefinition;
  thumbnail?: boolean;
  viewport?: InvitePreviewViewport;
}) {
  const tokens = mode === "dark" && theme.tokens.dark ? theme.tokens.dark : theme.tokens.light;
  const sections = theme.previewData.sections.slice(0, thumbnail ? 1 : 3);
  const effects = theme.composition.effects;

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
          minHeight: thumbnail ? "238px" : viewport === "mobile" ? "620px" : "540px",
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
            gap: thumbnail ? "10px" : "18px",
            minHeight: thumbnail ? "146px" : viewport === "mobile" ? "300px" : "250px",
            padding: thumbnail ? "18px" : viewport === "mobile" ? "40px 28px" : "46px 54px",
            position: "relative",
            textAlign: theme.composition.hero.composition === "centered-media" ? "center" : "left",
            zIndex: 1,
          }}
        >
          <p
            style={{
              color: tokens.accentStrong,
              fontFamily: theme.typography.css.bodyFamily,
              fontSize: thumbnail ? "9px" : "11px",
              fontWeight: 700,
              letterSpacing: theme.typography.css.eyebrowLetterSpacing,
              lineHeight: 1.2,
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            {theme.previewData.eyebrow}
          </p>
          <h3
            style={{
              color: tokens.foreground,
              fontFamily: theme.typography.css.displayFamily,
              fontSize: thumbnail ? "24px" : viewport === "mobile" ? "42px" : "54px",
              fontWeight: 600,
              letterSpacing: "-0.035em",
              lineHeight: 0.98,
              margin: 0,
              maxWidth: "14ch",
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
          fontWeight: 600,
          lineHeight: 1.1,
          margin: thumbnail ? "7px 0 0" : "12px 0 0",
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

function PreviewOrnament({ theme, tokens }: { theme: ThemeDefinition; tokens: ThemeTokenSet }) {
  const ornaments = theme.composition.effects.ornaments;

  if (!ornaments.enabled || ornaments.set === "none") {
    return null;
  }

  const style: CSSProperties = {
    border: `1px solid ${withAlpha(tokens.accent, "66")}`,
    borderRadius: ornaments.set === "botanical" ? "75% 15% 75% 15%" : "999px",
    boxShadow:
      ornaments.set === "constellation"
        ? `22px 18px 0 -3px ${tokens.accent}, 48px -10px 0 -4px ${tokens.accentStrong}`
        : ornaments.set === "confetti"
          ? `18px 28px 0 -2px ${tokens.warning}, 44px 8px 0 -3px ${tokens.accentStrong}`
          : `0 0 36px ${withAlpha(tokens.accent, "44")}`,
    height: ornaments.set === "editorial-rules" ? "1px" : "72px",
    opacity: ornaments.density === "sparse" ? 0.45 : 0.7,
    pointerEvents: "none",
    position: "absolute",
    right: "7%",
    top: "8%",
    transform: ornaments.set === "botanical" ? "rotate(28deg)" : "none",
    width: ornaments.set === "editorial-rules" ? "34%" : "72px",
    zIndex: 0,
  };

  return <span aria-hidden="true" data-preview-ornament={ornaments.set} style={style} />;
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
