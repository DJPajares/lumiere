import { ApiClientError } from "@lumiere/api-client";
import type { Metadata } from "next";

import { PublicInvitation, PublicInvitationUnavailable } from "../../../components/public-invite";
import { createInviteApiClient } from "../../../lib/invite-api";

type PublicEventPageProps = {
  params: Promise<{
    eventSlug: string;
  }>;
};

export async function generateMetadata({ params }: PublicEventPageProps): Promise<Metadata> {
  const { eventSlug } = await params;
  const result = await loadPublicEvent(eventSlug);

  if (result.status === "ready") {
    return {
      title: `${result.invite.event.title} | Lumiere Invite`,
      description: `Public invitation for ${result.invite.event.title}.`,
    };
  }

  return {
    title: `${eventSlug} | Lumiere Invite`,
    description: "Public invitation without guest-only RSVP details.",
  };
}

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { eventSlug } = await params;
  const result = await loadPublicEvent(eventSlug);

  if (result.status === "ready") {
    return <PublicInvitation invite={result.invite} />;
  }

  return <PublicInvitationUnavailable eventSlug={eventSlug} message={result.message} />;
}

async function loadPublicEvent(eventSlug: string) {
  try {
    const invite = await createInviteApiClient().getPublicEvent(eventSlug);

    return {
      invite,
      status: "ready" as const,
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return {
        message: "This invitation was not found, is not published, or is no longer available.",
        status: "unavailable" as const,
      };
    }

    return {
      message: "This invitation is temporarily unavailable. Please try again later.",
      status: "error" as const,
    };
  }
}
