import type { GuestDataExportDownload } from "@lumiere/api-client";
import type { Event, GuestInviteShareChannel } from "@lumiere/types";

export type InviteShareMethod = "email" | "native" | "whatsapp";

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

export function createGuestInviteShareContent(event: Event, inviteLink: string) {
  const subject = `You’re invited to ${event.title}`;

  return {
    text: `${subject}. RSVP using your private invitation link: ${inviteLink}`,
    title: subject,
    url: inviteLink,
  } satisfies ShareData;
}

export function createGuestInviteEmailUrl(shareContent: ShareData) {
  return `mailto:?subject=${encodeURIComponent(shareContent.title ?? "Invitation")}&body=${encodeURIComponent(shareContent.text ?? "")}`;
}

export function createGuestInviteWhatsAppUrl(shareContent: ShareData) {
  return `https://wa.me/?text=${encodeURIComponent(shareContent.text ?? shareContent.url ?? "")}`;
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
