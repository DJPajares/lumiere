import type { Metadata } from "next";

import { DashboardUiShowcase } from "../../components/ui-showcase";

export const metadata: Metadata = {
  title: "Dashboard UI showcase",
};

export default function DashboardUiShowcasePage() {
  return <DashboardUiShowcase />;
}
