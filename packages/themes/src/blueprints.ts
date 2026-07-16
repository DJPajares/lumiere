import type {
  Event,
  EventSectionMutationInput,
  EventStatus,
  EventType,
  SectionType,
  SectionVisibility,
} from "@lumiere/types";

import { sectionDefinitions, type SectionDefinition } from "./sections";

export type SectionBlueprintRequirement = "optional" | "recommended" | "required";

export type EventSectionBlueprint = {
  allowDisableWhenPublished: boolean;
  createDefaultContent: (event: EventBlueprintContext) => Record<string, unknown>;
  createDefaultSettings: () => Record<string, unknown>;
  defaultEnabled: boolean;
  defaultLabel: string;
  defaultVisibility: SectionVisibility;
  requirement: SectionBlueprintRequirement;
  sectionKey: string;
  sectionType: SectionType;
};

export type EventSectionBlueprintDefinition = EventSectionBlueprint & {
  contentSchema: SectionDefinition["contentSchema"];
  rendererKey: SectionDefinition["rendererKey"];
  settingsSchema: SectionDefinition["settingsSchema"];
  validationRules: string[];
};

export type EventTypeBlueprint = {
  description: string;
  eventType: EventType;
  label: string;
  sections: EventSectionBlueprint[];
};

export type EventBlueprintContext = Pick<
  Event,
  "endsAt" | "eventType" | "startsAt" | "timezone" | "title" | "venueAddress" | "venueName"
>;

export type EventTypeSectionValidationIssue = {
  message: string;
  path: (number | string)[];
};

const requiredSection = (
  sectionType: SectionType,
  options: Partial<EventSectionBlueprint> = {},
): EventSectionBlueprint =>
  sectionBlueprint(sectionType, {
    requirement: "required",
    ...options,
  });

const recommendedSection = (
  sectionType: SectionType,
  options: Partial<EventSectionBlueprint> = {},
): EventSectionBlueprint =>
  sectionBlueprint(sectionType, {
    requirement: "recommended",
    ...options,
  });

const optionalSection = (
  sectionType: SectionType,
  options: Partial<EventSectionBlueprint> = {},
): EventSectionBlueprint =>
  sectionBlueprint(sectionType, {
    requirement: "optional",
    ...options,
  });

function sectionBlueprint(
  sectionType: SectionType,
  options: Partial<EventSectionBlueprint> & {
    requirement: SectionBlueprintRequirement;
  },
): EventSectionBlueprint {
  const definition = sectionDefinitions[sectionType];

  return {
    allowDisableWhenPublished: options.allowDisableWhenPublished ?? false,
    createDefaultContent:
      options.createDefaultContent ??
      ((event) => ({
        eyebrow: definition.label,
        ...defaultContent(sectionType, event),
      })),
    createDefaultSettings: options.createDefaultSettings ?? (() => defaultSettings(sectionType)),
    defaultEnabled: options.defaultEnabled ?? false,
    defaultLabel: options.defaultLabel ?? definition.label,
    defaultVisibility: options.defaultVisibility ?? definition.defaultVisibility,
    requirement: options.requirement,
    sectionKey: options.sectionKey ?? sectionType.replaceAll("_", "-"),
    sectionType,
  };
}

export const eventTypeBlueprints = {
  wedding: {
    description: "Formal invitation rhythm for ceremonies, receptions, entourages, and RSVP.",
    eventType: "wedding",
    label: "Wedding",
    sections: [
      requiredSection("introduction"),
      requiredSection("date"),
      requiredSection("location"),
      requiredSection("rsvp"),
      recommendedSection("profile", {
        defaultLabel: "Couple profile",
        sectionKey: "hosts",
      }),
      recommendedSection("story"),
      recommendedSection("dress_code"),
      recommendedSection("gallery"),
      recommendedSection("outro"),
      optionalSection("entourage"),
      optionalSection("details"),
      optionalSection("custom"),
    ],
  },
  birthday: {
    description: "Celebratory birthday flow focused on details, images, location, and RSVP.",
    eventType: "birthday",
    label: "Birthday",
    sections: [
      requiredSection("introduction"),
      requiredSection("date"),
      requiredSection("location"),
      requiredSection("rsvp"),
      recommendedSection("details"),
      recommendedSection("gallery"),
      recommendedSection("outro"),
      optionalSection("profile"),
      optionalSection("story"),
      optionalSection("dress_code"),
      optionalSection("custom"),
    ],
  },
  kids_party: {
    description: "Parent-friendly party flow with schedule notes, location, gallery, and RSVP.",
    eventType: "kids_party",
    label: "Kids party",
    sections: [
      requiredSection("introduction"),
      requiredSection("date"),
      requiredSection("location"),
      requiredSection("rsvp"),
      recommendedSection("details"),
      recommendedSection("gallery"),
      recommendedSection("outro"),
      optionalSection("dress_code"),
      optionalSection("custom"),
    ],
  },
  holiday: {
    description: "Seasonal gathering flow with dress guidance, shared details, and RSVP.",
    eventType: "holiday",
    label: "Holiday gathering",
    sections: [
      requiredSection("introduction"),
      requiredSection("date"),
      requiredSection("location"),
      requiredSection("rsvp"),
      recommendedSection("details"),
      recommendedSection("dress_code"),
      recommendedSection("gallery"),
      recommendedSection("outro"),
      optionalSection("story"),
      optionalSection("custom"),
    ],
  },
  dinner: {
    description: "Intimate dinner flow with schedule, attire, venue, and guest reply.",
    eventType: "dinner",
    label: "Dinner",
    sections: [
      requiredSection("introduction"),
      requiredSection("date"),
      requiredSection("location"),
      requiredSection("rsvp"),
      recommendedSection("details"),
      recommendedSection("dress_code"),
      recommendedSection("outro"),
      optionalSection("gallery"),
      optionalSection("profile"),
      optionalSection("story"),
      optionalSection("custom"),
    ],
  },
  launch: {
    description: "Launch event flow with feature details, venue, RSVP, and brand-ready imagery.",
    eventType: "launch",
    label: "Launch",
    sections: [
      requiredSection("introduction"),
      requiredSection("date"),
      requiredSection("details"),
      requiredSection("location"),
      requiredSection("rsvp"),
      recommendedSection("gallery"),
      recommendedSection("outro"),
      optionalSection("profile"),
      optionalSection("story"),
      optionalSection("dress_code"),
      optionalSection("custom"),
    ],
  },
  private_event: {
    description: "Flexible private-event flow for hosts who need a concise complete invite.",
    eventType: "private_event",
    label: "Private event",
    sections: genericCelebrationSections(),
  },
  other: {
    description: "Generic celebration flow for future extensible event kinds.",
    eventType: "other",
    label: "Generic celebration",
    sections: genericCelebrationSections(),
  },
} satisfies Record<EventType, EventTypeBlueprint>;

export const eventTypeBlueprintList = Object.values(eventTypeBlueprints);

export function getEventTypeBlueprint(eventType: EventType): EventTypeBlueprint {
  return eventTypeBlueprints[eventType] ?? eventTypeBlueprints.other;
}

export function getSectionBlueprint(
  eventType: EventType,
  sectionType: SectionType,
): EventSectionBlueprintDefinition | undefined {
  const blueprint = getEventTypeBlueprint(eventType).sections.find(
    (section) => section.sectionType === sectionType,
  );

  return blueprint ? toSectionBlueprintDefinition(blueprint) : undefined;
}

export function getBlueprintSectionsForEventType(
  eventType: EventType,
): EventSectionBlueprintDefinition[] {
  return getEventTypeBlueprint(eventType).sections.map(toSectionBlueprintDefinition);
}

export function getBlueprintSectionOrder(
  eventType: EventType,
  supportedSections: SectionType[],
): SectionType[] {
  const supported = new Set(supportedSections);

  return getEventTypeBlueprint(eventType)
    .sections.map((section) => section.sectionType)
    .filter((sectionType) => supported.has(sectionType));
}

export function getBlueprintSectionRequirement(
  eventType: EventType,
  sectionType: SectionType,
): SectionBlueprintRequirement {
  return getSectionBlueprint(eventType, sectionType)?.requirement ?? "optional";
}

export function canDisableBlueprintSection({
  eventStatus,
  eventType,
  sectionType,
}: {
  eventStatus: EventStatus;
  eventType: EventType;
  sectionType: SectionType;
}) {
  const section = getSectionBlueprint(eventType, sectionType);

  if (!section || section.requirement !== "required") {
    return true;
  }

  return eventStatus === "draft" || section.allowDisableWhenPublished;
}

export function validateEventTypeSections({
  eventStatus,
  eventType,
  sections,
}: {
  eventStatus: EventStatus;
  eventType: EventType;
  sections: EventSectionMutationInput[];
}): EventTypeSectionValidationIssue[] {
  const blueprint = getEventTypeBlueprint(eventType);
  const blueprintByType = new Map(
    blueprint.sections.map((section) => [section.sectionType, section] as const),
  );
  const enabledTypes = new Set(
    sections.filter((section) => section.enabled !== false).map((section) => section.sectionType),
  );
  const issues: EventTypeSectionValidationIssue[] = [];

  sections.forEach((section, index) => {
    if (!blueprintByType.has(section.sectionType)) {
      issues.push({
        message: `${sectionDefinitions[section.sectionType].label} is not supported for ${blueprint.label} events`,
        path: ["sections", index, "sectionType"],
      });
    }
  });

  if (eventStatus !== "draft") {
    for (const section of blueprint.sections) {
      if (
        section.requirement === "required" &&
        !section.allowDisableWhenPublished &&
        !enabledTypes.has(section.sectionType)
      ) {
        issues.push({
          message: `${section.defaultLabel} is required before publishing ${blueprint.label} events`,
          path: ["sections"],
        });
      }
    }
  }

  return issues;
}

function toSectionBlueprintDefinition(
  blueprint: EventSectionBlueprint,
): EventSectionBlueprintDefinition {
  const definition = sectionDefinitions[blueprint.sectionType];

  return {
    ...blueprint,
    contentSchema: definition.contentSchema,
    rendererKey: definition.rendererKey,
    settingsSchema: definition.settingsSchema,
    validationRules: [
      `${definition.label} content must pass the ${definition.rendererKey} content schema.`,
      `${definition.label} settings must pass the ${definition.rendererKey} settings schema.`,
      definition.requiresGuestContext
        ? `${definition.label} requires guest context and must not be public.`
        : `${definition.label} can be public, guest-only, hidden, or disabled according to the event blueprint.`,
    ],
  };
}

function genericCelebrationSections() {
  return [
    requiredSection("introduction"),
    requiredSection("date"),
    requiredSection("location"),
    requiredSection("rsvp"),
    recommendedSection("details"),
    recommendedSection("outro"),
    optionalSection("gallery"),
    optionalSection("story"),
    optionalSection("profile"),
    optionalSection("dress_code"),
    optionalSection("custom"),
  ];
}

function defaultContent(sectionType: SectionType, event: EventBlueprintContext) {
  if (sectionType === "date") {
    return {
      startsAt: event.startsAt,
      timezone: event.timezone,
      title: "Date and time",
      ...(event.endsAt ? { endsAt: event.endsAt } : {}),
    };
  }

  if (sectionType === "details") {
    return {
      items: [
        {
          label: "Schedule",
          value: "Add the key timing or guest notes here.",
        },
      ],
      title: "Details",
    };
  }

  if (sectionType === "dress_code") {
    return {
      description: "Add attire guidance for your guests.",
      cards: [
        {
          label: "For women",
          title: "Formal attire",
          description: "Choose an elegant look suited to the celebration.",
        },
        {
          label: "For men",
          title: "Coat and tie",
          description: "A polished suit with dress shoes is recommended.",
        },
        {
          label: "Style note",
          title: "Refined and festive",
          description: "Use the palette as inspiration and avoid overly casual pieces.",
        },
      ],
      palette: [],
      paletteDescription: "Use these colors as inspiration for your celebration look.",
      paletteTitle: "A festive celebration palette",
      title: "Dress code",
    };
  }

  if (sectionType === "entourage") {
    return {
      groups: [
        {
          label: "Wedding party",
          names: ["Add names"],
        },
      ],
      title: "Entourage",
    };
  }

  if (sectionType === "introduction") {
    return {
      eyebrow: "You're invited",
      title: event.title,
    };
  }

  if (sectionType === "location") {
    return {
      address: event.venueAddress || "Address to be announced",
      venueName: event.venueName || "Venue to be announced",
    };
  }

  if (sectionType === "outro") {
    return {
      message: "We hope to celebrate with you.",
      title: "With love",
    };
  }

  if (sectionType === "profile") {
    return {
      people: [
        {
          name: "Host",
          role: "Host",
        },
      ],
      title: "Hosts",
    };
  }

  if (sectionType === "rsvp") {
    return {
      description: "Let us know if you can make it.",
      title: "RSVP",
    };
  }

  if (sectionType === "story") {
    return {
      paragraphs: [{ body: "Share a short note about this celebration." }],
      title: "Our story",
    };
  }

  if (sectionType === "custom") {
    return {
      blocks: [
        {
          body: "Add a custom note for guests.",
        },
      ],
      title: "More information",
    };
  }

  return {
    images: [],
    title: "Gallery",
  };
}

function defaultSettings(sectionType: SectionType) {
  if (sectionType === "date") {
    return {
      showCountdown: true,
    };
  }

  if (sectionType === "introduction") {
    return {
      density: "spacious",
      introAnimation: {
        enabled: true,
      },
      layout: "editorial",
    };
  }

  if (sectionType === "gallery") {
    return {
      density: "balanced",
      layout: "grid",
    };
  }

  if (sectionType === "story") {
    return {
      density: "balanced",
      layout: "editorial",
    };
  }

  return {};
}
