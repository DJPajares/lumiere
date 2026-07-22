"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { InviteImage } from "./invite-image";

export type AmbientAudioConfig = {
  art?: string;
  artist?: string;
  autoplay: boolean;
  label: string;
  lowDistraction: boolean;
  src: string;
  title: string;
};

type AudioStatus = "blocked" | "buffering" | "error" | "idle" | "paused" | "playing";
type AudioPreference = "paused" | "playing";

type AmbientAudioControlsProps = {
  audio?: AmbientAudioConfig;
  eventKey: string;
};

const playerIdleTimeout = 5_000;

export function AmbientAudioControls({ audio, eventKey }: AmbientAudioControlsProps) {
  const detailsId = useId();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const minimizeRef = useRef<HTMLButtonElement | null>(null);
  const openedWithKeyboardRef = useRef(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pointerIsDownRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [isReducedMotion, setIsReducedMotion] = useState<boolean | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [artFailed, setArtFailed] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const storageKey = useMemo(
    () => (audio ? createAudioPreferenceKey({ eventKey, src: audio.src }) : ""),
    [audio, eventKey],
  );

  const closePlayer = useCallback((restoreFocus = true) => {
    const shouldRestoreFocus =
      restoreFocus &&
      document.activeElement instanceof Node &&
      panelRef.current?.contains(document.activeElement);

    setIsExpanded(false);
    if (shouldRestoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  const scheduleAutoHide = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = window.setTimeout(function hideWhenIdle() {
      hideTimeoutRef.current = null;
      if (
        pointerIsDownRef.current ||
        (document.activeElement instanceof Node &&
          panelRef.current?.contains(document.activeElement))
      ) {
        hideTimeoutRef.current = window.setTimeout(hideWhenIdle, playerIdleTimeout);
        return;
      }

      closePlayer();
    }, playerIdleTimeout);
  }, [closePlayer]);

  useEffect(() => {
    if (!audio) {
      return;
    }

    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    if (!mediaQuery) {
      setIsReducedMotion(false);
      return;
    }

    const updateReducedMotion = () => setIsReducedMotion(mediaQuery.matches);

    updateReducedMotion();
    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => mediaQuery.removeEventListener("change", updateReducedMotion);
  }, [audio]);

  useEffect(() => {
    setStatus("idle");
    setCurrentTime(0);
    setDuration(0);
    setArtFailed(false);
  }, [audio?.art, audio?.src]);

  useEffect(() => {
    if (!audio || !audioRef.current || isReducedMotion === null) {
      return;
    }

    const savedPreference = readAudioPreference(storageKey);
    const shouldAttemptAutoplay =
      !audio.lowDistraction &&
      !isReducedMotion &&
      (savedPreference === "playing" || (!savedPreference && audio.autoplay));

    if (!shouldAttemptAutoplay) {
      setStatus(savedPreference === "paused" ? "paused" : "idle");
      return;
    }

    void playAudio({
      audioElement: audioRef.current,
      onBlocked: () => setStatus("blocked"),
      onError: () => setStatus("error"),
      onPlaying: () => {
        setStatus("playing");
        writeAudioPreference(storageKey, "playing");
      },
    });
  }, [audio, isReducedMotion, storageKey]);

  useEffect(() => {
    if (!isExpanded) {
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      return;
    }

    scheduleAutoHide();
    if (openedWithKeyboardRef.current) {
      openedWithKeyboardRef.current = false;
      window.requestAnimationFrame(() => minimizeRef.current?.focus());
    }
  }, [isExpanded, scheduleAutoHide]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const minimizeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        closePlayer(false);
      }
    };

    document.addEventListener("pointerdown", minimizeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", minimizeOnOutsidePress);
  }, [closePlayer, isExpanded]);

  useEffect(
    () => () => {
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    },
    [],
  );

  if (!audio) {
    return null;
  }

  const isPlaying = status === "playing" || status === "buffering";
  const isVisualizerActive = status === "playing";
  const canSeek = Number.isFinite(duration) && duration > 0 && status !== "error";
  const progress = canSeek ? Math.min((currentTime / duration) * 100, 100) : 0;
  const statusLabel = getAudioStatusLabel({
    isReducedMotion: Boolean(isReducedMotion),
    lowDistraction: audio.lowDistraction,
    status,
  });
  const positionStyle = {
    bottom: "max(1rem, env(safe-area-inset-bottom))",
    right: "max(1rem, env(safe-area-inset-right))",
  } as CSSProperties;

  const startPlayback = () => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    if (status === "error") {
      audioElement.load();
      setStatus("idle");
    }

    void playAudio({
      audioElement,
      onBlocked: () => setStatus("blocked"),
      onError: () => setStatus("error"),
      onPlaying: () => {
        setStatus("playing");
        writeAudioPreference(storageKey, "playing");
      },
    });
  };

  const togglePlayback = () => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    scheduleAutoHide();
    if (isPlaying) {
      audioElement.pause();
      setStatus("paused");
      writeAudioPreference(storageKey, "paused");
      return;
    }

    startPlayback();
  };

  const syncDuration = (audioElement: HTMLAudioElement) => {
    setDuration(Number.isFinite(audioElement.duration) ? audioElement.duration : 0);
  };

  const seekTo = (nextTime: number) => {
    const audioElement = audioRef.current;

    if (!audioElement || !Number.isFinite(nextTime)) {
      return;
    }

    audioElement.currentTime = nextTime;
    setCurrentTime(nextTime);
    scheduleAutoHide();
  };

  return (
    <div
      className="pointer-events-none fixed z-50 w-[min(20rem,calc(100vw-2rem))]"
      data-audio-expanded={isExpanded ? "true" : "false"}
      data-audio-placement="bottom-end"
      data-audio-status={status}
      data-low-distraction={audio.lowDistraction ? "true" : "false"}
      onBlurCapture={scheduleAutoHide}
      onFocusCapture={scheduleAutoHide}
      onKeyDown={(event) => {
        scheduleAutoHide();
        if (event.key === "Escape" && isExpanded) {
          closePlayer();
        }
      }}
      onPointerCancel={() => {
        pointerIsDownRef.current = false;
        scheduleAutoHide();
      }}
      onPointerDown={() => {
        pointerIsDownRef.current = true;
        scheduleAutoHide();
      }}
      onPointerMove={scheduleAutoHide}
      onPointerUp={() => {
        pointerIsDownRef.current = false;
        scheduleAutoHide();
      }}
      ref={rootRef}
      style={positionStyle}
    >
      <audio
        aria-hidden="true"
        loop
        onCanPlay={() => setStatus((current) => (current === "buffering" ? "playing" : current))}
        onDurationChange={(event) => syncDuration(event.currentTarget)}
        onEnded={() => {
          setCurrentTime(0);
          setStatus("playing");
        }}
        onError={() => setStatus("error")}
        onLoadedMetadata={(event) => syncDuration(event.currentTarget)}
        onPause={() =>
          setStatus((current) =>
            current === "playing" || current === "buffering" ? "paused" : current,
          )
        }
        onPlay={() => setStatus("playing")}
        onPlaying={() => setStatus("playing")}
        onSeeked={() => setStatus((current) => (current === "buffering" ? "playing" : current))}
        onSeeking={() => setStatus((current) => (current === "playing" ? "buffering" : current))}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onWaiting={() => setStatus((current) => (current === "playing" ? "buffering" : current))}
        preload="metadata"
        ref={audioRef}
        src={audio.src}
      />

      <div
        aria-labelledby={`${detailsId}-title`}
        aria-hidden={!isExpanded}
        className={`absolute bottom-0 right-0 max-h-[calc(100dvh-2rem)] w-full origin-bottom-right overflow-y-auto overscroll-contain rounded-[calc(var(--radius-lg)+0.35rem)] border border-[color-mix(in_srgb,var(--border)_64%,transparent)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] p-4 text-[var(--foreground)] shadow-[0_24px_72px_color-mix(in_srgb,var(--foreground)_16%,transparent)] backdrop-blur-2xl backdrop-saturate-150 transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none ${
          isExpanded
            ? "pointer-events-auto translate-y-0 opacity-100 duration-500"
            : "pointer-events-none translate-y-4 opacity-0 duration-200"
        }`}
        data-state={isExpanded ? "open" : "closed"}
        id={detailsId}
        inert={!isExpanded}
        ref={panelRef}
        role="region"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="lumiere-type-eyebrow flex min-w-0 items-center gap-2 text-[var(--accent-strong)]">
            <span aria-hidden="true" className="size-1 shrink-0 rotate-45 bg-current" />
            <span className="truncate">Now playing</span>
          </p>
          <button
            aria-label={`Minimize music player for ${audio.title}`}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-transparent text-[color-mix(in_srgb,var(--foreground)_68%,transparent)] transition-[background-color,border-color,transform] duration-200 hover:border-[color-mix(in_srgb,var(--border)_58%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface-muted)_68%,transparent)] hover:text-[var(--foreground)] active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] motion-reduce:transition-none"
            onClick={() => closePlayer()}
            ref={minimizeRef}
            type="button"
          >
            <MinimizeIcon />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-3">
          <div className="grid aspect-square overflow-hidden rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--border)_72%,transparent)] bg-[color-mix(in_srgb,var(--surface-muted)_72%,transparent)] p-0.5">
            {audio.art && !artFailed ? (
              <InviteImage
                alt=""
                className="size-full rounded-[calc(var(--radius-md)-0.15rem)] object-cover"
                height={68}
                loading="lazy"
                onError={() => setArtFailed(true)}
                sizes="4.25rem"
                src={audio.art}
                width={68}
              />
            ) : (
              <span
                aria-label="Album art unavailable"
                className="grid size-full place-items-center rounded-[calc(var(--radius-md)-0.15rem)] bg-[color-mix(in_srgb,var(--surface-muted)_78%,transparent)] text-[var(--accent-strong)]"
                role="img"
              >
                <MusicNoteIcon />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="lumiere-type-label truncate text-[var(--foreground)]" id={`${detailsId}-title`}>
              {audio.title}
            </p>
            <p className="lumiere-type-body mt-1 truncate text-[var(--accent-strong)]">
              {audio.artist ?? audio.label}
            </p>
            <span aria-live="polite" className="sr-only">
              {statusLabel}
            </span>
          </div>
        </div>

        <label className="mt-4 block" htmlFor={`${detailsId}-seek`}>
          <span className="sr-only">Seek through {audio.title}</span>
          <input
            aria-label={`Seek through ${audio.title}`}
            aria-valuetext={`${formatAudioTime(currentTime)} of ${canSeek ? formatAudioTime(duration) : "unknown"}`}
            className="lumiere-music-progress block h-5 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!canSeek}
            id={`${detailsId}-seek`}
            max={canSeek ? duration : 0}
            min="0"
            onChange={(event) => seekTo(Number(event.currentTarget.value))}
            step="0.1"
            style={{ "--music-progress": `${progress}%` } as CSSProperties}
            type="range"
            value={canSeek ? Math.min(currentTime, duration) : 0}
          />
          <span className="lumiere-type-caption mt-0.5 flex justify-between gap-3 tabular-nums text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
            <span>{formatAudioTime(currentTime)}</span>
            <span>{canSeek ? formatAudioTime(duration) : "—:—"}</span>
          </span>
        </label>

        <div className="mt-2 flex items-center justify-between gap-4">
          <AudioVisualizer active={isVisualizerActive} size="panel" />

          <div className="flex items-center gap-2.5">
            <button
              aria-label={`Forward 15 seconds in ${audio.title}`}
              className="grid size-12 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm transition-[filter,transform] hover:brightness-95 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
              disabled={!canSeek}
              onClick={() => seekTo(Math.min(currentTime + 15, duration))}
              type="button"
            >
              <Forward15Icon />
            </button>
            <button
              aria-label={`${status === "error" ? "Retry" : isPlaying ? "Pause" : "Play"} ${audio.title}`}
              className="grid size-12 place-items-center rounded-full border border-[color-mix(in_srgb,var(--accent)_58%,var(--border))] text-[var(--accent-strong)] transition-[background-color,transform] hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] motion-reduce:transition-none"
              onClick={togglePlayback}
              type="button"
            >
              <PlaybackIcon error={status === "error"} playing={isPlaying} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`flex justify-end transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none ${
          isExpanded
            ? "pointer-events-none translate-y-2 opacity-0 duration-150"
            : "pointer-events-auto translate-y-0 opacity-100 duration-300"
        }`}
        inert={isExpanded}
      >
        <button
          aria-controls={detailsId}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Close" : "Open"} music player for ${audio.title}. ${statusLabel}`}
          className="relative grid size-12 place-items-center rounded-full border border-[color-mix(in_srgb,var(--border)_58%,transparent)] bg-[color-mix(in_srgb,var(--surface)_44%,transparent)] text-[var(--foreground)] opacity-75 shadow-[0_12px_38px_color-mix(in_srgb,var(--foreground)_10%,transparent)] backdrop-blur-xl backdrop-saturate-150 transition-[opacity,transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_46%,var(--border))] hover:bg-[color-mix(in_srgb,var(--surface)_68%,transparent)] hover:opacity-100 active:translate-y-0 active:scale-[0.96] focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none"
          onClick={(event) => {
            openedWithKeyboardRef.current = event.detail === 0;
            setIsExpanded(true);
          }}
          ref={triggerRef}
          tabIndex={isExpanded ? -1 : 0}
          type="button"
        >
          {isPlaying ? (
            <AudioVisualizer active={isVisualizerActive} size="trigger" />
          ) : (
            <PlayIcon />
          )}
        </button>
      </div>
    </div>
  );
}

function AudioVisualizer({ active, size }: { active: boolean; size: "panel" | "trigger" }) {
  return (
    <span
      aria-hidden="true"
      className={`lumiere-music-visualizer flex items-end justify-center gap-1 text-[var(--accent)] ${
        size === "panel" ? "h-7 w-12" : "h-5 w-6"
      }`}
      data-active={active ? "true" : "false"}
    >
      <span className="h-[38%] w-0.5 rounded-full bg-current" />
      <span className="h-[78%] w-0.5 rounded-full bg-current" />
      <span className="h-full w-0.5 rounded-full bg-current" />
      <span className="h-[58%] w-0.5 rounded-full bg-current" />
      <span className="h-[32%] w-0.5 rounded-full bg-current" />
    </span>
  );
}

function PlaybackIcon({ error, playing }: { error: boolean; playing: boolean }) {
  if (error) {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M19 8a8 8 0 1 0 1 5M19 4v4h-4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (playing) {
    return (
      <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <rect height="12" rx="1" width="3" x="7" y="6" />
        <rect height="12" rx="1" width="3" x="14" y="6" />
      </svg>
    );
  }

  return <PlayIcon />;
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.5 6.8a1 1 0 0 1 1.53-.85l8 5.2a1 1 0 0 1 0 1.7l-8 5.2a1 1 0 0 1-1.53-.85V6.8Z" />
    </svg>
  );
}

function Forward15Icon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M6.1 8.1A7 7 0 1 1 5 14M6 4.75V8.5h3.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <text
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="6.5"
        fontWeight="700"
        textAnchor="middle"
        x="12"
        y="14.35"
      >
        15
      </text>
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m7 10 5 5 5-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MusicNoteIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M9 17.5V7l9-2v10.5M9 17.5c0 1.38-1.34 2.5-3 2.5s-3-1.12-3-2.5S4.34 15 6 15s3 1.12 3 2.5Zm9-2c0 1.38-1.34 2.5-3 2.5s-3-1.12-3-2.5 1.34-2.5 3-2.5 3 1.12 3 2.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

async function playAudio({
  audioElement,
  onBlocked,
  onError,
  onPlaying,
}: {
  audioElement: HTMLAudioElement;
  onBlocked: () => void;
  onError: () => void;
  onPlaying: () => void;
}) {
  try {
    await audioElement.play();
    onPlaying();
  } catch {
    if (audioElement.error) {
      onError();
      return;
    }

    onBlocked();
  }
}

function getAudioStatusLabel({
  isReducedMotion,
  lowDistraction,
  status,
}: {
  isReducedMotion: boolean;
  lowDistraction: boolean;
  status: AudioStatus;
}) {
  switch (status) {
    case "blocked":
      return "Tap to play";
    case "buffering":
      return "Buffering";
    case "error":
      return "Audio unavailable";
    case "paused":
      return "Paused";
    case "playing":
      return "Playing";
    default:
      return isReducedMotion || lowDistraction ? "Tap to begin" : "Ready to play";
  }
}

function formatAudioTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainder = wholeSeconds % 60;

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function createAudioPreferenceKey({ eventKey, src }: { eventKey: string; src: string }) {
  return `lumiere:ambient-audio:${eventKey}:${src}`;
}

function readAudioPreference(key: string): AudioPreference | null {
  try {
    const value = window.localStorage.getItem(key);

    return value === "playing" || value === "paused" ? value : null;
  } catch {
    return null;
  }
}

function writeAudioPreference(key: string, value: AudioPreference) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in private browsing; audio should still work.
  }
}
