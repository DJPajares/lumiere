export const themeTypographyRoleNames = [
  "hero",
  "heroSubtitle",
  "pretitle",
  "title",
  "name",
  "subtitle",
  "description",
  "body",
  "label",
  "control",
  "controlIcon",
  "eyebrow",
  "caption",
  "numeric",
] as const;

export type ThemeTypographyRoleName = (typeof themeTypographyRoleNames)[number];

export type ThemeTypographyStyle = {
  fontFamily: "body" | "display";
  fontSize: string;
  fontStyle: "italic" | "normal";
  fontWeight: string;
  letterSpacing: string;
  lineHeight: string;
  textTransform: "capitalize" | "lowercase" | "none" | "uppercase";
};

export type ThemeTypographyRoles = Record<ThemeTypographyRoleName, ThemeTypographyStyle>;

export type ThemeTypographyRoleOverrides = Partial<{
  [Role in ThemeTypographyRoleName]: Partial<ThemeTypographyStyle>;
}>;

export type ThemeTypographyScale = "editorial" | "playful" | "restrained";

const restrainedRoles: ThemeTypographyRoles = {
  hero: {
    fontFamily: "display",
    fontSize: "clamp(3.25rem, 8vw, 7.5rem)",
    fontStyle: "normal",
    fontWeight: "600",
    letterSpacing: "-0.05em",
    lineHeight: "0.9",
    textTransform: "none",
  },
  heroSubtitle: {
    fontFamily: "body",
    fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
    fontStyle: "normal",
    fontWeight: "400",
    letterSpacing: "0em",
    lineHeight: "1.55",
    textTransform: "none",
  },
  pretitle: {
    fontFamily: "display",
    fontSize: "clamp(1rem, 2vw, 1.5rem)",
    fontStyle: "normal",
    fontWeight: "500",
    letterSpacing: "0.02em",
    lineHeight: "1.2",
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "display",
    fontSize: "clamp(2.25rem, 5vw, 4.5rem)",
    fontStyle: "normal",
    fontWeight: "600",
    letterSpacing: "-0.04em",
    lineHeight: "0.98",
    textTransform: "none",
  },
  name: {
    fontFamily: "display",
    fontSize: "clamp(1.5rem, 2.6vw, 2.5rem)",
    fontStyle: "normal",
    fontWeight: "600",
    letterSpacing: "-0.02em",
    lineHeight: "1.1",
    textTransform: "none",
  },
  subtitle: {
    fontFamily: "display",
    fontSize: "clamp(1.375rem, 2.4vw, 2rem)",
    fontStyle: "normal",
    fontWeight: "600",
    letterSpacing: "-0.02em",
    lineHeight: "1.15",
    textTransform: "none",
  },
  description: {
    fontFamily: "body",
    fontSize: "clamp(1.0625rem, 1.4vw, 1.25rem)",
    fontStyle: "normal",
    fontWeight: "400",
    letterSpacing: "0em",
    lineHeight: "1.7",
    textTransform: "none",
  },
  body: {
    fontFamily: "body",
    fontSize: "clamp(1rem, 1vw, 1.125rem)",
    fontStyle: "normal",
    fontWeight: "400",
    letterSpacing: "0em",
    lineHeight: "1.65",
    textTransform: "none",
  },
  label: {
    fontFamily: "body",
    fontSize: "0.875rem",
    fontStyle: "normal",
    fontWeight: "600",
    letterSpacing: "0.08em",
    lineHeight: "1.4",
    textTransform: "none",
  },
  control: {
    fontFamily: "body",
    fontSize: "0.875rem",
    fontStyle: "normal",
    fontWeight: "600",
    letterSpacing: "0em",
    lineHeight: "1.35",
    textTransform: "none",
  },
  controlIcon: {
    fontFamily: "body",
    fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
    fontStyle: "normal",
    fontWeight: "600",
    letterSpacing: "0em",
    lineHeight: "1",
    textTransform: "none",
  },
  eyebrow: {
    fontFamily: "body",
    fontSize: "0.75rem",
    fontStyle: "normal",
    fontWeight: "650",
    letterSpacing: "var(--eyebrow-tracking)",
    lineHeight: "1.5",
    textTransform: "uppercase",
  },
  caption: {
    fontFamily: "body",
    fontSize: "0.875rem",
    fontStyle: "normal",
    fontWeight: "400",
    letterSpacing: "0em",
    lineHeight: "1.5",
    textTransform: "none",
  },
  numeric: {
    fontFamily: "display",
    fontSize: "clamp(2rem, 4vw, 4rem)",
    fontStyle: "normal",
    fontWeight: "600",
    letterSpacing: "-0.02em",
    lineHeight: "1",
    textTransform: "none",
  },
};

const typographyScaleOverrides: Record<
  Exclude<ThemeTypographyScale, "restrained">,
  ThemeTypographyRoleOverrides
> = {
  editorial: {
    hero: {
      fontSize: "clamp(3.75rem, 9vw, 8.75rem)",
      fontWeight: "400",
      lineHeight: "0.86",
    },
    heroSubtitle: { fontFamily: "display", fontSize: "clamp(1.2rem, 2.2vw, 1.75rem)" },
    title: {
      fontSize: "clamp(2.6rem, 5.8vw, 5.5rem)",
      fontWeight: "400",
      lineHeight: "0.94",
    },
    subtitle: { fontWeight: "500" },
    description: { fontSize: "clamp(1.1rem, 1.6vw, 1.35rem)" },
  },
  playful: {
    hero: {
      fontSize: "clamp(3.5rem, 8.5vw, 7.75rem)",
      fontWeight: "700",
      letterSpacing: "-0.04em",
      lineHeight: "0.94",
    },
    title: { fontSize: "clamp(2.5rem, 5.5vw, 5rem)", fontWeight: "700" },
    subtitle: { fontWeight: "700" },
    description: { fontSize: "clamp(1.1rem, 1.5vw, 1.3rem)" },
  },
};

export function resolveThemeTypographyRoles(
  scale: ThemeTypographyScale,
  overrides: ThemeTypographyRoleOverrides = {},
): ThemeTypographyRoles {
  const scaleOverrides = scale === "restrained" ? {} : typographyScaleOverrides[scale];

  return Object.fromEntries(
    themeTypographyRoleNames.map((role) => [
      role,
      {
        ...restrainedRoles[role],
        ...scaleOverrides[role],
        ...overrides[role],
      },
    ]),
  ) as ThemeTypographyRoles;
}
