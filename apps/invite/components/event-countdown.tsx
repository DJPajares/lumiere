"use client";

import { useEffect, useState } from "react";

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  status: "active" | "elapsed";
};

const countdownUnits = [
  ["days", "Days"],
  ["hours", "Hours"],
  ["minutes", "Minutes"],
  ["seconds", "Seconds"],
] as const;

export function EventCountdown({ label, startsAt }: { label?: string; startsAt: string }) {
  const [countdown, setCountdown] = useState<CountdownState | null>(null);
  const targetTime = Date.parse(startsAt);

  useEffect(() => {
    if (!Number.isFinite(targetTime)) {
      return;
    }

    const initialCountdown = getCountdownState(targetTime, Date.now());

    setCountdown(initialCountdown);

    if (initialCountdown.status === "elapsed") {
      return;
    }

    const interval = window.setInterval(() => {
      const nextCountdown = getCountdownState(targetTime, Date.now());

      setCountdown(nextCountdown);
      if (nextCountdown.status === "elapsed") {
        window.clearInterval(interval);
      }
    }, 1_000);

    return () => window.clearInterval(interval);
  }, [targetTime]);

  if (!Number.isFinite(targetTime)) {
    return null;
  }

  const heading = label ?? "Until the occasion";
  const accessibleStatus = countdown
    ? countdown.status === "elapsed"
      ? "The occasion has arrived."
      : `${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, and ${countdown.seconds} seconds remaining.`
    : "Countdown loading.";

  return (
    <section
      aria-label={heading}
      className="lumiere-countdown grid gap-4 sm:col-span-2"
      data-countdown-state={countdown?.status ?? "loading"}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="lumiere-countdown__label text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          {heading}
        </p>
        <time
          className="text-xs text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]"
          dateTime={startsAt}
        >
          {countdown?.status === "elapsed" ? "The occasion has arrived" : "Counting down"}
        </time>
      </div>

      <div
        aria-label={accessibleStatus}
        className="lumiere-countdown__grid grid grid-cols-2 gap-2 sm:grid-cols-4"
        role="timer"
      >
        {countdownUnits.map(([key, unitLabel]) => (
          <div
            className="lumiere-countdown__unit grid min-h-24 content-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-4 text-center shadow-[0_12px_36px_color-mix(in_srgb,var(--accent)_8%,transparent)]"
            data-countdown-unit={key}
            key={key}
          >
            <strong className="lumiere-countdown__value lumiere-display text-3xl font-semibold leading-none tabular-nums sm:text-4xl">
              {countdown ? String(countdown[key]).padStart(2, "0") : "—"}
            </strong>
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">
              {unitLabel}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function getCountdownState(targetTime: number, currentTime: number): CountdownState {
  const remainingSeconds = Math.max(0, Math.floor((targetTime - currentTime) / 1_000));

  return {
    days: Math.floor(remainingSeconds / 86_400),
    hours: Math.floor((remainingSeconds % 86_400) / 3_600),
    minutes: Math.floor((remainingSeconds % 3_600) / 60),
    seconds: remainingSeconds % 60,
    status: remainingSeconds > 0 ? "active" : "elapsed",
  };
}
