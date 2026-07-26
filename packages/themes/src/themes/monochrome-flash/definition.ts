import type { ThemeDefinition } from "../../contracts";
import { allInviteSections, createRendererSlots } from "../../theme-shared";
import { monochromeFlashEffects, monochromeFlashPresentation } from "./visual";

const specializedSections = [
  "introduction",
  "date",
  "details",
  "profile",
  "story",
  "gallery",
  "location",
  "rsvp",
  "outro",
] as const;
const fallbackSections = ["entourage", "dress_code", "custom"] as const;

export const monochromeFlashTheme = {
  id: "monochrome-flash",
  label: "Monochrome Flash",
  description:
    "A photography-first invitation with direct crops, graphic timestamps, and one disciplined red cue.",
  designRead:
    "Gallery gray and camera black frame high-contrast documentary photography, oversized condensed grotesk titles, mono captions, and quick editorial cuts without any simulated flash.",
  supportedEventTypes: ["launch", "birthday", "dinner", "private_event", "other"],
  supportedModes: ["light", "dark", "system", "toggleable"],
  defaultMode: "system",
  presentation: monochromeFlashPresentation,
  modeToggle: {
    defaultPreference: "system",
    labels: { control: "Frame exposure", dark: "Camera black", light: "Gallery white" },
    placement: "top-end",
    style: "editorial",
  },
  rsvpCopy: {
    acceptLabel: "Add me to the list",
    attendancePrompt: "Are you in?",
    declineLabel: "Not this time",
    eyebrow: "Guest list",
    reservedSeatsIntro: "Entry held for",
    sectionDescription: "Add your party to the final frame.",
    sectionTitle: "You are on the list",
    submitLabel: "Confirm entry",
    submittingLabel: "Adding entry…",
    successDescription: "Your named entry is now with the host.",
    successTitle: "Entry confirmed",
  },
  supportedSections: allInviteSections,
  requiredSections: ["introduction", "date", "location", "rsvp"],
  recommendedSections: [...specializedSections],
  sectionRhythm: [
    "introduction",
    "date",
    "profile",
    "story",
    "details",
    "gallery",
    "location",
    "rsvp",
    "outro",
  ],
  tokens: {
    light: {
      background: "#f2f0eb",
      foreground: "#171718",
      surface: "#faf8f3",
      surfaceMuted: "#dedcd7",
      border: "#747477",
      accent: "#8d211d",
      accentStrong: "#681713",
      success: "#336845",
      warning: "#80590e",
      error: "#aa2f38",
      focus: "#8d211d",
    },
    dark: {
      background: "#111112",
      foreground: "#f2f0ea",
      surface: "#1c1c1e",
      surfaceMuted: "#29292c",
      border: "#77777c",
      accent: "#ff877e",
      accentStrong: "#ffb0aa",
      success: "#7bc493",
      warning: "#e9bd62",
      error: "#ff8d98",
      focus: "#ffb0aa",
    },
  },
  composition: {
    ambientMedia: {
      audioSlot: "optional",
      controlStrategy: "external-controls",
      defaultAutoplay: false,
      mood: "A host-selected studio or nightlife mix remains guest-controlled and independent of visual cuts.",
    },
    backgroundTreatment:
      "Flat gallery gray or camera black with crisp registration lines and one non-status red splice.",
    effects: monochromeFlashEffects,
    visualSystem: {
      cardStackPolicy:
        "Use full frames, contact sequences, and hard registration lines; never turn photographs into thumbnail cards.",
      compositionMap: "monochrome-flash",
      imageStrategy:
        "Favor direct-flash candids, sharp portrait crops, room details, and readable monochrome tonal range.",
      motionProfile: "immersive",
      parallaxProfile: "none",
    },
    hero: {
      composition: "flash-frame",
      fullViewport: true,
      mediaTreatment:
        "One high-contrast photograph, oversized title, and readable timestamp share a hard-edged opening frame.",
    },
    map: { aspect: "wide", frame: "minimal", overlay: "none" },
    rsvpDesign: "guest-list",
    sectionDefaults: {
      date: {
        composition: "framed",
        density: "compact",
        layout: "registration-strip",
        motion: "section-reveal",
      },
      profile: {
        composition: "editorial-split",
        density: "compact",
        layout: "portrait-diptych",
        motion: "media-reveal",
      },
      story: {
        composition: "layered-media",
        density: "balanced",
        layout: "scene-cut",
        motion: "media-reveal",
      },
      details: { composition: "timeline", density: "compact", motion: "section-reveal" },
      gallery: {
        composition: "gallery-feature",
        density: "compact",
        layout: "contact-sequence",
        motion: "media-reveal",
      },
      location: {
        composition: "editorial-split",
        density: "compact",
        layout: "arrival-frame",
        motion: "section-reveal",
      },
      rsvp: {
        composition: "full-bleed",
        density: "compact",
        layout: "guest-list-reply",
        motion: "section-reveal",
      },
      outro: { composition: "full-bleed", density: "compact", motion: "section-reveal" },
    },
  },
  radius: { sm: "0rem", md: "0rem", lg: "0rem" },
  typography: {
    display: "oversized condensed grotesk",
    body: "neutral sans with mono captions",
    css: {
      bodyFamily: '"Manrope Variable", Manrope, ui-sans-serif, system-ui, sans-serif',
      displayFamily: '"Manrope Variable", Manrope, "Arial Narrow", ui-sans-serif, sans-serif',
      eyebrowLetterSpacing: "0.2em",
    },
    roles: {
      hero: {
        fontSize: "clamp(4.5rem, 13vw, 12rem)",
        fontWeight: "760",
        letterSpacing: "-0.09em",
        lineHeight: "0.74",
      },
      title: {
        fontSize: "clamp(3rem, 7vw, 7rem)",
        fontWeight: "740",
        letterSpacing: "-0.075em",
        lineHeight: "0.82",
      },
      label: {
        fontSize: "0.68rem",
        fontWeight: "720",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      },
      numeric: {
        fontSize: "clamp(3rem, 8vw, 8rem)",
        fontWeight: "760",
        letterSpacing: "-0.08em",
      },
    },
    scale: "restrained",
  },
  imageTreatment:
    "High-contrast monochrome photography with inspectable shadows, crisp crops, and opaque text backplates.",
  rsvpTreatment:
    "A hard-edged, full-width guest-list frame where capacity, response, names, and questions stay visibly labelled.",
  compatibility: {
    backdropStrategy:
      "Flat monochrome fields and registration rules create structure without paper, glass, glow, or simulated camera effects.",
    fontPairing: {
      body: "neutral sans with mono captions",
      display: "oversized condensed grotesk",
    },
    motionLevel: "immersive",
    ornamentStrategy:
      "Sparse contact-sheet frames, registration ticks, and one red splice; no strobe, flash, flicker, film logos, or magazine mastheads.",
    rendererSlots: createRendererSlots({
      fallback: [...fallbackSections],
      specialized: [...specializedSections],
    }),
  },
  dashboardPreview: {
    swatch: "#ff877e",
    summary: "High-contrast photography, graphic timestamps, and a sharp guest-list close.",
  },
  previewData: {
    eventTitle: "One Night Only",
    eyebrow: "21:30 · Frame 01",
    subtitle: "A studio gathering for new work, loud conversation, and the people behind the pictures.",
    venueName: "Framehouse 24",
    heroImageAlt: "Guests photographed in high-contrast monochrome at a studio opening",
    sections: [
      {
        type: "profile",
        title: "In frame",
        summary: "Direct portrait diptychs introduce the people behind the night.",
      },
      {
        type: "gallery",
        title: "Contact sequence",
        summary: "One lead image and crisp supporting cuts keep every photograph inspectable.",
      },
      {
        type: "rsvp",
        title: "You are on the list",
        summary: "The final frame resolves into a stable named guest-list entry.",
      },
    ],
  },
  accessibilityNotes: [
    "The theme never simulates a flash, strobe, flicker, or rapid alternating contrast.",
    "Condensed display and mono-like labels never replace readable body copy or form labels.",
    "Red is a structural cue only; attendance and validation always include text and semantic color.",
  ],
} satisfies ThemeDefinition;
