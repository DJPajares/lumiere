"use client";

import { toast } from "@lumiere/dashboard-ui/components/sonner";
import type { Event } from "@lumiere/types";
import { useEffect, useState, type FormEvent } from "react";

import { useDashboardAuth } from "../../auth/dashboard-auth-provider";
import { ResponsiveModal } from "../ui/responsive-modal";
import {
  EventBasicsForm,
  createBlankEventFormValues,
  createEventFormValuesFromEvent,
  emptyEventFormState,
  parseEventCreateValues,
  parseEventUpdateValues,
  toEventFormError,
  toSlug,
  type EventBasicsFormValues,
  type EventFormField,
  type EventFormState,
} from "./event-basics-form";

type EventBasicsModalProps = {
  event?: Event | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (event: Event) => void;
  open: boolean;
};

export function EventBasicsModal({ event, onOpenChange, onSaved, open }: EventBasicsModalProps) {
  const { apiClient } = useDashboardAuth();
  const mode = event ? "edit" : "create";
  const [baseline, setBaseline] = useState<EventBasicsFormValues>(() =>
    event ? createEventFormValuesFromEvent(event) : createBlankEventFormValues(),
  );
  const [values, setValues] = useState<EventBasicsFormValues>(baseline);
  const [formState, setFormState] = useState<EventFormState>(emptyEventFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const dirty = !areEventFormValuesEqual(values, baseline);

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextValues = event ? createEventFormValuesFromEvent(event) : createBlankEventFormValues();

    setBaseline(nextValues);
    setValues(nextValues);
    setFormState(emptyEventFormState);
    setIsSaving(false);
    setSlugTouched(Boolean(event));
  }, [event, open]);

  const updateField = (field: EventFormField, value: string) => {
    if (field === "slug") {
      setSlugTouched(true);
    }

    setValues((current) => {
      const nextValues = { ...current, [field]: value } as EventBasicsFormValues;

      if (mode === "create" && field === "title" && !slugTouched) {
        nextValues.slug = toSlug(value);
      }

      return nextValues;
    });
    setFormState((current) => ({
      fieldErrors: {
        ...current.fieldErrors,
        [field]: undefined,
      },
      formError: null,
    }));
  };

  const submit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();

    if (!apiClient) {
      setFormState({
        fieldErrors: {},
        formError: "Dashboard API is not configured.",
      });
      return;
    }

    try {
      let response: { event: Event };

      if (event) {
        const parsed = parseEventUpdateValues(values);

        if (!parsed.ok) {
          setFormState({
            fieldErrors: parsed.fieldErrors,
            formError: parsed.formError,
          });
          return;
        }

        setIsSaving(true);
        setFormState(emptyEventFormState);
        response = await apiClient.updateEvent(event.id, parsed.input);
      } else {
        const parsed = parseEventCreateValues(values);

        if (!parsed.ok) {
          setFormState({
            fieldErrors: parsed.fieldErrors,
            formError: parsed.formError,
          });
          return;
        }

        setIsSaving(true);
        setFormState(emptyEventFormState);
        response = await apiClient.createEvent(parsed.input);
      }

      const savedValues = createEventFormValuesFromEvent(response.event);

      setBaseline(savedValues);
      setValues(savedValues);
      onSaved(response.event);
      onOpenChange(false);
      toast.success(event ? "Event details saved." : "Event created.");
    } catch (error) {
      setFormState(toEventFormError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setValues(baseline);
    setFormState(emptyEventFormState);
  };

  return (
    <ResponsiveModal
      description={
        event
          ? "Update the public identity, timing, venue, and publish state."
          : "Start with the public identity, timing, and venue. Theme and guests come next."
      }
      dirty={dirty}
      onDiscard={reset}
      onOpenChange={onOpenChange}
      open={open}
      title={event ? `Edit ${event.title}` : "Create event"}
    >
      <EventBasicsForm
        dirty={dirty}
        formId={event ? `edit-event-${event.id}` : "create-event"}
        formState={formState}
        isSaving={isSaving}
        mode={mode}
        onCancel={mode === "edit" ? reset : undefined}
        onFieldChange={updateField}
        onSubmit={submit}
        submitLabel={event ? "Save event" : "Create event"}
        values={values}
      />
    </ResponsiveModal>
  );
}

function areEventFormValuesEqual(first: EventBasicsFormValues, second: EventBasicsFormValues) {
  return JSON.stringify(first) === JSON.stringify(second);
}
