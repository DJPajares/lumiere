import type { GuestDataExportDownload } from "@lumiere/api-client";
import type { Event, GuestGroup, GuestInviteShareChannel } from "@lumiere/types";

export type InviteShareMethod = "email" | "messenger" | "native" | "whatsapp";

export const shareChannelOptions: Array<{
  label: string;
  value: GuestInviteShareChannel | "unspecified";
}> = [
  { label: "Not specified", value: "unspecified" },
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Messenger", value: "messenger" },
  { label: "Other", value: "other" },
];

/** The name a share message greets the group by — its label is always present. */
function guestGroupGreetingName(group: GuestGroup) {
  return group.label;
}

export function createGuestInviteShareContent(event: Event, group: GuestGroup, inviteLink: string) {
  const subject = `You’re invited to ${event.title}`;

  return {
    text: `Hi ${guestGroupGreetingName(group)}, you’re invited to ${event.title}! RSVP using your private invitation link: ${inviteLink}`,
    title: subject,
    url: inviteLink,
  } satisfies ShareData;
}

export function createGuestInviteNativeShareContent(event: Event, group: GuestGroup, inviteLink: string) {
  return {
    text: `Hi ${guestGroupGreetingName(group)}, you’re invited to ${event.title}! RSVP using your private invitation link: ${inviteLink}`,
  } satisfies ShareData;
}

export function createGuestInviteEmailUrl(shareContent: ShareData) {
  return `mailto:?subject=${encodeURIComponent(shareContent.title ?? "Invitation")}&body=${encodeURIComponent(shareContent.text ?? "")}`;
}

export function createGuestInviteWhatsAppUrl(shareContent: ShareData) {
  return `https://wa.me/?text=${encodeURIComponent(shareContent.text ?? shareContent.url ?? "")}`;
}

/**
 * Messenger's web share endpoint accepts a link and an optional quote parameter.
 * We include the message text as a quote so the personalized greeting appears
 * alongside the link preview.
 */
export function createGuestInviteMessengerUrl(shareContent: ShareData) {
  const params = new URLSearchParams();
  params.set("link", shareContent.url ?? "");
  if (shareContent.text) {
    params.set("quote", shareContent.text);
  }
  return `https://www.messenger.com/t/?${params.toString()}`;
}

export function describeShareMethod(method: Exclude<InviteShareMethod, "native">) {
  if (method === "email") return "email";
  return method === "messenger" ? "Messenger" : "WhatsApp";
}

export function isShareCancellation(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function triggerBrowserDownload({ blob, filename }: GuestDataExportDownload) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
