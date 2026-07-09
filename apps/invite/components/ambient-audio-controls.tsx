"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type AmbientAudioConfig = {
  autoplay: boolean;
  label: string;
  lowDistraction: boolean;
  src: string;
  title: string;
};

type AudioStatus = "blocked" | "error" | "idle" | "paused" | "playing";
type AudioPreference = "paused" | "playing";

type AmbientAudioControlsProps = {
  audio?: AmbientAudioConfig;
  context: "guest" | "public";
  themeId: string;
};

export function AmbientAudioControls({ audio, context, themeId }: AmbientAudioControlsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const storageKey = useMemo(
    () => (audio ? createAudioPreferenceKey({ context, src: audio.src, themeId }) : ""),
    [audio, context, themeId],
  );

  useEffect(() => {
    if (!audio) {
      return;
    }

    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    if (!mediaQuery) {
      return;
    }

    const updateReducedMotion = () => setIsReducedMotion(mediaQuery.matches);

    updateReducedMotion();
    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => mediaQuery.removeEventListener("change", updateReducedMotion);
  }, [audio]);

  useEffect(() => {
    if (!audio || !audioRef.current) {
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

  if (!audio) {
    return null;
  }

  const isPlaying = status === "playing";
  const statusLabel = getAudioStatusLabel({
    isReducedMotion,
    lowDistraction: audio.lowDistraction,
    status,
  });

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

  return (
    <div
      className="fixed right-4 top-4 z-50 max-w-[calc(100vw-2rem)] rounded-full border border-[color-mix(in_srgb,var(--border)_82%,transparent)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] p-1 shadow-[0_16px_48px_color-mix(in_srgb,var(--accent)_18%,transparent)] backdrop-blur"
      data-audio-status={status}
      data-low-distraction={audio.lowDistraction ? "true" : "false"}
    >
      <audio
        aria-hidden="true"
        loop
        onError={() => {
          setStatus("error");
          console.info("Lumiere ambient audio could not be loaded.");
        }}
        onPause={() => setStatus((current) => (current === "playing" ? "paused" : current))}
        onPlay={() => setStatus("playing")}
        preload="metadata"
        ref={audioRef}
        src={audio.src}
      />
      <button
        aria-label={`${isPlaying ? "Pause" : "Play"} ${audio.title}`}
        className="grid min-h-12 grid-cols-[2.25rem_1fr] items-center gap-2 rounded-full px-2.5 py-1.5 text-left text-sm text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
        onClick={togglePlayback}
        type="button"
      >
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full bg-[var(--accent)] text-white shadow-sm"
        >
          {isPlaying ? "II" : "Play"}
        </span>
        <span className="min-w-0 pr-2">
          <span className="block truncate text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
            {audio.label}
          </span>
          <span className="block truncate text-xs text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
            {statusLabel}
          </span>
        </span>
      </button>
    </div>
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
      console.info("Lumiere ambient audio playback failed.");
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
  if (isReducedMotion || lowDistraction) {
    return "Tap to begin";
  }

  switch (status) {
    case "blocked":
      return "Tap to play";
    case "error":
      return "Audio unavailable";
    case "paused":
      return "Paused";
    case "playing":
      return "Playing";
    default:
      return "Ambient music";
  }
}

function createAudioPreferenceKey({
  context,
  src,
  themeId,
}: {
  context: string;
  src: string;
  themeId: string;
}) {
  return `lumiere:ambient-audio:${context}:${themeId}:${src}`;
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
