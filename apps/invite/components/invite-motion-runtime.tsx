"use client";

import { useLayoutEffect, useRef } from "react";

import {
  calculateMotionBlur,
  calculateScrollProgress,
  inviteMotionPresets,
  resolveInviteMotionDriver,
  type InviteMotionIntensity,
  type InviteMotionPreset,
} from "./invite-motion-config";

const sectionSelector = '[data-motion-scope="invite-section"]';
const parallaxSelector = "[data-parallax-kind]";

export function InviteMotionRuntime({ intensity }: { intensity: InviteMotionIntensity }) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = markerRef.current?.closest<HTMLElement>("[data-motion-root]");

    if (!root) {
      return;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let deactivate: () => void = () => undefined;

    const activate = () => {
      deactivate();
      deactivate = initializeMotion(root, reducedMotionQuery.matches ? "none" : intensity);
    };

    activate();
    reducedMotionQuery.addEventListener("change", activate);

    return () => {
      reducedMotionQuery.removeEventListener("change", activate);
      deactivate();
    };
  }, [intensity]);

  return <span aria-hidden="true" data-motion-runtime-marker={intensity} hidden ref={markerRef} />;
}

function initializeMotion(root: HTMLElement, intensity: InviteMotionIntensity) {
  const preset = inviteMotionPresets[intensity];
  const sections = Array.from(root.querySelectorAll<HTMLElement>(sectionSelector));
  const parallaxScopes = Array.from(root.querySelectorAll<HTMLElement>(parallaxSelector));
  const cleanupCallbacks: Array<() => void> = [];

  root.dataset.motionIntensity = intensity;
  root.dataset.motionRuntime = "ready";
  root.style.setProperty("--motion-reveal-distance", `${preset.revealDistance}px`);
  root.style.setProperty("--motion-reveal-duration", `${preset.revealDuration}ms`);

  if (intensity === "none") {
    root.dataset.motionDriver = "none";
    sections.forEach((section) => {
      section.dataset.motionState = "visible";
    });

    return () => resetMotion(root, sections, parallaxScopes);
  }

  const intersectionObserver = createRevealObserver(sections, preset.intersectionThreshold);

  if (intersectionObserver) {
    cleanupCallbacks.push(() => intersectionObserver.disconnect());
  }

  const supportsScrollTimeline =
    typeof CSS !== "undefined" &&
    CSS.supports("animation-timeline: view()") &&
    CSS.supports("animation-timeline: scroll()");

  const motionDriver = resolveInviteMotionDriver(intensity, supportsScrollTimeline);

  if (motionDriver === "css") {
    root.dataset.motionDriver = "css";
  } else {
    root.dataset.motionDriver = "raf";
    cleanupCallbacks.push(startAnimationFrameDriver(root, parallaxScopes, preset));
  }

  return () => {
    cleanupCallbacks.forEach((cleanup) => cleanup());
    resetMotion(root, sections, parallaxScopes);
  };
}

function createRevealObserver(sections: HTMLElement[], threshold: number) {
  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => {
      section.dataset.motionState = "visible";
    });
    return undefined;
  }

  sections.forEach((section) => {
    section.dataset.motionState = "pending";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const section = entry.target as HTMLElement;
        section.dataset.motionState = "visible";
        observer.unobserve(section);
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold,
    },
  );

  sections.forEach((section) => observer.observe(section));
  return observer;
}

function startAnimationFrameDriver(
  root: HTMLElement,
  parallaxScopes: HTMLElement[],
  preset: InviteMotionPreset,
) {
  let animationFrame: number | undefined;
  let currentBlur = 0;
  let lastFrameTime = performance.now();
  let lastScrollY = window.scrollY;

  const render = (frameTime: number) => {
    animationFrame = undefined;
    const documentElement = document.documentElement;
    const currentScrollY = window.scrollY;
    const frameDuration = frameTime - lastFrameTime;
    const scrollDelta = currentScrollY - lastScrollY;
    const scrollRange = Math.max(documentElement.scrollHeight - window.innerHeight, 1);
    const pageProgress = Math.min(Math.max(currentScrollY / scrollRange, 0), 1);
    const blurImpulse = calculateMotionBlur(scrollDelta, frameDuration, preset.maxMotionBlur);

    currentBlur = scrollDelta === 0 ? currentBlur * 0.72 : Math.max(blurImpulse, currentBlur * 0.8);

    if (currentBlur < 0.02) {
      currentBlur = 0;
    }

    root.style.setProperty("--motion-page-progress", pageProgress.toFixed(4));
    root.style.setProperty("--motion-scroll-blur", `${currentBlur.toFixed(2)}px`);

    parallaxScopes.forEach((scope) => {
      const rect = scope.getBoundingClientRect();
      const progress = calculateScrollProgress(rect.top, rect.height, window.innerHeight);
      const offset = (progress - 0.5) * preset.parallaxDistance;
      const horizontalOffset = offset * 0.18;
      const scale = 1.035 + progress * preset.parallaxScale;

      scope.style.setProperty("--motion-parallax-x", `${horizontalOffset.toFixed(2)}px`);
      scope.style.setProperty("--motion-parallax-x-reverse", `${(-horizontalOffset).toFixed(2)}px`);
      scope.style.setProperty("--motion-parallax-y", `${offset.toFixed(2)}px`);
      scope.style.setProperty("--motion-parallax-y-reverse", `${(-offset).toFixed(2)}px`);
      scope.style.setProperty("--motion-story-y", `${(-offset * 0.45).toFixed(2)}px`);
      scope.style.setProperty("--motion-parallax-scale", scale.toFixed(4));
    });

    lastFrameTime = frameTime;
    lastScrollY = currentScrollY;

    if (currentBlur > 0) {
      scheduleRender();
    }
  };

  const scheduleRender = () => {
    if (animationFrame === undefined) {
      animationFrame = window.requestAnimationFrame(render);
    }
  };

  window.addEventListener("resize", scheduleRender);
  window.addEventListener("scroll", scheduleRender, { passive: true });
  scheduleRender();

  return () => {
    window.removeEventListener("resize", scheduleRender);
    window.removeEventListener("scroll", scheduleRender);

    if (animationFrame !== undefined) {
      window.cancelAnimationFrame(animationFrame);
    }
  };
}

function resetMotion(root: HTMLElement, sections: HTMLElement[], parallaxScopes: HTMLElement[]) {
  delete root.dataset.motionDriver;
  delete root.dataset.motionRuntime;
  root.style.removeProperty("--motion-page-progress");
  root.style.removeProperty("--motion-reveal-distance");
  root.style.removeProperty("--motion-reveal-duration");
  root.style.removeProperty("--motion-scroll-blur");

  sections.forEach((section) => {
    delete section.dataset.motionState;
  });

  parallaxScopes.forEach((scope) => {
    scope.style.removeProperty("--motion-parallax-scale");
    scope.style.removeProperty("--motion-parallax-x-reverse");
    scope.style.removeProperty("--motion-parallax-x");
    scope.style.removeProperty("--motion-parallax-y-reverse");
    scope.style.removeProperty("--motion-parallax-y");
    scope.style.removeProperty("--motion-story-y");
  });
}
