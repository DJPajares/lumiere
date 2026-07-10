"use client";

import { useEffect, useRef, useState } from "react";

export const TOP_BAR_HIDE_AFTER = 72;
export const TOP_BAR_HIDE_THRESHOLD = 40;
export const TOP_BAR_SHOW_THRESHOLD = 20;

export type TopBarScrollState = {
  direction: "down" | "idle" | "up";
  distance: number;
  lastScrollY: number;
  visible: boolean;
};

export const initialTopBarScrollState: TopBarScrollState = {
  direction: "idle",
  distance: 0,
  lastScrollY: 0,
  visible: true,
};

export function getNextTopBarScrollState(
  state: TopBarScrollState,
  nextScrollY: number,
  interactionLocked = false,
): TopBarScrollState {
  const scrollY = Math.max(0, nextScrollY);
  const delta = scrollY - state.lastScrollY;

  if (interactionLocked || scrollY <= TOP_BAR_HIDE_AFTER) {
    return {
      direction: "idle",
      distance: 0,
      lastScrollY: scrollY,
      visible: true,
    };
  }

  if (Math.abs(delta) < 2) {
    return { ...state, lastScrollY: scrollY };
  }

  const direction = delta > 0 ? "down" : "up";
  const distance =
    direction === state.direction ? state.distance + Math.abs(delta) : Math.abs(delta);
  let visible = state.visible;

  if (direction === "down" && distance >= TOP_BAR_HIDE_THRESHOLD) {
    visible = false;
  }

  if (direction === "up" && distance >= TOP_BAR_SHOW_THRESHOLD) {
    visible = true;
  }

  return {
    direction,
    distance,
    lastScrollY: scrollY,
    visible,
  };
}

export function useTopBarVisibility(interactionLocked = false) {
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const interactionLockedRef = useRef(interactionLocked);
  const keyboardNavigationRef = useRef(false);
  const focusedControlRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);
  const scrollStateRef = useRef<TopBarScrollState>(initialTopBarScrollState);

  useEffect(() => {
    interactionLockedRef.current = interactionLocked;

    if (interactionLocked) {
      scrollStateRef.current = getNextTopBarScrollState(
        scrollStateRef.current,
        window.scrollY,
        true,
      );
      setIsVisible(true);
    }
  }, [interactionLocked]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      prefersReducedMotionRef.current = motionQuery.matches;
      setPrefersReducedMotion(motionQuery.matches);

      if (motionQuery.matches) {
        scrollStateRef.current = getNextTopBarScrollState(
          scrollStateRef.current,
          window.scrollY,
          true,
        );
        setIsVisible(true);
      }
    };

    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);

    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    const hasOpenPopup = () =>
      Boolean(
        document.querySelector(
          '[data-slot="drawer-popup"], [data-slot="sheet-content"], [data-slot="dropdown-menu-content"], [role="dialog"], [role="menu"]',
        ),
      );
    const isControl = (element: Element | null) =>
      element instanceof HTMLElement &&
      element.matches('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const isLocked = () =>
      interactionLockedRef.current ||
      keyboardNavigationRef.current ||
      focusedControlRef.current ||
      prefersReducedMotionRef.current ||
      hasOpenPopup();
    const updateFromScroll = () => {
      animationFrame = 0;
      const nextState = getNextTopBarScrollState(
        scrollStateRef.current,
        window.scrollY,
        isLocked(),
      );

      scrollStateRef.current = nextState;
      setIsVisible((current) => (current === nextState.visible ? current : nextState.visible));
    };
    const onScroll = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateFromScroll);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Tab" ||
        event.key.startsWith("Arrow") ||
        event.key === "Home" ||
        event.key === "End" ||
        event.key === "Escape"
      ) {
        keyboardNavigationRef.current = true;
        setIsVisible(true);
      }
    };
    const onPointerDown = () => {
      keyboardNavigationRef.current = false;
    };
    const updateFocusedControl = () => {
      focusedControlRef.current = isControl(document.activeElement);

      if (focusedControlRef.current) {
        setIsVisible(true);
      }
    };

    scrollStateRef.current = {
      ...initialTopBarScrollState,
      lastScrollY: window.scrollY,
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", updateFocusedControl);
    document.addEventListener("focusout", updateFocusedControl);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", updateFocusedControl);
      document.removeEventListener("focusout", updateFocusedControl);
    };
  }, []);

  return { isVisible, prefersReducedMotion };
}
