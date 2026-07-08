import type { Metadata } from "next";

import { GuestInvitePlaceholder } from "../../../../components/placeholder-invite";

type GuestEventPageProps = {
  params: Promise<{
    eventSlug: string;
    guestToken: string;
  }>;
};

export async function generateMetadata({ params }: GuestEventPageProps): Promise<Metadata> {
  const { eventSlug } = await params;

  return {
    title: `${eventSlug} RSVP | Lumiere Invite`,
    description: "Personalized invitation preview with guest RSVP context.",
  };
}

export default async function GuestEventPage({ params }: GuestEventPageProps) {
  const { eventSlug, guestToken } = await params;

  return <GuestInvitePlaceholder eventSlug={eventSlug} guestToken={guestToken} />;
}
