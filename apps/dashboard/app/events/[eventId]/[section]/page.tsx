import { notFound } from "next/navigation";

import { DashboardShell, eventTabs } from "../../../components/dashboard-shell";
import { ManagementPlaceholder } from "../../../components/placeholder-panels";
import { ProtectedDashboard } from "../../../components/protected-dashboard";
import { GuestManagementWorkspace } from "./guest-management-workspace";
import { ResponsesActivityWorkspace } from "./responses-activity-workspace";
import { SectionBuilderWorkspace } from "./section-builder-workspace";
import { ThemeSelectorWorkspace } from "./theme-selector-workspace";

type EventSectionPageProps = {
  params: Promise<{
    eventId: string;
    section: string;
  }>;
};

export default async function EventSectionPage({ params }: EventSectionPageProps) {
  const { eventId, section } = await params;
  const tab = eventTabs.find((item) => item.href === section);

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
        ) : (
          <ManagementPlaceholder eventId={eventId} section={tab.label} />
        )}
      </DashboardShell>
    </ProtectedDashboard>
  );
}
