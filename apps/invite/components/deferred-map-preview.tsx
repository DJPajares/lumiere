"use client";

import type { ThemeDefinition } from "@lumiere/themes";
import { useEffect, useRef, useState } from "react";

type MapLoadState = "deferred" | "embedded" | "error";

export function DeferredMapPreview({
  address,
  allowInteraction,
  directionsUrl,
  embedUrl,
  presentation,
  venueName,
}: {
  address: string | undefined;
  allowInteraction: boolean;
  directionsUrl: string | undefined;
  embedUrl: string | undefined;
  presentation: ThemeDefinition["composition"]["map"];
  venueName: string;
}) {
  const frameRef = useRef<HTMLElement>(null);
  const [loadState, setLoadState] = useState<MapLoadState>("deferred");
  const aspectClassName = {
    landscape: "aspect-[4/3]",
    portrait: "aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]",
    wide: "aspect-[4/3] sm:aspect-[16/10]",
  }[presentation.aspect];
  const frameClassName = {
    celestial:
      "rounded-[var(--radius-lg)] border-[color-mix(in_srgb,var(--accent)_48%,var(--border))]",
    editorial: "rounded-none border-[var(--foreground)]",
    minimal: "rounded-none border-[var(--foreground)] shadow-none",
    organic:
      "rounded-[var(--radius-lg)] border-[color-mix(in_srgb,var(--accent)_32%,var(--border))]",
    playful: "rounded-[calc(var(--radius-lg)*1.35)] border-[var(--accent)]",
    seasonal:
      "rounded-[var(--radius-lg)] border-[color-mix(in_srgb,var(--accent)_42%,var(--border))]",
    soft: "rounded-[var(--radius-lg)] border-[var(--border)]",
  }[presentation.frame];
  const frameClasses = `lumiere-map-preview relative grid min-h-64 overflow-hidden border bg-[var(--surface-muted)] p-4 shadow-[0_18px_60px_color-mix(in_srgb,var(--accent)_10%,transparent)] ${aspectClassName} ${frameClassName}`;

  useEffect(() => {
    if (
      !embedUrl ||
      loadState !== "deferred" ||
      !frameRef.current ||
      typeof window.IntersectionObserver !== "function"
    ) {
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLoadState("embedded");
          observer.disconnect();
        }
      },
      {
        rootMargin: "320px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(frameRef.current);

    return () => observer.disconnect();
  }, [embedUrl, loadState]);

  if (!embedUrl) {
    return (
      <MapFallback
        address={address}
        aspectClassName={aspectClassName}
        directionsUrl={directionsUrl}
        frameClassName={frameClassName}
        presentation={presentation}
        state="fallback"
        venueName={venueName}
      />
    );
  }

  if (loadState !== "embedded") {
    return (
      <figure
        className={frameClasses}
        data-map-aspect={presentation.aspect}
        data-map-frame={presentation.frame}
        data-map-interaction={allowInteraction ? "interactive" : "preview-only"}
        data-map-load="viewport-or-action"
        data-map-overlay={presentation.overlay}
        data-map-state={loadState}
        ref={frameRef}
      >
        <MapFallbackCard
          address={address}
          directionsUrl={directionsUrl}
          loadLabel={loadState === "error" ? "Retry map preview" : "Load map preview"}
          onLoad={() => setLoadState("embedded")}
          status={
            loadState === "error"
              ? "The map preview could not load. Venue details and directions remain available."
              : "The map preview loads when this section approaches the screen."
          }
          venueName={venueName}
        />
      </figure>
    );
  }

  return (
    <figure
      className={frameClasses}
      data-map-aspect={presentation.aspect}
      data-map-frame={presentation.frame}
      data-map-interaction={allowInteraction ? "interactive" : "preview-only"}
      data-map-load="viewport-or-action"
      data-map-overlay={presentation.overlay}
      data-map-state="embedded"
      ref={frameRef}
    >
      <iframe
        className={
          allowInteraction
            ? "lumiere-map-embed absolute inset-0 size-full border-0"
            : "lumiere-map-embed pointer-events-none absolute -top-20 -left-12 h-[calc(100%+5rem)] w-[calc(100%+3rem)] select-none border-0"
        }
        loading="lazy"
        onError={() => setLoadState("error")}
        referrerPolicy="strict-origin-when-cross-origin"
        src={embedUrl}
        tabIndex={allowInteraction ? 0 : -1}
        title={`Map showing ${venueName}`}
      />
      {presentation.overlay !== "none" ? (
        <span
          aria-hidden="true"
          className={`lumiere-map-overlay pointer-events-none absolute inset-0 ${
            presentation.overlay === "soft-vignette"
              ? "bg-[radial-gradient(circle_at_center,transparent_48%,color-mix(in_srgb,var(--background)_38%,transparent))]"
              : "bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] mix-blend-multiply"
          }`}
        />
      ) : null}
      <figcaption className="lumiere-map-caption lumiere-type-caption absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-3 py-2 text-[var(--foreground)] shadow-sm backdrop-blur">
        <span className="lumiere-map-caption__venue lumiere-type-name">{venueName}</span>
        <a
          className="lumiere-map-caption__attribution lumiere-type-label underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          href="https://www.openstreetmap.org/copyright"
          rel="noopener noreferrer"
          target="_blank"
        >
          © OpenStreetMap contributors
        </a>
      </figcaption>
    </figure>
  );
}

function MapFallback({
  address,
  aspectClassName,
  directionsUrl,
  frameClassName,
  presentation,
  state,
  venueName,
}: {
  address: string | undefined;
  aspectClassName: string;
  directionsUrl: string | undefined;
  frameClassName: string;
  presentation: ThemeDefinition["composition"]["map"];
  state: "fallback";
  venueName: string;
}) {
  return (
    <div
      className={`lumiere-map-preview grid min-h-64 place-items-end overflow-hidden border bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-muted)_88%,transparent),color-mix(in_srgb,var(--accent)_18%,var(--surface)))] p-4 shadow-[0_18px_60px_color-mix(in_srgb,var(--accent)_10%,transparent)] ${aspectClassName} ${frameClassName}`}
      data-map-aspect={presentation.aspect}
      data-map-frame={presentation.frame}
      data-map-overlay={presentation.overlay}
      data-map-state={state}
    >
      <MapFallbackCard
        address={address}
        directionsUrl={directionsUrl}
        status={
          directionsUrl
            ? "Directions open in your preferred map experience."
            : "Map directions are not available yet."
        }
        venueName={venueName}
      />
    </div>
  );
}

function MapFallbackCard({
  address,
  directionsUrl,
  loadLabel,
  onLoad,
  status,
  venueName,
}: {
  address: string | undefined;
  directionsUrl: string | undefined;
  loadLabel?: string;
  onLoad?: () => void;
  status: string;
  venueName: string;
}) {
  return (
    <div className="lumiere-map-card w-full self-end rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <p className="lumiere-type-label text-[var(--accent-strong)]">Location</p>
      <p className="lumiere-type-name mt-2">{venueName}</p>
      <p className="lumiere-type-description mt-1 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
        {address ?? "Address to be announced."}
      </p>
      <p className="lumiere-type-caption mt-3 text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">
        {status}
      </p>
      {onLoad && loadLabel ? (
        <button
          className="lumiere-type-control mt-4 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          onClick={onLoad}
          type="button"
        >
          {loadLabel}
        </button>
      ) : null}
      {directionsUrl ? (
        <a className="sr-only" href={directionsUrl} rel="noopener noreferrer" target="_blank">
          Open directions for {venueName}
        </a>
      ) : null}
    </div>
  );
}
