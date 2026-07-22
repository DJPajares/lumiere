"use client";

import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import { resolveTheme } from "@lumiere/themes";
import {
  ambientAudioSettingsSchema,
  parseAmbientAudioSettings,
  type Event,
  type JsonValue,
  type ManagerRole,
} from "@lumiere/types";
import { useEffect, useMemo, useState } from "react";

import type { DashboardApiClient } from "../../../../auth/dashboard-auth-provider";
import { DashboardSwitch, DashboardTextInput } from "../../../ui/dashboard-fields";
import { toFriendlyApiMessage } from "../../event-basics-form";

type AmbientAudioFormValues = {
  autoplay: boolean;
  enabled: boolean;
  label: string;
  lowDistraction: boolean;
  src: string;
  title: string;
};

type AmbientAudioSettingsPanelProps = {
  accessRole: ManagerRole;
  apiClient: DashboardApiClient | null;
  event: Event;
  onSaved: (event: Event) => void;
};

export function AmbientAudioSettingsPanel({
  accessRole,
  apiClient,
  event,
  onSaved,
}: AmbientAudioSettingsPanelProps) {
  const [values, setValues] = useState(() => readAmbientAudioFormValues(event));
  const [sourceError, setSourceError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const canEdit = accessRole !== "viewer";
  const theme = resolveTheme(event.selectedThemeId);
  const themeSupportsMusic =
    theme.composition.ambientMedia.audioSlot === "optional" &&
    theme.composition.ambientMedia.controlStrategy === "external-controls";
  const savedValues = useMemo(() => readAmbientAudioFormValues(event), [event]);
  const isDirty = serializeValues(values) !== serializeValues(savedValues);

  useEffect(() => {
    setValues(readAmbientAudioFormValues(event));
  }, [event]);

  const updateValue = <TKey extends keyof AmbientAudioFormValues>(
    key: TKey,
    value: AmbientAudioFormValues[TKey],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setSourceError(undefined);
    setFormError(undefined);
    setNotice(undefined);
  };

  const save = async () => {
    if (!apiClient) {
      setFormError("Dashboard API is not configured.");
      return;
    }

    const src = values.src.trim();
    const title = values.title.trim();
    const label = values.label.trim();

    if (values.enabled && !src) {
      setSourceError("Add a direct audio URL before enabling background music.");
      return;
    }

    const parsed = src
      ? ambientAudioSettingsSchema.safeParse({
          autoplay: values.autoplay,
          enabled: values.enabled,
          label,
          lowDistraction: values.lowDistraction,
          src,
          title,
        })
      : undefined;

    if (parsed && !parsed.success) {
      setSourceError(parsed.error.issues.find((issue) => issue.path[0] === "src")?.message);
      setFormError(
        parsed.error.issues.find((issue) => issue.path[0] !== "src")?.message ?? undefined,
      );
      return;
    }

    const publicSettings = { ...event.publicSettings };

    if (!src) {
      publicSettings.ambientAudio = { enabled: false };
    } else if (parsed?.success) {
      const settings = parsed.data;
      publicSettings.ambientAudio = {
        autoplay: settings.autoplay,
        enabled: settings.enabled,
        lowDistraction: settings.lowDistraction,
        src: settings.src,
        ...(settings.label ? { label: settings.label } : {}),
        ...(settings.title ? { title: settings.title } : {}),
      } satisfies JsonValue;
    }

    setIsSaving(true);
    setSourceError(undefined);
    setFormError(undefined);
    setNotice(undefined);

    try {
      const response = await apiClient.updateEvent(event.id, { publicSettings });
      onSaved(response.event);
      setNotice(src ? "Background music settings saved." : "Background music removed.");
    } catch (error) {
      setFormError(toFriendlyApiMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="grid gap-5 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Background music</p>
          <h2 className="mt-2 text-lg font-semibold">Stream a track from its host</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Paste a direct link to a browser-playable audio file. Lumiere stores the URL only; the
            guest&apos;s browser streams the track from that host.
          </p>
        </div>
        <Badge className="w-fit" variant={values.enabled && values.src ? "default" : "outline"}>
          {values.enabled && values.src ? "Configured" : "Off"}
        </Badge>
      </div>

      {!themeSupportsMusic ? (
        <p className="rounded-[var(--radius-md)] border border-border bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
          {theme.label} does not display a music player. You can save a track now, but it will stay
          hidden until you choose a music-compatible theme.
        </p>
      ) : null}

      <div className="grid gap-5">
        <DashboardSwitch
          checked={values.enabled}
          description="Guests remain in control of playback. Browsers may block autoplay until they interact with the invitation."
          disabled={!canEdit || isSaving}
          id="event-background-music-enabled"
          label="Enable background music"
          onCheckedChange={(checked) => updateValue("enabled", checked)}
        />

        <DashboardTextInput
          autoCapitalize="none"
          autoComplete="url"
          disabled={!canEdit || isSaving}
          error={sourceError}
          id="event-background-music-url"
          inputMode="url"
          label="Direct audio URL"
          onChange={(inputEvent) => updateValue("src", inputEvent.target.value)}
          placeholder="https://media.example.com/our-song.mp3"
          type="url"
          value={values.src}
          description="Use an HTTP(S) file or CDN URL that returns audio, not a Spotify, Apple Music, SoundCloud, or YouTube page. HTTPS is recommended for published invitations."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <DashboardTextInput
            disabled={!canEdit || isSaving}
            id="event-background-music-title"
            label="Track title"
            maxLength={160}
            onChange={(inputEvent) => updateValue("title", inputEvent.target.value)}
            placeholder="Garden strings"
            type="text"
            value={values.title}
          />
          <DashboardTextInput
            disabled={!canEdit || isSaving}
            id="event-background-music-label"
            label="Player label"
            maxLength={80}
            onChange={(inputEvent) => updateValue("label", inputEvent.target.value)}
            placeholder="Evening music"
            type="text"
            value={values.label}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DashboardSwitch
            checked={values.autoplay}
            description="Best-effort only; audible autoplay is always subject to browser policy."
            disabled={!canEdit || isSaving}
            id="event-background-music-autoplay"
            label="Request autoplay"
            onCheckedChange={(checked) => updateValue("autoplay", checked)}
          />
          <DashboardSwitch
            checked={values.lowDistraction}
            description="Always waits for the guest to press play, independent of motion preferences."
            disabled={!canEdit || isSaving}
            id="event-background-music-low-distraction"
            label="Low-distraction start"
            onCheckedChange={(checked) => updateValue("lowDistraction", checked)}
          />
        </div>
      </div>

      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}
      {notice ? (
        <p className="text-sm text-muted-foreground" role="status">
          {notice}
        </p>
      ) : null}

      {canEdit ? (
        <Button
          className="min-h-10 w-fit sm:ml-auto"
          disabled={!isDirty || isSaving}
          onClick={() => void save()}
          type="button"
        >
          {isSaving ? "Saving..." : "Save background music"}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">Editors and owners can change music.</p>
      )}
    </section>
  );
}

function readAmbientAudioFormValues(event: Event): AmbientAudioFormValues {
  const publicValue = readJsonObject(event.publicSettings.ambientAudio);
  const themeValue = readJsonObject(event.themeConfig.ambientAudio);
  const value = publicValue ?? themeValue;
  const config = parseAmbientAudioSettings(value);

  if (!value) {
    return {
      autoplay: false,
      enabled: false,
      label: "",
      lowDistraction: false,
      src: "",
      title: "",
    };
  }

  return {
    autoplay: config?.autoplay ?? readBoolean(value.autoplay, false),
    enabled: config?.enabled ?? readBoolean(value.enabled, false),
    label: config?.label ?? readString(value.label),
    lowDistraction: config?.lowDistraction ?? readBoolean(value.lowDistraction, false),
    src: config?.src ?? readString(value.src) ?? readString(value.url),
    title: config?.title ?? readString(value.title),
  };
}

function readJsonObject(value: JsonValue | undefined) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : undefined;
}

function readBoolean(value: JsonValue | undefined, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readString(value: JsonValue | undefined) {
  return typeof value === "string" ? value : "";
}

function serializeValues(values: AmbientAudioFormValues) {
  return JSON.stringify({
    ...values,
    label: values.label.trim(),
    src: values.src.trim(),
    title: values.title.trim(),
  });
}
