import { DashboardShell } from "../../components/dashboard-shell";
import { EventsWorkspace } from "../../components/events/events-workspace";
import { ProtectedDashboard } from "../../components/protected-dashboard";

export default function EventsPage() {
  return (
    <ProtectedDashboard>
      <DashboardShell activePath="/events" title="Events">
        <EventsWorkspace />
      </DashboardShell>
    </ProtectedDashboard>
  );
}
