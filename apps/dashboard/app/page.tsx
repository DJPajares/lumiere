import { DashboardShell, AuthRequiredPlaceholder } from "./components/dashboard-shell";
import { EventListPlaceholder } from "./components/placeholder-panels";

export default function DashboardHome() {
  return (
    <DashboardShell activePath="/events" title="Calm controls for event setup.">
      <AuthRequiredPlaceholder />
      <EventListPlaceholder />
    </DashboardShell>
  );
}
