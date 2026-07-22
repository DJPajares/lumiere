import Image from "next/image";
import { cn } from "@lumiere/dashboard-ui/lib/utils";

type DashboardBrandLockupProps = {
  className?: string;
  compact?: boolean;
};

export function DashboardBrandLockup({ className, compact = false }: DashboardBrandLockupProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        alt=""
        aria-hidden="true"
        className={cn("object-contain", compact ? "size-8" : "size-10")}
        height={compact ? 32 : 40}
        sizes={compact ? "32px" : "40px"}
        src="/logo.png"
        width={compact ? 32 : 40}
      />
      <span>Lumiere Dashboard</span>
    </span>
  );
}
