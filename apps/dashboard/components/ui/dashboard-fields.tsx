"use client";

import {
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

export const dashboardInputClassName =
  "min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[color-mix(in_srgb,var(--foreground)_42%,transparent)] hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1 focus:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:opacity-70";

export const dashboardTextAreaClassName = `${dashboardInputClassName} min-h-28 resize-y leading-6`;

export const dashboardButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";

export const dashboardPrimaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

type DashboardFieldChromeProps = {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  error?: string;
  errorId?: string;
  id: string;
  label: ReactNode;
  required?: boolean;
};

export function DashboardField({
  children,
  className,
  description,
  error,
  errorId,
  id,
  label,
  required = false,
}: DashboardFieldChromeProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const resolvedErrorId = error ? (errorId ?? `${id}-error`) : undefined;

  return (
    <div className={cx("grid gap-2", className)}>
      <div className="flex items-center gap-1">
        <label className="text-sm font-semibold" htmlFor={id}>
          {label}
        </label>
        {required ? (
          <span aria-hidden="true" className="text-[var(--error)]">
            *
          </span>
        ) : null}
      </div>
      {description ? (
        <p
          className="text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]"
          id={descriptionId}
        >
          {description}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className="text-sm leading-5 text-[var(--error)]" id={resolvedErrorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type BaseFieldProps = {
  description?: ReactNode;
  error?: string;
  id?: string;
  label: ReactNode;
  required?: boolean;
};

type DashboardTextInputProps = BaseFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id"> & {
    inputClassName?: string;
  };

export function DashboardTextInput({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  description,
  error,
  id,
  inputClassName,
  label,
  required = false,
  ...inputProps
}: DashboardTextInputProps) {
  const inputId = useResolvedId(id);
  const describedBy = describeBy(
    ariaDescribedBy,
    description ? `${inputId}-description` : undefined,
    error ? `${inputId}-error` : undefined,
  );

  return (
    <DashboardField
      description={description}
      error={error}
      id={inputId}
      label={label}
      required={required}
    >
      <input
        {...inputProps}
        aria-describedby={describedBy}
        aria-invalid={error ? true : ariaInvalid}
        className={cx(dashboardInputClassName, inputClassName)}
        id={inputId}
        required={required}
      />
    </DashboardField>
  );
}

type DashboardTextAreaProps = BaseFieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "id"> & {
    textAreaClassName?: string;
  };

export function DashboardTextArea({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  description,
  error,
  id,
  label,
  required = false,
  textAreaClassName,
  ...textAreaProps
}: DashboardTextAreaProps) {
  const inputId = useResolvedId(id);
  const describedBy = describeBy(
    ariaDescribedBy,
    description ? `${inputId}-description` : undefined,
    error ? `${inputId}-error` : undefined,
  );

  return (
    <DashboardField
      description={description}
      error={error}
      id={inputId}
      label={label}
      required={required}
    >
      <textarea
        {...textAreaProps}
        aria-describedby={describedBy}
        aria-invalid={error ? true : ariaInvalid}
        className={cx(dashboardTextAreaClassName, textAreaClassName)}
        id={inputId}
        required={required}
      />
    </DashboardField>
  );
}

type DashboardSelectProps = BaseFieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "id"> & {
    children: ReactNode;
    selectClassName?: string;
  };

export function DashboardSelect({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  children,
  description,
  error,
  id,
  label,
  required = false,
  selectClassName,
  ...selectProps
}: DashboardSelectProps) {
  const inputId = useResolvedId(id);
  const describedBy = describeBy(
    ariaDescribedBy,
    description ? `${inputId}-description` : undefined,
    error ? `${inputId}-error` : undefined,
  );

  return (
    <DashboardField
      description={description}
      error={error}
      id={inputId}
      label={label}
      required={required}
    >
      <select
        {...selectProps}
        aria-describedby={describedBy}
        aria-invalid={error ? true : ariaInvalid}
        className={cx(dashboardInputClassName, selectClassName)}
        id={inputId}
        required={required}
      >
        {children}
      </select>
    </DashboardField>
  );
}

type DashboardDateTimeInputProps = Omit<DashboardTextInputProps, "description" | "type"> & {
  description?: ReactNode;
  timezone?: string;
};

export function DashboardDateTimeInput({
  description,
  timezone,
  ...inputProps
}: DashboardDateTimeInputProps) {
  const timezoneDescription = timezone ? `Event timezone: ${timezone}` : undefined;
  const fieldDescription =
    description && timezoneDescription ? (
      <>
        <span className="block">{description}</span>
        <span className="block">{timezoneDescription}</span>
      </>
    ) : (
      (description ?? timezoneDescription)
    );

  return (
    <DashboardTextInput
      {...inputProps}
      description={fieldDescription}
      step={inputProps.step ?? 60}
      type="datetime-local"
    />
  );
}

type DashboardCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> & {
  checkboxClassName?: string;
  description?: ReactNode;
  error?: string;
  label: ReactNode;
};

export function DashboardCheckbox({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  checkboxClassName,
  description,
  error,
  id,
  label,
  ...inputProps
}: DashboardCheckboxProps) {
  const inputId = useResolvedId(id);
  const describedBy = describeBy(
    ariaDescribedBy,
    description ? `${inputId}-description` : undefined,
    error ? `${inputId}-error` : undefined,
  );

  return (
    <div className="grid gap-2">
      <label
        className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm transition hover:bg-[var(--surface-muted)]"
        htmlFor={inputId}
      >
        <input
          {...inputProps}
          aria-describedby={describedBy}
          aria-invalid={error ? true : ariaInvalid}
          className={cx("mt-1 size-4 accent-[var(--accent)]", checkboxClassName)}
          id={inputId}
          type="checkbox"
        />
        <span>
          <span className="block font-semibold">{label}</span>
          {description ? (
            <span
              className="mt-1 block leading-6 text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]"
              id={`${inputId}-description`}
            >
              {description}
            </span>
          ) : null}
        </span>
      </label>
      {error ? (
        <p className="text-sm leading-5 text-[var(--error)]" id={`${inputId}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type DashboardSwitchProps = Omit<DashboardCheckboxProps, "checkboxClassName">;

export function DashboardSwitch({
  description,
  error,
  id,
  label,
  ...inputProps
}: DashboardSwitchProps) {
  const inputId = useResolvedId(id);

  return (
    <div className="grid gap-2">
      <label
        className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm transition hover:bg-[var(--surface-muted)]"
        htmlFor={inputId}
      >
        <span>
          <span className="block font-semibold">{label}</span>
          {description ? (
            <span
              className="mt-1 block leading-6 text-[color-mix(in_srgb,var(--foreground)_66%,transparent)]"
              id={`${inputId}-description`}
            >
              {description}
            </span>
          ) : null}
        </span>
        <span className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-[var(--surface-muted)] p-1 ring-1 ring-[var(--border)] transition has-[:checked]:bg-[var(--accent)]">
          <input
            {...inputProps}
            aria-describedby={description ? `${inputId}-description` : undefined}
            aria-invalid={error ? true : inputProps["aria-invalid"]}
            className="peer sr-only"
            id={inputId}
            type="checkbox"
          />
          <span className="size-4 rounded-full bg-[var(--surface)] shadow-sm transition peer-checked:translate-x-5" />
        </span>
      </label>
      {error ? (
        <p className="text-sm leading-5 text-[var(--error)]" id={`${inputId}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type DashboardButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function DashboardButton({
  className,
  type = "button",
  variant = "secondary",
  ...buttonProps
}: DashboardButtonProps) {
  return (
    <button
      {...buttonProps}
      className={cx(
        variant === "primary" ? dashboardPrimaryButtonClassName : dashboardButtonClassName,
        className,
      )}
      type={type}
    />
  );
}

export function DashboardNotice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "error" | "info" | "success" | "warning";
}) {
  const toneClassName =
    tone === "error"
      ? "border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] text-[var(--error)]"
      : tone === "success"
        ? "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] text-[var(--success)]"
        : tone === "warning"
          ? "border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_10%,var(--surface))] text-[var(--warning)]"
          : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]";

  return (
    <p
      className={cx("rounded-[var(--radius-md)] border px-3 py-2 text-sm", toneClassName)}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}

export function DashboardPopover({ children, label }: { children: ReactNode; label: ReactNode }) {
  return (
    <details className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3">
      <summary className="cursor-pointer text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
        {label}
      </summary>
      <div className="mt-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
        {children}
      </div>
    </details>
  );
}

export function DashboardDialog({
  children,
  open,
  title,
}: {
  children: ReactNode;
  open: boolean;
  title: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <section
      aria-modal="true"
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
      role="dialog"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function DashboardDrawer({
  children,
  open,
  title,
}: {
  children: ReactNode;
  open: boolean;
  title: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <aside
      aria-label={typeof title === "string" ? title : undefined}
      className="fixed inset-y-0 right-0 z-50 grid w-full max-w-md content-start gap-4 overflow-y-auto border-l border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl"
      role="dialog"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </aside>
  );
}

export function DashboardTabs({
  label,
  tabs,
}: {
  label: string;
  tabs: Array<{ active?: boolean; id: string; label: ReactNode; onSelect?: () => void }>;
}) {
  return (
    <div
      aria-label={label}
      className="inline-flex flex-wrap gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-1"
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          aria-selected={Boolean(tab.active)}
          className={cx(
            "min-h-9 rounded-[var(--radius-sm)] px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
            tab.active
              ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
              : "text-[color-mix(in_srgb,var(--foreground)_68%,transparent)] hover:text-[var(--foreground)]",
          )}
          id={tab.id}
          key={tab.id}
          onClick={tab.onSelect}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function useResolvedId(id?: string) {
  const generatedId = useId();

  return id ?? generatedId;
}

function describeBy(...ids: Array<string | undefined>) {
  const value = ids.filter(Boolean).join(" ");

  return value || undefined;
}

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}
