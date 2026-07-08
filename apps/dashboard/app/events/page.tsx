import { DashboardShell } from "../components/dashboard-shell";
import { EventListPlaceholder } from "../components/placeholder-panels";

export default function EventsPage() {
  return (
    <DashboardShell activePath="/events" title="Events">
      <EventListPlaceholder />
    </DashboardShell>
  );
}
