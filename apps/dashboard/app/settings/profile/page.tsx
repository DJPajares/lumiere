import { DashboardShell } from "../../../components/dashboard-shell";
import { ProfileSettingsWorkspace } from "../../../components/account/profile-settings-workspace";
import { ProtectedDashboard } from "../../../components/protected-dashboard";

export default function ProfileSettingsPage() {
  return (
    <ProtectedDashboard>
      <DashboardShell activePath="/settings/profile" eyebrow="Manager account" title="Edit profile">
        <ProfileSettingsWorkspace />
      </DashboardShell>
    </ProtectedDashboard>
  );
}
