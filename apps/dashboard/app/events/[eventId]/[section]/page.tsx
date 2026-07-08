import { notFound } from "next/navigation";

import { DashboardShell, eventTabs } from "../../../components/dashboard-shell";
import { ManagementPlaceholder } from "../../../components/placeholder-panels";

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
    <DashboardShell
      activePath={`/events/${eventId}/${section}`}
      eyebrow="Event management"
      title={`${tab.label} setup`}
    >
      <ManagementPlaceholder eventId={eventId} section={tab.label} />
    </DashboardShell>
  );
}
