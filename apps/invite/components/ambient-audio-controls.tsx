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
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pointerIsDownRef = useRef(false);
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

  const closePlayer = useCallback(() => {
    const shouldRestoreFocus =
      document.activeElement instanceof Node && panelRef.current?.contains(document.activeElement);

    setIsExpanded(false);
    if (shouldRestoreFocus) {
      queueMicrotask(() => triggerRef.current?.focus());
    }
  }, []);

  const scheduleAutoHide = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = window.setTimeout(function hideWhenIdle() {
      hideTimeoutRef.current = null;
      if (pointerIsDownRef.current) {
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
  }, [isExpanded, scheduleAutoHide]);

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
      className="fixed z-50 max-w-[calc(100vw-2rem)]"
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
        aria-hidden={!isExpanded}
        className={`absolute bottom-[4.5rem] right-0 w-[min(20rem,calc(100vw-2rem))] origin-bottom-right rounded-[calc(var(--radius-lg)+0.35rem)] border border-[color-mix(in_srgb,var(--accent)_42%,transparent)] bg-[color-mix(in_srgb,#100e0c_92%,var(--accent))] p-4 text-[#f5f1e8] shadow-[0_22px_64px_color-mix(in_srgb,#080706_68%,transparent)] backdrop-blur-xl transition-[opacity,transform] duration-300 motion-reduce:transition-none ${
          isExpanded
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-[0.97] opacity-0"
        }`}
        id={detailsId}
        inert={!isExpanded}
        ref={panelRef}
      >
        <p className="lumiere-type-eyebrow flex items-center gap-2 text-[var(--accent)]">
          <span aria-hidden="true" className="size-1 rotate-45 bg-current" />
          Now playing
        </p>

        <div className="mt-4 grid grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-3">
          <div className="grid aspect-square overflow-hidden rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,#f5f1e8_8%,transparent)] p-0.5">
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
                className="grid size-full place-items-center rounded-[calc(var(--radius-md)-0.15rem)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]"
                role="img"
              >
                <MusicNoteIcon />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="lumiere-type-label truncate text-[#f5f1e8]">{audio.title}</p>
            <p className="lumiere-type-body mt-1 truncate italic text-[var(--accent)]">
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
        </label>

        <div className="mt-3 flex items-center justify-between gap-4">
          <AudioVisualizer active={isVisualizerActive} size="panel" />

          <div className="flex items-center gap-2.5">
            <button
              aria-label={`Forward 15 seconds in ${audio.title}`}
              className="grid size-12 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm transition-[filter,transform] hover:brightness-95 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#100e0c] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
              disabled={!canSeek}
              onClick={() => seekTo(Math.min(currentTime + 15, duration))}
              type="button"
            >
              <ForwardIcon />
            </button>
            <button
              aria-label={`${status === "error" ? "Retry" : isPlaying ? "Pause" : "Play"} ${audio.title}`}
              className="grid size-12 place-items-center rounded-full border border-[color-mix(in_srgb,var(--accent)_58%,transparent)] text-[var(--accent)] transition-[background-color,transform] hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#100e0c] motion-reduce:transition-none"
              onClick={togglePlayback}
              type="button"
            >
              <PlaybackIcon error={status === "error"} playing={isPlaying} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          aria-controls={detailsId}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Close" : "Open"} music player for ${audio.title}. ${statusLabel}`}
          className="grid size-14 place-items-center rounded-full border border-[color-mix(in_srgb,var(--accent)_52%,transparent)] bg-[color-mix(in_srgb,#100e0c_92%,var(--accent))] text-[var(--accent)] shadow-[0_14px_38px_color-mix(in_srgb,#080706_54%,transparent)] backdrop-blur-xl transition-[background-color,filter,transform] hover:brightness-110 active:scale-[0.95] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none"
          onClick={() => {
            if (isExpanded) {
              closePlayer();
              return;
            }

            setIsExpanded(true);
          }}
          ref={triggerRef}
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

function ForwardIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.25 7.1a.8.8 0 0 1 1.23-.67l6.4 4.22a.8.8 0 0 1 0 1.34l-6.4 4.22a.8.8 0 0 1-1.23-.67V7.1Z" />
      <rect height="10" rx="1" width="2" x="15.75" y="7" />
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
