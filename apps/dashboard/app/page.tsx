import { DashboardShell } from "../components/dashboard-shell";
import { ManagerOverviewWorkspace } from "../components/manager-overview-workspace";
import { ProtectedDashboard } from "../components/protected-dashboard";

export default function DashboardHome() {
  return (
    <ProtectedDashboard>
      <DashboardShell activePath="/" eyebrow="Across all managed events" title="Manager overview">
        <ManagerOverviewWorkspace />
      </DashboardShell>
    </ProtectedDashboard>
  );
}
