import { DashboardShell } from "../components/dashboard-shell";
import { ProtectedDashboard } from "../components/protected-dashboard";
import { EventsWorkspace } from "./events-workspace";

export default function EventsPage() {
  return (
    <ProtectedDashboard>
      <DashboardShell activePath="/events" title="Events">
        <EventsWorkspace />
      </DashboardShell>
    </ProtectedDashboard>
  );
}
