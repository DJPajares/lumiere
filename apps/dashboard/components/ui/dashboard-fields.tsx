"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@lumiere/dashboard-ui/components/combobox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lumiere/dashboard-ui/components/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@lumiere/dashboard-ui/components/field";
import { Switch } from "@lumiere/dashboard-ui/components/switch";
import {
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
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
  descriptionClassName?: string;
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
  descriptionClassName,
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
          className={cx(
            "text-xs leading-5 text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]",
            descriptionClassName,
          )}
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

export type DashboardSelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

type DashboardSelectProps = BaseFieldProps & {
  alignItemWithTrigger?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "false" | "true";
  "aria-label"?: string;
  disabled?: boolean;
  descriptionClassName?: string;
  loading?: boolean;
  name?: string;
  onValueChange: (value: string) => void;
  options: readonly DashboardSelectOption[];
  placeholder?: string;
  readOnly?: boolean;
  selectClassName?: string;
  value?: string | null;
};

export function DashboardSelect({
  alignItemWithTrigger = false,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  description,
  descriptionClassName,
  disabled = false,
  error,
  id,
  label,
  loading = false,
  name,
  onValueChange,
  options,
  placeholder = "Select an option",
  readOnly = false,
  required = false,
  selectClassName,
  value,
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
      descriptionClassName={descriptionClassName}
      error={error}
      id={inputId}
      label={label}
      required={required}
    >
      <Select
        disabled={disabled || loading}
        items={options}
        modal={false}
        name={name}
        onValueChange={(nextValue) => {
          if (nextValue !== null) {
            onValueChange(nextValue);
          }
        }}
        readOnly={readOnly}
        required={required}
        value={loading ? null : value}
      >
        <SelectTrigger
          aria-busy={loading || undefined}
          aria-describedby={describedBy}
          aria-invalid={error ? true : ariaInvalid}
          aria-label={ariaLabel}
          className={cx("h-11 w-full px-3", selectClassName)}
          id={inputId}
        >
          <SelectValue placeholder={loading ? "Loading options..." : placeholder} />
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={alignItemWithTrigger} sideOffset={6}>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem disabled={option.disabled} key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </DashboardField>
  );
}

type DashboardComboboxProps = BaseFieldProps & {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "false" | "true";
  "aria-label"?: string;
  disabled?: boolean;
  emptyMessage?: string;
  inputClassName?: string;
  loading?: boolean;
  name?: string;
  onValueChange: (value: string) => void;
  options: readonly DashboardSelectOption[];
  placeholder?: string;
  readOnly?: boolean;
  value?: string | null;
};

export function DashboardCombobox({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  description,
  disabled = false,
  emptyMessage = "No matching options.",
  error,
  id,
  inputClassName,
  label,
  loading = false,
  name,
  onValueChange,
  options,
  placeholder = "Search options",
  readOnly = false,
  required = false,
  value,
}: DashboardComboboxProps) {
  const inputId = useResolvedId(id);
  const describedBy = describeBy(
    ariaDescribedBy,
    description ? `${inputId}-description` : undefined,
    error ? `${inputId}-error` : undefined,
  );
  const optionValues = options.map((option) => option.value);
  const labelForValue = (optionValue: string) =>
    options.find((option) => option.value === optionValue)?.label ?? optionValue;

  return (
    <DashboardField
      description={description}
      error={error}
      id={inputId}
      label={label}
      required={required}
    >
      <Combobox
        disabled={disabled || loading}
        itemToStringLabel={labelForValue}
        itemToStringValue={(optionValue) => optionValue}
        items={loading ? [] : optionValues}
        name={name}
        onValueChange={(nextValue) => {
          if (nextValue !== null) {
            onValueChange(nextValue);
          }
        }}
        readOnly={readOnly}
        required={required}
        value={loading ? null : value}
      >
        <ComboboxInput
          aria-busy={loading || undefined}
          aria-describedby={describedBy}
          aria-invalid={error ? true : ariaInvalid}
          aria-label={ariaLabel}
          className={cx("h-11 w-full", inputClassName)}
          disabled={disabled || loading}
          id={inputId}
          placeholder={loading ? "Loading options..." : placeholder}
          readOnly={readOnly}
        />
        <ComboboxContent>
          <ComboboxEmpty>{loading ? "Loading options..." : emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(optionValue: string) => {
              const option = options.find((candidate) => candidate.value === optionValue);

              return (
                <ComboboxItem disabled={option?.disabled} key={optionValue} value={optionValue}>
                  {option?.label ?? optionValue}
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </DashboardField>
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

type DashboardSwitchProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "false" | "true";
  checked?: boolean;
  defaultChecked?: boolean;
  description?: ReactNode;
  disabled?: boolean;
  error?: string;
  id?: string;
  label: ReactNode;
  name?: string;
  onCheckedChange?: (checked: boolean) => void;
  required?: boolean;
};

export function DashboardSwitch({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  checked,
  defaultChecked,
  description,
  disabled,
  error,
  id,
  label,
  name,
  onCheckedChange,
  required,
}: DashboardSwitchProps) {
  const inputId = useResolvedId(id);
  const describedBy = describeBy(
    ariaDescribedBy,
    description ? `${inputId}-description` : undefined,
    error ? `${inputId}-error` : undefined,
  );

  return (
    <FieldGroup className="gap-2">
      <FieldLabel htmlFor={inputId}>
        <Field data-disabled={disabled || undefined} data-invalid={error ? true : undefined}>
          <FieldContent>
            <FieldTitle>{label}</FieldTitle>
            {description ? (
              <FieldDescription id={`${inputId}-description`}>{description}</FieldDescription>
            ) : null}
          </FieldContent>
          <Switch
            aria-describedby={describedBy}
            aria-invalid={error ? true : ariaInvalid}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            id={inputId}
            name={name}
            onCheckedChange={onCheckedChange}
            required={required}
          />
        </Field>
      </FieldLabel>
      {error ? <FieldError id={`${inputId}-error`}>{error}</FieldError> : null}
    </FieldGroup>
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
