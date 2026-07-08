import { DashboardShell } from "../../components/dashboard-shell";
import { EventDetailPlaceholder } from "../../components/placeholder-panels";

type EventPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;

  return (
    <DashboardShell
      activePath={`/events/${eventId}`}
      eyebrow="Event overview"
      title="Demo event workspace"
    >
      <EventDetailPlaceholder eventId={eventId} />
    </DashboardShell>
  );
}
