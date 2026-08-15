"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@lumiere/dashboard-ui/components/alert-dialog";
import { Button } from "@lumiere/dashboard-ui/components/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@lumiere/dashboard-ui/components/field";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import { toast } from "@lumiere/dashboard-ui/components/sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lumiere/dashboard-ui/components/table";
import { ToggleGroup, ToggleGroupItem } from "@lumiere/dashboard-ui/components/toggle-group";
import { DownloadIcon } from "@lumiere/dashboard-ui/components/icons";
import {
  type Event,
  type EventSummary,
  type GuestDataExportFormat,
  type GuestDataExportScope,
  type GuestGroup,
  type GuestInviteShareChannel,
  type ManagerRole,
  type RsvpResponse,
} from "@lumiere/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useDashboardAuth } from "../../../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../../placeholder-panels";
import { DashboardSelect } from "../../../../ui/dashboard-fields";
import { eventIsoToLocalDateTime } from "../../../../ui/event-date-time-picker";
import { ResponsiveModal } from "../../../../ui/responsive-modal";
import { AllGuestsTable } from "./all-guests-table";
import { toFriendlyApiMessage } from "./guest-errors";
import {
  areGuestListFiltersDefault,
  defaultGuestListFilters,
  filterAndSortGuestGroupRows,
  filterAndSortGuestRows,
  hasExportableFilters,
  readGuestListFilters,
  readGuestListMode,
  toExportTrackingStage,
  writeGuestListFilters,
  writeGuestListMode,
  type GuestListFilters,
  type GuestListMode,
} from "./guest-filters";
import { isGuestShareUnavailable } from "./guest-formatters";
import { GuestGroupList } from "./guest-group-list";
import {
  createMemberFields,
  defaultFormValues,
  GuestGroupForm,
  parseGuestGroupForm,
  toFormErrors,
  toGuestGroupMutationRequest,
  type FormErrors,
  type FormValues,
  type TextFormField,
} from "./guest-group-form";
import type { GuestRowActionHandlers } from "./guest-invite-actions";
import {
  buildGuestGroupRows,
  buildGuestRows,
  collectInvitedByValues,
  countUnnamedSeats,
} from "./guest-row-models";
import {
  createGuestInviteEmailUrl,
  createGuestInviteMessengerUrl,
  createGuestInviteShareContent,
  createGuestInviteWhatsAppUrl,
  describeShareMethod,
  isShareCancellation,
  shareChannelOptions,
  triggerBrowserDownload,
  type InviteShareMethod,
} from "./guest-share";
import { GuestSummary } from "./guest-summary";
import { GuestToolbar } from "./guest-toolbar";

type GuestWorkspaceData = {
  accessRole: ManagerRole;
  event: Event;
  guestGroups: GuestGroup[];
  responses: RsvpResponse[];
  summary: EventSummary | null;
};

type GuestWorkspaceState =
  | {
      data: GuestWorkspaceData;
      error: null;
      inviteLinks: Record<string, string>;
      isRefreshing: boolean;
      status: "ready";
    }
  | {
      data: null;
      error: string | null;
      inviteLinks: Record<string, string>;
      isRefreshing: false;
      status: "error" | "loading";
    };

type PendingAction = {
  groupId: string;
  type: "disable" | "regenerate";
} | null;

export function GuestManagementWorkspace({ eventId }: { eventId: string }) {
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<GuestWorkspaceState>({
    data: null,
    error: null,
    inviteLinks: {},
    isRefreshing: false,
    status: "loading",
  });
  const [formValues, setFormValues] = useState<FormValues>(defaultFormValues);
  const [baselineValues, setBaselineValues] = useState<FormValues>(defaultFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<GuestDataExportFormat>("csv");
  const [exportScope, setExportScope] = useState<GuestDataExportScope>("all");
  const [exporting, setExporting] = useState(false);
  const [sentGroup, setSentGroup] = useState<GuestGroup | null>(null);
  const [shareChannel, setShareChannel] = useState<GuestInviteShareChannel | "unspecified">(
    "unspecified",
  );
  const [guestListFilters, setGuestListFilters] = useState<GuestListFilters>(() =>
    readGuestListFilters(),
  );
  const [listMode, setListMode] = useState<GuestListMode>(() => readGuestListMode());
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const isDesktop = useDesktopGuestList();

  useEffect(() => {
    const syncViewFromUrl = () => {
      setGuestListFilters(readGuestListFilters());
      setListMode(readGuestListMode());
    };

    window.addEventListener("popstate", syncViewFromUrl);
    return () => window.removeEventListener("popstate", syncViewFromUrl);
  }, []);

  // Both RSVP notifications deep-link with ?guestGroupId=. Opening that row directly is
  // the whole point of the link, so expand it on arrival.
  useEffect(() => {
    const deepLinkedGroupId = new URLSearchParams(window.location.search).get("guestGroupId");

    if (deepLinkedGroupId) {
      setExpandedGroupId(deepLinkedGroupId);
    }
  }, []);

  const updateGuestListFilters = useCallback((updates: Partial<GuestListFilters>) => {
    setGuestListFilters((current) => {
      const next = { ...current, ...updates };
      writeGuestListFilters(next);
      return next;
    });
  }, []);

  const clearGuestListFilters = useCallback(() => {
    writeGuestListFilters(defaultGuestListFilters);
    setGuestListFilters(defaultGuestListFilters);
  }, []);

  const updateListMode = useCallback((mode: GuestListMode) => {
    writeGuestListMode(mode);
    setListMode(mode);
  }, []);

  const toggleExpandedGroup = useCallback((groupId: string) => {
    setExpandedGroupId((current) => (current === groupId ? null : groupId));
  }, []);

  const loadGuests = useCallback(
    async ({ refreshing = false }: { refreshing?: boolean } = {}) => {
      if (!apiClient) {
        setState({
          data: null,
          error: "Dashboard API is not configured.",
          inviteLinks: {},
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
              inviteLinks: current.inviteLinks,
              isRefreshing: false,
              status: "loading",
            },
      );

      try {
        const [eventResponse, guestGroupResponse, rsvpResponse, summaryResponse] =
          await Promise.all([
            apiClient.getEvent(eventId),
            apiClient.listGuestGroups(eventId),
            apiClient.listEventResponses(eventId),
            apiClient.getEventSummary(eventId),
          ]);

        setState((current) => ({
          data: {
            accessRole: eventResponse.access.role,
            event: eventResponse.event,
            guestGroups: guestGroupResponse.guestGroups,
            responses: rsvpResponse.responses,
            summary: summaryResponse.summary,
          },
          error: null,
          inviteLinks: Object.fromEntries(
            guestGroupResponse.guestGroups
              .filter((group) => group.inviteLink)
              .map((group) => [group.id, group.inviteLink as string]),
          ),
          isRefreshing: false,
          status: "ready",
        }));
      } catch (error) {
        toast.error(toFriendlyApiMessage(error));
        setState({
          data: null,
          error: toFriendlyApiMessage(error),
          inviteLinks: {},
          isRefreshing: false,
          status: "error",
        });
      }
    },
    [apiClient, eventId],
  );

  useEffect(() => {
    void loadGuests();
  }, [loadGuests]);

  const readyState = state.status === "ready" ? state : null;
  const editingGroup = readyState?.data.guestGroups.find((group) => group.id === editingGroupId);
  const guestGroups = useMemo(
    () => readyState?.data.guestGroups ?? [],
    [readyState?.data.guestGroups],
  );

  const groupRows = useMemo(() => {
    if (!readyState) return [];

    return buildGuestGroupRows({
      event: readyState.data.event,
      guestGroups: readyState.data.guestGroups,
      responses: readyState.data.responses,
    });
  }, [readyState]);

  const filteredGroupRows = useMemo(
    () => filterAndSortGuestGroupRows(groupRows, guestListFilters),
    [groupRows, guestListFilters],
  );
  const guestRows = useMemo(() => buildGuestRows(groupRows), [groupRows]);
  const unnamedSeats = useMemo(() => countUnnamedSeats(groupRows), [groupRows]);
  const filteredGuestRows = useMemo(
    () => filterAndSortGuestRows(guestRows, guestListFilters),
    [guestRows, guestListFilters],
  );
  const invitedByValues = useMemo(() => collectInvitedByValues(guestGroups), [guestGroups]);

  const hasGuestListFilters = !areGuestListFiltersDefault(guestListFilters);
  const hasSupportedExportFilters = hasExportableFilters(guestListFilters);
  const canShareFromDevice =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const startCreate = () => {
    setEditingGroupId(null);
    setFormValues(defaultFormValues);
    setBaselineValues(defaultFormValues);
    setFormErrors({});
    setActionMessage(null);
    setFormOpen(true);
  };

  const startEdit = (group: GuestGroup) => {
    setEditingGroupId(group.id);
    const storedMembers =
      group.members?.map(({ id, name }) => ({ id, name })) ??
      (group.contactName ? [{ name: group.contactName }] : []);
    const values = {
      accessExpiresAt: eventIsoToLocalDateTime(
        group.accessExpiresAt ?? undefined,
        readyState?.data.event.timezone ?? "UTC",
      ),
      contactEmail: group.contactEmail ?? "",
      contactName: group.contactName ?? "",
      invitedBy: group.invitedBy ?? "",
      label: group.label,
      members: createMemberFields(storedMembers, group.maxPax),
      maxPax: String(group.maxPax),
      notes: group.notes ?? "",
      status: group.status,
    };

    setFormValues(values);
    setBaselineValues(values);
    setFormErrors({});
    setActionMessage(null);
    setFormOpen(true);
  };

  const updateField = (field: TextFormField, value: string) => {
    setFormValues((current) => {
      if (field !== "maxPax") {
        return {
          ...current,
          [field]: value,
        };
      }

      const nextMaxPax = Number(value);
      return {
        ...current,
        maxPax: value,
        members:
          Number.isInteger(nextMaxPax) && nextMaxPax >= 1 && nextMaxPax <= 50
            ? createMemberFields(current.members, nextMaxPax)
            : current.members,
      };
    });
    setFormErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[field];
      if (field === "maxPax") {
        delete nextErrors.members;
        delete nextErrors.memberNames;
      }
      delete nextErrors._form;
      return nextErrors;
    });
  };

  const updateMember = (index: number, name: string) => {
    setFormValues((current) => ({
      ...current,
      members: current.members.map((member, memberIndex) =>
        memberIndex === index ? { ...member, name } : member,
      ),
    }));
    clearMemberErrors(index);
  };

  const clearMemberErrors = (index: number) => {
    setFormErrors((current) => {
      const nextErrors = { ...current };

      delete nextErrors.members;
      if (nextErrors.memberNames) {
        const memberNames = { ...nextErrors.memberNames };
        delete memberNames[index];
        nextErrors.memberNames = memberNames;
      }
      delete nextErrors._form;
      return nextErrors;
    });
  };

  const submitForm = async () => {
    if (!apiClient) {
      toast.error("Dashboard API is not configured.");
      return;
    }

    if (state.status !== "ready") {
      return;
    }

    const parsed = parseGuestGroupForm(
      formValues,
      state.data.event.timezone,
      state.data.event.accessExpiresAt ?? null,
    );

    if (!parsed.ok) {
      setFormErrors(parsed.errors);
      setActionMessage(null);
      toast.error(parsed.errors._form ?? "Check the highlighted guest group fields.");
      return;
    }

    setSubmitting(true);
    setFormErrors({});
    setActionMessage(null);

    try {
      if (editingGroup) {
        const response = await apiClient.updateGuestGroup(eventId, editingGroup.id, parsed.input);
        replaceGuestGroup(response.guestGroup);
        setActionMessage(`${response.guestGroup.label} updated.`);
        setFormOpen(false);
        toast.success(`${response.guestGroup.label} updated.`);
        void refreshSummary();
      } else {
        const response = await apiClient.createGuestGroup(eventId, parsed.input);
        setState((current) =>
          current.status === "ready"
            ? {
                ...current,
                data: {
                  ...current.data,
                  guestGroups: [response.guestGroup, ...current.data.guestGroups],
                },
                inviteLinks: {
                  ...current.inviteLinks,
                  [response.guestGroup.id]: response.inviteLink,
                },
              }
            : current,
        );
        setFormValues(defaultFormValues);
        setActionMessage(`${response.guestGroup.label} created. Invite link ready to copy.`);
        setFormOpen(false);
        toast.success(`${response.guestGroup.label} created. Invite link ready to copy.`);
        void refreshSummary();
      }
    } catch (error) {
      setFormErrors(toFormErrors(error));
      toast.error(toFriendlyApiMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * The summary tiles come from the API so they always agree with the Overview page.
   * Status changes (disable, regenerate, manual status edits) move a group between
   * buckets, so the cached summary has to be refetched — but only the summary, to keep
   * the optimistic row update in place.
   */
  const refreshSummary = useCallback(async () => {
    if (!apiClient) return;

    try {
      const { summary } = await apiClient.getEventSummary(eventId);

      setState((current) =>
        current.status === "ready" ? { ...current, data: { ...current.data, summary } } : current,
      );
    } catch {
      // A stale summary is better than a broken page; the next load corrects it.
    }
  }, [apiClient, eventId]);

  const replaceGuestGroup = (guestGroup: GuestGroup, inviteLink?: string) => {
    setState((current) =>
      current.status === "ready"
        ? {
            ...current,
            data: {
              ...current.data,
              guestGroups: current.data.guestGroups.map((item) =>
                item.id === guestGroup.id ? guestGroup : item,
              ),
            },
            inviteLinks: inviteLink
              ? {
                  ...current.inviteLinks,
                  [guestGroup.id]: inviteLink,
                }
              : current.inviteLinks,
          }
        : current,
    );
  };

  const disableGuestGroup = async (group: GuestGroup) => {
    if (!apiClient) {
      toast.error("Dashboard API is not configured.");
      return;
    }

    setBusyGroupId(group.id);
    setActionMessage(null);

    try {
      const response = await apiClient.updateGuestGroup(
        eventId,
        group.id,
        toGuestGroupMutationRequest(group, "disabled"),
      );
      replaceGuestGroup(response.guestGroup);
      setPendingAction(null);
      setActionMessage(`${response.guestGroup.label} disabled. Existing invite access is blocked.`);
      toast.success(`${response.guestGroup.label} disabled.`);
      void refreshSummary();
    } catch (error) {
      const message = toFriendlyApiMessage(error);
      setActionMessage(message);
      toast.error(message);
    } finally {
      setBusyGroupId(null);
    }
  };

  const reenableGuestGroup = async (group: GuestGroup) => {
    if (!apiClient) {
      toast.error("Dashboard API is not configured.");
      return;
    }

    setBusyGroupId(group.id);
    setActionMessage(null);

    try {
      const response = await apiClient.updateGuestGroup(
        eventId,
        group.id,
        toGuestGroupMutationRequest(group, "pending"),
      );
      replaceGuestGroup(response.guestGroup);
      const message = `${response.guestGroup.label} re-enabled. The existing invite link works again.`;
      setActionMessage(message);
      toast.success(message);
      void refreshSummary();
    } catch (error) {
      const message = toFriendlyApiMessage(error);
      setActionMessage(message);
      toast.error(message);
    } finally {
      setBusyGroupId(null);
    }
  };

  const regenerateInvite = async (group: GuestGroup) => {
    if (!apiClient) {
      toast.error("Dashboard API is not configured.");
      return;
    }

    setBusyGroupId(group.id);
    setActionMessage(null);

    try {
      const response = await apiClient.regenerateGuestGroupInvite(eventId, group.id);
      replaceGuestGroup(response.guestGroup, response.inviteLink);
      setPendingAction(null);
      setActionMessage(`${response.guestGroup.label} has a new invite link ready to copy.`);
      toast.success(`${response.guestGroup.label} invite link regenerated.`);
      void refreshSummary();
    } catch (error) {
      const message = toFriendlyApiMessage(error);
      setActionMessage(message);
      toast.error(message);
    } finally {
      setBusyGroupId(null);
    }
  };

  const copyInviteLink = async (group: GuestGroup) => {
    const inviteLink = state.inviteLinks[group.id];

    if (!inviteLink) {
      const message = "Regenerate this invite link before copying a shareable URL.";
      setActionMessage(message);
      toast.warning(message);
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setActionMessage(`${group.label} invite link copied.`);
      toast.success(`${group.label} invite link copied.`);
    } catch {
      const message = "Clipboard is unavailable. Select the invite URL and copy it manually.";
      setActionMessage(message);
      toast.error(message);
    }
  };

  const openInviteLink = (group: GuestGroup) => {
    const inviteLink = state.inviteLinks[group.id];

    if (!inviteLink || state.status !== "ready") {
      const message =
        group.status === "disabled"
          ? "This guest group is disabled. Invite access is unavailable."
          : "Regenerate this invite link before opening a shareable URL.";
      setActionMessage(message);
      toast.warning(message);
      return;
    }

    if (isGuestShareUnavailable(state.data.event, group)) {
      const message =
        group.status === "disabled"
          ? "This guest group is disabled. Invite access is unavailable."
          : "Invite access has expired. Extend access before opening or sharing this link.";
      setActionMessage(message);
      toast.warning(message);
      return;
    }

    const openedWindow = window.open(inviteLink, "_blank", "noopener,noreferrer");

    if (!openedWindow) {
      const message = "The invite could not be opened. Allow pop-ups and try again.";
      setActionMessage(message);
      toast.error(message);
      return;
    }

    setActionMessage(group.label + " invite link opened.");
    toast.success(group.label + " invite link opened.");
  };

  const recordInviteShare = async (group: GuestGroup, channel: GuestInviteShareChannel) => {
    if (!apiClient || state.status !== "ready") {
      const message = "Lumiere could not record this share. You can record it manually when ready.";
      setActionMessage(message);
      toast.warning(message);
      return;
    }

    if (state.data.accessRole === "viewer") {
      const message = "Share handoff started. View-only access cannot record invite sharing.";
      setActionMessage(message);
      toast.success(message);
      return;
    }

    setBusyGroupId(group.id);
    setActionMessage(null);

    try {
      const response = await apiClient.markGuestGroupSent(eventId, group.id, {
        shareChannel: channel,
      });
      replaceGuestGroup(response.guestGroup);
      const message = `${response.guestGroup.label} share handoff recorded. Delivery is not verified.`;
      setActionMessage(message);
      toast.success(message);
    } catch (error) {
      const message = `${toFriendlyApiMessage(error)} Record the share manually if you completed it.`;
      setActionMessage(message);
      toast.error(message);
    } finally {
      setBusyGroupId(null);
    }
  };

  const shareInviteLink = async (group: GuestGroup, method: InviteShareMethod) => {
    if (state.status !== "ready") return;

    const inviteLink = state.inviteLinks[group.id];
    if (!inviteLink || isGuestShareUnavailable(state.data.event, group)) {
      const message = !inviteLink
        ? "Regenerate this invite link before sharing a URL."
        : group.status === "disabled"
          ? "This guest group is disabled. Invite access is unavailable."
          : "Invite access has expired. Extend access before sharing this link.";
      setActionMessage(message);
      toast.warning(message);
      return;
    }

    if (navigator.onLine === false) {
      const message =
        "You appear to be offline. Copy the invite link and share it when you are connected.";
      setActionMessage(message);
      toast.warning(message);
      return;
    }

    const shareContent = createGuestInviteShareContent(state.data.event, group, inviteLink);

    if (method === "native") {
      if (typeof navigator.share !== "function") {
        const message =
          "Sharing from this device is unavailable. Use Copy, Email, or WhatsApp instead.";
        setActionMessage(message);
        toast.warning(message);
        return;
      }

      try {
        await navigator.share(shareContent);
        await recordInviteShare(group, "other");
      } catch (error) {
        const message = isShareCancellation(error)
          ? "Share cancelled. Copy the link or choose Email or WhatsApp instead."
          : "The device share sheet could not open. Use Copy, Email, or WhatsApp instead.";
        setActionMessage(message);
        toast.warning(message);
      }
      return;
    }

    const destination =
      method === "email"
        ? createGuestInviteEmailUrl(shareContent)
        : method === "messenger"
          ? createGuestInviteMessengerUrl(shareContent)
          : createGuestInviteWhatsAppUrl(shareContent);
    const openedWindow = window.open(destination, "_blank", "noopener,noreferrer");

    if (!openedWindow) {
      const message = `The ${describeShareMethod(method)} composer could not open. Allow pop-ups and try again, or copy the invite link.`;
      setActionMessage(message);
      toast.error(message);
      return;
    }

    await recordInviteShare(group, method);
  };

  const startMarkSent = (group: GuestGroup) => {
    setShareChannel("unspecified");
    setSentGroup(group);
  };

  const markInviteSent = async () => {
    if (!apiClient || !sentGroup) return;

    setBusyGroupId(sentGroup.id);
    setActionMessage(null);

    try {
      const response = await apiClient.markGuestGroupSent(eventId, sentGroup.id, {
        ...(shareChannel === "unspecified" ? {} : { shareChannel }),
      });
      replaceGuestGroup(response.guestGroup);
      const message = `${response.guestGroup.label} recorded as shared. Delivery is not verified.`;
      setActionMessage(message);
      setSentGroup(null);
      toast.success(message);
    } catch (error) {
      toast.error(toFriendlyApiMessage(error));
    } finally {
      setBusyGroupId(null);
    }
  };

  const startExport = () => {
    setExportScope(hasSupportedExportFilters ? "filtered" : "all");
    setExportOpen(true);
  };

  const downloadGuestData = async () => {
    if (!apiClient) {
      toast.error("Dashboard API is not configured.");
      return;
    }

    const scope = exportScope === "filtered" && hasSupportedExportFilters ? "filtered" : "all";
    setExporting(true);
    setActionMessage(null);

    try {
      const download = await apiClient.downloadGuestData(eventId, {
        format: exportFormat,
        invitedBy:
          scope === "filtered" && guestListFilters.invitedBy !== "all"
            ? guestListFilters.invitedBy
            : undefined,
        q: scope === "filtered" ? guestListFilters.query.trim() || undefined : undefined,
        scope,
        tracking: scope === "filtered" ? toExportTrackingStage(guestListFilters.invite) : undefined,
      });
      triggerBrowserDownload(download);
      const message = `${download.filename} is ready.`;
      setActionMessage(message);
      setExportOpen(false);
      toast.success(message);
    } catch (error) {
      toast.error(toFriendlyApiMessage(error));
    } finally {
      setExporting(false);
    }
  };

  if (state.status === "loading") {
    return (
      <div className="grid gap-5">
        <EventTabs active="guests" eventId={eventId} />
        <GuestLoading />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="grid gap-5">
        <EventTabs active="guests" eventId={eventId} />
        <section
          className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] p-5 text-[var(--error)]"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Unable to load guest groups</h2>
          <p className="text-sm">{state.error}</p>
          <Button
            className="w-fit"
            onClick={() => void loadGuests()}
            size="lg"
            type="button"
            variant="outline"
          >
            Try again
          </Button>
        </section>
      </div>
    );
  }

  if (!readyState) {
    return null;
  }

  const canEdit = readyState.data.accessRole !== "viewer";
  const rowHandlers: GuestRowActionHandlers = {
    onCopy: (group) => void copyInviteLink(group),
    onDisable: (group) => setPendingAction({ groupId: group.id, type: "disable" }),
    onEdit: startEdit,
    onMarkSent: startMarkSent,
    onOpen: openInviteLink,
    onReenable: (group) => void reenableGuestGroup(group),
    onRegenerate: (group) => setPendingAction({ groupId: group.id, type: "regenerate" }),
    onShare: (group, method) => void shareInviteLink(group, method),
  };
  const pendingGroup = pendingAction
    ? guestGroups.find((group) => group.id === pendingAction.groupId)
    : undefined;
  const visibleCount = listMode === "groups" ? filteredGroupRows.length : filteredGuestRows.length;
  const totalCount = listMode === "groups" ? groupRows.length : guestRows.length;

  return (
    <div className="grid gap-5">
      <EventTabs active="guests" eventId={eventId} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">Guests</h2>
        {canEdit ? (
          <Button onClick={startCreate} type="button">
            New guest group
          </Button>
        ) : (
          <span className="rounded-full border border-border px-3 py-1 text-sm font-medium">
            View-only access
          </span>
        )}
      </div>

      <GuestSummary groupRows={groupRows} summary={readyState.data.summary} />

      <GuestToolbar
        filters={guestListFilters}
        hasActiveFilters={hasGuestListFilters}
        invitedByValues={invitedByValues}
        isRefreshing={readyState.isRefreshing}
        mode={listMode}
        onClear={clearGuestListFilters}
        onExport={startExport}
        onModeChange={updateListMode}
        onRefresh={() => void loadGuests({ refreshing: true })}
        onUpdate={updateGuestListFilters}
      />

      {actionMessage ? (
        <div
          className="rounded-[var(--radius-md)] border border-border bg-muted/50 px-4 py-3 text-sm"
          role="status"
        >
          {actionMessage}
        </div>
      ) : null}

      {canEdit ? (
        <ResponsiveModal
          description={
            editingGroup
              ? "Update the group identity, capacity, invite status, and private notes."
              : "Create one private invite for a household, table, or guest group."
          }
          dirty={JSON.stringify(formValues) !== JSON.stringify(baselineValues)}
          footer={({ requestClose }) => (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                disabled={
                  submitting || JSON.stringify(formValues) === JSON.stringify(baselineValues)
                }
                onClick={requestClose}
                type="button"
                variant="outline"
              >
                Cancel changes
              </Button>
              <Button disabled={submitting} onClick={() => void submitForm()} type="button">
                {submitting
                  ? "Saving..."
                  : editingGroup
                    ? "Save guest group"
                    : "Create guest group"}
              </Button>
            </div>
          )}
          onDiscard={() => {
            setFormValues(baselineValues);
            setFormErrors({});
          }}
          onOpenChange={setFormOpen}
          open={formOpen}
          title={editingGroup ? `Edit ${editingGroup.label}` : "Create guest group"}
        >
          <GuestGroupForm
            editingGroup={editingGroup}
            errors={formErrors}
            event={readyState.data.event}
            invitedByValues={invitedByValues}
            onUpdate={updateField}
            onUpdateMember={updateMember}
            values={formValues}
          />
        </ResponsiveModal>
      ) : null}

      <ResponsiveModal
        description="Download guest groups and RSVP details without invite credentials or internal IDs."
        footer={({ requestClose }) => (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button disabled={exporting} onClick={requestClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={exporting} onClick={() => void downloadGuestData()} type="button">
              <DownloadIcon data-icon="inline-start" />
              {exporting ? "Preparing export..." : `Download ${exportFormat.toUpperCase()}`}
            </Button>
          </div>
        )}
        onOpenChange={(open) => {
          if (!exporting) {
            setExportOpen(open);
          }
        }}
        open={exportOpen}
        title="Export guest data"
      >
        <FieldGroup>
          <FieldSet>
            <FieldLegend>File format</FieldLegend>
            <FieldDescription>
              CSV is lightweight and universal. XLSX adds a frozen header row, filters, wrapping,
              and readable column widths.
            </FieldDescription>
            <ToggleGroup
              aria-label="Export file format"
              onValueChange={(value) => {
                const nextFormat = value[0];
                if (nextFormat === "csv" || nextFormat === "xlsx") {
                  setExportFormat(nextFormat);
                }
              }}
              spacing={0}
              value={[exportFormat]}
              variant="outline"
            >
              <ToggleGroupItem type="button" value="csv">
                CSV
              </ToggleGroupItem>
              <ToggleGroupItem type="button" value="xlsx">
                XLSX
              </ToggleGroupItem>
            </ToggleGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Rows to include</FieldLegend>
            <FieldDescription>
              Exports use a stable server order. The list sorting in this workspace does not change
              the file.
            </FieldDescription>
            <ToggleGroup
              aria-label="Export row scope"
              onValueChange={(value) => {
                const nextScope = value[0];
                if (
                  nextScope === "all" ||
                  (nextScope === "filtered" && hasSupportedExportFilters)
                ) {
                  setExportScope(nextScope);
                }
              }}
              orientation="vertical"
              spacing={2}
              value={[exportScope]}
              variant="outline"
            >
              <ToggleGroupItem type="button" value="all">
                All event rows ({guestGroups.length})
              </ToggleGroupItem>
              <ToggleGroupItem disabled={!hasSupportedExportFilters} type="button" value="filtered">
                Current search, invite status, and invited by filters
              </ToggleGroupItem>
            </ToggleGroup>
            <FieldDescription>
              {hasSupportedExportFilters
                ? "The export honours search text, invite status, and invited by. The RSVP filter is applied in this workspace only."
                : "Add search text, an invite status filter, or an invited by filter to enable a filtered export."}
            </FieldDescription>
          </FieldSet>

          <FieldDescription>
            Each request is limited to 10,000 guest-group rows. Selected attendee names are taken
            from the submitted RSVP.
          </FieldDescription>
        </FieldGroup>
      </ResponsiveModal>

      {canEdit ? (
        <ResponsiveModal
          description="Record a share that happened outside Lumiere. This is manager-confirmed and is not a delivery or read receipt."
          footer={({ requestClose }) => (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                disabled={Boolean(busyGroupId)}
                onClick={requestClose}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={Boolean(busyGroupId)}
                onClick={() => void markInviteSent()}
                type="button"
              >
                {busyGroupId
                  ? "Recording..."
                  : sentGroup?.sendCount
                    ? "Record resend"
                    : "Mark sent"}
              </Button>
            </div>
          )}
          onOpenChange={(open) => {
            if (!open && !busyGroupId) setSentGroup(null);
          }}
          open={Boolean(sentGroup)}
          title={sentGroup ? `Record share for ${sentGroup.label}` : "Record invite share"}
        >
          <FieldGroup>
            <DashboardSelect
              id="guest-invite-share-channel"
              label="Share channel"
              onValueChange={(value) =>
                setShareChannel(value as GuestInviteShareChannel | "unspecified")
              }
              options={shareChannelOptions}
              value={shareChannel}
            />
            <FieldDescription>
              Choose the channel you used, or leave it unspecified. Opening the guest link and
              submitting an RSVP are tracked separately.
            </FieldDescription>
          </FieldGroup>
        </ResponsiveModal>
      ) : null}

      <AlertDialog
        onOpenChange={(open) => {
          if (!open && !busyGroupId) setPendingAction(null);
        }}
        open={Boolean(pendingAction && pendingGroup)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === "regenerate"
                ? "Reset this invite link?"
                : "Disable this guest group?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === "regenerate"
                ? "The current invite link stops working and a fresh copyable URL is created. Sent and opened history is cleared, and the guest is asked to RSVP again."
                : "The guest group stays in the list, but private invite access is blocked."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(busyGroupId)}>Cancel</AlertDialogCancel>
            <Button
              disabled={Boolean(busyGroupId)}
              onClick={() => {
                if (!pendingGroup || !pendingAction) return;

                if (pendingAction.type === "regenerate") {
                  void regenerateInvite(pendingGroup);
                } else {
                  void disableGuestGroup(pendingGroup);
                }
              }}
              type="button"
              variant={pendingAction?.type === "disable" ? "destructive" : "default"}
            >
              {busyGroupId
                ? "Working..."
                : pendingAction?.type === "regenerate"
                  ? "Reset link"
                  : "Disable invite"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section aria-label="Guest list" className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-muted-foreground" role="status">
            Showing {visibleCount} of {totalCount}
          </h3>
        </div>

        {groupRows.length === 0 ? (
          <EmptyGuestList canEdit={canEdit} />
        ) : visibleCount === 0 ? (
          <NoGuestMatches onClearFilters={clearGuestListFilters} />
        ) : listMode === "groups" ? (
          <GuestGroupList
            busyGroupId={busyGroupId}
            canEdit={canEdit}
            canShareFromDevice={canShareFromDevice}
            event={readyState.data.event}
            expandedGroupId={expandedGroupId}
            handlers={rowHandlers}
            inviteLinks={readyState.inviteLinks}
            isDesktop={isDesktop}
            onToggleExpanded={toggleExpandedGroup}
            rows={filteredGroupRows}
          />
        ) : (
          <AllGuestsTable
            isDesktop={isDesktop}
            rows={filteredGuestRows}
            unnamedSeats={unnamedSeats}
          />
        )}
      </section>
    </div>
  );
}

function EmptyGuestList({ canEdit }: { canEdit: boolean }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-dashed border-border bg-muted/30 p-6">
      <h3 className="text-lg font-semibold">No guest groups yet</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {canEdit
          ? "Create the first household or invite group to generate a private RSVP link."
          : "No guest groups are available to review yet."}
      </p>
    </section>
  );
}

function NoGuestMatches({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <section
      aria-label="Guest list results"
      className="grid gap-3 rounded-[var(--radius-lg)] border border-dashed border-border bg-muted/30 p-6"
      role="status"
    >
      <h3 className="text-lg font-semibold">No guest groups match these filters</h3>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        Try a different search or filter, or clear the filters to see every guest again.
      </p>
      <Button className="w-fit" onClick={onClearFilters} type="button">
        Clear filters
      </Button>
    </section>
  );
}

function useDesktopGuestList() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia?.("(min-width: 1024px)");

    if (!query) return;

    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function GuestLoading() {
  return (
    <section
      aria-label="Loading guest groups"
      className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <Skeleton className="h-5 w-40" />
      <div className="hidden lg:block">
        <Table>
          <TableCaption className="sr-only">Loading guest group rows</TableCaption>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 6 }, (_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }, (_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 6 }, (_, columnIndex) => (
                  <TableCell key={columnIndex}>
                    <Skeleton className="h-8 w-full min-w-16" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 lg:hidden">
        {Array.from({ length: 2 }, (_, index) => (
          <div
            className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-4"
            key={index}
          >
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </section>
  );
}
