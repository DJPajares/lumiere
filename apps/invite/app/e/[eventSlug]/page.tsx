import { ApiClientError } from "@lumiere/api-client";
import type { PublicEventSummary } from "@lumiere/types";
import type { Metadata } from "next";

import { PublicInvitation, PublicInvitationUnavailable } from "../../../components/public-invite";
import { createInviteApiClient } from "../../../lib/invite-api";

export const dynamic = "force-dynamic";

type PublicEventPageProps = {
  params: Promise<{
    eventSlug: string;
  }>;
  searchParams?: Promise<{
    accessCode?: string;
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PublicEventPageProps): Promise<Metadata> {
  const { eventSlug } = await params;
  const accessCode = (await searchParams)?.accessCode;
  const result = await loadPublicEvent(eventSlug, accessCode);

  if (result.status === "ready") {
    const title = result.invite.event.title;
    const description = buildPublicInviteDescription(result.invite.event);

    return {
      title,
      description,
      openGraph: {
        description,
        siteName: "Lumiere Invite",
        title,
        type: "website",
      },
      robots: getPublicInviteRobots(),
    };
  }

  return {
    title: eventSlug,
    description: "Public invitation without guest-only RSVP details.",
    robots: getPublicInviteRobots(),
  };
}

export default async function PublicEventPage({ params, searchParams }: PublicEventPageProps) {
  const { eventSlug } = await params;
  const accessCode = (await searchParams)?.accessCode;
  const result = await loadPublicEvent(eventSlug, accessCode);

  if (result.status === "ready") {
    return <PublicInvitation invite={result.invite} />;
  }

  return <PublicInvitationUnavailable eventSlug={eventSlug} message={result.message} />;
}

async function loadPublicEvent(eventSlug: string, accessCode?: string) {
  try {
    const invite = await createInviteApiClient().getPublicEvent(eventSlug, accessCode);

    return {
      invite,
      status: "ready" as const,
    };
  } catch (error) {
    if (error instanceof ApiClientError && (error.status === 403 || error.status === 404)) {
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

function buildPublicInviteDescription(event: PublicEventSummary) {
  const venue = event.venueName ? ` at ${event.venueName}` : "";
  const date = formatMetadataDate(event.startsAt, event.timezone);

  return `Invitation for ${event.title}${venue}${date ? ` on ${date}` : ""}.`;
}

function getPublicInviteRobots(): Metadata["robots"] {
  return {
    follow: false,
    index: false,
  };
}

function formatMetadataDate(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "long",
      timeZone: timezone,
    }).format(new Date(value));
  } catch {
    return undefined;
  }
}
