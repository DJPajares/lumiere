import type { Metadata } from "next";

import { PublicInvitePlaceholder } from "../../components/placeholder-invite";

type PublicEventPageProps = {
  params: Promise<{
    eventSlug: string;
  }>;
};

export async function generateMetadata({ params }: PublicEventPageProps): Promise<Metadata> {
  const { eventSlug } = await params;

  return {
    title: `${eventSlug} | Lumiere Invite`,
    description: "Public invitation preview without guest-only RSVP details.",
  };
}

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { eventSlug } = await params;

  return <PublicInvitePlaceholder eventSlug={eventSlug} />;
}
