"use client";

import type { CSSProperties, FocusEvent, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";

import { ambientAudioLayoutEvent } from "./ambient-audio-controls";

export type InviteSectionNavigationItem = {
  id: string;
  label: string;
};

type InviteSectionNavigatorProps = {
  hasAmbientAudio: boolean;
  items: InviteSectionNavigationItem[];
  placement: "end" | "start";
};

export function InviteSectionNavigator({
  hasAmbientAudio,
  items,
  placement,
}: InviteSectionNavigatorProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const suppressNextFocusOpenRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [audioExpanded, setAudioExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!hasAmbientAudio) {
      setAudioExpanded(false);
      return;
    }

    const syncAudioLayout = (event: Event) => {
      setAudioExpanded(
        event instanceof CustomEvent &&
          typeof event.detail === "object" &&
          event.detail !== null &&
          event.detail.expanded === true,
      );
    };

    window.addEventListener(ambientAudioLayoutEvent, syncAudioLayout);
    return () => window.removeEventListener(ambientAudioLayoutEvent, syncAudioLayout);
  }, [hasAmbientAudio]);

  useEffect(() => {
    if (items.length < 2 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const targets = items.flatMap((item) => {
      const target = document.getElementById(item.id);

      return target ? [target] : [];
    });
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top),
          )[0];

        if (current?.target.id) {
          setActiveId(current.target.id);
        }
      },
      {
        rootMargin: "-18% 0px -68% 0px",
        threshold: [0, 0.25, 0.6],
      },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const dismissWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      suppressNextFocusOpenRef.current = true;
      setIsOpen(false);
      triggerRef.current?.focus();
      queueMicrotask(() => {
        suppressNextFocusOpenRef.current = false;
      });
    };

    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissWithEscape);

    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissWithEscape);
    };
  }, [isOpen]);

  if (items.length < 2) {
    return null;
  }

  const positionStyle = {
    [placement === "start" ? "left" : "right"]:
      placement === "start"
        ? "max(1rem, env(safe-area-inset-left))"
        : "max(1rem, env(safe-area-inset-right))",
    top: hasAmbientAudio
      ? audioExpanded
        ? "max(14rem, calc(env(safe-area-inset-top) + 13rem))"
        : "max(5rem, calc(env(safe-area-inset-top) + 4rem))"
      : "max(1rem, env(safe-area-inset-top))",
  } as CSSProperties;

  const closeAfterFocusLeaves = (event: FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsOpen(false);
  };

  const closeAfterPointerLeaves = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || rootRef.current?.contains(document.activeElement)) {
      return;
    }

    setIsOpen(false);
  };

  const selectSection = (id: string) => {
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    setActiveId(id);
    setIsOpen(false);
  };

  const activeIndex = Math.max(
    items.findIndex((item) => item.id === activeId),
    0,
  );
  const panelPlacementClass = placement === "start" ? "left-0" : "right-0";

  return (
    <div
      className="fixed z-40 w-12"
      data-section-navigator="true"
      data-section-navigator-open={isOpen ? "true" : "false"}
      data-section-navigator-placement={placement}
      onBlurCapture={closeAfterFocusLeaves}
      onFocusCapture={() => {
        if (!suppressNextFocusOpenRef.current) {
          setIsOpen(true);
        }
      }}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") {
          setIsOpen(true);
        }
      }}
      onPointerLeave={closeAfterPointerLeaves}
      ref={rootRef}
      style={positionStyle}
    >
      <button
        aria-controls={listId}
        aria-expanded={isOpen}
        aria-label={`${isOpen ? "Close" : "Open"} invitation sections`}
        className="relative grid size-12 place-items-center rounded-full border border-[color-mix(in_srgb,var(--border)_58%,transparent)] bg-[color-mix(in_srgb,var(--surface)_44%,transparent)] text-[var(--foreground)] opacity-75 shadow-[0_12px_38px_color-mix(in_srgb,var(--foreground)_10%,transparent)] backdrop-blur-xl backdrop-saturate-150 transition-[opacity,transform,background-color,border-color,box-shadow] duration-200 hover:border-[color-mix(in_srgb,var(--accent)_46%,var(--border))] hover:bg-[color-mix(in_srgb,var(--surface)_68%,transparent)] hover:opacity-100 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] data-[state=open]:border-[color-mix(in_srgb,var(--accent)_54%,var(--border))] data-[state=open]:bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] data-[state=open]:opacity-100 motion-reduce:transition-none"
        data-section-navigator-trigger="true"
        data-state={isOpen ? "open" : "closed"}
        onClick={() => setIsOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
          <circle cx="4.5" cy="6" fill="currentColor" r="1" />
          <circle cx="4.5" cy="12" fill="currentColor" r="1" />
          <circle cx="4.5" cy="18" fill="currentColor" r="1" />
          <path
            d="M8 6h11M8 12h8M8 18h11"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
      </button>

      <span
        aria-hidden="true"
        className={`absolute top-full h-3 w-[min(20rem,calc(100vw-2rem))] ${panelPlacementClass} ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        data-section-navigator-hover-bridge="true"
      />

      <nav
        aria-hidden={!isOpen}
        aria-label="Invitation sections"
        className={`absolute top-[calc(100%+0.75rem)] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[calc(var(--radius-lg)+0.25rem)] border border-[color-mix(in_srgb,var(--border)_58%,transparent)] bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] shadow-[0_24px_72px_color-mix(in_srgb,var(--foreground)_14%,transparent)] backdrop-blur-2xl backdrop-saturate-150 transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none ${panelPlacementClass} ${
          isOpen
            ? "translate-y-0 opacity-100 duration-300"
            : "pointer-events-none translate-y-1.5 opacity-0 duration-200"
        }`}
        data-section-navigator-panel="true"
        id={listId}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[color-mix(in_srgb,var(--border)_52%,transparent)] px-4 py-3.5">
          <div className="min-w-0">
            <p className="lumiere-type-eyebrow truncate text-[var(--accent-strong)]">
              Invitation guide
            </p>
            <p className="lumiere-type-caption mt-1 text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">
              Explore {items.length} sections
            </p>
          </div>
          <span
            aria-hidden="true"
            className="lumiere-type-numeric shrink-0 text-[color-mix(in_srgb,var(--foreground)_54%,transparent)]"
          >
            {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
        </div>

        <ol className="grid max-h-[min(68dvh,30rem)] gap-1 overflow-y-auto overscroll-contain p-2">
          {items.map((item, index) => {
            const isCurrent = item.id === activeId;

            return (
              <li key={item.id}>
                <button
                  aria-current={isCurrent ? "location" : undefined}
                  className={`lumiere-type-control group grid min-h-12 w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[var(--radius-md)] border px-2.5 py-2.5 text-left text-[var(--foreground)] transition-[background-color,border-color,transform] duration-200 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus)] motion-reduce:transition-none ${
                    isCurrent
                      ? "border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
                      : "border-transparent hover:border-[color-mix(in_srgb,var(--border)_56%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface-muted)_64%,transparent)] hover:translate-x-0.5"
                  }`}
                  data-section-target={item.id}
                  onClick={() => selectSection(item.id)}
                  tabIndex={isOpen ? 0 : -1}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className={`lumiere-type-caption tabular-nums ${
                      isCurrent
                        ? "text-[var(--accent-strong)]"
                        : "text-[color-mix(in_srgb,var(--foreground)_42%,transparent)]"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate" data-section-label="true">
                    {item.label}
                  </span>
                  {isCurrent ? (
                    <span className="lumiere-type-caption rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] px-2 py-1 text-[var(--accent-strong)]">
                      Now
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="pr-1 text-[color-mix(in_srgb,var(--foreground)_42%,transparent)] opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                    >
                      →
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
