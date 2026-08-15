"use client";

import * as React from "react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@lumiere/dashboard-ui/components/field";
import { MinusIcon, PlusIcon } from "@lumiere/dashboard-ui/components/icons";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@lumiere/dashboard-ui/components/input-group";
import { cn } from "@lumiere/dashboard-ui/lib/utils";

export type NumberFieldProps = {
  "aria-label"?: string;
  className?: string;
  description?: React.ReactNode;
  disabled?: boolean;
  error?: string;
  id?: string;
  label?: React.ReactNode;
  max?: number;
  min?: number;
  name?: string;
  onValueChange: (value: number) => void;
  required?: boolean;
  step?: number;
  value: number;
};

/**
 * A stepper input built from InputGroup + Button, in the spirit of HeroUI's NumberField:
 * decrement/increment buttons flank a numeric input that also accepts direct typing.
 * Typing is tracked as a draft string so an in-progress edit (e.g. a momentarily empty
 * field) isn't fought by the parent's numeric state until it's committed on blur/Enter.
 */
function NumberField({
  "aria-label": ariaLabel,
  className,
  description,
  disabled = false,
  error,
  id,
  label,
  max = Number.POSITIVE_INFINITY,
  min = Number.NEGATIVE_INFINITY,
  name,
  onValueChange,
  required = false,
  step = 1,
  value,
}: NumberFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const [draft, setDraft] = React.useState(() => String(value));

  React.useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const clamp = React.useCallback((next: number) => Math.min(max, Math.max(min, next)), [max, min]);

  // Typed values are committed as-is, not clamped: like a native <input type="number">
  // with min/max, out-of-range input stays visible so the caller's own validation
  // (e.g. a Zod schema) can surface a real error instead of the field silently
  // correcting it. Only the stepper buttons — which should never overshoot — clamp.
  const commit = (rawValue: string) => {
    const parsed = Number(rawValue);

    if (rawValue.trim() === "" || Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }

    setDraft(String(parsed));

    if (parsed !== value) {
      onValueChange(parsed);
    }
  };

  const nudge = (direction: 1 | -1) => {
    const next = clamp(value + direction * step);

    setDraft(String(next));

    if (next !== value) {
      onValueChange(next);
    }
  };

  const describedBy =
    [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  const control = (
    <InputGroup className={cn("h-10", className)}>
      <InputGroupButton
        aria-label="Decrease value"
        disabled={disabled || value <= min}
        onClick={() => nudge(-1)}
        size="icon-sm"
        variant="outline"
      >
        <MinusIcon />
      </InputGroupButton>
      <InputGroupInput
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
        className="text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        disabled={disabled}
        id={inputId}
        inputMode="numeric"
        name={name}
        onBlur={(event) => commit(event.target.value)}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            nudge(1);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            nudge(-1);
          } else if (event.key === "Enter") {
            commit(event.currentTarget.value);
          }
        }}
        required={required}
        value={draft}
      />
      <InputGroupButton
        aria-label="Increase value"
        disabled={disabled || value >= max}
        onClick={() => nudge(1)}
        size="icon-sm"
        variant="outline"
      >
        <PlusIcon />
      </InputGroupButton>
    </InputGroup>
  );

  if (!label && !description && !error) {
    return control;
  }

  return (
    <Field data-invalid={Boolean(error)}>
      {label ? <FieldLabel htmlFor={inputId}>{label}</FieldLabel> : null}
      {control}
      {description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </Field>
  );
}

export { NumberField };
