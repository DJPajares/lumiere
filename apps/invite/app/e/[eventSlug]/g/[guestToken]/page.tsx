import { ApiClientError } from "@lumiere/api-client";
import type { Metadata } from "next";

import {
  GuestInvitation,
  GuestInvitationUnavailable,
} from "../../../../../components/public-invite";
import { createInviteApiClient } from "../../../../../lib/invite-api";

export const dynamic = "force-dynamic";

type GuestEventPageProps = {
  params: Promise<{
    eventSlug: string;
    guestToken: string;
  }>;
};

export async function generateMetadata({ params }: GuestEventPageProps): Promise<Metadata> {
  const { eventSlug, guestToken } = await params;
  const result = await loadGuestInvite(eventSlug, guestToken);

  if (result.status === "ready") {
    const title = `${result.invite.event.title} RSVP`;
    const description = `Invitation details for ${result.invite.event.title}. RSVP access stays private to each guest link.`;

    return {
      title,
      description,
      openGraph: {
        description,
        siteName: "Lumiere Invite",
        title,
        type: "website",
      },
      robots: getGuestInviteRobots(),
    };
  }

  return {
    title: `${eventSlug} RSVP`,
    description: "Private RSVP invitation link.",
    robots: getGuestInviteRobots(),
  };
}

export default async function GuestEventPage({ params }: GuestEventPageProps) {
  const { eventSlug, guestToken } = await params;
  const result = await loadGuestInvite(eventSlug, guestToken);

  if (result.status === "ready") {
    return <GuestInvitation guestToken={guestToken} invite={result.invite} />;
  }

  return <GuestInvitationUnavailable eventSlug={eventSlug} message={result.message} />;
}

async function loadGuestInvite(eventSlug: string, guestToken: string) {
  try {
    const invite = await createInviteApiClient().getPublicGuestInvite(eventSlug, guestToken);

    return {
      invite,
      status: "ready" as const,
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (error.status === 404) {
        return {
          message: "This guest invite link is invalid, expired, or no longer available.",
          status: "unavailable" as const,
        };
      }

      if (error.status === 403) {
        const apiMessage = error.apiError.error.message.toLowerCase();
        const message = apiMessage.includes("rsvp")
          ? "RSVP is closed for this event. You can still contact the host for help."
          : "This guest invite is disabled. Ask the host for a fresh link.";

        return {
          message,
          status: "unavailable" as const,
        };
      }
    }

    return {
      message: "This guest invite is temporarily unavailable. Please try again later.",
      status: "error" as const,
    };
  }
}

function getGuestInviteRobots(): Metadata["robots"] {
  return {
    follow: false,
    index: false,
  };
}
