import { DashboardShell } from "../components/dashboard-shell";
import { EventListPlaceholder } from "../components/placeholder-panels";
import { ProtectedDashboard } from "../components/protected-dashboard";

export default function EventsPage() {
  return (
    <ProtectedDashboard>
      <DashboardShell activePath="/events" title="Events">
        <EventListPlaceholder />
      </DashboardShell>
    </ProtectedDashboard>
  );
}
