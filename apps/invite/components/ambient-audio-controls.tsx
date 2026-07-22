"use client";

import type { CSSProperties } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export type AmbientAudioConfig = {
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
  placement: "end" | "start";
};

export const ambientAudioLayoutEvent = "lumiere:ambient-audio-layout";

export function AmbientAudioControls({ audio, eventKey, placement }: AmbientAudioControlsProps) {
  const detailsId = useId();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [isReducedMotion, setIsReducedMotion] = useState<boolean | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const storageKey = useMemo(
    () => (audio ? createAudioPreferenceKey({ eventKey, src: audio.src }) : ""),
    [audio, eventKey],
  );

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
    setIsMuted(false);
  }, [audio?.src]);

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
    window.dispatchEvent(
      new CustomEvent(ambientAudioLayoutEvent, { detail: { expanded: isExpanded } }),
    );

    return () => {
      if (isExpanded) {
        window.dispatchEvent(
          new CustomEvent(ambientAudioLayoutEvent, { detail: { expanded: false } }),
        );
      }
    };
  }, [isExpanded]);

  if (!audio) {
    return null;
  }

  const isPlaying = status === "playing" || status === "buffering";
  const canSeek = Number.isFinite(duration) && duration > 0 && status !== "error";
  const statusLabel = getAudioStatusLabel({
    isReducedMotion: Boolean(isReducedMotion),
    lowDistraction: audio.lowDistraction,
    status,
  });
  const positionStyle = {
    [placement === "start" ? "left" : "right"]:
      placement === "start"
        ? "max(1rem, env(safe-area-inset-left))"
        : "max(1rem, env(safe-area-inset-right))",
    top: "max(1rem, env(safe-area-inset-top))",
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

  return (
    <div
      className="fixed z-50 max-w-[calc(100vw-2rem)]"
      data-audio-expanded={isExpanded ? "true" : "false"}
      data-audio-placement={placement}
      data-audio-status={status}
      data-low-distraction={audio.lowDistraction ? "true" : "false"}
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
        className={`overflow-hidden rounded-[calc(var(--radius-lg)+0.25rem)] border border-[color-mix(in_srgb,var(--border)_68%,transparent)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] text-[var(--foreground)] shadow-[0_18px_54px_color-mix(in_srgb,var(--accent)_18%,transparent)] backdrop-blur-xl backdrop-saturate-150 transition-[width] motion-reduce:transition-none ${
          isExpanded ? "w-[min(20rem,calc(100vw-2rem))]" : "w-[min(17rem,calc(100vw-2rem))]"
        }`}
      >
        <div className="grid min-h-14 grid-cols-[2.75rem_minmax(0,1fr)_2.5rem] items-center gap-2 p-1.5">
          <button
            aria-label={`${status === "error" ? "Retry" : isPlaying ? "Pause" : "Play"} ${audio.title}`}
            className="grid size-11 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm transition-[transform,filter] hover:brightness-95 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] motion-reduce:transition-none"
            onClick={togglePlayback}
            type="button"
          >
            <PlaybackIcon error={status === "error"} playing={isPlaying} />
          </button>

          <div className="min-w-0 py-1">
            <p className="lumiere-type-label truncate text-[var(--accent-strong)]">{audio.title}</p>
            <p
              aria-live="polite"
              className="lumiere-type-caption mt-0.5 truncate text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]"
            >
              {audio.label} · {statusLabel}
            </p>
          </div>

          <button
            aria-controls={detailsId}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Hide" : "Show"} playback details for ${audio.title}`}
            className="grid size-10 place-items-center rounded-full text-[var(--foreground)] transition-[background-color,transform] hover:bg-[var(--surface-muted)] active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] motion-reduce:transition-none"
            onClick={() => setIsExpanded((current) => !current)}
            type="button"
          >
            <svg
              aria-hidden="true"
              className={`size-4 transition-transform motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="m7 9.5 5 5 5-5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        </div>

        <div
          aria-hidden={!isExpanded}
          className={`grid transition-[grid-template-rows,opacity] motion-reduce:transition-none ${
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
          id={detailsId}
          inert={!isExpanded}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="grid gap-3 border-t border-[color-mix(in_srgb,var(--border)_55%,transparent)] px-3.5 pb-3.5 pt-3">
              <label className="grid gap-1.5" htmlFor={`${detailsId}-seek`}>
                <span className="sr-only">Seek through {audio.title}</span>
                <input
                  aria-label={`Seek through ${audio.title}`}
                  className="h-5 w-full cursor-pointer accent-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!canSeek}
                  id={`${detailsId}-seek`}
                  max={canSeek ? duration : 0}
                  min="0"
                  onChange={(event) => {
                    const audioElement = audioRef.current;
                    const nextTime = Number(event.currentTarget.value);

                    if (!audioElement || !Number.isFinite(nextTime)) {
                      return;
                    }

                    audioElement.currentTime = nextTime;
                    setCurrentTime(nextTime);
                  }}
                  step="0.1"
                  type="range"
                  value={canSeek ? Math.min(currentTime, duration) : 0}
                />
                <span className="lumiere-type-numeric flex justify-between text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">
                  <span>{formatAudioTime(currentTime)}</span>
                  <span>{canSeek ? formatAudioTime(duration) : "—:—"}</span>
                </span>
              </label>

              <div className="flex items-center justify-between gap-3">
                <span className="lumiere-type-caption text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">
                  Streamed from the host
                </span>
                <button
                  aria-label={`${isMuted ? "Unmute" : "Mute"} ${audio.title}`}
                  aria-pressed={isMuted}
                  className="lumiere-type-control min-h-10 rounded-full border border-[color-mix(in_srgb,var(--border)_70%,transparent)] px-3 text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] motion-reduce:transition-none"
                  onClick={() => {
                    const audioElement = audioRef.current;

                    if (!audioElement) {
                      return;
                    }

                    audioElement.muted = !audioElement.muted;
                    setIsMuted(audioElement.muted);
                  }}
                  type="button"
                >
                  {isMuted ? "Unmute" : "Mute"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

  return (
    <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.5 6.8a1 1 0 0 1 1.53-.85l8 5.2a1 1 0 0 1 0 1.7l-8 5.2a1 1 0 0 1-1.53-.85V6.8Z" />
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
