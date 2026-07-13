import type { ThemeMotionProfile } from "@lumiere/themes";

export type InviteMotionIntensity = "high" | "low" | "none";

export type InviteMotionPreset = {
  intersectionThreshold: number;
  maxMotionBlur: number;
  parallaxDistance: number;
  parallaxScale: number;
  revealDistance: number;
  revealDuration: number;
};

export const inviteMotionPresets = {
  none: {
    intersectionThreshold: 0,
    maxMotionBlur: 0,
    parallaxDistance: 0,
    parallaxScale: 0,
    revealDistance: 0,
    revealDuration: 0,
  },
  low: {
    intersectionThreshold: 0.08,
    maxMotionBlur: 0,
    parallaxDistance: 0,
    parallaxScale: 0,
    revealDistance: 10,
    revealDuration: 560,
  },
  high: {
    intersectionThreshold: 0.12,
    maxMotionBlur: 3.2,
    parallaxDistance: 88,
    parallaxScale: 0.075,
    revealDistance: 42,
    revealDuration: 880,
  },
} satisfies Record<InviteMotionIntensity, InviteMotionPreset>;

const profileIntensity = {
  calm: "low",
  immersive: "high",
  playful: "high",
  seasonal: "high",
} satisfies Record<ThemeMotionProfile, InviteMotionIntensity>;

export function resolveInviteMotionIntensity(
  profile: ThemeMotionProfile,
  prefersReducedMotion = false,
): InviteMotionIntensity {
  return prefersReducedMotion ? "none" : profileIntensity[profile];
}

export function calculateScrollProgress(
  elementTop: number,
  elementHeight: number,
  viewportHeight: number,
) {
  const travel = viewportHeight + elementHeight;

  if (travel <= 0) {
    return 0;
  }

  return clamp((viewportHeight - elementTop) / travel, 0, 1);
}

export function calculateMotionBlur(
  scrollDelta: number,
  frameDuration: number,
  maximumBlur: number,
) {
  if (maximumBlur <= 0) {
    return 0;
  }

  const velocity = Math.abs(scrollDelta) / Math.max(frameDuration, 16);

  return clamp(velocity * 3.2, 0, maximumBlur);
}

export function resolveInviteMotionDriver(
  intensity: InviteMotionIntensity,
): "css" | "none" | "raf" {
  if (intensity === "none") {
    return "none";
  }

  return "raf";
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
