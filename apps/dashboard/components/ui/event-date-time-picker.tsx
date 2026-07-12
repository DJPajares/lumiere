"use client";

import { Button } from "@lumiere/dashboard-ui/components/button";
import { Calendar } from "@lumiere/dashboard-ui/components/calendar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@lumiere/dashboard-ui/components/drawer";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@lumiere/dashboard-ui/components/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lumiere/dashboard-ui/components/select";
import { useEffect, useMemo, useState } from "react";

import { DashboardField } from "./dashboard-fields";

export const EVENT_LOCAL_DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm";

type EventDatePickerProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-label": string;
  "aria-required"?: boolean;
  disabled?: boolean;
  id: string;
  locale?: string;
  maximum?: string;
  minimum?: string;
  name?: string;
  onValueChange: (value: string) => void;
  value: string;
};

export function EventDatePicker({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-required": ariaRequired,
  disabled = false,
  id,
  locale,
  maximum,
  minimum,
  name,
  onValueChange,
  value,
}: EventDatePickerProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useDesktopDatePicker();
  const selected = parseDateValue(value);
  const minimumDate = parseDateValue(minimum);
  const maximumDate = parseDateValue(maximum);
  const calendar = (
    <Calendar
      aria-label={`${ariaLabel} calendar`}
      captionLayout="dropdown"
      className="w-74 max-w-full motion-reduce:transition-none"
      defaultMonth={selected ?? minimumDate ?? new Date()}
      disabled={[
        ...(minimumDate ? [{ before: minimumDate }] : []),
        ...(maximumDate ? [{ after: maximumDate }] : []),
      ]}
      endMonth={new Date(2100, 11, 31)}
      fixedWeeks
      mode="single"
      onSelect={(date) => {
        if (!date) {
          return;
        }

        onValueChange(toDateValue(date));
        setOpen(false);
      }}
      selected={selected}
      startMonth={new Date(1900, 0, 1)}
    />
  );
  const trigger = (
    <Button
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      aria-label={ariaLabel}
      aria-required={ariaRequired}
      className="w-full justify-start gap-2 border-border px-3 font-normal motion-reduce:transition-none"
      disabled={disabled}
      id={id}
      type="button"
      variant="outline"
    >
      <CalendarPickerIcon />
      <span className={value ? undefined : "text-muted-foreground"}>
        {value ? formatEventDate(value, locale) : "Choose date"}
      </span>
    </Button>
  );

  return (
    <>
      {name ? <input name={name} type="hidden" value={value} /> : null}
      {isDesktop ? (
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger render={trigger} />
          <PopoverContent
            align="start"
            className="w-auto max-w-[calc(100vw-2rem)] p-0 motion-reduce:animate-none"
            sideOffset={6}
          >
            <PopoverHeader className="px-3 pt-3">
              <PopoverTitle>{ariaLabel}</PopoverTitle>
              <PopoverDescription>Choose a calendar date.</PopoverDescription>
            </PopoverHeader>
            {calendar}
          </PopoverContent>
        </Popover>
      ) : (
        <Drawer onOpenChange={setOpen} open={open} showSwipeHandle>
          <DrawerTrigger render={trigger} />
          <DrawerContent className="motion-reduce:transition-none">
            <DrawerHeader>
              <DrawerTitle>{ariaLabel}</DrawerTitle>
              <DrawerDescription>Choose a calendar date.</DrawerDescription>
            </DrawerHeader>
            <div className="flex min-h-0 justify-center overflow-y-auto px-4 py-2">{calendar}</div>
            <DrawerFooter>
              <DrawerClose render={<Button className="h-11" variant="outline" />}>Done</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

type EventTimePickerProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-label": string;
  "aria-required"?: boolean;
  disabled?: boolean;
  id: string;
  locale?: string;
  minimum?: string;
  name?: string;
  onValueChange: (value: string) => void;
  value: string;
};

export function EventTimePicker({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-required": ariaRequired,
  disabled = false,
  id,
  locale,
  minimum,
  name,
  onValueChange,
  value,
}: EventTimePickerProps) {
  const options = useMemo(() => getTimeOptions(value, locale), [locale, value]);

  return (
    <Select
      disabled={disabled}
      items={options}
      name={name}
      onValueChange={(nextValue) => {
        if (nextValue !== null) {
          onValueChange(nextValue);
        }
      }}
      value={value || null}
    >
      <SelectTrigger
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
        aria-required={ariaRequired}
        className="h-11 w-full justify-start gap-2 px-3 motion-reduce:transition-none"
        id={id}
      >
        <TimePickerIcon />
        <SelectValue placeholder="Choose time" />
      </SelectTrigger>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className="max-h-72 motion-reduce:animate-none"
        sideOffset={6}
      >
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              className="min-h-10"
              disabled={Boolean(minimum && option.value <= minimum)}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

type EventDateTimeRangeProps = {
  disabled?: boolean;
  endDescription?: string;
  endError?: string;
  endId: string;
  endName?: string;
  endValue: string;
  locale?: string;
  onEndValueChange: (value: string) => void;
  onStartValueChange: (value: string) => void;
  startError?: string;
  startDescription?: string;
  startId: string;
  startName?: string;
  startValue: string;
  timezone: string;
};

export function EventDateTimeRange({
  disabled = false,
  endDescription = "Leave blank if the event has no set end time.",
  endError,
  endId,
  endName,
  endValue,
  locale,
  onEndValueChange,
  onStartValueChange,
  startError,
  startDescription = "Required date and time.",
  startId,
  startName,
  startValue,
  timezone,
}: EventDateTimeRangeProps) {
  const startParts = splitEventLocalDateTime(startValue);
  const endParts = splitEventLocalDateTime(endValue);

  const updateStart = (nextValue: string) => {
    onStartValueChange(nextValue);

    if (isCompleteEventLocalDateTime(nextValue) && endValue && endValue <= nextValue) {
      onEndValueChange("");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <EventDateTimeField
        description={startDescription}
        disabled={disabled}
        error={startError}
        id={startId}
        label="Starts"
        locale={locale}
        name={startName}
        onValueChange={updateStart}
        required
        timezone={timezone}
        value={startValue}
      />
      <EventDateTimeField
        description={endDescription}
        disabled={disabled}
        error={endError}
        id={endId}
        label="Ends optional"
        locale={locale}
        minimumDate={startParts.date}
        minimumTime={endParts.date === startParts.date ? startParts.time : undefined}
        name={endName}
        onValueChange={onEndValueChange}
        timezone={timezone}
        value={endValue}
      />
    </div>
  );
}

export type EventDateTimeFieldProps = {
  description?: string;
  disabled: boolean;
  error?: string;
  id: string;
  label: string;
  locale?: string;
  minimumDate?: string;
  minimumTime?: string;
  name?: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  timezone: string;
  value: string;
};

export function EventDateTimeField({
  description,
  disabled,
  error,
  id,
  label,
  locale,
  minimumDate,
  minimumTime,
  name,
  onValueChange,
  required = false,
  timezone,
  value,
}: EventDateTimeFieldProps) {
  const { date, time } = splitEventLocalDateTime(value);
  const fieldId = `${id}-date`;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  const describedBy = [
    description || timezone ? descriptionId : undefined,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  const fieldDescription = (
    <>
      {description ? <span className="block">{description}</span> : null}
      <span className="block">Event timezone: {formatTimezone(timezone)}</span>
    </>
  );

  return (
    <DashboardField
      description={fieldDescription}
      error={error}
      id={fieldId}
      label={label}
      required={required}
    >
      {name ? <input name={name} type="hidden" value={value} /> : null}
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(7.75rem,0.68fr)]">
        <div className="grid gap-1.5">
          <span className="text-xs font-medium text-muted-foreground" id={`${id}-date-label`}>
            Date
          </span>
          <EventDatePicker
            aria-describedby={describedBy || undefined}
            aria-invalid={Boolean(error)}
            aria-label={`${label} date`}
            aria-required={required}
            disabled={disabled}
            id={`${id}-date`}
            locale={locale}
            minimum={minimumDate}
            onValueChange={(nextDate) => {
              const nextTime =
                minimumDate === nextDate && minimumTime && time <= minimumTime ? "" : time;
              onValueChange(joinEventLocalDateTime(nextDate, nextTime));
            }}
            value={date}
          />
        </div>
        <div className="grid gap-1.5">
          <span className="text-xs font-medium text-muted-foreground" id={`${id}-time-label`}>
            Time
          </span>
          <EventTimePicker
            aria-describedby={describedBy || undefined}
            aria-invalid={Boolean(error)}
            aria-label={`${label} time`}
            aria-required={required}
            disabled={disabled || !date}
            id={`${id}-time`}
            locale={locale}
            minimum={minimumDate === date ? minimumTime : undefined}
            onValueChange={(nextTime) => onValueChange(joinEventLocalDateTime(date, nextTime))}
            value={time}
          />
        </div>
      </div>
      {!required && value ? (
        <Button
          aria-label={`Clear ${label} date and time`}
          className="h-10 w-fit px-2 text-muted-foreground motion-reduce:transition-none"
          disabled={disabled}
          onClick={() => onValueChange("")}
          type="button"
          variant="ghost"
        >
          <ClearPickerIcon />
          Clear end date and time
        </Button>
      ) : null}
    </DashboardField>
  );
}

export function splitEventLocalDateTime(value: string) {
  const [date = "", rawTime = ""] = value.split("T", 2);
  const time = rawTime.slice(0, 5);

  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    time: /^\d{2}:\d{2}$/.test(time) ? time : "",
  };
}

export function joinEventLocalDateTime(date: string, time: string) {
  if (!date && !time) {
    return "";
  }

  return `${date}T${time}`;
}

export function isCompleteEventLocalDateTime(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
}

/**
 * Dashboard values are wall-clock `YYYY-MM-DDTHH:mm` strings interpreted in the event's IANA
 * timezone. API/content payloads use ISO 8601 UTC instants and keep `timezone` explicit beside it.
 */
export function eventLocalDateTimeToIso(value: string, timezone: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue, hourValue, minuteValue] = match;
  const target = {
    day: Number(dayValue),
    hour: Number(hourValue),
    minute: Number(minuteValue),
    month: Number(monthValue),
    year: Number(yearValue),
  };
  const targetAsUtc = Date.UTC(
    target.year,
    target.month - 1,
    target.day,
    target.hour,
    target.minute,
  );
  const normalizedTarget = new Date(targetAsUtc);

  if (
    normalizedTarget.getUTCFullYear() !== target.year ||
    normalizedTarget.getUTCMonth() !== target.month - 1 ||
    normalizedTarget.getUTCDate() !== target.day ||
    normalizedTarget.getUTCHours() !== target.hour ||
    normalizedTarget.getUTCMinutes() !== target.minute
  ) {
    return null;
  }

  let instant = targetAsUtc;

  try {
    for (let pass = 0; pass < 4; pass += 1) {
      const parts = getZonedDateTimeParts(new Date(instant), timezone);
      const representedAsUtc = Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
      );
      const adjustment = targetAsUtc - representedAsUtc;

      if (adjustment === 0) {
        return new Date(instant).toISOString();
      }

      instant += adjustment;
    }
  } catch {
    return null;
  }

  return null;
}

export function eventIsoToLocalDateTime(value: string | undefined, timezone: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  try {
    const parts = getZonedDateTimeParts(date, timezone);

    return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}T${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export function formatEventDate(value: string, locale?: string) {
  const date = parseDateValue(value);

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatEventTime(value: string, locale?: string) {
  const [hours, minutes] = value.split(":").map(Number);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
}

function getTimeOptions(currentValue: string, locale?: string) {
  const values = new Set<string>();

  for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
    values.add(
      `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`,
    );
  }

  if (/^\d{2}:\d{2}$/.test(currentValue)) {
    values.add(currentValue);
  }

  return [...values]
    .sort()
    .map((optionValue) => ({ label: formatEventTime(optionValue, locale), value: optionValue }));
}

function parseDateValue(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined;
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTimezone(timezone: string) {
  return timezone.replaceAll("_", " ");
}

function useDesktopDatePicker() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function getZonedDateTimeParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]),
  );

  return {
    day: values.day as number,
    hour: values.hour as number,
    minute: values.minute as number,
    month: values.month as number,
    year: values.year as number,
  };
}

function CalendarPickerIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function TimePickerIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function ClearPickerIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}
