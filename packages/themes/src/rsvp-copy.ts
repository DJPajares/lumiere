import type {
  ThemeDefinition,
  ThemeRsvpCopy,
  ThemeRsvpCopyOverrides,
  ThemeRsvpManagerCopy,
} from "./contracts";

export const defaultRsvpCopy = {
  acceptLabel: "I'll be there",
  attendancePrompt: "Will you join us?",
  countPrompt: "Who's coming?",
  declineLabel: "Can't make it",
  detailsAnswersOrNoteLabel: "Add answers or a note",
  detailsCloseLabel: "Close",
  detailsLabel: "Add names or a note",
  detailsNamesAndAnswersLabel: "Add guest names and answers",
  detailsNamesLabel: "Add guest names",
  detailsNoteLabel: "Add a note",
  detailsOpenLabel: "Open",
  detailsQuestionsLabel: "Answer guest questions",
  eyebrow: "Your reply",
  greetingPrefix: "Hi",
  guestLabelPlural: "Guests",
  guestLabelSingular: "Guest",
  guestLinkRequired: "RSVP details unlock from a valid guest invite link.",
  guestNameLabel: "Guest",
  guestNamesLabel: "Names for the guest list",
  messageLabel: "Message for the host",
  messagePlaceholder: "Optional",
  questionGroupDescription: "Required questions apply when your group is attending.",
  questionGroupTitle: "RSVP questions prepared by the host",
  reservedSeatsIntro: "We've saved",
  sectionDescription:
    "Review your guest details now. The RSVP form will open here when responses are enabled.",
  sectionTitle: "RSVP",
  submitLabel: "Confirm attendance",
  submittingLabel: "Sending RSVP...",
  successDescription: "Your reply is with the host.",
  successTitle: "RSVP received",
  updateLabel: "Update RSVP",
  updateNotice:
    "You already sent a reply. Changes here will update the host's copy when you submit again.",
  updatingLabel: "Updating RSVP...",
} satisfies ThemeRsvpCopy;

export const editorialRsvpCopyOverrides = {
  attendancePrompt: "Will you celebrate with us?",
  countPrompt: "Who's joining you?",
  submittingLabel: "Sending reply...",
  successTitle: "Reply received",
  updateLabel: "Update attendance",
  updatingLabel: "Updating attendance...",
} satisfies ThemeRsvpCopyOverrides;

export const playfulRsvpCopyOverrides = {
  acceptLabel: "We're coming",
  attendancePrompt: "Can you join the party?",
  countPrompt: "How many party guests?",
  declineLabel: "Can't come",
  eyebrow: "Your party reply",
  messageLabel: "Anything the host should know?",
  submittingLabel: "Sending reply...",
  successTitle: "Reply sent",
  updateLabel: "Update reply",
  updatingLabel: "Updating reply...",
} satisfies ThemeRsvpCopyOverrides;

export const seasonalRsvpCopyOverrides = {
  acceptLabel: "We'll be there",
  attendancePrompt: "Will you gather with us?",
  countPrompt: "Who's joining?",
  declineLabel: "Warm regrets",
  eyebrow: "Your holiday reply",
  messageLabel: "A note for the host",
  submittingLabel: "Sending reply...",
  successTitle: "Reply received",
  updateLabel: "Update reply",
  updatingLabel: "Updating reply...",
} satisfies ThemeRsvpCopyOverrides;

export function resolveThemeRsvpCopy(
  theme: Pick<ThemeDefinition, "id" | "rsvpCopy"> | null | undefined,
  managerCopy: ThemeRsvpManagerCopy = {},
): ThemeRsvpCopy {
  // Manager-authored section copy is schema-validated before rendering and wins over
  // partial theme voice; blank or missing values safely fall back to shared defaults.
  return {
    ...defaultRsvpCopy,
    ...compactCopy(theme?.rsvpCopy),
    ...compactCopy(managerCopy),
  };
}

function compactCopy(copy: ThemeRsvpCopyOverrides | undefined) {
  return Object.fromEntries(
    Object.entries(copy ?? {}).filter((entry): entry is [string, string] => {
      const value = entry[1];
      return typeof value === "string" && value.trim().length > 0;
    }),
  ) as ThemeRsvpCopyOverrides;
}
