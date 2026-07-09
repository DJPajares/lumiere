type DashboardBrandLockupProps = {
  className?: string;
};

export function DashboardBrandLockup({ className = "" }: DashboardBrandLockupProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        alt=""
        aria-hidden="true"
        className="size-10 object-contain"
        height={40}
        src="/logo.png"
        width={40}
      />
      <span>Lumiere Dashboard</span>
    </span>
  );
}
