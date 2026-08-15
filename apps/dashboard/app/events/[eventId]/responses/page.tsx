import { redirect } from "next/navigation";

type ResponsesRedirectPageProps = {
  params: Promise<{ eventId: string }>;
};

/**
 * RSVP responses moved into the Guests workspace. This static segment takes routing
 * precedence over [section], so bookmarks and already-delivered notifications that
 * still point at /responses land on Guests instead of a 404.
 */
export default async function ResponsesRedirectPage({ params }: ResponsesRedirectPageProps) {
  const { eventId } = await params;

  redirect(`/events/${encodeURIComponent(eventId)}/guests`);
}
