import { DashboardShell } from "../components/dashboard-shell";
import { EventListPlaceholder } from "../components/placeholder-panels";
import { ProtectedDashboard } from "../components/protected-dashboard";

export default function DashboardHome() {
  return (
    <ProtectedDashboard>
      <DashboardShell activePath="/events" title="Calm controls for event setup.">
        <EventListPlaceholder />
      </DashboardShell>
    </ProtectedDashboard>
  );
}
