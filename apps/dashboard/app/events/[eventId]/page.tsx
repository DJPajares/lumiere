import { DashboardShell } from "../../../components/dashboard-shell";
import { EventOverviewWorkspace } from "../../../components/events/[eventId]/event-overview-workspace";
import { ProtectedDashboard } from "../../../components/protected-dashboard";

type EventPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;

  return (
    <ProtectedDashboard>
      <DashboardShell
        activePath={`/events/${eventId}`}
        eyebrow="Event overview"
        title="Event workspace"
      >
        <EventOverviewWorkspace eventId={eventId} />
      </DashboardShell>
    </ProtectedDashboard>
  );
}
