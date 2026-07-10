import type { ElementType, ReactNode } from "react";
import type { ThemeMotionKind } from "@lumiere/themes";

export const invitePressFeedbackProps = {
  "data-motion-feedback": "press",
} as const;

type MotionRevealProps = {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  kind?: ThemeMotionKind;
  order?: number;
};

type MotionLayerProps = {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  layer: "hero-image" | "hero-media" | "section-image";
};

export function InviteMotionReveal({
  as: Component = "div",
  children,
  className,
  kind = "section-reveal",
  order,
}: MotionRevealProps) {
  return (
    <Component
      className={className}
      data-motion-kind={kind}
      data-motion-order={order}
      data-motion-scope="invite-section"
    >
      {children}
    </Component>
  );
}

export function InviteParallaxLayer({
  as: Component = "div",
  children,
  className,
  layer,
}: MotionLayerProps) {
  return (
    <Component className={className} data-parallax-layer={layer}>
      {children}
    </Component>
  );
}

export function InviteMaskedText({ children }: { children: ReactNode }) {
  return (
    <span data-motion-mask="text">
      <span data-motion-mask-content="true">{children}</span>
    </span>
  );
}

export function InviteMotionImageFrame({
  as: Component = "figure",
  children,
  className,
}: {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Component className={className} data-motion-soft-image="true">
      {children}
    </Component>
  );
}
