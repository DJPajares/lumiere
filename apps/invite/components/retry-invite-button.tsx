"use client";

export function RetryInviteButton({ className }: { className: string }) {
  return (
    <button className={className} onClick={() => window.location.reload()} type="button">
      Try again
    </button>
  );
}
