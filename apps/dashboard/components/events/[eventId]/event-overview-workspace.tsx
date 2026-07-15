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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lumiere/dashboard-ui/components/dialog";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import { toast } from "@lumiere/dashboard-ui/components/sonner";
import type {
  ActivityEvent,
  Event,
  EventPublishingDestination,
  EventPublishingReadiness,
  EventSummary,
} from "@lumiere/types";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useDashboardAuth } from "../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../placeholder-panels";
import { EventBasicsModal } from "../event-basics-modal";

type OverviewData = {
  activity: ActivityEvent[];
  event: Event;
  readiness: EventPublishingReadiness;
  summary: EventSummary;
};

type OverviewState =
  | {
      data: OverviewData;
      error: null;
      isRefreshing: boolean;
      status: "ready";
    }
  | {
      data: null;
      error: string | null;
      isRefreshing: false;
      status: "error" | "loading";
    };

export function EventOverviewWorkspace({ eventId }: { eventId: string }) {
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<OverviewState>({
    data: null,
    error: null,
    isRefreshing: false,
    status: "loading",
  });
  const [editOpen, setEditOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [publicationError, setPublicationError] = useState<string | null>(null);
  const [publicationPending, setPublicationPending] = useState<"publish" | "unpublish" | null>(
    null,
  );

  const loadOverview = useCallback(
    async ({ refreshing = false }: { refreshing?: boolean } = {}) => {
      if (!apiClient) {
        setState({
          data: null,
          error: "Dashboard API is not configured.",
          isRefreshing: false,
          status: "error",
        });
        return;
      }

      setState((current) =>
        current.status === "ready" && refreshing
          ? {
              ...current,
              isRefreshing: true,
            }
          : {
              data: null,
              error: null,
              isRefreshing: false,
              status: "loading",
            },
      );

      try {
        const [eventResponse, summaryResponse, activityResponse, readinessResponse] =
          await Promise.all([
            apiClient.getEvent(eventId),
            apiClient.getEventSummary(eventId),
            apiClient.listEventActivity(eventId),
            apiClient.getEventPublishingReadiness(eventId),
          ]);

        setState({
          data: {
            activity: activityResponse.activity,
            event: eventResponse.event,
            readiness: readinessResponse.readiness,
            summary: summaryResponse.summary,
          },
          error: null,
          isRefreshing: false,
          status: "ready",
        });
      } catch (error) {
        setState({
          data: null,
          error: toFriendlyApiMessage(error),
          isRefreshing: false,
          status: "error",
        });
      }
    },
    [apiClient, eventId],
  );

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        void loadOverview({ refreshing: true });
      }
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadOverview]);

  if (state.status === "loading") {
    return (
      <div className="grid gap-5">
        <EventTabs eventId={eventId} />
        <OverviewLoading />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="grid gap-5">
        <EventTabs eventId={eventId} />
        <section
          className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] p-5 text-[var(--error)]"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Unable to load event overview</h2>
          <p className="text-sm">{state.error}</p>
          <button
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] border border-[var(--error)] px-4 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--error)_12%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--error)]"
            onClick={() => void loadOverview()}
            type="button"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  const overviewData = state.data;

  if (!overviewData) {
    return null;
  }

  const updatePublicationState = (event: Event) => {
    setState((current) =>
      current.status === "ready"
        ? {
            ...current,
            data: {
              ...current.data,
              event,
              readiness: {
                ...current.data.readiness,
                eventUpdatedAt: event.updatedAt,
                status: event.status,
              },
            },
          }
        : current,
    );
  };

  const publishEvent = async () => {
    if (!apiClient || !overviewData.readiness.ready) {
      return;
    }

    setPublicationError(null);
    setPublicationPending("publish");

    try {
      const response = await apiClient.publishEvent(eventId, overviewData.readiness.eventUpdatedAt);
      updatePublicationState(response.event);
      setPublishOpen(false);
      toast.success("Invitation published.");
    } catch (error) {
      const message = toPublicationError(error);
      setPublicationError(message);
      toast.error(message);
    } finally {
      setPublicationPending(null);
    }
  };

  const unpublishEvent = async () => {
    if (!apiClient) {
      return;
    }

    setPublicationError(null);
    setPublicationPending("unpublish");

    try {
      const response = await apiClient.unpublishEvent(
        eventId,
        overviewData.readiness.eventUpdatedAt,
      );
      updatePublicationState(response.event);
      setUnpublishOpen(false);
      toast.success("Invitation unpublished and returned to draft.");
    } catch (error) {
      const message = toPublicationError(error);
      setPublicationError(message);
      toast.error(message);
    } finally {
      setPublicationPending(null);
    }
  };

  return (
    <>
      <EventOverviewContent
        activity={overviewData.activity}
        event={overviewData.event}
        isRefreshing={state.isRefreshing}
        onEdit={() => setEditOpen(true)}
        onPublish={() => {
          setPublicationError(null);
          setPublishOpen(true);
        }}
        onRefresh={() => void loadOverview({ refreshing: true })}
        onUnpublish={() => {
          setPublicationError(null);
          setUnpublishOpen(true);
        }}
        readiness={overviewData.readiness}
        summary={overviewData.summary}
      />
      <EventBasicsModal
        event={overviewData.event}
        onOpenChange={setEditOpen}
        onSaved={(savedEvent) =>
          setState((current) =>
            current.status === "ready"
              ? {
                  ...current,
                  data: { ...current.data, event: savedEvent },
                }
              : current,
          )
        }
        open={editOpen}
      />
      <PublishConfirmation
        error={publicationError}
        isPublishing={publicationPending === "publish"}
        onConfirm={() => void publishEvent()}
        onOpenChange={setPublishOpen}
        open={publishOpen}
        readiness={overviewData.readiness}
      />
      <UnpublishConfirmation
        error={publicationError}
        isUnpublishing={publicationPending === "unpublish"}
        onConfirm={() => void unpublishEvent()}
        onOpenChange={setUnpublishOpen}
        open={unpublishOpen}
      />
    </>
  );
}

function EventOverviewContent({
  activity,
  event,
  isRefreshing,
  onEdit,
  onPublish,
  onRefresh,
  onUnpublish,
  readiness,
  summary,
}: OverviewData & {
  isRefreshing: boolean;
  onEdit: () => void;
  onPublish: () => void;
  onRefresh: () => void;
  onUnpublish: () => void;
}) {
  const summaryCards = useMemo(() => getSummaryCards(summary, activity), [activity, summary]);

  return (
    <div className="grid gap-5">
      <EventTabs eventId={event.id} />

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant={event.status === "published" ? "default" : "secondary"}>
              {formatStatus(event.status)}
            </Badge>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{event.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
              {formatEventType(event.eventType)} · {formatDateTime(event.startsAt, event.timezone)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {event.status === "draft" ? (
              <>
                <Button disabled={!readiness.ready} onClick={onPublish} size="lg" type="button">
                  Publish event
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href={`/events/${event.id}/content`} />}
                  size="lg"
                  variant="outline"
                >
                  Preview invitation
                </Button>
              </>
            ) : event.status === "published" ? (
              <Button
                nativeButton={false}
                render={<a href={readiness.publicUrl} rel="noreferrer" target="_blank" />}
                size="lg"
              >
                Open invite
              </Button>
            ) : null}
            <Button onClick={onEdit} size="lg" type="button" variant="outline">
              Edit event
            </Button>
            <Button
              disabled={isRefreshing}
              onClick={onRefresh}
              size="lg"
              type="button"
              variant="ghost"
            >
              {isRefreshing ? "Refreshing..." : "Refresh data"}
            </Button>
          </div>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <MetadataItem label="Public slug" value={`/e/${event.slug}`} />
          <MetadataItem label="Venue" value={event.venueName || "Venue not set"} />
          <MetadataItem label="Timezone" value={event.timezone} />
        </dl>
      </section>

      <PublishingReadinessPanel event={event} onUnpublish={onUnpublish} readiness={readiness} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="RSVP summary">
        {summaryCards.map((card) => (
          <article
            className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
            key={card.label}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                {card.label}
              </p>
              <span className={card.badgeClassName}>{card.badge}</span>
            </div>
            <p className="text-3xl font-semibold">{card.value}</p>
            <p className="rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-3 py-2 text-sm">
              {card.detail}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Recent activity</h2>
          <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
            RSVP and manager actions appear here in chronological order.
          </p>
        </div>
        <ActivityList activity={activity} />
      </section>
    </div>
  );
}

function PublishingReadinessPanel({
  event,
  onUnpublish,
  readiness,
}: {
  event: Event;
  onUnpublish: () => void;
  readiness: EventPublishingReadiness;
}) {
  const published = event.status === "published";

  return (
    <section
      aria-labelledby="publishing-readiness-title"
      className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6"
      id="publishing-readiness"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Publishing readiness</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight" id="publishing-readiness-title">
            {published
              ? "Your invitation is live"
              : readiness.ready
                ? "Ready for a final review"
                : "Finish the blockers before publishing"}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {published
              ? "Saved event, theme, and section changes update the live invitation immediately. Unpublish before making changes that should stay private."
              : "Readiness is checked by the API against event details, dates, theme compatibility, sections, and RSVP availability."}
          </p>
        </div>
        <Badge variant={readiness.ready ? "default" : "destructive"}>
          {readiness.ready ? "Ready" : `${readiness.blockers.length} blockers`}
        </Badge>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        <MetadataItem label="Public URL" value={readiness.publicUrl} />
        <MetadataItem
          label="Theme"
          value={
            readiness.theme
              ? `${readiness.theme.name} · ${formatThemeMode(readiness.theme.mode)}`
              : "Theme not selected"
          }
        />
        <MetadataItem label="RSVP" value={formatRsvpStatus(readiness.rsvpStatus)} />
      </dl>

      {readiness.blockers.length > 0 ? (
        <div className="grid gap-2" role="group" aria-label="Publishing blockers">
          <h3 className="text-sm font-semibold">Required fixes</h3>
          <ul className="grid gap-2">
            {readiness.blockers.map((blocker, index) => (
              <li
                className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-destructive/30 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between"
                key={`${blocker.code}-${index}`}
              >
                <span className="text-sm leading-6">{blocker.message}</span>
                <Button
                  nativeButton={false}
                  render={<Link href={publishingDestinationHref(event.id, blocker.destination)} />}
                  size="sm"
                  variant="outline"
                >
                  Fix in {publishingDestinationLabel(blocker.destination)}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {readiness.warnings.length > 0 ? (
        <div className="grid gap-2">
          <h3 className="text-sm font-semibold">Review before publishing</h3>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            {readiness.warnings.map((warning, index) => (
              <li
                className="rounded-[var(--radius-md)] border border-border bg-muted/50 px-3 py-2 leading-6"
                key={`${warning.code}-${index}`}
              >
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {published || event.status === "archived" ? (
        <div className="flex flex-wrap gap-2">
          {published ? (
            <>
              <Button onClick={() => void copyInviteUrl(readiness.publicUrl)} type="button">
                Copy link
              </Button>
              <Button
                nativeButton={false}
                render={<a href={readiness.publicUrl} rel="noreferrer" target="_blank" />}
                variant="outline"
              >
                Open invite
              </Button>
              <Button
                onClick={() => void shareInvite(event.title, readiness.publicUrl)}
                type="button"
                variant="outline"
              >
                Share invite
              </Button>
              <Button onClick={onUnpublish} type="button" variant="destructive">
                Unpublish event
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Archived events cannot be published from this workspace.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}

function PublishConfirmation({
  error,
  isPublishing,
  onConfirm,
  onOpenChange,
  open,
  readiness,
}: {
  error: string | null;
  isPublishing: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  readiness: EventPublishingReadiness;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Publish this invitation?</DialogTitle>
          <DialogDescription>
            Confirm the public destination and guest response state. Publishing makes the invite
            available immediately.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-2 text-sm">
          <ConfirmationItem label="Public URL" value={readiness.publicUrl} />
          <ConfirmationItem
            label="Theme"
            value={
              readiness.theme
                ? `${readiness.theme.name} · ${formatThemeMode(readiness.theme.mode)}`
                : "Theme not selected"
            }
          />
          <ConfirmationItem label="RSVP" value={formatRsvpStatus(readiness.rsvpStatus)} />
          <ConfirmationItem label="Updates" value="Saved changes appear on the live invite" />
        </dl>

        {readiness.warnings.length > 0 ? (
          <div className="grid gap-1 rounded-[var(--radius-md)] bg-muted p-3 text-sm">
            <p className="font-semibold">Non-blocking warnings</p>
            {readiness.warnings.map((warning, index) => (
              <p className="text-muted-foreground" key={`${warning.code}-${index}`}>
                {warning.message}
              </p>
            ))}
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button disabled={isPublishing} onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button disabled={isPublishing || !readiness.ready} onClick={onConfirm}>
            {isPublishing ? "Publishing..." : "Publish event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UnpublishConfirmation({
  error,
  isUnpublishing,
  onConfirm,
  onOpenChange,
  open,
}: {
  error: string | null;
  isUnpublishing: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unpublish this invitation?</AlertDialogTitle>
          <AlertDialogDescription>
            Public and guest links will stop working immediately. Your saved event content remains
            available as a draft and can be published again later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUnpublishing}>Keep published</AlertDialogCancel>
          <AlertDialogAction disabled={isUnpublishing} onClick={onConfirm} variant="destructive">
            {isUnpublishing ? "Unpublishing..." : "Unpublish event"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConfirmationItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-[var(--radius-md)] bg-muted/60 p-3 sm:grid-cols-[7rem_1fr]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium">{value}</dd>
    </div>
  );
}

function ActivityList({ activity }: { activity: ActivityEvent[] }) {
  if (activity.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-muted)_48%,var(--surface))] p-5">
        <h3 className="text-lg font-semibold">No activity yet</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          Activity will appear after managers publish changes, guests open invites, or RSVP
          responses are submitted.
        </p>
      </div>
    );
  }

  return (
    <ol className="grid gap-3">
      {activity.map((item) => (
        <li
          className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--border)] p-4"
          key={item.id}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold">{formatActivityTitle(item)}</p>
              <p className="mt-1 text-sm text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                {formatActor(item.actorType)} · {formatDateTime(item.createdAt)}
              </p>
            </div>
            <span className="inline-flex w-fit rounded-[var(--radius-sm)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
              {formatActivityType(item.activityType)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

function OverviewLoading() {
  return (
    <div className="grid gap-5" aria-label="Loading event overview" aria-live="polite">
      <Skeleton className="h-36 rounded-[var(--radius-lg)] motion-reduce:animate-none" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <Skeleton
            className="h-32 rounded-[var(--radius-lg)] motion-reduce:animate-none"
            key={item}
          />
        ))}
      </div>
      <Skeleton className="h-44 rounded-[var(--radius-lg)] motion-reduce:animate-none" />
    </div>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-3">
      <dt className="text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">{label}</dt>
      <dd className="mt-1 break-words font-semibold">{value}</dd>
    </div>
  );
}

function publishingDestinationHref(eventId: string, destination: EventPublishingDestination) {
  if (destination === "theme") {
    return `/events/${eventId}/theme`;
  }

  if (destination === "sections" || destination === "rsvp") {
    return `/events/${eventId}/content`;
  }

  return `/events/${eventId}/settings`;
}

function publishingDestinationLabel(destination: EventPublishingDestination) {
  if (destination === "theme") {
    return "Theme";
  }

  if (destination === "sections") {
    return "Content";
  }

  if (destination === "rsvp") {
    return "RSVP";
  }

  return "Settings";
}

function formatRsvpStatus(status: EventPublishingReadiness["rsvpStatus"]) {
  if (status === "open") {
    return "Open for guest responses";
  }

  if (status === "closed") {
    return "Included, responses closed";
  }

  return "Not included";
}

function formatThemeMode(mode: NonNullable<EventPublishingReadiness["theme"]>["mode"]) {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

async function copyInviteUrl(publicUrl: string) {
  try {
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Invite link copied.");
  } catch {
    toast.error("Unable to copy the invite link.");
  }
}

async function shareInvite(title: string, publicUrl: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url: publicUrl });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  }

  await copyInviteUrl(publicUrl);
}

function toPublicationError(error: unknown) {
  if (error instanceof ApiClientError && error.status === 409) {
    return "This event changed after readiness was checked. Refresh the overview and review the latest changes before trying again.";
  }

  return toFriendlyApiMessage(error);
}

function getSummaryCards(summary: EventSummary, activity: ActivityEvent[]) {
  const latestActivity = activity[0];

  return [
    {
      badge: "Yes",
      badgeClassName: statusBadgeClassName("success"),
      detail: `${summary.attending.groups} groups confirmed`,
      label: "Attending",
      value: `${summary.attending.pax} pax`,
    },
    {
      badge: "No",
      badgeClassName: statusBadgeClassName("error"),
      detail: `${summary.notAttending.groups} groups declined`,
      label: "Not attending",
      value: `${summary.notAttending.pax} pax`,
    },
    {
      badge: "Maybe",
      badgeClassName: statusBadgeClassName("warning"),
      detail: `${summary.maybe.groups} groups tentative`,
      label: "Maybe",
      value: `${summary.maybe.pax} pax`,
    },
    {
      badge: "Pending",
      badgeClassName: statusBadgeClassName("neutral"),
      detail: `${summary.pending.groups} groups need a response`,
      label: "Pending",
      value: `${summary.pending.pax} pax`,
    },
    {
      badge: "Invited",
      badgeClassName: statusBadgeClassName("neutral"),
      detail: `${summary.totalInvitedPax} max pax across active guest groups`,
      label: "Total invited",
      value: `${summary.totalGroups} groups`,
    },
    {
      badge: "Max pax",
      badgeClassName: statusBadgeClassName("neutral"),
      detail: `${summary.totalRespondedPax} pax have submitted an RSVP count`,
      label: "Maximum attendance",
      value: `${summary.totalInvitedPax} pax`,
    },
    {
      badge: "Activity",
      badgeClassName: statusBadgeClassName("neutral"),
      detail: latestActivity
        ? `Latest: ${formatDateTime(latestActivity.createdAt)}`
        : "No manager or guest actions yet",
      label: "Recent activity",
      value: `${activity.length} updates`,
    },
  ];
}

function statusBadgeClassName(tone: "error" | "neutral" | "success" | "warning") {
  const base =
    "inline-flex rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em]";

  if (tone === "success") {
    return `${base} bg-[color-mix(in_srgb,var(--success)_14%,var(--surface))] text-[var(--success)]`;
  }

  if (tone === "error") {
    return `${base} bg-[color-mix(in_srgb,var(--error)_12%,var(--surface))] text-[var(--error)]`;
  }

  if (tone === "warning") {
    return `${base} bg-[color-mix(in_srgb,var(--warning)_14%,var(--surface))] text-[var(--warning)]`;
  }

  return `${base} bg-[var(--surface-muted)] text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]`;
}

function formatActivityTitle(activity: ActivityEvent) {
  const metadataTitle = readMetadataString(activity.metadata, "title");

  if (metadataTitle) {
    return metadataTitle;
  }

  switch (activity.activityType) {
    case "event_created":
      return "Event created";
    case "event_deleted":
      return "Event deleted";
    case "event_published":
      return "Event published";
    case "event_restored":
      return "Event restored";
    case "guest_group_created":
      return "Guest group created";
    case "guest_invite_opened":
      return "Guest invite opened";
    case "notification_created":
      return "Notification created";
    case "rsvp_submitted":
      return "RSVP submitted";
    case "rsvp_updated":
      return "RSVP updated";
    case "section_updated":
      return "Section updated";
    case "theme_updated":
      return "Theme updated";
  }
}

function readMetadataString(metadata: ActivityEvent["metadata"], key: string) {
  const value = metadata[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function formatActivityType(value: ActivityEvent["activityType"]) {
  return value.replaceAll("_", " ");
}

function formatActor(value: ActivityEvent["actorType"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatStatus(value: Event["status"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatEventType(value: Event["eventType"]) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value: string, timeZone?: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
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
