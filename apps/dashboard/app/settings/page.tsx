import { AccountSettingsWorkspace } from "../../components/account/account-settings-workspace";
import { DashboardShell } from "../../components/dashboard-shell";
import { ProtectedDashboard } from "../../components/protected-dashboard";

export default function AccountSettingsPage() {
  return (
    <ProtectedDashboard>
      <DashboardShell activePath="/settings" eyebrow="Manager account" title="Account settings">
        <AccountSettingsWorkspace />
      </DashboardShell>
    </ProtectedDashboard>
  );
}
