"use client";

import { ApiClientError } from "@lumiere/api-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@lumiere/dashboard-ui/components/alert-dialog";
import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import { Grid2X2Icon, LayoutGridIcon, ListIcon } from "@lumiere/dashboard-ui/components/icons";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@lumiere/dashboard-ui/components/toggle-group";
import { cn } from "@lumiere/dashboard-ui/utils";
import {
  compatibilityThemeModes,
  evaluateThemeCompatibility,
  getTheme,
  isThemeId,
  resolveTheme,
  type ThemeCompatibilityResult,
  type ThemeDefinition,
  type ThemeTokenSet,
} from "@lumiere/themes";
import {
  eventThemeUpdateRequestSchema,
  type EventType,
  type EventThemeUpdateRequest,
  type Theme,
  type ThemeMode,
} from "@lumiere/types";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { InviteThemePreviewRenderer } from "../../../invite-preview/theme-preview-renderer";
import { EventTabs } from "../../../placeholder-panels";
import { DashboardSelect } from "../../../ui/dashboard-fields";
import { ResponsiveModal } from "../../../ui/responsive-modal";

const LazyThemeExpandedPreview = lazy(async () => {
  const module = await import("../../../invite-preview/theme-expanded-preview");

  return { default: module.ThemeExpandedPreview };
});

const themeGalleryViewStorageKey = "lumiere.dashboard.theme-gallery-view";

type ThemeState = {
  selectedThemeId: string | null;
  themeMode: ThemeMode;
};

type FieldErrors = Partial<Record<"selectedThemeId" | "themeMode", string>>;
type GalleryModeFilter = "any" | ThemeMode;
type ThemeGalleryView = "compact" | "large" | "list";
type ReadinessFilter = "all" | "fully-supported";

type ThemeGalleryEntry = {
  compatibility?: ThemeCompatibilityResult;
  fallbackReason?: string;
  isCompatible: boolean;
  previewDefinition: ThemeDefinition;
  publishReady: boolean;
  reasons: string[];
  resolvedMode: ThemeMode;
  theme: Theme;
};

type ThemeWorkspaceState =
  | {
      currentThemeId?: string;
      currentThemeConfig: EventThemeUpdateRequest["themeConfig"];
      error: null;
      eventTitle: string;
      eventType: EventType;
      fieldErrors: FieldErrors;
      formMessage: string | null;
      isSaving: boolean;
      savingThemeId: string | null;
      status: "ready";
      themes: Theme[];
      values: ThemeState;
    }
  | {
      error: string | null;
      status: "error" | "loading";
    };

export function ThemeSelectorWorkspace({ eventId }: { eventId: string }) {
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<ThemeWorkspaceState>({
    error: null,
    status: "loading",
  });

  const loadThemes = useCallback(async () => {
    if (!apiClient) {
      setState({
        error: "Dashboard API is not configured.",
        status: "error",
      });
      return;
    }

    setState({
      error: null,
      status: "loading",
    });

    try {
      const [eventResponse, themesResponse, eventThemeResponse] = await Promise.all([
        apiClient.getEvent(eventId),
        apiClient.listThemes(),
        apiClient.getEventTheme(eventId),
      ]);
      const selectedTheme =
        eventThemeResponse.theme ??
        themesResponse.themes.find((theme) => theme.id === eventThemeResponse.selectedThemeId) ??
        themesResponse.themes[0];
      const selectedThemeId = selectedTheme?.id ?? null;
      const themeMode =
        eventThemeResponse.themeMode &&
        selectedTheme?.supportedModes.includes(eventThemeResponse.themeMode)
          ? eventThemeResponse.themeMode
          : (selectedTheme?.defaultMode ?? "system");

      setState({
        currentThemeId: eventThemeResponse.selectedThemeId,
        currentThemeConfig: eventThemeResponse.themeConfig,
        error: null,
        eventTitle: eventResponse.event.title,
        eventType: eventResponse.event.eventType,
        fieldErrors: {},
        formMessage: null,
        isSaving: false,
        savingThemeId: null,
        status: "ready",
        themes: themesResponse.themes,
        values: {
          selectedThemeId,
          themeMode,
        },
      });
    } catch (error) {
      setState({
        error: toFriendlyApiMessage(error),
        status: "error",
      });
    }
  }, [apiClient, eventId]);

  useEffect(() => {
    void loadThemes();
  }, [loadThemes]);

  if (state.status === "loading") {
    return (
      <div className="grid gap-5">
        <EventTabs active="theme" eventId={eventId} />
        <ThemeLoading />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="grid gap-5">
        <EventTabs active="theme" eventId={eventId} />
        <section
          className="grid justify-items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-5 text-destructive"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Unable to load theme settings</h2>
          <p className="text-sm">{state.error}</p>
          <Button onClick={() => void loadThemes()} variant="outline">
            Try again
          </Button>
        </section>
      </div>
    );
  }

  const readyState = state.status === "ready" ? state : null;

  if (!readyState) {
    return null;
  }

  return <ThemeSelectorContent eventId={eventId} state={readyState} updateState={setState} />;
}

function ThemeSelectorContent({
  eventId,
  state,
  updateState,
}: {
  eventId: string;
  state: Extract<ThemeWorkspaceState, { status: "ready" }>;
  updateState: Dispatch<SetStateAction<ThemeWorkspaceState>>;
}) {
  const { apiClient } = useDashboardAuth();
  const [modeFilter, setModeFilter] = useState<GalleryModeFilter>("any");
  const [readinessFilter, setReadinessFilter] = useState<ReadinessFilter>("all");
  const [galleryView, setGalleryView] = useState<ThemeGalleryView>("large");
  const [galleryViewStorageReady, setGalleryViewStorageReady] = useState(false);
  const [showIncompatible, setShowIncompatible] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<ThemeGalleryEntry | null>(null);
  const [pendingThemeMode, setPendingThemeMode] = useState<ThemeMode | null>(null);

  useEffect(() => {
    setGalleryView(readStoredThemeGalleryView());
    setGalleryViewStorageReady(true);
  }, []);

  useEffect(() => {
    if (!galleryViewStorageReady || typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(themeGalleryViewStorageKey, galleryView);
    } catch {
      // Storage may be disabled; the in-memory selection still works for this visit.
    }
  }, [galleryView, galleryViewStorageReady]);

  const galleryEntries = useMemo(
    () =>
      buildThemeGalleryEntries({
        eventType: state.eventType,
        modeFilter,
        preferredMode: state.values.themeMode,
        themes: state.themes,
      }),
    [modeFilter, state.eventType, state.themes, state.values.themeMode],
  );
  const visibleEntries = useMemo(
    () =>
      galleryEntries.filter((entry) => {
        if (!showIncompatible && !entry.isCompatible) {
          return false;
        }

        if (readinessFilter === "fully-supported" && entry.compatibility?.status !== "compatible") {
          return false;
        }

        return true;
      }),
    [galleryEntries, readinessFilter, showIncompatible],
  );
  const incompatibleCount = galleryEntries.filter((entry) => !entry.isCompatible).length;
  const compatibleCount = galleryEntries.length - incompatibleCount;
  const activeTheme = state.themes.find((theme) => theme.id === state.values.selectedThemeId);
  const themeModeOptions = useMemo(
    () =>
      compatibilityThemeModes.map((mode) => ({
        disabled: activeTheme ? !activeTheme.supportedModes.includes(mode) : false,
        label: formatMode(mode),
        value: mode,
      })),
    [activeTheme],
  );
  const pendingThemeEntry = useMemo(() => {
    if (!pendingThemeMode || !activeTheme) {
      return null;
    }

    return (
      buildThemeGalleryEntries({
        eventType: state.eventType,
        modeFilter: pendingThemeMode,
        preferredMode: pendingThemeMode,
        themes: [activeTheme],
      })[0] ?? null
    );
  }, [activeTheme, pendingThemeMode, state.eventType]);

  const applyTheme = async (
    entry: ThemeGalleryEntry,
    successMessage = `${entry.theme.name} is now active.`,
  ) => {
    if (!entry.isCompatible || state.isSaving) {
      return;
    }

    if (!apiClient) {
      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              fieldErrors: {},
              formMessage: "Dashboard API is not configured.",
            }
          : current,
      );
      return;
    }

    const parsed = createThemeUpdateInput(
      entry.theme,
      entry.resolvedMode,
      state.eventType,
      entry.theme.id === state.currentThemeId ? state.currentThemeConfig : {},
    );

    if (!parsed.ok) {
      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              fieldErrors: parsed.fieldErrors,
              formMessage: parsed.formMessage,
            }
          : current,
      );
      return;
    }

    updateState((current) =>
      current.status === "ready"
        ? {
            ...current,
            fieldErrors: {},
            formMessage: null,
            isSaving: true,
            savingThemeId: entry.theme.id,
          }
        : current,
    );

    try {
      const response = await apiClient.updateEventTheme(eventId, parsed.input);

      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              currentThemeId: response.selectedThemeId,
              currentThemeConfig: response.themeConfig,
              fieldErrors: {},
              formMessage: successMessage,
              isSaving: false,
              savingThemeId: null,
              values: {
                selectedThemeId: response.selectedThemeId ?? parsed.input.selectedThemeId,
                themeMode: response.themeMode,
              },
            }
          : current,
      );
    } catch (error) {
      const formError = toThemeFormError(error);

      updateState((current) =>
        current.status === "ready"
          ? {
              ...current,
              fieldErrors: formError.fieldErrors,
              formMessage: formError.formMessage,
              isSaving: false,
              savingThemeId: null,
            }
          : current,
      );
    }
  };

  const requestThemeModeChange = (value: string) => {
    const nextMode = value as ThemeMode;

    if (nextMode !== state.values.themeMode && !state.isSaving) {
      setPendingThemeMode(nextMode);
    }
  };

  const confirmThemeModeChange = () => {
    if (!pendingThemeEntry || !pendingThemeMode) {
      return;
    }

    setPendingThemeMode(null);
    void applyTheme(
      pendingThemeEntry,
      `${pendingThemeEntry.theme.name} is now using ${formatMode(pendingThemeMode)} mode.`,
    );
  };

  return (
    <div className="grid gap-5">
      <EventTabs active="theme" eventId={eventId} />

      <section className="grid gap-4 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
        <div>
          <Badge variant="secondary">{formatEventType(state.eventType)} themes</Badge>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Choose the invitation for {state.eventTitle}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Compatible themes appear first. Choose a theme, then set its shared display mode from
            the gallery controls.
          </p>
        </div>

        {state.formMessage ? (
          <p
            className={
              Object.keys(state.fieldErrors).length > 0
                ? "rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                : "rounded-lg border border-success/50 bg-success/10 px-3 py-2 text-sm text-success"
            }
            role={Object.keys(state.fieldErrors).length > 0 ? "alert" : "status"}
          >
            {state.formMessage}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-6 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)] lg:items-start">
          <div>
            <h3 className="text-lg font-semibold">Theme gallery</h3>
            <p className="mt-1 text-sm text-muted-foreground" role="status">
              {compatibleCount} compatible · {incompatibleCount} unavailable for this setup
            </p>
          </div>
          <div className="grid min-w-0 gap-5 lg:max-w-4xl lg:justify-self-end">
            <div className="grid gap-4 sm:grid-cols-[auto_minmax(16rem,1fr)] sm:items-end">
              <div className="grid gap-2">
                <span className="text-sm font-medium" id="theme-gallery-view-label">
                  Gallery view
                </span>
                <ToggleGroup
                  aria-labelledby="theme-gallery-view-label"
                  className="w-full sm:w-fit"
                  onValueChange={(value) => {
                    const nextView = value[0] as ThemeGalleryView | undefined;

                    if (nextView) {
                      setGalleryView(nextView);
                    }
                  }}
                  size="sm"
                  spacing={0}
                  value={[galleryView]}
                  variant="outline"
                >
                  <ToggleGroupItem aria-label="Large theme cards" type="button" value="large">
                    <LayoutGridIcon data-icon="inline-start" />
                    Large
                  </ToggleGroupItem>
                  <ToggleGroupItem aria-label="Compact theme cards" type="button" value="compact">
                    <Grid2X2Icon data-icon="inline-start" />
                    Compact
                  </ToggleGroupItem>
                  <ToggleGroupItem aria-label="List themes" type="button" value="list">
                    <ListIcon data-icon="inline-start" />
                    List
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="grid gap-2 sm:border-l sm:border-border sm:pl-4">
                <span className="hidden text-sm font-medium sm:block">Invitation setting</span>
                <DashboardSelect
                  disabled={state.isSaving}
                  id="theme-mode"
                  label="Theme mode"
                  onValueChange={requestThemeModeChange}
                  options={themeModeOptions}
                  value={state.values.themeMode}
                />
              </div>
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] sm:items-end sm:border-t sm:border-border sm:pt-4">
              <p className="col-span-full hidden text-sm font-medium sm:block">Filter themes</p>
              <div className="min-w-0">
                <DashboardSelect
                  id="theme-mode-filter"
                  label="Mode support"
                  onValueChange={(value) => setModeFilter(value as GalleryModeFilter)}
                  options={[
                    { label: "Any mode", value: "any" },
                    { label: "Light", value: "light" },
                    { label: "Dark", value: "dark" },
                    { label: "System", value: "system" },
                    { label: "Toggleable", value: "toggleable" },
                  ]}
                  value={modeFilter}
                />
              </div>
              <div className="min-w-0">
                <DashboardSelect
                  id="theme-readiness-filter"
                  label="Publish readiness"
                  onValueChange={(value) => setReadinessFilter(value as ReadinessFilter)}
                  options={[
                    { label: "Compatible with fallbacks", value: "all" },
                    { label: "Fully supported only", value: "fully-supported" },
                  ]}
                  value={readinessFilter}
                />
              </div>
              <div className="grid min-w-0 gap-2">
                <span className="text-sm font-medium">Theme availability</span>
                <Button
                  aria-pressed={showIncompatible}
                  className="w-full min-w-0"
                  onClick={() => setShowIncompatible((current) => !current)}
                  variant="outline"
                >
                  {showIncompatible
                    ? "Hide incompatible"
                    : `Show incompatible (${incompatibleCount})`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        {state.themes.length === 0 ? (
          <ThemeEmptyState
            body="The theme registry returned no selectable themes. Try again after registry data is available."
            title="No themes available"
          />
        ) : visibleEntries.length === 0 ? (
          <ThemeEmptyState
            body="Adjust mode or readiness filters, or reveal incompatible themes to review their conflicts."
            title="No themes match these filters"
          />
        ) : (
          <div
            className={cn(
              "grid gap-4",
              galleryView === "large" && "md:grid-cols-2 xl:grid-cols-3",
              galleryView === "compact" &&
                "grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4",
              galleryView === "list" &&
                "grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card",
            )}
            data-theme-gallery-view={galleryView}
          >
            {visibleEntries.map((entry) => (
              <ThemeGalleryCard
                entry={entry}
                eventType={state.eventType}
                isSelected={state.values.selectedThemeId === entry.theme.id}
                isSaving={state.isSaving}
                key={entry.theme.id}
                onPreview={setPreviewEntry}
                onUse={applyTheme}
                savingThemeId={state.savingThemeId}
                selectedMode={state.values.themeMode}
                view={galleryView}
              />
            ))}
          </div>
        )}
      </section>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setPendingThemeMode(null);
          }
        }}
        open={Boolean(pendingThemeMode)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Apply {pendingThemeMode ? formatMode(pendingThemeMode) : "new"} mode?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will update the saved mode for {activeTheme?.name ?? "the active theme"} and
              apply it to the invitation immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingThemeEntry && !pendingThemeEntry.isCompatible ? (
            <p className="text-sm text-destructive" role="alert">
              {pendingThemeEntry.reasons[0] ?? "This mode is not available for the active theme."}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={state.isSaving}>Keep current mode</AlertDialogCancel>
            <AlertDialogAction
              disabled={state.isSaving || !pendingThemeEntry?.isCompatible}
              onClick={confirmThemeModeChange}
            >
              Apply mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ResponsiveModal
        contentClassName="sm:max-w-6xl"
        description="Inspect representative public invite output without leaving theme selection."
        onOpenChange={(open) => {
          if (!open) {
            setPreviewEntry(null);
          }
        }}
        open={Boolean(previewEntry)}
        title={previewEntry ? `${previewEntry.theme.name} invite preview` : "Invite preview"}
      >
        {previewEntry ? (
          <Suspense
            fallback={
              <div aria-label="Loading expanded theme preview" className="grid gap-3">
                <Skeleton className="h-10 w-full motion-reduce:animate-none" />
                <Skeleton className="h-128 w-full motion-reduce:animate-none" />
              </div>
            }
          >
            <LazyThemeExpandedPreview
              fallbackReason={previewEntry.fallbackReason}
              initialMode={toPreviewMode(previewEntry.resolvedMode)}
              theme={previewEntry.previewDefinition}
            />
          </Suspense>
        ) : null}
      </ResponsiveModal>
    </div>
  );
}

function ThemeGalleryCard({
  entry,
  eventType,
  isSelected,
  isSaving,
  onPreview,
  onUse,
  savingThemeId,
  selectedMode,
  view,
}: {
  entry: ThemeGalleryEntry;
  eventType: EventType;
  isSelected: boolean;
  isSaving: boolean;
  onPreview: (entry: ThemeGalleryEntry) => void;
  onUse: (entry: ThemeGalleryEntry) => void;
  savingThemeId: string | null;
  selectedMode: ThemeMode;
  view: ThemeGalleryView;
}) {
  const isActive = isSelected && entry.resolvedMode === selectedMode;

  const statusLabel = !entry.isCompatible
    ? `Not for ${formatEventType(eventType)}`
    : entry.compatibility?.status === "warning"
      ? "Compatible with fallbacks"
      : "Fully compatible";

  if (view === "list") {
    return (
      <ThemeGalleryListItem
        entry={entry}
        isActive={isActive}
        isSaving={isSaving}
        isSelected={isSelected}
        onPreview={onPreview}
        onUse={onUse}
        savingThemeId={savingThemeId}
        statusLabel={statusLabel}
      />
    );
  }

  return (
    <article
      className={cn(
        "grid overflow-hidden rounded-lg border bg-card shadow-sm",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border transition-shadow hover:shadow-md",
      )}
      data-theme-gallery-card={entry.theme.id}
      data-theme-gallery-card-view={view}
    >
      <div className={cn("bg-muted/40", view === "compact" ? "p-2" : "p-3")}>
        <InviteThemePreviewRenderer
          fallbackReason={entry.fallbackReason}
          mode={toPreviewMode(entry.resolvedMode)}
          theme={entry.previewDefinition}
          thumbnailSize={view === "compact" ? "compact" : "default"}
          thumbnail
        />
      </div>
      <div className={cn("grid", view === "compact" ? "gap-2 p-2" : "gap-4 p-4")}>
        <div>
          <h3 className={cn("font-semibold", view === "compact" ? "text-base" : "text-lg")}>
            {entry.theme.name}
          </h3>
          <p
            className={cn(
              "mt-1 text-sm leading-6 text-muted-foreground",
              view === "compact" && "hidden sm:line-clamp-2 sm:block",
            )}
          >
            {readThemeSummary(entry.theme)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={entry.isCompatible ? "secondary" : "destructive"}>{statusLabel}</Badge>
          <Badge variant="outline">{entry.theme.supportedModes.length} modes</Badge>
        </div>

        {entry.reasons.length > 0 ? (
          <ul
            className={
              entry.isCompatible
                ? "grid gap-1 rounded-lg bg-warning/10 p-3 text-xs leading-5"
                : "grid gap-1 rounded-lg bg-destructive/10 p-3 text-xs leading-5 text-destructive"
            }
          >
            {entry.reasons.slice(0, 3).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <Button
            aria-label={`Use ${entry.theme.name}`}
            className="min-h-10 sm:min-w-32"
            disabled={!entry.isCompatible || isSaving || isActive}
            onClick={() => void onUse(entry)}
            size="sm"
          >
            {savingThemeId === entry.theme.id ? "Applying..." : isActive ? "Current" : "Use theme"}
          </Button>
          <Button
            aria-label={`Preview ${entry.theme.name}`}
            className="min-h-10 sm:min-w-28"
            disabled={isSaving}
            onClick={() => onPreview(entry)}
            size="sm"
            variant="outline"
          >
            Expand preview
          </Button>
        </div>
      </div>
    </article>
  );
}

function ThemeGalleryListItem({
  entry,
  isActive,
  isSaving,
  isSelected,
  onPreview,
  onUse,
  savingThemeId,
  statusLabel,
}: {
  entry: ThemeGalleryEntry;
  isActive: boolean;
  isSaving: boolean;
  isSelected: boolean;
  onPreview: (entry: ThemeGalleryEntry) => void;
  onUse: (entry: ThemeGalleryEntry) => void;
  savingThemeId: string | null;
  statusLabel: string;
}) {
  return (
    <article
      className={cn(
        "grid bg-card transition-colors",
        isSelected ? "bg-primary/5" : "hover:bg-muted/40",
      )}
      data-theme-gallery-card={entry.theme.id}
      data-theme-gallery-card-view="list"
    >
      <div className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(19rem,auto)] sm:items-start sm:gap-5 sm:p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="text-base font-semibold">{entry.theme.name}</h3>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={entry.isCompatible ? "secondary" : "destructive"}>
                {statusLabel}
              </Badge>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ThemeTokenStrip themeName={entry.theme.name} tokens={getThemePreviewTokens(entry)} />
            <span className="text-xs text-muted-foreground">
              {entry.theme.supportedModes.length} supported modes
            </span>
          </div>

          {entry.reasons.length > 0 ? (
            <p
              className={cn(
                "mt-2 text-xs leading-5",
                entry.isCompatible ? "text-warning" : "text-destructive",
              )}
            >
              {entry.reasons[0]}
              {entry.reasons.length > 1 ? ` +${entry.reasons.length - 1} more` : null}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2 min-[420px]:flex min-[420px]:flex-wrap min-[420px]:justify-end sm:min-w-[19rem]">
          <Button
            aria-label={`Use ${entry.theme.name}`}
            className="min-h-10 w-full min-[420px]:w-auto min-[420px]:min-w-32"
            disabled={!entry.isCompatible || isSaving || isActive}
            onClick={() => void onUse(entry)}
            size="sm"
          >
            {savingThemeId === entry.theme.id ? "Applying..." : isActive ? "Current" : "Use theme"}
          </Button>
          <Button
            aria-label={`Preview ${entry.theme.name}`}
            className="min-h-10 w-full min-[420px]:w-auto min-[420px]:min-w-28"
            disabled={isSaving}
            onClick={() => onPreview(entry)}
            size="sm"
            variant="outline"
          >
            Preview
          </Button>
        </div>
      </div>
    </article>
  );
}

function ThemeTokenStrip({ themeName, tokens }: { themeName: string; tokens: ThemeTokenSet }) {
  const palette = [
    ["Background", tokens.background],
    ["Surface", tokens.surface],
    ["Accent", tokens.accent],
    ["Text", tokens.foreground],
    ["Border", tokens.border],
  ] as const;

  return (
    <div
      aria-label={`${themeName} color tokens`}
      className="flex shrink-0 items-center gap-1"
      role="img"
    >
      {palette.map(([label, value]) => (
        <span
          aria-hidden="true"
          className="size-5 rounded-full border border-foreground/20 shadow-sm"
          key={label}
          style={{ backgroundColor: value }}
          title={`${label}: ${value}`}
        />
      ))}
    </div>
  );
}

function getThemePreviewTokens(entry: ThemeGalleryEntry) {
  return entry.previewDefinition.tokens[toPreviewMode(entry.resolvedMode)];
}

function readStoredThemeGalleryView(): ThemeGalleryView {
  if (typeof window === "undefined") {
    return "large";
  }

  try {
    const storedView = window.localStorage.getItem(themeGalleryViewStorageKey);

    return storedView === "compact" || storedView === "list" || storedView === "large"
      ? storedView
      : "large";
  } catch {
    return "large";
  }
}

function ThemeEmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function ThemeLoading() {
  return (
    <div aria-label="Loading theme settings" aria-live="polite" className="grid gap-5">
      <Skeleton className="h-36 rounded-lg motion-reduce:animate-none" />
      <Skeleton className="h-24 rounded-lg motion-reduce:animate-none" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
        {[0, 1, 2].map((item) => (
          <Skeleton className="h-96 rounded-lg motion-reduce:animate-none" key={item} />
        ))}
      </div>
    </div>
  );
}

export function buildThemeGalleryEntries({
  eventType,
  modeFilter,
  preferredMode,
  themes,
}: {
  eventType: EventType;
  modeFilter: GalleryModeFilter;
  preferredMode: ThemeMode;
  themes: Theme[];
}): ThemeGalleryEntry[] {
  const defaultTheme = resolveTheme(undefined);

  return themes
    .map((theme): ThemeGalleryEntry => {
      const definition = isThemeId(theme.id) ? getTheme(theme.id) : undefined;
      const resolvedMode =
        modeFilter !== "any"
          ? modeFilter
          : theme.supportedModes.includes(preferredMode)
            ? preferredMode
            : theme.defaultMode;
      const compatibility = definition
        ? evaluateThemeCompatibility({ eventType, mode: resolvedMode, theme: definition })
        : undefined;
      const reasons = [
        ...(theme.eventTypes.includes(eventType)
          ? []
          : [`${theme.name} does not support ${eventType} events.`]),
        ...(theme.supportedModes.includes(resolvedMode)
          ? []
          : [`${theme.name} does not support ${resolvedMode} mode.`]),
        ...(compatibility?.issues.map((issue) => `${issue.message}.`) ?? []),
      ];
      const fallbackReason = definition
        ? undefined
        : "This registry theme module is unavailable, so Lumiere Default is shown.";

      if (fallbackReason) {
        reasons.push(fallbackReason);
      }

      const isCompatible = Boolean(
        definition &&
        theme.eventTypes.includes(eventType) &&
        theme.supportedModes.includes(resolvedMode) &&
        compatibility?.canApply,
      );

      return {
        compatibility,
        fallbackReason,
        isCompatible,
        previewDefinition: definition ?? defaultTheme,
        publishReady: Boolean(isCompatible && compatibility?.canRenderRequiredSections),
        reasons: uniqueStrings(
          isCompatible && compatibility?.warnings.length
            ? [...reasons, ...compatibility.warnings.map((warning) => warning.message)]
            : reasons,
        ),
        resolvedMode,
        theme,
      };
    })
    .sort((first, second) => {
      const compatibilityOrder = Number(second.isCompatible) - Number(first.isCompatible);

      if (compatibilityOrder !== 0) {
        return compatibilityOrder;
      }

      const readinessOrder = Number(second.publishReady) - Number(first.publishReady);

      return readinessOrder || first.theme.name.localeCompare(second.theme.name);
    });
}

function createThemeUpdateInput(
  theme: Theme,
  themeMode: ThemeMode,
  eventType: EventType,
  themeConfig: EventThemeUpdateRequest["themeConfig"],
):
  | {
      input: EventThemeUpdateRequest;
      ok: true;
    }
  | {
      fieldErrors: FieldErrors;
      formMessage: string;
      ok: false;
    } {
  if (!theme.supportedModes.includes(themeMode)) {
    return {
      fieldErrors: {
        themeMode: `${theme.name} does not support ${formatMode(themeMode)} mode.`,
      },
      formMessage: "Check the highlighted theme fields before saving.",
      ok: false,
    };
  }

  const compatibility = getThemeCompatibility(theme, eventType, themeMode);

  if (compatibility && !compatibility.canApply) {
    return {
      fieldErrors: issuesToFieldErrors(compatibility.issues),
      formMessage: "Check the highlighted theme fields before saving.",
      ok: false,
    };
  }

  const parsedRequest = eventThemeUpdateRequestSchema.safeParse({
    selectedThemeId: theme.id,
    themeConfig,
    themeMode,
  });

  if (parsedRequest.success) {
    return {
      input: parsedRequest.data,
      ok: true,
    };
  }

  return {
    fieldErrors: issuesToFieldErrors(parsedRequest.error.issues),
    formMessage: "Check the highlighted theme fields before saving.",
    ok: false,
  };
}

function toThemeFormError(error: unknown) {
  if (error instanceof ApiClientError) {
    return {
      fieldErrors: issuesToFieldErrors(error.apiError.error.fields ?? []),
      formMessage: error.apiError.error.message,
    };
  }

  return {
    fieldErrors: {},
    formMessage: toFriendlyApiMessage(error),
  };
}

function issuesToFieldErrors(issues: Array<{ message: string; path: readonly unknown[] }>) {
  const fieldErrors: FieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if ((field === "selectedThemeId" || field === "themeMode") && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

function readThemeSummary(theme: Theme) {
  const dashboardPreview = theme.metadata.dashboardPreview;

  if (isRecord(dashboardPreview) && typeof dashboardPreview.summary === "string") {
    return dashboardPreview.summary;
  }

  return typeof theme.metadata.description === "string" ? theme.metadata.description : theme.name;
}

function getThemeCompatibility(theme: Theme, eventType: EventType, mode: ThemeMode) {
  const themeDefinition = isThemeId(theme.id) ? getTheme(theme.id) : undefined;

  return themeDefinition
    ? evaluateThemeCompatibility({
        eventType,
        mode,
        theme: themeDefinition,
      })
    : undefined;
}

function toPreviewMode(mode: ThemeMode) {
  return mode === "dark" ? "dark" : "light";
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatEventType(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMode(value: ThemeMode) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toFriendlyApiMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.apiError.error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete the dashboard request.";
}
