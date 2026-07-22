import { ApiClientError } from "@lumiere/api-client";
import type { Metadata } from "next";

import {
  InviteAccessView,
  type GuestInviteAccessState,
} from "../../../../../components/invite-access-state";
import { GuestInvitation } from "../../../../../components/public-invite";
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
    title: "Private invitation unavailable",
    description: "Private RSVP invitation link.",
    openGraph: {
      description: "Private RSVP invitation link.",
      siteName: "Lumiere Invite",
      title: "Private invitation unavailable",
      type: "website",
    },
    robots: getGuestInviteRobots(),
  };
}

export default async function GuestEventPage({ params }: GuestEventPageProps) {
  const { eventSlug, guestToken } = await params;
  const result = await loadGuestInvite(eventSlug, guestToken);

  if (result.status === "ready") {
    return <GuestInvitation guestToken={guestToken} invite={result.invite} />;
  }

  return <InviteAccessView context="guest" state={result.state} />;
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
      if (error.apiError.error.code === "INVITE_EXPIRED") {
        return {
          state: "guest-expired" as const satisfies GuestInviteAccessState,
          status: "unavailable" as const,
        };
      }

      if (error.status === 404) {
        return {
          state: "guest-invalid" as const satisfies GuestInviteAccessState,
          status: "unavailable" as const,
        };
      }

      if (error.status === 403) {
        const apiMessage = error.apiError.error.message.toLowerCase();
        const state: GuestInviteAccessState = apiMessage.includes("expired")
          ? "guest-expired"
          : apiMessage.includes("rsvp")
            ? "guest-rsvp-closed"
            : "guest-disabled";

        return {
          state,
          status: "unavailable" as const,
        };
      }
    }

    return {
      state: "service-error" as const satisfies GuestInviteAccessState,
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
