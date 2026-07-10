import type { ThemeMotionProfile } from "@lumiere/themes";

export type InviteMotionIntensity = "none" | "low" | "premium";

export type InviteMotionPreset = {
  intersectionThreshold: number;
  parallaxDistance: number;
  parallaxScale: number;
  revealDistance: number;
  revealDuration: number;
};

export const inviteMotionPresets = {
  none: {
    intersectionThreshold: 0,
    parallaxDistance: 0,
    parallaxScale: 0,
    revealDistance: 0,
    revealDuration: 0,
  },
  low: {
    intersectionThreshold: 0.08,
    parallaxDistance: 0,
    parallaxScale: 0,
    revealDistance: 10,
    revealDuration: 560,
  },
  premium: {
    intersectionThreshold: 0.14,
    parallaxDistance: 26,
    parallaxScale: 0.035,
    revealDistance: 24,
    revealDuration: 760,
  },
} satisfies Record<InviteMotionIntensity, InviteMotionPreset>;

const profileIntensity = {
  calm: "low",
  immersive: "premium",
  playful: "premium",
  seasonal: "premium",
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

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
