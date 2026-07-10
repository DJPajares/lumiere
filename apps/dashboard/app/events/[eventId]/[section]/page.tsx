import { notFound } from "next/navigation";

import { getEventSectionDefinition } from "../../../../components/dashboard-navigation";
import { DashboardShell } from "../../../../components/dashboard-shell";
import { GuestManagementWorkspace } from "../../../../components/events/[eventId]/[section]/guest-management-workspace";
import { EventSettingsWorkspace } from "../../../../components/events/[eventId]/[section]/event-settings-workspace";
import { ResponsesActivityWorkspace } from "../../../../components/events/[eventId]/[section]/responses-activity-workspace";
import { SectionBuilderWorkspace } from "../../../../components/events/[eventId]/[section]/section-builder-workspace";
import { ThemeSelectorWorkspace } from "../../../../components/events/[eventId]/[section]/theme-selector-workspace";
import { ManagementPlaceholder } from "../../../../components/placeholder-panels";
import { ProtectedDashboard } from "../../../../components/protected-dashboard";

type EventSectionPageProps = {
  params: Promise<{
    eventId: string;
    section: string;
  }>;
};

export default async function EventSectionPage({ params }: EventSectionPageProps) {
  const { eventId, section } = await params;
  const tab = getEventSectionDefinition(section);

  if (!tab) {
    notFound();
  }

  return (
    <ProtectedDashboard>
      <DashboardShell
        activePath={`/events/${eventId}/${section}`}
        eyebrow="Event management"
        title={`${tab.label} setup`}
      >
        {section === "content" ? (
          <SectionBuilderWorkspace eventId={eventId} />
        ) : section === "activity" || section === "responses" ? (
          <ResponsesActivityWorkspace eventId={eventId} mode={section} />
        ) : section === "guests" ? (
          <GuestManagementWorkspace eventId={eventId} />
        ) : section === "theme" ? (
          <ThemeSelectorWorkspace eventId={eventId} />
        ) : section === "settings" ? (
          <EventSettingsWorkspace eventId={eventId} />
        ) : (
          <ManagementPlaceholder eventId={eventId} section={tab.label} />
        )}
      </DashboardShell>
    </ProtectedDashboard>
  );
}
